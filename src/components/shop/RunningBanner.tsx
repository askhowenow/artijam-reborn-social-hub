
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Product } from '@/hooks/use-products';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp } from 'lucide-react';

type BannerItem = {
  id: string;
  type: 'product' | 'service' | 'event';
  title: string;
  image: string;
  price?: number;
  category: string;
  path: string;
}

interface RunningBannerProps {
  data: BannerItem[];
  slideDuration?: number;
  className?: string;
}

const RunningBanner = ({ 
  data, 
  slideDuration = 5000,
  className = ""
}: RunningBannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const totalItems = data.length;
  
  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % totalItems);
  }, [totalItems]);

  useEffect(() => {
    if (data.length <= 1) return;
    
    const interval = setInterval(nextSlide, slideDuration);
    return () => clearInterval(interval);
  }, [data.length, nextSlide, slideDuration]);

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-artijam-purple" />
        <h2 className="text-lg font-bold text-gray-100 dark:text-gray-100">Trending Now</h2>
      </div>
      
      <Carousel 
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
        setApi={(api) => {
          if (api) {
            api.scrollTo(activeIndex);
          }
        }}
      >
        <CarouselContent>
          {data.map((item, index) => (
            <CarouselItem key={item.id} className="basis-full">
              <div className="p-1">
                <Card 
                  className="overflow-hidden cursor-pointer group bg-gray-800/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-700/30 hover:bg-gray-700/70"
                  onClick={() => handleItemClick(item.path)}
                >
                  <div className="flex items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-900 dark:bg-gray-900">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <CardContent className="py-3 px-4">
                      <Badge variant="outline" className="mb-2 bg-gray-700/50 dark:bg-gray-700/50 text-gray-200 border-gray-600">
                        {item.type} • {item.category}
                      </Badge>
                      <h3 className="font-medium line-clamp-2 text-gray-100 dark:text-gray-100">{item.title}</h3>
                      {item.price !== undefined && (
                        <p className="font-bold text-yellow-400 dark:text-yellow-400 mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-artijam-purple">
                        <span className="group-hover:underline text-artijam-purple-light dark:text-artijam-purple-light">View details</span>
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform text-artijam-purple-light dark:text-artijam-purple-light" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <div className="flex justify-center mt-2 gap-1">
        {data.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === activeIndex ? 'bg-artijam-purple w-4' : 'bg-gray-600/50 dark:bg-gray-600/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RunningBanner;
