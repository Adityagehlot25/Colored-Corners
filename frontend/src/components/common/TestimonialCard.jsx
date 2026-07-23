import React from 'react';

export default function TestimonialCard({
  quote = "“Really loved this brand and their cutesy products. Would buy more in future.”",
  image = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  name = "Siddhanth Chauhan",
  location = "Mumbai",
  bgColor = "#FAEDCD"
}) {
  return (
    <div 
      className="flex flex-col justify-between w-[460px] h-[254px] rounded-[12px] p-[20px] shrink-0 select-none shadow-xs transition-transform duration-300 hover:-translate-y-1"
      style={{ backgroundColor: bgColor }}
    >
      {/* Testimonial Text Container */}
      {/* w: 420, h: 113, Typography: Inter Tight, 28px, leading: 123%, tracking: -3% */}
      <p className="font-inter w-full max-w-[420px] text-[28px] font-normal text-[#000000] leading-[1.23] tracking-[-0.03em] m-0 p-0 antialiased">
        {quote}
      </p>

      {/* Frame 2 (Person Container): h: 37, gap: 19px */}
      <div className="flex items-center gap-[19px] w-full h-[37px]">
        
        {/* Frame 2.1 Profile Image: w: 37, h: 37, rounded-full */}
        <div className="w-[37px] h-[37px] rounded-full overflow-hidden shrink-0 bg-[#000000]/10 border border-[#000000]/5">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Frame 2.2 Details Container: flex-col, justify-center */}
        <div className="flex flex-col justify-center gap-[2px]">
          
          {/* Frame 2.2.1 Name: Inter Display, 16px, Regular, leading: 100%, tracking: -3% */}
          <span className="font-inter text-[16px] font-normal text-[#000000] leading-none tracking-[-0.03em] antialiased">
            {name}
          </span>

          {/* Frame 2.2.2 Location: Inter Display, 14px, Regular, leading: 16px, tracking: -4%, opacity: 54% (#0000008A) */}
          <span className="font-inter text-[14px] font-normal text-[#000000]/54 leading-[16px] tracking-[-0.04em] antialiased">
            {location}
          </span>

        </div>

      </div>

    </div>
  );
}