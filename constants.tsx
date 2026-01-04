
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'food-1',
    name: 'Hyderabadi Chicken Dum Biryani',
    description: 'Slow-cooked for 6 hours. Authentic long-grain basmati rice cooked with succulent chicken pieces.',
    mrp: 350,
    price: 280,
    discountPercentage: 20,
    category: 'Biryanis',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    stock: 50,
    isActive: true
  },
  {
    id: 'food-2',
    name: 'Special Gongura Mutton Biryani',
    description: 'Our house specialty! Tender mutton pieces marinated in tangy Gongura leaf paste.',
    mrp: 450,
    price: 399,
    discountPercentage: 11,
    category: 'Biryanis',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    stock: 30,
    isActive: true
  },
  {
    id: 'food-3',
    name: 'Classic Chicken 65',
    description: 'Spicy, deep-fried chicken tempered with curry leaves and green chillies.',
    mrp: 280,
    price: 220,
    discountPercentage: 21,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    stock: 100,
    isActive: true
  }
];

export const CATEGORIES = [
  'All',
  'Starters',
  'Biryanis',
  'Curries',
  'Breads',
  'Desserts',
  'Beverages'
];
