// Page.js
import React from 'react';

const Page = () => {
    return (
        <div className="flex h-full bg-white">
            <div className="flex-1 flex flex-col min-w-0 h-full bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center justify-center overflow-y-auto px-4 py-8 h-full min-h-0">
                    <div className="w-full max-w-3xl">
                        <div className="relative bg-white rounded-2xl shadow-2xl overflow-visible border border-gray-200">
                            <div className="relative h-72 bg-[#FCEEC9] overflow-visible px-8 pt-8 pb-16">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400 rounded-full blur-3xl"></div>
                                </div>
                                
                                <div className="relative h-full flex items-start justify-between">
                                    <div className="flex-1 pr-6 pt-8">
                                        <h1 className="text-5xl text-[#0284BC] font-bold mb-3 leading-tight" style={{fontFamily: 'Georgia, serif'}}>
                                            Social Media
                                            <span className="block text-transparent text-[#FF6347]">
                                                Strategy
                                            </span>
                                        </h1>
                                    </div>
                                    
                                    <div className="flex-shrink-0 relative">
                                        <img 
                                            className="w-64 h-82 object-cover rounded-2xl shadow-2xl" 
                                            alt="Social Media" 
                                            src="https://images.pexels.com/photos/8088489/pexels-photo-8088489.jpeg"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[#FF6347] p-8 mt-1">
                                <div className="max-w-md">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-1 h-16 bg-[#0284BC] rounded-full flex-shrink-0"></div>
                                        <p className="text-[#ffff] leading-relaxed font-semibold text-lg">
                                            Boosting <span className="font-bold text-[#000]">social media</span> posts is crucial because it expands your reach beyond existing followers, improves brand awareness and visibility, allows for precise audience targeting, drives website traffic and leads, and helps build a loyal community by engaging directly with customers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;