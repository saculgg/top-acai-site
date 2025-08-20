import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';
import ItemModal from './components/ItemModal';
import CheckoutModal from './components/CheckoutModal';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [menuData, setMenuData] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'category', 'subcategory'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Carregar menu da API
  useEffect(() => {
    fetchMenu();
    loadCartFromStorage();
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchMenu = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/menu');
      const data = await response.json();
      setMenuData(data);
    } catch (error) {
      console.error('Erro ao carregar menu:', error);
      toast.error("Não foi possível carregar o menu. Tente novamente.");
    }
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  };

  const addToCart = (item) => {
    const cartItem = {
      id: Date.now() + Math.random(), // ID único
      ...item
    };
    setCart(prev => [...prev, cartItem]);
    toast.success(`${item.product_name} foi adicionado ao carrinho.`);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removido do carrinho.");
  };

  const updateCartItem = (itemId, updatedItem) => {
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...updatedItem, id: itemId } : item
    ));
    toast.success("Item do carrinho foi atualizado.");
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const openItemModal = (item, category, subcategory = null) => {
    setSelectedItem({ ...item, category, subcategory });
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (!menuData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600">
      <Header 
        storeName={menuData.store_name}
        cartItemCount={getCartItemCount()}
        onCartClick={() => setShowCart(true)}
        onHomeClick={() => {
          setCurrentView('home');
          setCurrentCategory(null);
          setCurrentSubcategory(null);
        }}
      />
      
      <main className="container mx-auto px-4 py-8">
        <Menu
          menuData={menuData}
          currentView={currentView}
          currentCategory={currentCategory}
          currentSubcategory={currentSubcategory}
          onCategorySelect={(category) => {
            setCurrentView('category');
            setCurrentCategory(category);
            setCurrentSubcategory(null);
          }}
          onSubcategorySelect={(subcategory) => {
            setCurrentView('subcategory');
            setCurrentSubcategory(subcategory);
          }}
          onItemSelect={openItemModal}
          onBack={() => {
            if (currentView === 'subcategory') {
              setCurrentView('category');
              setCurrentSubcategory(null);
            } else if (currentView === 'category') {
              setCurrentView('home');
              setCurrentCategory(null);
            }
          }}
        />
      </main>

      {/* Modais */}
      {showItemModal && selectedItem && (
        <ItemModal
          item={selectedItem}
          menuData={menuData}
          onClose={closeItemModal}
          onAddToCart={addToCart}
        />
      )}

      {showCart && (
        <Cart
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemoveItem={removeFromCart}
          onUpdateItem={updateCartItem}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
          onEditItem={(item) => {
            setSelectedItem(item);
            setShowCart(false);
            setShowItemModal(true);
          }}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          menuData={menuData}
          onClose={() => setShowCheckout(false)}
          onSuccess={clearCart}
        />
      )}

      <Toaster />
    </div>
  );
}

export default App;
