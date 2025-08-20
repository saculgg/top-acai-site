import React from 'react';
import { ShoppingCart, Home } from 'lucide-react';
import { Button } from './ui/button';

const Header = ({ storeName, cartItemCount, onCartClick, onHomeClick }) => {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHomeClick}
              className="text-white hover:bg-white/20"
              aria-label="Voltar ao início"
            >
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              {storeName}
            </h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCartClick}
            className="text-white hover:bg-white/20 relative"
            aria-label={`Carrinho com ${cartItemCount} itens`}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

