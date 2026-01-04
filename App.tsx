
import React, { useState, useMemo, useEffect } from 'react';
import { View, Product, CartItem, User, OrderDetails, Order, StoreSettings, OrderStatus } from './types';
import { MOCK_PRODUCTS } from './constants';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import AIChat from './components/AIChat';
import LoginModal from './components/LoginModal';
import CheckoutWorkflow from './components/CheckoutWorkflow';
import AdminPortal from './components/AdminPortal';
import ProfileView from './components/ProfileView';
import Footer from './components/Footer';
import InstallPwaBanner from './components/InstallPwaBanner';

export const App: React.FC = () => {
  const [currentView, setView] = useState<View>(View.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State to track if the current session is an Admin session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  // State to track if Admin is currently "Previewing" the user site
  const [isAdminPreviewing, setIsAdminPreviewing] = useState(false);
  
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mana_restaurant_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mana_restaurant_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mana_restaurant_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('mana_restaurant_settings');
    const defaultSettings: StoreSettings = {
      storeName: 'MANA FAMILY RESTAURANT',
      themeColor: '#8b0000',
      heroTitle: 'Authentic Taste. Family Tradition.',
      heroSubtitle: 'The finest Hyderabadi Dum Biryani and local Gongura specialties in Madhira.',
      heroImage: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=1920',
      chefSectionTitle: "Chef's Recommendations",
      deliveryFee: 50,
      supportEmail: 'kanna.secgrc@gmail.com',
      supportPhone: '8919108717',
      whatsappNumber: '8919108717',
      officeAddress: 'Madhira, KVR Hospital Lane, Khammam District - 507203',
      aboutUs: 'Authentic flavors and hygiene in Madhira.',
      operatingHoursLunch: '11:00 AM - 04:00 PM',
      operatingHoursDinner: '07:00 PM - 11:00 PM',
      operatingDays: 'Open Every Day',
      bannerHighlight: '⚡ Today\'s Special: Free Delivery on orders above ₹200!',
      promoImage: '',
      promoBackgroundColor: '',
      promoTextColor: '#ffffff',
      freeDeliveryThreshold: 200,
      customBadges: [
        { text: 'Get Directions', link: 'https://maps.google.com' },
        { text: 'Book Party Hall', link: 'https://wa.me/918919108717' }
      ]
    };
    
    // Migration logic for old string-based badges
    let loadedSettings = saved ? JSON.parse(saved) : defaultSettings;
    if (loadedSettings.customBadges && loadedSettings.customBadges.length > 0 && typeof loadedSettings.customBadges[0] === 'string') {
        loadedSettings.customBadges = defaultSettings.customBadges;
    }
    
    return { ...defaultSettings, ...loadedSettings };
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mana_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('mana_restaurant_products', JSON.stringify(products));
    localStorage.setItem('mana_restaurant_orders', JSON.stringify(orders));
    localStorage.setItem('mana_restaurant_users', JSON.stringify(registeredUsers));
    localStorage.setItem('mana_restaurant_settings', JSON.stringify(storeSettings));
    localStorage.setItem('mana_current_user', JSON.stringify(user));
  }, [products, orders, registeredUsers, storeSettings, user]);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setShowInstallBanner(false);
        }
        setInstallPrompt(null);
      });
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleOrderComplete = (details: OrderDetails) => {
    const baseFee = Number(storeSettings.deliveryFee) || 0;
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    
    // Apply Free Delivery Logic
    const finalShippingFee = subtotal >= (storeSettings.freeDeliveryThreshold || 0) ? 0 : baseFee;
    
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: details.fullName,
      customerEmail: user?.email || details.email || 'Guest',
      items: [...cart],
      subtotal: subtotal,
      shipping: finalShippingFee,
      total: subtotal + finalShippingFee,
      date: new Date().toISOString(),
      status: 'Pending',
      shippingAddress: `${details.address}, ${details.city}`,
      paymentMethod: details.paymentMethod
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setView(View.ORDER_SUCCESS);
    
    // Auto-register guest users if email provided
    if (details.email && !registeredUsers.find(u => u.email === details.email)) {
       const newUser: User = {
         id: Date.now().toString(),
         name: details.fullName,
         email: details.email,
         phone: details.zip, 
         address: details.address,
         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${details.email}`,
         joinedAt: new Date().toISOString()
       };
       setRegisteredUsers(prev => [...prev, newUser]);
    }
  };

  const handleLogin = (u: User, isAdmin: boolean) => {
    if (isAdmin) {
      setIsAdminLoggedIn(true);
      setView(View.ADMIN);
    } else {
      setUser(u);
      // Check if user exists, if not add to registered
      if (!registeredUsers.find(ru => ru.email === u.email)) {
        setRegisteredUsers(prev => [...prev, u]);
      }
    }
    setIsLoginOpen(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const isVisible = p.isActive;
      return matchesSearch && matchesCategory && isVisible;
    });
  }, [searchQuery, categoryFilter, products]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [selectedProductId, products]);

  // If Admin is logged in and NOT previewing, show Admin Portal
  if (isAdminLoggedIn && !isAdminPreviewing) {
    return (
      <div className="min-h-screen bg-gray-50 font-['Inter']">
        <style>{`:root { --brand-primary: ${storeSettings.themeColor}; }`}</style>
        <AdminPortal 
          products={products} 
          orders={orders} 
          registeredUsers={registeredUsers} 
          storeSettings={storeSettings} 
          onUpdateSettings={setStoreSettings} 
          onAddProduct={p => setProducts(prev => [p, ...prev])} 
          onDeleteProduct={id => setProducts(prev => prev.filter(p => p.id !== id))}
          onUpdateProduct={updateProduct}
          onUpdateOrderStatus={updateOrderStatus}
          onClose={() => { setIsAdminLoggedIn(false); setView(View.HOME); }}
          onPreview={() => { setIsAdminPreviewing(true); setView(View.HOME); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] font-['Inter']">
      <style>{`
        :root { --brand-primary: ${storeSettings.themeColor}; }
        .bg-brand { background-color: var(--brand-primary) !important; }
        .text-brand { color: var(--brand-primary) !important; }
        .border-brand { border-color: var(--brand-primary) !important; }
      `}</style>
      
      {/* Floating Admin Control when Previewing */}
      {isAdminPreviewing && (
        <div className="fixed bottom-6 left-6 z-[100] animate-in slide-in-from-bottom-10">
          <button 
            onClick={() => setIsAdminPreviewing(false)} 
            className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all border-4 border-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            Back to Dashboard
          </button>
        </div>
      )}
      
      <Header 
        currentView={currentView} 
        setView={setView} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        storeName={storeSettings.storeName} 
        user={user} 
        onSearch={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenLogin={() => setIsLoginOpen(true)}
      />
      
      <main className="flex-grow">
        {currentView === View.HOME && (
          <div className="space-y-12 pb-20">
            <section className="relative h-[80vh] flex items-center overflow-hidden rounded-[50px] mx-6 mt-6 shadow-2xl group">
              {/* Dynamic Hero Image */}
              <img src={storeSettings.heroImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60" />
              
              {/* Daily Highlight Banner Element */}
              {storeSettings.bannerHighlight && (
                <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20 animate-in slide-in-from-top-4 duration-1000">
                  <div 
                    className={`p-6 rounded-3xl shadow-2xl max-w-xs transform hover:scale-105 transition-transform cursor-default overflow-hidden relative ${!storeSettings.promoBackgroundColor ? 'bg-white/10 backdrop-blur-md border border-white/20' : ''}`}
                    style={{
                      backgroundColor: storeSettings.promoBackgroundColor || undefined,
                      color: storeSettings.promoTextColor || '#ffffff'
                    }}
                  >
                     {/* Promo Image Background */}
                     {storeSettings.promoImage && (
                        <img src={storeSettings.promoImage} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
                     )}
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: storeSettings.promoTextColor || '#4ade80' }}></span>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: storeSettings.promoTextColor || '#4ade80' }}>Today's Highlight</p>
                        </div>
                        <p className="font-bold leading-tight text-lg drop-shadow-md">
                        {storeSettings.bannerHighlight}
                        </p>
                     </div>
                  </div>
                </div>
              )}

              <div className="relative z-10 max-w-7xl mx-auto px-12 text-white">
                <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none tracking-tighter uppercase">{storeSettings.heroTitle}</h1>
                <p className="text-xl mb-12 opacity-80 max-w-2xl">{storeSettings.heroSubtitle}</p>
                {/* View Menu Button Removed from here */}
              </div>
            </section>

            {/* Dynamic Custom Badges Section (Clickable Links) with View Menu integrated */}
            <section className="max-w-7xl mx-auto px-6">
              <div className="flex flex-wrap justify-center gap-4">
                  {/* View Menu Button */}
                  <button 
                    onClick={() => setView(View.SHOP)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer animate-in zoom-in duration-500"
                  >
                    <span className="w-2 h-2 bg-brand rounded-full group-hover:animate-ping"></span>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-brand transition-colors">View Menu</span>
                    <svg className="w-3 h-3 text-gray-300 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </button>

                  {storeSettings.customBadges && storeSettings.customBadges.map((badge, idx) => (
                    <a 
                      key={idx} 
                      href={badge.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer animate-in zoom-in duration-500" 
                      style={{animationDelay: `${idx * 100}ms`}}
                    >
                        <span className="w-2 h-2 bg-brand rounded-full group-hover:animate-ping"></span>
                        <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-brand transition-colors">{badge.text}</span>
                        <svg className="w-3 h-3 text-gray-300 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  ))}
              </div>
            </section>
            
            <section className="max-w-7xl mx-auto px-6 pt-8">
               {/* Dynamic Section Title */}
               <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-12">{storeSettings.chefSectionTitle}</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.filter(p => p.isActive).slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetails={(id) => { setSelectedProductId(id); setView(View.PRODUCT_DETAILS); }} />
                  ))}
               </div>
            </section>
          </div>
        )}

        {currentView === View.SHOP && (
          <div className="max-w-7xl mx-auto px-6 py-12">
             <button 
                onClick={() => setView(View.HOME)}
                className="mb-8 px-6 py-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-brand hover:border-brand transition-all"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Home
             </button>
             
             <div className="flex flex-wrap gap-2 mb-12">
                {['All', 'Biryanis', 'Starters', 'Curries'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-brand text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400'}`}>{cat}</button>
                ))}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetails={(id) => { setSelectedProductId(id); setView(View.PRODUCT_DETAILS); }} />
                ))}
             </div>
          </div>
        )}

        {currentView === View.PRODUCT_DETAILS && selectedProduct && (
          <ProductDetails product={selectedProduct} onAddToCart={addToCart} onBack={() => setView(View.SHOP)} />
        )}

        {currentView === View.PROFILE && user && (
          <ProfileView user={user} orders={orders} onLogout={() => { setUser(null); setView(View.HOME); }} />
        )}

        {currentView === View.CHECKOUT && (
           <CheckoutWorkflow 
             items={cart} 
             subtotal={cart.reduce((s, i) => s + i.price * i.quantity, 0)} 
             deliveryFee={Number(storeSettings.deliveryFee)}
             freeDeliveryThreshold={storeSettings.freeDeliveryThreshold}
             onComplete={handleOrderComplete} 
             onCancel={() => setView(View.SHOP)} 
           />
        )}

        {currentView === View.ORDER_SUCCESS && (
           <div className="max-w-7xl mx-auto px-6 py-32 text-center animate-in fade-in zoom-in">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" /></svg>
             </div>
             <h1 className="text-7xl font-black text-gray-900 tracking-tighter uppercase mb-8">Ordered!</h1>
             <p className="text-xl text-gray-500 mb-12 font-medium">Your feast is being prepared. You can track status in your Profile.</p>
             <button onClick={() => setView(View.PROFILE)} className="px-12 py-5 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl">Track My Order</button>
           </div>
        )}
      </main>

      <Footer settings={storeSettings} />

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} products={products} />
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
      </button>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        freeDeliveryThreshold={storeSettings.freeDeliveryThreshold}
        onRemove={id => setCart(prev => prev.filter(i => i.id !== id))} 
        onUpdateQty={(id, delta) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))} 
        onCheckout={() => { setIsCartOpen(false); setView(View.CHECKOUT); }} 
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
      
      {/* PWA Install Banner - Only shows if browser prompts */}
      {showInstallBanner && installPrompt && (
        <InstallPwaBanner 
           installPrompt={installPrompt} 
           onInstall={handleInstallClick} 
           onDismiss={() => setShowInstallBanner(false)} 
        />
      )}
    </div>
  );
};
