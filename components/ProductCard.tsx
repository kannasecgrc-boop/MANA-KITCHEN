
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart }) => {
  if (!product.isActive) return null; // Hide disabled items from customer menu

  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`group bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-500 ${isOutOfStock ? 'opacity-80' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
      <div 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => !isOutOfStock && onViewDetails(product.id)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-110'}`}
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.discountPercentage > 0 && !isOutOfStock && (
            <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
              {product.discountPercentage}% OFF
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-gray-900 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
              Stock Over
            </div>
          )}
        </div>

        {!isOutOfStock && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="absolute bottom-4 right-4 w-12 h-12 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className={`text-base font-black truncate uppercase tracking-tight ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>{product.name}</h3>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{product.category}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            {product.mrp > product.price && (
              <span className="text-[10px] font-bold text-gray-400 line-through decoration-gray-400/50">₹{product.mrp}</span>
            )}
            <p className={`text-lg font-black tracking-tighter leading-none ${isOutOfStock ? 'text-gray-300' : 'text-brand'}`}>₹{product.price}</p>
          </div>
        </div>
        
        <button 
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isOutOfStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-brand shadow-xl'}`}
        >
          {isOutOfStock ? 'Unavailable' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
