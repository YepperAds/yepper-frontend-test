// AdsCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const AdsCard = ({filteredAds, searchQuery, compact = false}) => {
  const height = compact ? 'h-[200px]' : 'h-[280px]';
  const cardSize = compact ? 'w-14 h-12' : 'w-20 h-16';
  const imageHeight = compact ? 'h-4' : 'h-6';
  
  return (
    <div className="w-full">
      {filteredAds.length > 0 ? (
        <Link to="/ads">
          <div className="relative cursor-pointer group">
            <div className={`relative bg-white border-2 border-black p-4 ${height} flex flex-col`}>
              
              <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-black">
                
                <div className={`absolute top-0 left-0 right-0 ${compact ? 'h-4' : 'h-6'} bg-orange-300 border-b border-black`}></div>
                
                <div className={`absolute inset-0 ${compact ? 'top-4' : 'top-6'}`}>
                  {filteredAds.slice(0, 4).map((ad, index) => {
                    const positions = [
                      { x: 12, y: 15, rotate: -5, scale: 1 },
                      { x: 52, y: 20, rotate: 8, scale: 0.95 },
                      { x: 20, y: 52, rotate: -10, scale: 0.9 },
                      { x: 60, y: 15, rotate: 4, scale: 0.88 }
                    ];
                    
                    const pos = positions[index];
                    
                    const gradients = [
                      'from-blue-500 to-blue-600',
                      'from-purple-500 to-indigo-600', 
                      'from-pink-500 to-rose-600',
                      'from-orange-500 to-red-600'
                    ];

                    return (
                      <div
                        key={ad._id || index}
                        className={`absolute ${cardSize} transition-all duration-500 group-hover:scale-105`}
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
                          zIndex: 4 - index,
                        }}
                      >
                        <div className="relative bg-white rounded-md overflow-hidden shadow-lg border border-white/20 group-hover:shadow-xl transition-all duration-500">
                          
                          <div className={`${compact ? 'h-1.5' : 'h-2'} bg-gradient-to-r ${gradients[index]}`}></div>
                          
                          <div className={`${compact ? 'p-1' : 'p-1.5'} h-full flex flex-col bg-white`}>
                            <div className={`w-full ${imageHeight} overflow-hidden rounded-sm bg-slate-100 mb-1`}>
                              {ad.videoUrl ? (
                                <video 
                                  muted 
                                  className="w-full h-full object-cover"
                                >
                                  <source src={ad.videoUrl} type="video/mp4" />
                                </video>
                              ) : (
                                <img 
                                  src={ad.imageUrl} 
                                  alt={ad.businessName}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                              <div className={`${compact ? 'h-0.5' : 'h-1'} bg-slate-300 rounded-full w-3/4`}></div>
                              <div className={`${compact ? 'h-0.5' : 'h-0.5'} bg-slate-200 rounded-full w-1/2`}></div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div className={`${compact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-gradient-to-r ${gradients[index]}`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={`relative ${compact ? 'mt-2' : 'mt-4'} flex items-center justify-center`}>
                <div className="bg-white border-2 border-black px-3 py-1.5">
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-black uppercase tracking-wide`}>
                    Click to see your Ads
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className={`text-center py-8 border-2 border-black bg-white ${height} flex flex-col items-center justify-center`}>
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-black mb-1`}>
            {searchQuery ? 'No Campaigns Found' : 'No Active Campaigns Yet'}
          </h3>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
            {searchQuery 
              ? 'No campaigns match your current search criteria.'
              : 'Start creating your first campaign.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdsCard;