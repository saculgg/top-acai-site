const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
app.use(express.json());

// Menu data
const menuData = {
  "store_name": "TOP Açai & Delicias",
  "contact": {
    "wa_phone": "5543996813103"
  },
  "Gelados": {
    "Açai": {
      "Copos": [
        {"id":"cop300","name":"300ml","price":15.00,"free_addons_limit":3},
        {"id":"cop400","name":"400ml","price":19.00,"free_addons_limit":3},
        {"id":"cop500","name":"500ml","price":22.00,"free_addons_limit":4},
        {"id":"cop700","name":"700ml","price":30.00,"free_addons_limit":4}
      ],
      "Marmitas": [
        {"id":"mar350","name":"350g","price":18.00,"free_addons_limit":4},
        {"id":"mar550","name":"550g","price":25.00,"free_addons_limit":4},
        {"id":"mar800","name":"800g","price":40.00,"free_addons_limit":5}
      ],
      "Especiais": [
        {"id":"barca","name":"Barca","price":35.00,"free_addons_limit":6},
        {"id":"roleta","name":"Roleta","price":50.00,"free_addons_limit":6}
      ],
      "PaidAddons": [
        {"id":"creme_avelã","name":"Creme de avelã","price":5.00},
        {"id":"creme_leitinho","name":"Creme de leitinho","price":5.00}
      ],
      "FreeAddons": [
        "banana","kiwi","manga","morango","uva","leite_ninho","ovomaltine","paçoca","granola","sucrilhos","chocoball","confete","gotas_de_chocolate","granulado","bis","kitkat","look","ouro_branco","leite_condensado"
      ],
      "Vitaminas": [
        {"id":"vit300","name":"Garrafa 300ml","price":15.00,"description":"As vitaminas de 300ml são feitas com Leite, Morango, Banana, Leite Ninho e Leite Condensado e claro o melhor, Açai."},
        {"id":"vit500","name":"Garrafa 500ml","price":25.00,"description":"As vitaminas de 500ml são feitas com Leite, Morango, Banana, Leite Ninho e Leite Condensado e claro o melhor, Açai."}
      ],
      "Geladão Gourmet": [
        {"id":"sensacao","name":"Sensação","price":8.50,"description":"Delicioso geladão com sabor de Sensação."},
        {"id":"pacoca","name":"Paçoca","price":8.50,"description":"Geladão cremoso com sabor de Paçoca."},
        {"id":"sabor1","name":"Sabor1","price":8.50,"description":"Sabor único e refrescante."},
        {"id":"sabor2","name":"Sabor2","price":8.50,"description":"Uma explosão de sabor em cada colherada."},
        {"id":"sabor3","name":"Sabor3","price":8.50,"description":"Experimente essa delícia gelada."}
      ],
      "extra_price_per_extra": 3.00
    }
  },
  "Frituras": {
    "Mini Salgados": [
      {"id":"salg15","name":"15 unidades","price":12.00},
      {"id":"salg30","name":"30 unidades","price":24.00},
      {"id":"salg50","name":"50 unidades","price":40.00}
    ],
    "Mini Churros": [
      {"id":"mch15","name":"15 unidades","price":13.50,"description":"Mini Churros recheado com Doce de Leite"},
      {"id":"mch30","name":"30 unidades","price":27.00,"description":"Mini Churros recheado com Doce de Leite"},
      {"id":"mch50","name":"50 unidades","price":45.00,"description":"Mini Churros recheado com Doce de Leite"}
    ],
    "Churros Espanhol": [
      {"id":"che10","name":"10 unidades","price":15.00,"free_addons_limit":1},
      {"id":"che15","name":"15 unidades","price":20.00,"free_addons_limit":1},
      {"id":"che20","name":"20 unidades","price":25.00,"free_addons_limit":2}
    ],
    "Churros_Addons_Paid": [
      {"id":"ch_creme_avelã","name":"Creme de avelã","price":4.00},
      {"id":"ch_creme_leitinho","name":"Creme de leitinho","price":4.00}
    ],
    "Churros_Addons_Free": ["leite_condensado","doce_de_leite","chocolate_ao_leite","goiabada","geleia_de_morango"]
  },
  "Bebidas": {
    "Refrigerantes de 2L": [
      {"id":"coca2","name":"Coca Cola 2L","price":13.00},
      {"id":"sprite2","name":"Sprite 2L","price":9.00},
      {"id":"kuat2","name":"Kuat 2L","price":8.00},
      {"id":"riobranco2","name":"Rio Branco 2L","price":7.50},
      {"id":"fanta2","name":"Fanta 2L","price":11.00}
    ],
    "Latas de 350ml": [
      {"id":"coca350","name":"Coca Cola 350ml","price":5.50},
      {"id":"gua350","name":"Guaraná Antarctica 350ml","price":5.00},
      {"id":"fanta350","name":"Fanta 350ml","price":5.00}
    ],
    "extra_options": {
      "Latas de 350ml": ["canudo"]
    }
  },
  "delivery_rules": {
    "free_in_neighborhood_case_insensitive": "bem viver arapongas"
  },
  "pix_info": {
    "cpf": "074.448.389-17",
    "name": "MELISSA STEFANIE PEREIRA SIQUEIRA",
    "bank": "BRADESCO S.A."
  }
};

// Helper functions
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '');
}

function calculateDeliveryFee(address) {
  const freeNeighborhood = menuData.delivery_rules.free_in_neighborhood_case_insensitive.toLowerCase();
  if (address.toLowerCase().includes(freeNeighborhood)) {
    return 0.00;
  }
  return null; // A definir
}

