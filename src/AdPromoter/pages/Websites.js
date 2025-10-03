import React, { useState, useEffect } from 'react';
import { Globe, Search, Edit, Check, X, Plus, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Grid, Container } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdModalData from '../components/adModalData'

function Websites() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [tempWebsiteName, setTempWebsiteName] = useState('');
  // const [rejecting, setRejecting] = useState(null);
  // const [rejectionReason, setRejectionReason] = useState('');
  // const [showRejectModal, setShowRejectModal] = useState(false);
  // const [selectedAd, setSelectedAd] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adModalData, setAdModalData] = useState(null);
  // const [walletBalance, setWalletBalance] = useState(0);

  const authenticatedAxios = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const { data: websites, isLoading: websitesLoading, error: websitesError, refetch: refetchWebsites } = useQuery({
    queryKey: ['websites', user?._id || user?.id],
    queryFn: async () => {
      try {
        const userId = user?._id || user?.id;
        const response = await authenticatedAxios.get(`/createWebsite/${userId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!(user?._id || user?.id) && !!token,
  });

  // const { data: pendingAds = [], isLoading: pendingLoading } = useQuery({
  //   queryKey: ['pendingAds'],
  //   queryFn: async () => {
  //     try {
  //       const response = await authenticatedAxios.get('/ad-categories/pending-rejections');
  //       return response.data.pendingAds || [];
  //     } catch (error) {
  //       console.error('Error fetching pending ads:', error);
  //       return [];
  //     }
  //   },
  //   enabled: !!token,
  // });

  const { data: activeAds = [], isLoading: activeLoading } = useQuery({
    queryKey: ['activeAds'],
    queryFn: async () => {
      try {
        const response = await authenticatedAxios.get('/ad-categories/active-ads');
        return response.data.activeAds || [];
      } catch (error) {
        console.error('Error fetching active ads:', error);
        return [];
      }
    },
    enabled: !!token,
  });

  const updateWebsiteNameMutation = useMutation({
    mutationFn: ({ websiteId, websiteName }) => 
      authenticatedAxios.patch(`/createWebsite/${websiteId}/name`, { websiteName }),
    onSuccess: (response) => {
      queryClient.setQueryData(['websites', user?._id || user?.id], (oldData) => 
        oldData.map(website => 
          website._id === response.data._id ? response.data : website
        )
      );
      setEditingWebsite(null);
    },
    onError: (error) => {
    }
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || !token || !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [user, token, isAuthenticated, isLoading, navigate]);

  const handleStartEdit = (website) => {
    setEditingWebsite(website._id);
    setTempWebsiteName(website.websiteName);
  };

  const handleSaveWebsiteName = () => {
    if (tempWebsiteName.trim() && editingWebsite) {
      updateWebsiteNameMutation.mutate({
        websiteId: editingWebsite,
        websiteName: tempWebsiteName.trim()
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingWebsite(null);
  };

  const getAdsForWebsite = (websiteId) => {
    // const pending = pendingAds.filter(ad => 
    //   ad.websiteSelections?.some(sel => 
    //     sel.websiteId === websiteId && sel.approved && !sel.isRejected
    //   )
    // );
    
    const active = activeAds.filter(ad => 
      ad.websiteSelections?.some(sel => 
        sel.websiteId === websiteId && sel.approved && !sel.isRejected && sel.status === 'active'
      )
    );
    
    return { 
      // pending: [],
      active 
    };
  };

  // const openRejectModal = (ad) => {
  //   const websiteSelection = ad.websiteSelections.find(sel => sel.approved && !sel.isRejected);
  //   if (!websiteSelection) return;

  //   const paymentAmount = ad.paymentAmount || 0;
  //   if (walletBalance < paymentAmount) {
  //     alert('Insufficient balance in your wallet to process this rejection. Please contact support.');
  //     return;
  //   }

  //   setSelectedAd(ad);
  //   setShowRejectModal(true);
  // };

  const openAdModal = (ad, websiteId) => {
    const currentWebsite = websites?.find(w => w._id === websiteId);
    const websiteSelection = ad.websiteSelections?.find(sel => 
      sel.websiteId === websiteId
    );
    const adData = {
      ...ad,
      currentWebsite,
      websiteSelection,
      status: websiteSelection?.status || 'active'
    };

    setAdModalData(adData);
    setShowAdModal(true);
  };

  const closeAdModal = () => {
    setShowAdModal(false);
    setAdModalData(null);
  };

  // const handleRejectAd = async () => {
  //   if (!selectedAd || !rejectionReason.trim()) return;

  //   setRejecting(selectedAd._id);
  //   try {
  //     const websiteSelection = selectedAd.websiteSelections.find(sel => sel.approved && !sel.isRejected);
      
  //     await authenticatedAxios.post(
  //       `/ad-categories/reject/${selectedAd._id}/${websiteSelection.websiteId}/${websiteSelection.categories[0]}`,
  //       { rejectionReason: rejectionReason.trim() }
  //     );

  //     queryClient.invalidateQueries(['pendingAds']);
  //     queryClient.invalidateQueries(['activeAds']);
  //     queryClient.invalidateQueries(['wallet']);
      
  //     setShowRejectModal(false);
  //     setSelectedAd(null);
  //     setRejectionReason('');
      
  //     alert('Ad rejected successfully. Refund has been processed.');
      
  //   } catch (error) {
  //     console.error('Error rejecting ad:', error);
  //     const errorMessage = error.response?.data?.error || 'Failed to reject ad';
  //     alert(errorMessage);
  //   } finally {
  //     setRejecting(null);
  //   }
  // };

  // const closeRejectModal = () => {
  //   setShowRejectModal(false);
  //   setSelectedAd(null);
  //   setRejectionReason('');
  // };

  // const getTimeRemaining = (deadline) => {
  //   const now = new Date();
  //   const timeLeft = new Date(deadline) - now;
    
  //   if (timeLeft <= 0) return 'Expired';
    
  //   const minutes = Math.floor(timeLeft / (1000 * 60));
  //   const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
  //   return `${minutes}m ${seconds}s`;
  // };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (!websites) return;

    const performSearch = () => {
      const query = searchQuery.toLowerCase().trim();

      if (!query) {
        setFilteredWebsites(websites);
        return;
      }

      const searched = websites.filter(website => {
        const searchFields = [
          website.websiteName?.toLowerCase(),
          website.websiteLink?.toLowerCase(),
        ];
        return searchFields.some(field => field?.includes(query));
      });
        
      setFilteredWebsites(searched);
    };

    performSearch();
  }, [searchQuery, websites]);
    
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  if (websitesError) return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <Badge variant="default">Website</Badge>
          </div>
        </Container>
      </header>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error loading websites</h2>
          <p className="text-gray-600 mb-6">{websitesError.message}</p>
          <Button onClick={() => refetchWebsites()} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    </>
  );

  if (websitesLoading || activeLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <Badge variant="default">Website</Badge>
          </div>
        </Container>
      </header>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">

          <div className='flex justify-between items-center gap-4 mb-12'>
            <div className="flex justify-start flex-1">
              <div className="relative w-full max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search websites..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link to='/wallet'>
                <Button variant="primary" size="lg">
                  Wallet
                </Button>
              </Link>
            </div>

            <div className="flex-shrink-0">
              <Link to='/create-website'>
                <Button variant="secondary" size="lg" icon={Plus} iconPosition="left">
                  Add Website
                </Button>
              </Link>
            </div>

            <div className="flex-shrink-0">
              <Link to='/withdraw'>
                <Button variant="secondary" size="lg">
                  Withdraw Money
                </Button>
              </Link>
            </div>
          </div>

          {filteredWebsites && filteredWebsites.length > 0 ? (
            <div className="space-y-8">
              {filteredWebsites.slice().reverse().map((website) => {
                const { active } = getAdsForWebsite(website._id); // REMOVED: pending
                const totalAds = active.length; // REMOVED: pending.length

                return (
                  <div
                    key={website._id}
                    className="border border-black bg-white transition-all duration-200"
                  >
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {website.imageUrl ? (
                            <img 
                              src={website.imageUrl} 
                              alt={website.websiteName}
                              className="w-12 h-12 object-contain mr-4"
                            />
                          ) : (
                            <Globe size={48} className="mr-4 text-black" />
                          )}
                          
                          <div>
                            {editingWebsite === website._id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={tempWebsiteName}
                                  onChange={(e) => setTempWebsiteName(e.target.value)}
                                  className="px-3 py-2 border border-black bg-white focus:outline-none focus:ring-0 text-xl font-bold"
                                  autoFocus
                                />
                                <button 
                                  onClick={handleSaveWebsiteName} 
                                  className="p-2 text-green-600 hover:bg-green-50 border border-green-600"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={handleCancelEdit} 
                                  className="p-2 text-red-600 hover:bg-red-50 border border-red-600"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-black">{website.websiteName}</h2>
                                <button 
                                  onClick={() => handleStartEdit(website)}
                                  className="p-2 text-black hover:bg-gray-100 border border-black"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            )}
                            
                            <a 
                              href={website.websiteLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-black text-sm"
                            >
                              {website.websiteLink}
                            </a>
                          </div>
                        </div>
                        
                        <div className="text-right flex items-center gap-4">
                          <Link to={`/website/${website._id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {totalAds > 0 ? (
                      <div className="p-6">
                        {/* COMMENTED OUT: Pending ads section */}
                        {/* {pending.length > 0 && (
                          <div className="mb-6">
                            <Grid cols={1} gap={4}>
                              {pending.map((ad) => {
                                const activeSelection = ad.websiteSelections.find(sel => sel.approved && !sel.isRejected);
                                const timeRemaining = activeSelection?.rejectionDeadline ? 
                                  getTimeRemaining(activeSelection.rejectionDeadline) : 'No deadline';
                                
                                return (
                                  <div
                                    key={ad._id}
                                    className="border border-gray-200 bg-gray-50 overflow-hidden"
                                  >
                                    {ad.imageUrl && (
                                      <div className="relative h-64 w-full bg-gray-100">
                                        <img 
                                          src={ad.imageUrl} 
                                          alt={ad.businessName}
                                          className="w-full h-full object-cover"
                                        />
                                        <Badge variant='danger' className="absolute top-4 left-4">
                                          Pending Review
                                        </Badge>
                                        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                                          {timeRemaining}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="p-6">
                                      <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                          <h4 className="text-xl font-bold text-black mb-2">{ad.businessName}</h4>
                                          <p className="text-gray-600 mb-3 leading-relaxed">{ad.adDescription}</p>
                                        </div>
                                        <div className="ml-4 text-right">
                                          <div className="text-2xl font-bold text-green-600">{formatCurrency(ad.paymentAmount)}</div>
                                          <div className="text-sm text-gray-500">Payment</div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-3">
                                        <Button
                                          variant="outline"
                                          size="lg"
                                          className="flex-1"
                                          onClick={() => openAdModal(ad, website._id)}
                                        >
                                          View Full Ad
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="lg"
                                          className="flex-1"
                                          onClick={() => openRejectModal(ad)}
                                          disabled={rejecting === ad._id || walletBalance < (ad.paymentAmount || 0)}
                                        >
                                          {rejecting === ad._id ? (
                                            <>
                                              Rejecting...
                                            </>
                                          ) : (
                                            <>
                                              Reject Ad
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </Grid>
                          </div>
                        )} */}

                        {active.length > 0 && (
                          <div>
                            <Grid cols={2} gap={6}>
                              {active.map((ad) => (
                                <div
                                  key={ad._id}
                                  className="border border-gray-200 bg-gray-50 overflow-hidden"
                                >
                                  {ad.imageUrl && (
                                    <div className="relative h-48 w-full bg-gray-100">
                                      <img 
                                        src={ad.imageUrl} 
                                        alt={ad.businessName}
                                        className="w-full h-full object-cover"
                                      />
                                      <Badge variant='info' className="absolute top-4 left-4">
                                        Active
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold text-black mb-1">{ad.businessName}</h4>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.adDescription}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded border">
                                      <div className="text-center">
                                        <div className="text-xl font-bold text-black">{ad.views || 0}</div>
                                        <div className="text-xs text-gray-600">Views</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-xl font-bold text-black">{ad.clicks || 0}</div>
                                        <div className="text-xs text-gray-600">Clicks</div>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => openAdModal(ad, website._id)}
                                    >
                                      View Full Ad
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </Grid>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <AlertTriangle size={32} className="mx-auto mb-2 text-gray-400" />
                        <p>No ads for this website yet</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Globe size={64} className="mx-auto mb-6 text-black" />
                <h2 className="text-2xl font-semibold mb-4 text-black">
                  {searchQuery ? 'No Websites Found' : 'No Websites Yet'}
                </h2>
                <Link to='/create-website'>
                  <Button variant="primary">
                    Add Your First Website
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {showAdModal && adModalData && (
            <AdModalData 
              adModalData={adModalData} 
              closeAdModal={closeAdModal}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              // COMMENTED OUT: getTimeRemaining={getTimeRemaining}
            />
          )}

          {/* COMMENTED OUT: Rejection modal */}
          {/* {showRejectModal && selectedAd && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-black max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Reject Ad</h3>
                  <button
                    onClick={closeRejectModal}
                    className="text-gray-400 hover:text-black"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Rejecting: <strong>{selectedAd.businessName}</strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Refund: <strong>{formatCurrency(selectedAd.paymentAmount)}</strong>
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Reason for rejection
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
                    rows={3}
                    placeholder="Why are you rejecting this ad?"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={closeRejectModal}
                    disabled={rejecting === selectedAd._id}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleRejectAd}
                    disabled={!rejectionReason.trim() || rejecting === selectedAd._id}
                  >
                    {rejecting === selectedAd._id ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Reject Ad'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
}

export default Websites;