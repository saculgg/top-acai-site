import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const CheckoutModal = ({ cart, menuData, onClose, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPixInfo, setShowPixInfo] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const calculateDeliveryFee = (address) => {
    const freeNeighborhood = menuData.delivery_rules.free_in_neighborhood_case_insensitive.toLowerCase();
    if (address.toLowerCase().includes(freeNeighborhood)) {
      return 0.00;
    }
    return null; // A definir
  };

  const deliveryFee = calculateDeliveryFee(customerAddress);
  const subtotal = getCartSubtotal();
  const total = deliveryFee !== null ? subtotal + deliveryFee : subtotal;

  const isFormValid = () => {
    return customerName.trim() && customerAddress.trim() && paymentMethod;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: customerName.trim(),
          address_and_number: customerAddress.trim()
        },
        payment_method: paymentMethod,
        change_info: paymentMethod === 'DINHEIRO' && needsChange ? {
          needs_change: true,
          change_amount: parseFloat(changeAmount) || 0
        } : { needs_change: false },
        items: cart.map(item => ({
          category: item.category,
          product_id: item.product_id,
          product_name: item.product_name,
          base_price: item.base_price,
          quantity: item.quantity,
          free_addons: item.free_addons || [],
          paid_addons: item.paid_addons || [],
          extra_addons: item.extra_addons || [],
          extra_addons_price_total: item.extra_addons_price_total || 0,
          subtotal: item.subtotal,
          needs_spoon: item.needs_spoon || false,
          needs_straw: item.needs_straw || false,
          ketchup_sache: item.ketchup_sache || 0,
          maionese_sache: item.maionese_sache || 0
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total
      };

      const response = await fetch(\'https://top-acai-backend.onrender.com/api/orders\', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar pedido');
      }

      const result = await response.json();
      
      // Abrir WhatsApp em nova aba
      window.open(result.waLink, '_blank');
      
      toast.success("Seu pedido foi enviado para o WhatsApp. Aguarde confirmação.");

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error("Não foi possível enviar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
    setShowPixInfo(value === 'PIX');
    
    // Reset change states when payment method changes
    if (value !== 'DINHEIRO') {
      setNeedsChange(false);
      setChangeAmount('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Finalizar Pedido</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar checkout"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Cliente</h3>
              
              <div className="space-y-2">
                <Label htmlFor="customer-name">Nome *</Label>
                <Input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-address">Endereço e Número *</Label>
                <Input
                  id="customer-address"
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  required
                />
              </div>
            </div>

            {/* Método de pagamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Método de Pagamento</h3>
              
              <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARTÃO">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Cartão</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DINHEIRO">
                    <div className="flex items-center space-x-2">
                      <Banknote className="h-4 w-4" />
                      <span>Dinheiro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PIX">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>PIX</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Informações de troco para pagamento em dinheiro */}
              {paymentMethod === 'DINHEIRO' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-yellow-800">Informações sobre troco:</h4>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="needs-change"
                      checked={needsChange}
                      onChange={(e) => setNeedsChange(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="needs-change" className="text-yellow-700">
                      Preciso de troco
                    </Label>
                  </div>
                  
                  {needsChange && (
                    <div className="space-y-2">
                      <Label htmlFor="change-amount" className="text-yellow-700">
                        Valor para troco:
                      </Label>
                      <Input
                        id="change-amount"
                        type="number"
                        step="0.01"
                        min={total + 0.01}
                        value={changeAmount}
                        onChange={(e) => setChangeAmount(e.target.value)}
                        placeholder={`Mínimo: ${formatPrice(total + 0.01)}`}
                        className="border-yellow-300"
                      />
                      {changeAmount && parseFloat(changeAmount) > total && (
                        <p className="text-sm text-yellow-600">
                          Troco: {formatPrice(parseFloat(changeAmount) - total)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Informações PIX */}
              {showPixInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Dados PIX:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>CPF:</strong> {menuData.pix_info.cpf}</p>
                    <p><strong>Nome:</strong> {menuData.pix_info.name}</p>
                    <p><strong>Banco:</strong> {menuData.pix_info.bank}</p>
                  </div>
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    Pagamento via PIX pode ser feito agora ou na entrega — não é obrigatório pagar no momento.
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">
                  💡 Pagamento na entrega permitido (não obrigatório pagar agora).
                </p>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumo do Pedido</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'}):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Taxa de entrega:</span>
                  <span>
                    {deliveryFee !== null 
                      ? formatPrice(deliveryFee)
                      : 'A definir pelo atendente via WhatsApp'
                    }
                  </span>
                </div>
                
                {deliveryFee === 0 && (
                  <p className="text-sm text-green-600">
                    ✅ Entrega grátis para Bem Viver ARAPONGAS
                  </p>
                )}
                
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {deliveryFee !== null 
                      ? formatPrice(total)
                      : `${formatPrice(subtotal)} (+ taxa a definir)`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutModal;

