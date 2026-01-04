
import { Product, User, Order, StoreSettings } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const KEYS = {
  PRODUCTS: 'mana_restaurant_products',
  ORDERS: 'mana_restaurant_orders',
  USERS: 'mana_restaurant_users',
  SETTINGS: 'mana_restaurant_settings',
  CURRENT_USER: 'mana_current_user',
  LOGS: 'deepak_emart_logs'
};

export const storageService = {
  // --- LOADERS ---
  loadProducts: (): Product[] => {
    const saved = localStorage.getItem(KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  },

  loadOrders: (): Order[] => {
    const saved = localStorage.getItem(KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  },

  loadUsers: (): User[] => {
    const saved = localStorage.getItem(KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  },

  loadSettings: (): StoreSettings => {
    const saved = localStorage.getItem(KEYS.SETTINGS);
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
    
    // Merge saved settings with defaults to ensure new fields (like promoImage) exist
    if (saved) {
        const parsed = JSON.parse(saved);
        // Migration fix for old badges
        if (parsed.customBadges && parsed.customBadges.length > 0 && typeof parsed.customBadges[0] === 'string') {
             parsed.customBadges = defaultSettings.customBadges;
        }
        return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  },

  loadCurrentUser: (): User | null => {
    const saved = localStorage.getItem(KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  },

  // --- SAVERS ---
  saveProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),
  saveOrders: (orders: Order[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  saveSettings: (settings: StoreSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),
  saveCurrentUser: (user: User | null) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user)),

  // --- DATABASE MANAGEMENT ---
  
  // Creates a complete JSON backup of the system
  createBackup: () => {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0.3',
      products: JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
      orders: JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]'),
      users: JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
      settings: JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}'),
      logs: JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]')
    };
    return JSON.stringify(data, null, 2);
  },

  // Restores data from a JSON object
  restoreBackup: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Basic validation
      if (!data.products || !data.users || !data.settings) {
        throw new Error("Invalid backup file format");
      }

      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data.products));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(data.orders));
      localStorage.setItem(KEYS.USERS, JSON.stringify(data.users));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.logs) localStorage.setItem(KEYS.LOGS, JSON.stringify(data.logs));

      return { success: true, data };
    } catch (error) {
      console.error("Restore failed", error);
      return { success: false, error };
    }
  },

  // Hard Reset (For Admin debugging)
  clearDatabase: () => {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.LOGS);
    window.location.reload();
  }
};