function validateOrderPayload(payload) {
  if (!payload.customer || !payload.customer.name || !payload.customer.address_and_number) {
    return { valid: false, error: 'Dados do cliente incompletos' };
  }
  
  if (!payload.payment_method || !['CARTÃO', 'DINHEIRO', 'PIX'].includes(payload.payment_method)) {
    return { valid: false, error: 'Método de pagamento inválido' };
  }
  
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return { valid: false, error: 'Nenhum item no pedido' };
  }
  
  return { valid: true };
}

function generateWhatsAppMessage(order) {
  const { customer, payment_method, change_info, items, subtotal, delivery_fee, total, metadata } = order;
  
  let message = `📦 *NOVO PEDIDO*\n`;
  message += `👤 *Nome:* ${customer.name}\n`;
  message += `🏠 *Endereço:* ${customer.address_and_number}\n`;
  message += `💳 *Pagamento:* ${payment_method}\n`;
  
  // Adicionar informações de troco se necessário
  if (payment_method === 'DINHEIRO' && change_info && change_info.needs_change) {
    message += `💰 *Troco para:* R$${change_info.change_amount.toFixed(2)}\n`;
    message += `💸 *Valor do troco:* R$${(change_info.change_amount - total).toFixed(2)}\n`;
  }
  
  message += `\n`;
  
  message += `🛒 *Itens:*\n`;
  
  items.forEach(item => {
    message += `- ${item.quantity} x ${item.product_name} (${item.category})\n`;
    
    if (item.free_addons && item.free_addons.length > 0) {
      message += `   Adicionais grátis: ${item.free_addons.join(', ')}\n`;
    }
    
    if (item.paid_addons && item.paid_addons.length > 0) {
      const paidAddonsText = item.paid_addons.map(addon => `${addon.name} (R$${addon.price.toFixed(2)})`).join(', ');
      message += `   Adicionais pagos: ${paidAddonsText}\n`;
    }
    
    if (item.extra_addons && item.extra_addons.length > 0) {
      message += `   Adicionais extras (pagos R$3,00/un): ${item.extra_addons.join(', ')} (R$${item.extra_addons_price_total.toFixed(2)})\n`;
    }
    
    // Adicionar informações sobre colher/canudo/sachês
    if (item.needs_spoon) {
      message += `   🥄 Colher: Sim\n`;
    }
    if (item.needs_straw) {
      message += `   🥤 Canudo: Sim\n`;
    }
    if (item.ketchup_sache > 0) {
      message += `   🍅 Sachê ketchup: ${item.ketchup_sache}\n`;
    }
    if (item.maionese_sache > 0) {
      message += `   🥄 Sachê maionese: ${item.maionese_sache}\n`;
    }
    
    message += `   Subtotal: R$${item.subtotal.toFixed(2)}\n\n`;
  });
  
  message += `💰 *Sub-Total:* R$${subtotal.toFixed(2)}\n`;
  
  if (delivery_fee !== null) {
    message += `🚚 *Taxa de entrega:* R$${delivery_fee.toFixed(2)}\n`;
    message += `💰 *Total:* R$${total.toFixed(2)}\n\n`;
  } else {
    message += `🚚 *Taxa de entrega:* A definir pelo atendente via WhatsApp (endereço fora de Bem Viver ARAPONGAS)\n`;
    message += `💰 *Total (sem taxa):* R$${subtotal.toFixed(2)}\n\n`;
  }
  
  message += `🕒 Pedido gerado em: ${metadata.timestamp}\n`;
  
  // Adicionar dados PIX se o método de pagamento for PIX
  if (payment_method === 'PIX') {
    message += `\n📌 Dados PIX (opcional):\n`;
    message += `CPF: ${menuData.pix_info.cpf}\n`;
    message += `Nome: ${menuData.pix_info.name}\n`;
    message += `Banco: ${menuData.pix_info.bank}\n`;
    message += `Obs: Pagamento via PIX pode ser feito agora ou na entrega.\n`;
  }
  
  return message;
}

function saveOrder(order) {
  const ordersFile = path.join(__dirname, 'orders.json');
  let orders = [];
  
  try {
    if (fs.existsSync(ordersFile)) {
      const data = fs.readFileSync(ordersFile, 'utf8');
      orders = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao ler orders.json:', error);
    orders = [];
  }
  
  orders.push(order);
  
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Erro ao salvar orders.json:', error);
    throw new Error('Erro ao salvar pedido');
  }
}

// Routes
app.get('/api/menu', (req, res) => {
  res.json(menuData);
});

app.post('/api/orders', (req, res) => {
  try {
    // Sanitizar dados de entrada
    const sanitizedPayload = {
      ...req.body,
      customer: {
        name: sanitizeString(req.body.customer?.name),
        address_and_number: sanitizeString(req.body.customer?.address_and_number)
      }
    };
    
    // Validar payload
    const validation = validateOrderPayload(sanitizedPayload);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Calcular taxa de entrega
    const deliveryFee = calculateDeliveryFee(sanitizedPayload.customer.address_and_number);
    
    // Criar objeto do pedido
    const order = {
      ...sanitizedPayload,
      delivery_fee: deliveryFee,
      total: deliveryFee !== null ? sanitizedPayload.subtotal + deliveryFee : sanitizedPayload.subtotal,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
    
    // Salvar pedido
    saveOrder(order);
    
    // Gerar mensagem WhatsApp
    const waMessage = generateWhatsAppMessage(order);
    const waPhone = process.env.WA_PHONE || menuData.contact.wa_phone;
    const waLink = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(waMessage)}`;
    
    res.json({
      success: true,
      waMessage,
      waLink
    });
    
  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Menu API: http://localhost:${PORT}/api/menu`);
});

