import React from 'react';
import { ArrowLeft, IceCream, Utensils, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const Menu = ({
  menuData,
  currentView,
  currentCategory,
  currentSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  onItemSelect,
  onBack
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Gelados':
        return <IceCream className="h-8 w-8" />;
      case 'Frituras':
        return <Utensils className="h-8 w-8" />;
      case 'Bebidas':
        return <Coffee className="h-8 w-8" />;
      default:
        return <IceCream className="h-8 w-8" />;
    }
  };

  // Página inicial - mostrar categorias principais
  if (currentView === 'home') {
    const categories = Object.keys(menuData).filter(key => 
      !['store_name', 'contact', 'delivery_rules', 'pix_info'].includes(key)
    );

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Escolha uma categoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onCategorySelect(category)}
            >
              <CardContent className="p-8 text-center">
                <div className="text-white mb-4 flex justify-center">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-2xl font-bold text-white">{category}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Página de categoria - mostrar subcategorias
  if (currentView === 'category' && currentCategory) {
    const categoryData = menuData[currentCategory];
    
    // Se for categoria Açaí, mostrar subcategorias
    if (currentCategory === 'Gelados' && categoryData.Açai) {
      const subcategories = Object.keys(categoryData.Açai).filter(key => 
        !['PaidAddons', 'FreeAddons', 'extra_price_per_extra'].includes(key)
      );

      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-3xl font-bold text-white">
              {currentCategory} - Açaí
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map((subcategory) => (
              <Card
                key={subcategory}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => onSubcategorySelect(subcategory)}
              >
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-white">{subcategory}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }
    
    // Para outras categorias, mostrar subcategorias diretamente
    const subcategories = Object.keys(categoryData).filter(key => 
      !['extra_options','Churros_Addons_Paid','Churros_Addons_Free'].includes(key)
    );
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold text-white">{currentCategory}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((subcategory) => (
            <Card
              key={subcategory}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onSubcategorySelect(subcategory)}
            >
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-white">{subcategory}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Página de subcategoria - mostrar itens
  if (currentView === 'subcategory' && currentSubcategory) {
    let items = [];
    let categoryPath = currentCategory;
    
    if (currentCategory === 'Gelados') {
      items = menuData.Gelados.Açai[currentSubcategory] || [];
      categoryPath = `${currentCategory} > Açaí > ${currentSubcategory}`;
    } else {
      items = menuData[currentCategory][currentSubcategory] || [];
      categoryPath = `${currentCategory} > ${currentSubcategory}`;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold text-white">{categoryPath}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onItemSelect(item, categoryPath)}
            >
              <CardHeader>
                <CardTitle className="text-white text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300 mb-2">
                  {formatPrice(item.price)}
                </div>
                {item.description && (
                  <p className="text-white/80 text-sm mb-2">
                    {item.description}
                  </p>
                )}
                {item.free_addons_limit && (
                  <p className="text-white/80 text-sm">
                    {item.free_addons_limit} adicionais grátis
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default Menu;

