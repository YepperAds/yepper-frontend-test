// Home.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Grid } from '../components/components';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import WebsiteCard from '../components/WebsiteCard';
import AdsCard from '../components/AdsCard';
import MarketingAssistant from '../components/MarketingAssistant';
import api from '../utils/api';


const Home = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  

  const { data: mixedAds, isLoading, error } = useQuery({
    queryKey: ['mixedAds', user?._id || user?.id],
    queryFn: async () => {
      const userId = user?._id || user?.id;
      const response = await api.get(`/api/web-advertise/mixed/${userId}`);
      return response.data;
    },
    enabled: isAuthenticated && !!(user?._id || user?.id),
    onSuccess: (data) => {
      setFilteredAds(data || []);
    }
  });

  const { data: websites } = useQuery({
    queryKey: ['websites', user?._id || user?.id],
    queryFn: async () => {
      const userId = user?._id || user?.id;
      const response = await api.get(`/api/createWebsite/${userId}`);
      return response.data;
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
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        
        {/* Close Assistant Button */}
        <div className="bg-white px-4 py-2 flex items-center justify-end">
          <button
            onClick={() => setShowAssistant(false)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
            <span className="text-sm font-medium">Close Assistant</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 overflow-hidden">
            <MarketingAssistant user={user} isAuthenticated={isAuthenticated} />
          </div>

          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-l-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
            style={{ right: isRightSidebarOpen ? '320px' : '0' }}
          >
            {isRightSidebarOpen ? (
              <ChevronRight size={20} className="text-gray-600" />
            ) : (
              <ChevronLeft size={20} className="text-gray-600" />
            )}
          </button>

          {/* Right Sidebar with Cards */}
          <div className={`${isRightSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden transition-all duration-300 flex flex-col`}>
            {isRightSidebarOpen && (
              isAuthenticated ? (
                <div className="flex-1 flex flex-col px-4 space-y-4 overflow-hidden">
                  {/* Websites Section */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <Link to='/add-website' className="mb-2">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>Run Ads on Websites</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <WebsiteCard filteredWebsites={filteredWebsites} searchQuery={searchQuery} compact={true} />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <Link to="/advertise" className="mb-2">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>Advertise Products</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <AdsCard filteredAds={filteredAds} searchQuery={searchQuery} compact={true} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-4 space-y-4">
                  {/* Websites Section */}
                  <div className="flex-1 flex flex-col">
                    <Link to='/add-website' className="mb-2">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>Run Ads on Websites</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center p-6 border-2 border-black bg-white w-full">
                        <Link to='/websites'>
                          <Button 
                            variant="secondary" 
                            size="lg" 
                            className="w-full flex items-center justify-center space-x-2 text-xs"
                          >
                            <span>Visit Website Dashboard</span>
                            <ArrowRight size={14} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ads Section */}
                  <div className="flex-1 flex flex-col">
                    <Link to="/advertise" className="mb-2">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>Advertise Products</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center p-6 border-2 border-black bg-white w-full">
                        <Link to='/ads'>
                          <Button 
                            variant="secondary" 
                            size="lg" 
                            className="w-full flex items-center justify-center space-x-2 text-xs"
                          >
                            <span>Visit Business Dashboard</span>
                            <ArrowRight size={14} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
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
                      className="w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0"
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
                      className="w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0"
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
                        className="inline-flex items-center px-6 py-3 rounded-full bg-orange-600 text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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
                  className="w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0"
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
                  className="w-full flex items-center justify-center space-x-4 focus:outline-none focus:ring-0"
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
                    className="inline-flex items-center px-6 py-3 rounded-full bg-orange-600 text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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