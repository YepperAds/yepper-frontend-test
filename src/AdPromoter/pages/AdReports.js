// AdReports.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  DollarSign,
  RefreshCw,
  Wallet,
  AlertCircle,
  X,
  Search
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Button, Grid } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdReports = () => {
  const navigate = useNavigate();
  const [pendingAds, setPendingAds] = useState([]);
  const [activeAds, setActiveAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPendingAds, setFilteredPendingAds] = useState([]);
  const [filteredActiveAds, setFilteredActiveAds] = useState([]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    Promise.all([
      fetchAdReports(),
      fetchWalletBalance()
    ]);
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ad-categories/wallet', {
        headers: getAuthHeaders()
      });
      setWalletBalance(response.data.wallet?.balance || 0);
    } catch (error) {
    }
  };

  const fetchAdReports = async () => {
    try {
      const [pendingResponse, activeResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/ad-categories/pending-rejections', {
          headers: getAuthHeaders()
        }),
        axios.get('http://localhost:5000/api/ad-categories/active-ads', {
          headers: getAuthHeaders()
        })
      ]);

      setPendingAds(pendingResponse.data.pendingAds || []);
      setActiveAds(activeResponse.data.activeAds || []);
      setFilteredPendingAds(pendingResponse.data.pendingAds || []);
      setFilteredActiveAds(activeResponse.data.activeAds || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const performSearch = () => {
      const query = searchQuery.toLowerCase().trim();
      
      if (!query) {
        setFilteredPendingAds(pendingAds);
        setFilteredActiveAds(activeAds);
        return;
      }

      const searchInAds = (ads) => ads.filter(ad => {
        const searchFields = [
          ad.businessName?.toLowerCase(),
          ad.adDescription?.toLowerCase(),
          ad.businessLocation?.toLowerCase(),
        ];
        return searchFields.some(field => field?.includes(query));
      });

      setFilteredPendingAds(searchInAds(pendingAds));
      setFilteredActiveAds(searchInAds(activeAds));
    };

    performSearch();
  }, [searchQuery, pendingAds, activeAds]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const openRejectModal = (ad) => {
    const websiteSelection = ad.websiteSelections.find(sel => sel.approved && !sel.isRejected);
    if (!websiteSelection) return;

    const paymentAmount = ad.paymentAmount || 0;
    if (walletBalance < paymentAmount) {
      return;
    }

    setSelectedAd(ad);
    setShowRejectModal(true);
  };

  const handleRejectAd = async () => {
    if (!selectedAd || !rejectionReason.trim()) return;

    setRejecting(selectedAd._id);
    try {
      const websiteSelection = selectedAd.websiteSelections.find(sel => sel.approved && !sel.isRejected);
      
      await axios.post(
        `http://localhost:5000/api/ad-categories/reject/${selectedAd._id}/${websiteSelection.websiteId}/${websiteSelection.categories[0]}`,
        { rejectionReason: rejectionReason.trim() },
        { headers: getAuthHeaders() }
      );

      await Promise.all([
        fetchAdReports(),
        fetchWalletBalance()
      ]);
      
      setShowRejectModal(false);
      setSelectedAd(null);
      setRejectionReason('');
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reject ad';
      
      if (errorMessage.includes('Insufficient balance')) {
        fetchWalletBalance();
      }
    } finally {
      setRejecting(null);
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAd(null);
    setRejectionReason('');
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const timeLeft = new Date(deadline) - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">

          <div className='flex justify-between items-center gap-4 mb-12'>
            {/* Search Section */}
            <div className="flex justify-start flex-1">
              <div className="relative w-full max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search ads..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Pending Rejections Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
              <Clock size={24} className="text-black" />
              Pending Rejections ({filteredPendingAds.length})
            </h2>
            
            {filteredPendingAds.length === 0 ? (
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <AlertTriangle size={64} className="mx-auto mb-6 text-black" />
                  <h3 className="text-xl font-semibold mb-4 text-black">
                    {searchQuery ? 'No Pending Ads Found' : 'No Ads Pending Rejection'}
                  </h3>
                </div>
              </div>
            ) : (
              <Grid cols={2} gap={6}>
                {filteredPendingAds.map((ad) => {
                  const activeSelection = ad.websiteSelections.find(sel => sel.approved && !sel.isRejected);
                  const timeRemaining = activeSelection?.rejectionDeadline ? 
                    getTimeRemaining(activeSelection.rejectionDeadline) : 'No deadline';
                  
                  return (
                    <div
                      key={ad._id}
                      className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                          <AlertTriangle size={40} className="mr-3 text-black" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600 mb-1">Time Left</div>
                          <div className="text-sm font-semibold text-black">{timeRemaining}</div>
                        </div>
                      </div>
                      
                      {/* Business Name */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-black">{ad.businessName}</h3>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Payment</div>
                          <div className="text-sm font-semibold text-black">{formatCurrency(ad.paymentAmount)}</div>
                        </div>
                      </div>

                      {/* Ad Description */}
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm">{ad.adDescription}</p>
                      </div>

                      {/* Business Details */}
                      <div className="mb-6">
                        <p className="text-xs text-gray-600 mb-1">Business Link:</p>
                        <a 
                          href={ad.businessLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-black text-sm break-all"
                        >
                          {ad.businessLink}
                        </a>
                        <p className="text-xs text-gray-600 mt-2">Location: {ad.businessLocation}</p>
                      </div>

                      {/* Insufficient Balance Warning */}
                      {walletBalance < (ad.paymentAmount || 0) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-600" />
                          <span className="text-xs text-red-700">
                            Insufficient balance. Required: {formatCurrency(ad.paymentAmount)}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(ad.imageUrl || ad.videoUrl, '_blank')}
                        >
                          <Eye size={16} className="mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => openRejectModal(ad)}
                          disabled={rejecting === ad._id || walletBalance < (ad.paymentAmount || 0)}
                        >
                          {rejecting === ad._id ? (
                            <RefreshCw size={16} className="mr-1 animate-spin" />
                          ) : (
                            <XCircle size={16} className="mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </Grid>
            )}
          </div>

          {/* Active Ads Section */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
              <CheckCircle size={24} className="text-black" />
              Active Ads ({filteredActiveAds.length})
            </h2>
            
            {filteredActiveAds.length === 0 ? (
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <CheckCircle size={64} className="mx-auto mb-6 text-black" />
                  <h3 className="text-xl font-semibold mb-4 text-black">
                    {searchQuery ? 'No Active Ads Found' : 'No Active Ads'}
                  </h3>
                </div>
              </div>
            ) : (
              <Grid cols={3} gap={6}>
                {filteredActiveAds.map((ad) => (
                  <div
                    key={ad._id}
                    className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <CheckCircle size={40} className="mr-3 text-black" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Status</div>
                        <div className="text-sm font-semibold text-black">Active</div>
                      </div>
                    </div>
                    
                    {/* Business Name */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-black">{ad.businessName}</h3>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Payment</div>
                        <div className="text-sm font-semibold text-black">{formatCurrency(ad.paymentAmount)}</div>
                      </div>
                    </div>

                    {/* Ad Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm">{ad.adDescription}</p>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 flex justify-between text-sm">
                      <div>
                        <div className="text-xs text-gray-600">Views</div>
                        <div className="font-semibold text-black">{ad.views || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Clicks</div>
                        <div className="font-semibold text-black">{ad.clicks || 0}</div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.open(ad.imageUrl || ad.videoUrl, '_blank')}
                    >
                      <Eye size={16} className="mr-2" />
                      Preview Ad
                    </Button>
                  </div>
                ))}
              </Grid>
            )}
          </div>

          {/* Rejection Modal */}
          {showRejectModal && selectedAd && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-black max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Reject Advertisement</h3>
                  <button
                    onClick={closeRejectModal}
                    className="text-gray-400 hover:text-black transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    You are about to reject: <strong>{selectedAd.businessName}</strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Refund amount: <strong>{formatCurrency(selectedAd.paymentAmount)}</strong> 
                    will be transferred to advertiser's wallet
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
                    rows={4}
                    placeholder="Please provide a reason for rejecting this ad..."
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="mr-2" />
                        Confirm Rejection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdReports;