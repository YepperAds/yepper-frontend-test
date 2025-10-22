// Home.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Button, 
  Grid,
} from '../components/components';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, token } = useAuth();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [showMarketing, setShowMarketing] = useState(false);
  const marketingRef = useRef(null);

  const getAuthenticatedAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  const { data: mixedAds, isLoading, error, refetch } = useQuery({
    queryKey: ['mixedAds', user?._id || user?.id],
    queryFn: async () => {
      try {
        const userId = user?._id || user?.id;
        const authenticatedAxios = getAuthenticatedAxios();
        const response = await authenticatedAxios.get(`/web-advertise/mixed/${userId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: isAuthenticated && !!(user?._id || user?.id),
    onSuccess: (data) => {
      setFilteredAds(data || []);
    }
  });

  const { data: websites } = useQuery({
    queryKey: ['websites', user?._id || user?.id],
    queryFn: async () => {
      try {
        const userId = user?._id || user?.id;
        const authenticatedAxios = getAuthenticatedAxios();
        const response = await authenticatedAxios.get(`/createWebsite/${userId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: isAuthenticated && !!(user?._id || user?.id),
    onSuccess: (data) => {
      setFilteredWebsites(data || []);
    }
  });

  useEffect(() => {
    if (!mixedAds) return;

    const performSearch = () => {
      const query = searchQuery.toLowerCase().trim();
      const statusFiltered = selectedFilter === 'all' 
        ? mixedAds 
        : mixedAds.filter(ad => ad.websiteSelections?.some(ws => 
          selectedFilter === 'approved' ? ws.approved : !ws.approved
        ));

      if (!query) {
        setFilteredAds(statusFiltered);
        return;
      }

      const searched = statusFiltered.filter(ad => {
        const searchFields = [
          ad.businessName?.toLowerCase(),
          ad.adDescription?.toLowerCase(),
          ...(ad.websiteSelections?.map(ws => ws.websiteId?.websiteName?.toLowerCase()) || [])
        ];
        return searchFields.some(field => field?.includes(query));
      });
      
      setFilteredAds(searched);
    };
  performSearch();
  }, [searchQuery, selectedFilter, mixedAds]);

  useEffect(() => {
    if (!websites) return;

    const performSearch = () => {
      const query = searchQuery.toLowerCase().trim();
      const statusFiltered = selectedFilter === 'all' 
        ? websites 
        : websites.filter(website => website.status === selectedFilter);

      if (!query) {
        setFilteredWebsites(statusFiltered);
        return;
      }

      const searched = statusFiltered.filter(website => {
        const searchFields = [
          website.websiteName?.toLowerCase(),
          website.websiteLink?.toLowerCase(),
        ];
        return searchFields.some(field => field?.includes(query));
      });
        
      setFilteredWebsites(searched);
    };

    performSearch();
  }, [searchQuery, selectedFilter, websites]);

  const handleReadMore = () => {
    setShowMarketing(true);
    setTimeout(() => {
      marketingRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const triggerPoint = window.innerHeight * 0.7;
      
      if (scrollPosition > triggerPoint && !showMarketing) {
        setShowMarketing(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showMarketing]);

  useEffect(() => {
  }, [isAuthenticated, user, mixedAds, websites, isLoading, error]);

  if (error) return (
      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
          <h2>Error Loading Data</h2>
          <p>{error.message}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
  );

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white">
          {/* Main Hero Section */}
          <div className="min-h-screen bg-white flex flex-col items-center justify-center relative px-6">
            {/* Buttons in the center */}
            <Grid cols={2} gap={8} className="max-w-4xl mx-auto py-8">
              {/* Left Column - Website Section */}
              <div className="flex flex-col items-center">
                <Link to='/add' className="w-full">
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
                <Link to="/add-ad" className="w-full">
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

          {/* Marketing Section */}
          <div 
            ref={marketingRef}
            className={`transition-all duration-1000 ease-out ${
              showMarketing 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 py-16">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                  A Smarter Way to Buy and Sell Ad Spaces
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Yepper connects website owners and advertisers through an automated system that makes digital advertising simple, transparent, and efficient.
                </p>
              </div>
            </div>

            {/* The Problem */}
            <div className="py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-black mb-4">
                  The Problem
                </h2>
                <p className="text-base text-gray-700 mb-4 leading-relaxed">
                  Digital advertising is often complicated. Publishers struggle to manage ad spaces, while advertisers waste time searching for the right websites to promote their brands.
                </p>
                <p className="text-base text-gray-700 leading-relaxed">
                  The result? Lost opportunities on both sides.
                </p>
              </div>
            </div>

            {/* The Solution */}
            <div className="py-16 bg-white">
              <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-black mb-4">The Solution</h2>
                <p className="text-base text-gray-700 mb-6 leading-relaxed">
                  Yepper brings both sides together on one smart platform:
                </p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-black mb-2">For Web Owners:</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Easily set up ad spaces, choose categories, and control what appears on your site, all from one dashboard.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-black mb-2">For Advertisers:</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Browse available spaces, choose audiences that match your goals, and launch ads instantly, no middlemen needed.
                    </p>
                  </div>
                </div>
                
                <p className="text-base text-gray-700 leading-relaxed">
                  Yepper handles the technical setup, tracking, and delivery automatically, so both sides can focus on what they do best.
                </p>
              </div>
            </div>

            {/* For Web Owners & Advertisers */}
            <div className="py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-200 p-8">
                    <h3 className="text-2xl font-bold text-black mb-4">For Web Owners</h3>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      Turn your website into a smart ad platform. Add your ad spaces, set your categories, and Yepper automatically connects you with trusted advertisers who fit your content. You stay in control, we handle the rest.
                    </p>
                    <Link to='/add-website'>
                      <button className="text-black font-semibold hover:underline">
                        → Start as a Web Owner
                      </button>
                    </Link>
                  </div>

                  <div className="bg-white border border-gray-200 p-8">
                    <h3 className="text-2xl font-bold text-black mb-4">For Advertisers</h3>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      Reach real audiences on quality websites across East Africa. Pick your categories, upload your ad, and Yepper instantly matches it to the most relevant spaces, no calls, no waiting. Just simple, transparent reach.
                    </p>
                    <Link to='/advertise'>
                      <button className="text-black font-semibold hover:underline">
                        → Start as an Advertiser
                      </button>
                    </Link>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="py-16 bg-white">
              <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-black mb-8">How It Works</h2>

                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">Create Your Account</h3>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Whether you're an advertiser or a publisher, start by signing up.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">Set Up Your Role</h3>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Publishers define their ad spaces and categories. Advertisers choose where their ads should appear.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">Yepper Matches You Automatically</h3>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Our system connects suitable advertisers to the best ad spaces in real time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">Track and Manage Everything</h3>
                      <p className="text-base text-gray-700 leading-relaxed">
                        View live data and performance insights through a simple, transparent dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why People Choose Yepper */}
            <div className="py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-black mb-8">Why People Choose Yepper</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-black mb-2">Built for Both Sides:</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      One platform that equally empowers publishers and advertisers.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black mb-2">Simple Setup:</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      No coding expertise or long setup process needed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black mb-2">Transparency First:</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      See what's running, where it's running, and how it's performing always.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black mb-2">Full Control:</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Choose categories, audiences, and preferences to protect your brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Mission */}
            <div className="py-16 bg-white border-t border-gray-200">
              <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-black mb-4">Our Mission</h2>
                <p className="text-base text-gray-700 leading-relaxed">
                  Yepper's mission is to make online advertising fair, clear, and accessible. We connect creators, media owners, and advertisers through technology that respects both sides, turning complex ad operations into a simple, automated experience.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-black text-white">
              <div className="max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Join the Future of Advertising?
                </h2>
                <p className="text-base text-gray-300 mb-8">
                  Whether you own a website or promote a brand, Yepper gives you the tools to connect, collaborate, and grow all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Main Content Section */}
        <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
          <Grid cols={2} gap={8} className="max-w-4xl mx-auto flex items-start justify-center py-8">
            {/* Left Column - Website Section */}
            <div className="flex flex-col items-center space-y-6">
              <Link to='/add-website' className="w-full">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="h-16 w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0 min-h-[4rem]"
                >
                  <ArrowLeft />
                  <span className="text-center leading-tight">Run Ads on your Website</span>
                </Button>
              </Link>
              
              <div className="w-80">
                {filteredWebsites.length > 0 ? (
                  <Link to="/websites">
                    <div className="relative cursor-pointer group">
                      <div className="relative bg-white border-2 border-black p-6 h-[280px] flex flex-col">
                        
                        {/* Main Display Area */}
                        <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-green-50 via-white to-teal-50 border border-black">
                          
                          {/* Browser-like top bar */}
                          <div className="absolute top-0 left-0 right-0 h-6 bg-blue-300 border-b border-black flex items-center px-2">
                            <div className="flex space-x-1.5">
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                          </div>
                          
                          {/* Content area with websites */}
                          <div className="absolute inset-0 top-6">
                            {filteredWebsites.slice(0, 4).map((website, index) => {
                              const positions = [
                                { x: 10, y: 15, rotate: -3, scale: 1 },
                                { x: 55, y: 12, rotate: 4, scale: 0.95 },
                                { x: 12, y: 55, rotate: -2, scale: 0.9 },
                                { x: 58, y: 52, rotate: 3, scale: 0.88 }
                              ];
                              
                              const pos = positions[index];
                              
                              const gradients = [
                                'from-green-500 to-emerald-500',
                                'from-teal-500 to-cyan-500', 
                                'from-emerald-500 to-green-600',
                                'from-cyan-500 to-teal-600'
                              ];

                              return (
                                <div
                                  key={website._id || index}
                                  className="absolute w-24 h-20 transition-all duration-500 group-hover:scale-105"
                                  style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
                                    zIndex: 4 - index,
                                  }}
                                >
                                  <div className={`relative bg-white rounded-lg overflow-hidden shadow-lg border border-white/20 group-hover:shadow-xl transition-all duration-500`}>
                                    
                                    {/* Top bar */}
                                    <div className={`h-2 bg-gradient-to-r ${gradients[index]} flex items-center px-1`}>
                                      <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-2 h-full flex flex-col bg-white">
                                      <div className="w-full h-8 overflow-hidden rounded-sm bg-gradient-to-br from-slate-100 to-slate-200 relative mb-2">
                                        {website.imageUrl ? (
                                          <img 
                                            src={website.imageUrl} 
                                            alt={website.websiteName}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <>
                                          </>
                                        )}
                                        <div className={`absolute top-1 right-1 w-2 h-2 bg-gradient-to-r ${gradients[index]} rounded-full animate-pulse`}></div>
                                      </div>
                                      
                                      <div className="flex-1 flex flex-col justify-center">
                                        <div className="text-[9px] font-semibold text-gray-700 text-center leading-tight truncate px-1">
                                          {website.websiteName || 'Unnamed Website'}
                                        </div>
                                        <div className="h-0.5 bg-slate-300 rounded-full w-3/4 mx-auto mt-1"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Bottom label */}
                        <div className="relative mt-4 flex items-center justify-center">
                          <div className="bg-white border-2 border-black px-4 py-2">
                            <span className="text-xs font-bold text-black uppercase tracking-wide">
                              Websites
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-8 border-2 border-black bg-white h-[280px] flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-black mb-1">{searchQuery ? 'No Websites Found' : 'No Websites Yet'}</h3>
                    <p className="text-sm text-gray-600">
                      {searchQuery 
                        ? 'No websites match your search criteria.'
                        : 'Start adding your first website.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Ads Section */}
            <div className="flex flex-col items-center space-y-6">
              <Link to="/advertise" className="w-full">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="h-16 w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0 min-h-[4rem]"
                >
                  <span className="text-center leading-tight">Advertise your Product Online</span>
                  <ArrowRight />
                </Button>
              </Link>
              
              <div className="w-80">
                {filteredAds.length > 0 ? (
                  <Link to="/ads">
                    <div className="relative cursor-pointer group">
                      <div className="relative bg-white border-2 border-black p-6 h-[280px] flex flex-col">
                        
                        {/* Main Display Area */}
                        <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-black">
                          
                          {/* Top decorative bar */}
                          <div className="absolute top-0 left-0 right-0 h-6 bg-orange-300 border-b border-black"></div>
                          
                          {/* Content area with ads */}
                          <div className="absolute inset-0 top-6">
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
                                  className="absolute w-20 h-16 transition-all duration-500 group-hover:scale-105"
                                  style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
                                    zIndex: 4 - index,
                                  }}
                                >
                                  <div className="relative bg-white rounded-md overflow-hidden shadow-lg border border-white/20 group-hover:shadow-xl transition-all duration-500">
                                    
                                    {/* Top color bar */}
                                    <div className={`h-2 bg-gradient-to-r ${gradients[index]}`}></div>
                                    
                                    {/* Content */}
                                    <div className="p-1.5 h-full flex flex-col bg-white">
                                      <div className="w-full h-6 overflow-hidden rounded-sm bg-slate-100 mb-1">
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
                                        <div className="h-1 bg-slate-300 rounded-full w-3/4"></div>
                                        <div className="h-0.5 bg-slate-200 rounded-full w-1/2"></div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradients[index]}`}></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Bottom label */}
                        <div className="relative mt-4 flex items-center justify-center">
                          <div className="bg-white border-2 border-black px-4 py-2">
                            <span className="text-xs font-bold text-black uppercase tracking-wide">
                              Your Ads
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-8 border-2 border-black bg-white h-[280px] flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-black mb-1">{searchQuery ? 'No Campaigns Found' : 'No Active Campaigns Yet'}</h3>
                    <p className="text-sm text-gray-600">
                      {searchQuery 
                        ? 'No campaigns match your current search criteria.'
                        : 'Start creating your first campaign.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Grid>

          {/* Glass Info Container */}
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

        {/* Marketing Section */}
        <div 
          ref={marketingRef}
          className={`transition-all duration-1000 ease-out ${
            showMarketing 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          {/* Hero Section */}
          <div className="bg-white border-b border-gray-200 py-16">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                A Smarter Way to Buy and Sell Ad Spaces
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Yepper connects website owners and advertisers through an automated system that makes digital advertising simple, transparent, and efficient.
              </p>
            </div>
          </div>

          {/* The Problem */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-black mb-4">
                The Problem
              </h2>
              <p className="text-base text-gray-700 mb-4 leading-relaxed">
                Digital advertising is often complicated. Publishers struggle to manage ad spaces, while advertisers waste time searching for the right websites to promote their brands.
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                The result? Lost opportunities on both sides.
              </p>
            </div>
          </div>

          {/* The Solution */}
          <div className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-black mb-4">The Solution</h2>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                Yepper brings both sides together on one smart platform:
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-black mb-2">For Web Owners:</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Easily set up ad spaces, choose categories, and control what appears on your site, all from one dashboard.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-black mb-2">For Advertisers:</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Browse available spaces, choose audiences that match your goals, and launch ads instantly, no middlemen needed.
                  </p>
                </div>
              </div>
              
              <p className="text-base text-gray-700 leading-relaxed">
                Yepper handles the technical setup, tracking, and delivery automatically, so both sides can focus on what they do best.
              </p>
            </div>
          </div>

          {/* For Web Owners & Advertisers */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-black mb-4">For Web Owners</h3>
                  <p className="text-base text-gray-700 mb-6 leading-relaxed">
                    Turn your website into a smart ad platform. Add your ad spaces, set your categories, and Yepper automatically connects you with trusted advertisers who fit your content. You stay in control, we handle the rest.
                  </p>
                  <Link to='/add-website'>
                    <button className="text-black font-semibold hover:underline">
                      → Start as a Web Owner
                    </button>
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-black mb-4">For Advertisers</h3>
                  <p className="text-base text-gray-700 mb-6 leading-relaxed">
                    Reach real audiences on quality websites across East Africa. Pick your categories, upload your ad, and Yepper instantly matches it to the most relevant spaces, no calls, no waiting. Just simple, transparent reach.
                  </p>
                  <Link to='/advertise'>
                    <button className="text-black font-semibold hover:underline">
                      → Start as an Advertiser
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-black mb-8">How It Works</h2>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">Create Your Account</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Whether you're an advertiser or a publisher, start by signing up.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">Set Up Your Role</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Publishers define their ad spaces and categories. Advertisers choose where their ads should appear.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">Yepper Matches You Automatically</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Our system connects suitable advertisers to the best ad spaces in real time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">Track and Manage Everything</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      View live data and performance insights through a simple, transparent dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why People Choose Yepper */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-black mb-8">Why People Choose Yepper</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-black mb-2">Built for Both Sides:</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    One platform that equally empowers publishers and advertisers.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-2">Simple Setup:</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    No coding expertise or long setup process needed.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-2">Transparency First:</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    See what's running, where it's running, and how it's performing always.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-2">Full Control:</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Choose categories, audiences, and preferences to protect your brand.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Mission */}
          <div className="py-16 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-black mb-4">Our Mission</h2>
              <p className="text-base text-gray-700 leading-relaxed">
                Yepper's mission is to make online advertising fair, clear, and accessible. We connect creators, media owners, and advertisers through technology that respects both sides, turning complex ad operations into a simple, automated experience.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-16 bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Join the Future of Advertising?
              </h2>
              <p className="text-base text-gray-300 mb-8">
                Whether you own a website or promote a brand, Yepper gives you the tools to connect, collaborate, and grow all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;