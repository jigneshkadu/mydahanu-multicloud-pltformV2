
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, PartyPopper, Stethoscope, Truck, Sparkles, Hammer, SprayCan, Utensils, Hotel, Calendar } from 'lucide-react';
import { Category } from '../types';

interface BottomNavProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ categories, onCategoryClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Icon Helper (Same as used in App/CategoryView)
  const getIcon = (iconName: string | undefined) => {
    const props = { className: "w-6 h-6 mb-1" };
    switch(iconName) {
      case 'PartyPopper': return <PartyPopper {...props} />;
      case 'Stethoscope': return <Stethoscope {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Hammer': return <Hammer {...props} />;
      case 'SprayCan': return <SprayCan {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Hotel': return <Hotel {...props} />;
      default: return <Calendar {...props} />;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50 h-28 flex items-center border-t border-gray-200 pb-safe">
       {/* Scroll Button Left */}
       <button onClick={() => scroll('left')} className="p-2 h-full bg-white hover:bg-gray-50 z-10 hidden md:flex items-center justify-center border-r border-gray-200">
         <ChevronLeft className="w-6 h-6 text-gray-600" />
       </button>

       {/* Scrollable Container */}
       <div 
         ref={scrollRef}
         className="flex-1 flex items-center overflow-x-auto gap-3 px-3 no-scrollbar h-full py-2"
       >
          {categories.map(cat => (
             <button 
                key={cat.id} 
                onClick={() => onCategoryClick(cat)}
                className="flex flex-col items-center justify-center min-w-[90px] h-[85px] rounded-lg bg-primary hover:bg-[#7E6885] transition-all shadow-sm hover:shadow-md group active:scale-95"
             >
                <div className="text-white transition-colors">
                   {getIcon(cat.icon)}
                </div>
                <span className="text-[11px] font-bold text-center leading-tight px-1 truncate w-full text-white">{cat.name}</span>
             </button>
          ))}
       </div>

       {/* Scroll Button Right */}
       <button onClick={() => scroll('right')} className="p-2 h-full bg-white hover:bg-gray-50 z-10 hidden md:flex items-center justify-center border-l border-gray-200">
         <ChevronRight className="w-6 h-6 text-gray-600" />
       </button>
    </div>
  );
}

export default BottomNav;