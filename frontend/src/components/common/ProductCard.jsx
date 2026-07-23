import React from 'react';

export default function ProductCard({
  id,
  image,
  name,
  price,
  originalPrice,
  onAddToCart
}) {
  
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ id, name, price, image });
    }
  };

  return (
    <div className="flex flex-col gap-[16px] w-[300px] h-[463px] shrink-0">
      
      {/* 1.1 Product Image Container */}
      {/* ➔ FIX: Removed all padding (px/py) and bg-white. Image now goes full-bleed to the border! */}
      <div className="w-[300px] h-[300px] rounded-[12px] border border-[#DBD0BC] overflow-hidden flex items-center justify-center group relative">
        <img
          src={image || 'https://via.placeholder.com/300'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* 1.2 Details Container */}
      <div className="flex flex-col justify-between gap-[36px] w-[300px] h-[147px]">

        {/* 1.2.1 Text Container */}
        <div className="flex flex-col gap-[12px] w-full h-[60px]">
          
          {/* 1.2.1.1 Product Name */}
          <h3
            className="w-full font-inter font-semibold text-[20px] leading-none tracking-[-0.03em] text-[#222222] truncate m-0 p-0 antialiased"
            title={name} 
          >
            {name}
          </h3>

          {/* 1.2.1.2 Price Container */}
          <div className="flex items-center gap-[12px] w-full h-[24px]">
            <span className="font-inter font-semibold text-[20px] leading-none tracking-[-0.03em] text-[#222222] antialiased">
              ₹{price}
            </span>
            
            {originalPrice && (
              <span className="font-inter font-semibold text-[20px] leading-none tracking-[-0.03em] text-[#222222]/40 line-through antialiased">
                ₹{originalPrice}
              </span>
            )}
          </div>

        </div>

        {/* 1.2.2 CTA (Add to Cart) */}
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center w-[300px] h-[51px] rounded-[12px] bg-[#DBD0BC] px-[24px] py-[16px] transition-all hover:bg-[#cabaa3] active:scale-95 shadow-xs cursor-pointer"
        >
          <span className="font-inter font-normal text-[16px] leading-none tracking-[-0.03em] text-[#222222] antialiased">
            Add to Cart
          </span>
        </button>

      </div>
    </div>
  );
}