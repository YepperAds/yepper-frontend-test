// Home.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Grid } from '../components/components';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import WebsiteCard from '../components/WebsiteCard';
import AdsCard from '../components/AdsCard';
import MarketingAssistant from '../components/MarketingAssistant';

const Home = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);

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

  const { data: mixedAds, isLoading, error } = useQuery({
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

  if (error) return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>Error Loading Data</h2>
      <p>{error.message}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (showAssistant) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 overflow-hidden">
            <MarketingAssistant user={user} isAuthenticated={isAuthenticated} />
          </div>

          {/* Right Sidebar with Cards */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto p-4 space-y-7 flex flex-col items-center justify-center">
            {isAuthenticated ?(
              <>
                <div className="space-y-2 bg-gray-300 w-full">
                  <Link to='/add-website' className="w-full">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="h-12 w-full flex items-center justify-center space-x-2 text-sm"
                    >
                      <span>Run Ads on Websites</span>
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                  
                  <div className="w-full">
                    <WebsiteCard filteredWebsites={filteredWebsites} searchQuery={searchQuery} compact={true} />
                  </div>
                </div>

                <div className="space-y-2 bg-gray-300 w-full">
                  <Link to="/advertise" className="w-full">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="h-12 w-full flex items-center justify-center space-x-2 text-sm"
                    >
                      <span>Advertise Products</span>
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                  
                  <div className="w-full">
                    <AdsCard filteredAds={filteredAds} searchQuery={searchQuery} compact={true} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 bg-gray-300 w-full">
                  <Link to='/add-website' className="w-full">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="h-12 w-full flex items-center justify-center space-x-2 text-sm"
                    >
                      <span>Run Ads on Websites</span>
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
                
                {/* Right Column - Ads Section */}
                <div className="space-y-2 bg-gray-300 w-full">
                  <Link to="/advertise" className="w-full">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="h-12 w-full flex items-center justify-center space-x-2 text-sm"
                    >
                      <span>Advertise Products</span>
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white">
            <div className="min-h-screen bg-white flex flex-col items-center justify-center relative px-6">
              <Grid cols={2} gap={8} className="max-w-4xl mx-auto py-8">
                {/* Left Column - Website Section */}
                <div className="flex flex-col items-center">
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
                </div>
                
                {/* Right Column - Ads Section */}
                <div className="flex flex-col items-center">
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
                </div>
              </Grid>

              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative bg-white/40 backdrop-blur-md border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => setShowAssistant(true)}
                        className="inline-flex items-center px-6 py-3 bg-orange-600 text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        <span>Use Yepper AI Marketing Assistant</span>
                      </button>
                    </div>
                  </div>
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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
          <Grid cols={2} gap={8} className="max-w-4xl mx-auto flex items-start justify-center py-8">
            <div className="flex flex-col items-center space-y-6">
              <Link to='/add-website' className="w-full">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="h-16 w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0"
                >
                  <ArrowLeft />
                  <span className="text-center leading-tight">Run Ads on your Website</span>
                </Button>
              </Link>
              
              <div className="w-80">
                <div className="max-w-md">
                  <WebsiteCard filteredWebsites={filteredWebsites} searchQuery={searchQuery} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <Link to="/advertise" className="w-full">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="h-16 w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0"
                >
                  <span className="text-center leading-tight">Advertise your Product Online</span>
                  <ArrowRight />
                </Button>
              </Link>
              
              <div className="w-80">
                <div className="w-full max-w-md">
                  <AdsCard filteredAds={filteredAds} searchQuery={searchQuery} />
                </div>
              </div>
            </div>
          </Grid>

          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white/40 backdrop-blur-md border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-center">
                  <button 
                    onClick={() => setShowAssistant(true)}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <span>Use Yepper AI Marketing Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;