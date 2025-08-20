import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';

const ItemModal = ({ item, menuData, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedFreeAddons, setSelectedFreeAddons] = useState([]);
  const [selectedPaidAddons, setSelectedPaidAddons] = useState([]);
  const [needsSpoon, setNeedsSpoon] = useState(false);
  const [needsStraw, setNeedsStraw] = useState(false);
  const [ketchupSache, setKetchupSache] = useState(0);
  const [maioneseSache, setMaioneseSache] = useState(0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getFreeAddons = () => {
    // Vitaminas e Geladão Gourmet não têm adicionais
    if (item.category.includes('Vitaminas') || item.category.includes('Geladão Gourmet')) {
      return [];
    }
    
    if (item.category.includes('Gelados')) {
      return menuData.Gelados.Açai.FreeAddons || [];
    }
    if (item.category.includes('Frituras') && item.category.includes('Churros Espanhol')) {
      return menuData.Frituras.Churros_Addons_Free || [];
    }
    return [];
  };

  const getPaidAddons = () => {
    // Vitaminas e Geladão Gourmet não têm adicionais
    if (item.category.includes('Vitaminas') || item.category.includes('Geladão Gourmet')) {
      return [];
    }
    
    if (item.category.includes('Gelados')) {
      return menuData.Gelados.Açai.PaidAddons || [];
    }
    if (item.category.includes('Frituras') && item.category.includes('Churros Espanhol')) {
      return menuData.Frituras.Churros_Addons_Paid || [];
    }
    return [];
  };

  const getExtraPricePerExtra = () => {
    if (item.category.includes('Gelados')) {
      return menuData.Gelados.Açai.extra_price_per_extra || 3.00;
    }
    return 0;
  };

  const calculateSubtotal = () => {
    let subtotal = item.price;
    
    // Adicionar preço dos adicionais pagos
    selectedPaidAddons.forEach(addonId => {
      const addon = getPaidAddons().find(a => a.id === addonId);
      if (addon) {
        subtotal += addon.price;
      }
    });
    
    // Adicionar preço dos adicionais extras (acima do limite grátis)
    const freeLimit = item.free_addons_limit || 0;
    const totalFreeAddons = selectedFreeAddons.length;
    const extraAddons = Math.max(0, totalFreeAddons - freeLimit);
    subtotal += extraAddons * getExtraPricePerExtra();
    
    return subtotal * quantity;
  };

  const handleFreeAddonChange = (addonName, checked) => {
    if (checked) {
      setSelectedFreeAddons(prev => [...prev, addonName]);
    } else {
      setSelectedFreeAddons(prev => prev.filter(name => name !== addonName));
    }
  };

  const handlePaidAddonChange = (addonId, checked) => {
    if (checked) {
      setSelectedPaidAddons(prev => [...prev, addonId]);
    } else {
      setSelectedPaidAddons(prev => prev.filter(id => id !== addonId));
    }
  };

  const handleAddToCart = () => {
    const freeLimit = item.free_addons_limit || 0;
    const extraAddons = selectedFreeAddons.slice(freeLimit);
    const regularFreeAddons = selectedFreeAddons.slice(0, freeLimit);
    
    const cartItem = {
      category: item.category,
      product_id: item.id,
      product_name: item.name,
      base_price: item.price,
      quantity,
      free_addons: regularFreeAddons,
      paid_addons: selectedPaidAddons.map(addonId => {
        const addon = getPaidAddons().find(a => a.id === addonId);
        return { id: addon.id, name: addon.name, price: addon.price };
      }),
      extra_addons: extraAddons,
      extra_addons_price_total: extraAddons.length * getExtraPricePerExtra(),
      subtotal: calculateSubtotal(),
      needs_spoon: needsSpoon,
      needs_straw: needsStraw,
      ketchup_sache: ketchupSache,
      maionese_sache: maioneseSache
    };
    
    onAddToCart(cartItem);
    onClose();
  };

  const freeAddons = getFreeAddons();
  const paidAddons = getPaidAddons();
  const freeLimit = item.free_addons_limit || 0;
  const isGelados = item.category.includes('Gelados') && (item.category.includes('Copos') || item.category.includes('Marmitas') || item.category.includes('Especiais'));
  const isLatas350ml = item.category.includes('Latas de 350ml');
  const isFrituras = item.category.includes('Frituras') && (item.category.includes('Mini Salgados') || item.category.includes('Churros Espanhol'));
  const isVitaminas = item.category.includes('Vitaminas');
  const isGeladaoGourmet = item.category.includes('Geladão Gourmet');
  const isMiniChurros = item.category.includes('Mini Churros');
  const isRefrigerantes2L = item.category.includes('Refrigerantes de 2L');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{item.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações do produto */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPrice(item.price)}
            </div>
            <p className="text-gray-600">{item.category}</p>
            {item.description && (
              <p className="text-gray-700 mt-2 text-sm bg-gray-50 p-3 rounded">
                {item.description}
              </p>
            )}
          </div>

          {/* Quantidade - apenas para Vitaminas, Geladão Gourmet e Latas de 350ml */}
          {(isVitaminas || isGeladaoGourmet || isLatas350ml || isRefrigerantes2L) && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Adicionais grátis */}
          {freeAddons.length > 0 && (
            <div className="space-y-3">
              <Label className="text-lg font-semibold">
                Adicionais Grátis (até {freeLimit})
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {freeAddons.map((addon, index) => {
                  const isExtra = selectedFreeAddons.indexOf(addon) >= freeLimit;
                  return (
                    <div key={addon} className="flex items-center space-x-2">
                      <Checkbox
                        id={`free-addon-${index}`}
                        checked={selectedFreeAddons.includes(addon)}
                        onCheckedChange={(checked) => handleFreeAddonChange(addon, checked)}
                      />
                      <Label
                        htmlFor={`free-addon-${index}`}
                        className={`text-sm ${isExtra ? 'text-orange-600 font-semibold' : ''}`}
                      >
                        {addon.replace(/_/g, ' ')}
                        {isExtra && (
                          <span className="ml-1 bg-orange-100 text-orange-800 px-1 py-0.5 rounded text-xs">
                            +{formatPrice(getExtraPricePerExtra())}
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Adicionais pagos */}
          {paidAddons.length > 0 && (
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Adicionais Pagos</Label>
              <div className="space-y-2">
                {paidAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`paid-addon-${addon.id}`}
                      checked={selectedPaidAddons.includes(addon.id)}
                      onCheckedChange={(checked) => handlePaidAddonChange(addon.id, checked)}
                    />
                    <Label htmlFor={`paid-addon-${addon.id}`} className="text-sm">
                      {addon.name} - {formatPrice(addon.price)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkboxes específicos */}
          {(isGelados || isLatas350ml || isFrituras) && (
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Extras</Label>
              
              {isGelados && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs-spoon"
                    checked={needsSpoon}
                    onCheckedChange={setNeedsSpoon}
                  />
                  <Label htmlFor="needs-spoon">Deseja colher?</Label>
                </div>
              )}

              {isLatas350ml && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs-straw"
                    checked={needsStraw}
                    onCheckedChange={setNeedsStraw}
                  />
                  <Label htmlFor="needs-straw">Deseja canudo?</Label>
                </div>
              )}

              {isFrituras && (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ketchup-sache"
                        checked={ketchupSache > 0}
                        onCheckedChange={(checked) => setKetchupSache(checked ? 1 : 0)}
                      />
                      <Label htmlFor="ketchup-sache">Sachê de ketchup</Label>
                    </div>
                    {ketchupSache > 0 && (
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={ketchupSache}
                        onChange={(e) => setKetchupSache(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="maionese-sache"
                        checked={maioneseSache > 0}
                        onCheckedChange={(checked) => setMaioneseSache(checked ? 1 : 0)}
                      />
                      <Label htmlFor="maionese-sache">Sachê de maionese</Label>
                    </div>
                    {maioneseSache > 0 && (
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={maioneseSache}
                        onChange={(e) => setMaioneseSache(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatPrice(calculateSubtotal())}</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Continuar comprando
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Adicionar ao carrinho
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemModal;

