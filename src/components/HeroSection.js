// HeroSection.js
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button, Grid } from './components';

const HeroSection = ({ isAuthenticated, handleReadMore }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative px-6">
      {/* Buttons in the center */}
      <Grid cols={2} gap={8} className="max-w-4xl mx-auto py-8">
        {/* Left Column - Website Section */}
        <div className="flex flex-col items-center">
          <Link to={isAuthenticated ? '/add-website' : '/add'} className="w-full">
            <Button 
              variant="primary" 
              size="lg" 
              className="h-16 w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0 min-h-[4rem]"
            >
              <ArrowLeft />
              <span className="text-center leading-tight">Run Ads on your Website</span>
            </Button>
          </Link>
        </div>
        
        {/* Right Column - Ads Section */}
        <div className="flex flex-col items-center">
          <Link to={isAuthenticated ? "/advertise" : "/add-ad"} className="w-full">
            <Button 
              variant="primary" 
              size="lg" 
              className="h-16 w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0 min-h-[4rem]"
            >
              <span className="text-center leading-tight">Advertise your Product Online</span>
              <ArrowRight />
            </Button>
          </Link>
        </div>
      </Grid>

      {/* Glass Info Container at the bottom */}
      <div className="w-full max-w-2xl px-6">
        <div className="relative group">
          {/* Glass morphism container */}
          <div className="relative bg-white/40 backdrop-blur-md border border-gray-200/50 p-4 shadow-lg hover:shadow-xl transition-all duration-500">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-transparent pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <p className="text-center text-black text-base md:text-lg leading-relaxed font-medium mb-4">
                Yepper connects website owners and advertisers through an automated system that makes digital advertising simple, transparent, and efficient.
              </p>
              
              {/* Read More Button */}
              <div className="flex justify-center">
                <button 
                  onClick={handleReadMore}
                  className="group/btn inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <span>Learn More</span>
                  <ChevronDown size={18} className="ml-2 group-hover/btn:translate-y-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-1 -left-1 w-20 h-20 bg-gradient-to-tr from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;