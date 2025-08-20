import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const Cart = ({ cart, onClose, onRemoveItem, onUpdateItem, onCheckout, onEditItem }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const calculateDeliveryFee = () => {
    // Esta lógica será implementada no checkout
    return null; // A definir
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return deliveryFee !== null ? subtotal + deliveryFee : subtotal;
  };

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="bg-white max-w-md w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Carrinho</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar carrinho"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
            <Button onClick={onClose}>Continuar comprando</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar carrinho"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Lista de itens */}
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.quantity}x {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-sm font-medium text-green-600">
                      Preço base: {formatPrice(item.base_price)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditItem(item)}
                      aria-label="Editar item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                      aria-label="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Adicionais grátis */}
                {item.free_addons && item.free_addons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Adicionais grátis:</p>
                    <p className="text-sm text-gray-600">
                      {item.free_addons.map(addon => addon.replace(/_/g, ' ')).join(', ')}
                    </p>
                  </div>
                )}

                {/* Adicionais pagos */}
                {item.paid_addons && item.paid_addons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Adicionais pagos:</p>
                    <div className="text-sm text-gray-600">
                      {item.paid_addons.map((addon, index) => (
                        <span key={index}>
                          {addon.name} ({formatPrice(addon.price)})
                          {index < item.paid_addons.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adicionais extras */}
                {item.extra_addons && item.extra_addons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      Adicionais extras (+{formatPrice(item.extra_addons_price_total)}):
                    </p>
                    <p className="text-sm text-orange-600">
                      {item.extra_addons.map(addon => addon.replace(/_/g, ' ')).join(', ')}
                    </p>
                  </div>
                )}

                {/* Extras específicos */}
                <div className="text-sm text-gray-600">
                  {item.needs_spoon && <span className="block">🥄 Com colher</span>}
                  {item.needs_straw && <span className="block">🥤 Com canudo</span>}
                  {item.ketchup_sache > 0 && (
                    <span className="block">🍅 Sachê ketchup: {item.ketchup_sache}</span>
                  )}
                  {item.maionese_sache > 0 && (
                    <span className="block">🥄 Sachê maionese: {item.maionese_sache}</span>
                  )}
                </div>

                {/* Subtotal do item */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo do pedido */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal:</span>
              <span className="font-medium">{formatPrice(getCartSubtotal())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Taxa de entrega:</span>
              <span className="font-medium text-gray-600">A definir no checkout</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">{formatPrice(getCartTotal())}</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Continuar comprando
            </Button>
            <Button
              onClick={onCheckout}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Finalizar pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;

