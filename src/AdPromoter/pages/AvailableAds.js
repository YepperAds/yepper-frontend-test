import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, DollarSign, MapPin, Calendar, Clock, TrendingUp, CheckCircle } from 'lucide-react';

const AvailableAds = () => {
  const [availableAds, setAvailableAds] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchWebsites();
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      fetchCategories(selectedWebsite);
    }
  }, [selectedWebsite]);

  useEffect(() => {
    if (selectedWebsite && selectedCategory) {
      fetchAvailableAds();
    }
  }, [selectedWebsite, selectedCategory]);

  const fetchWebsites = async () => {
    try {
      const response = await fetch('https://yepper-backend.onrender.com/api/createWebsite', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setWebsites(data.websites || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  };

  const fetchCategories = async (websiteId) => {
    try {
      const response = await fetch(`https://yepper-backend.onrender.com/api/ad-categories/${websiteId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('https://yepper-backend.onrender.com/api/ad-categories/wallet', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setWalletBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchAvailableAds = async () => {
    setLoading(true);
    try {
      const url = new URL('https://yepper-backend.onrender.com/api/web-advertise/available');
      url.searchParams.append('websiteId', selectedWebsite);
      url.searchParams.append('categoryId', selectedCategory);
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      setAvailableAds(data.availableAds || []);
      setSelectedCategoryData(data.category);
    } catch (error) {
      console.error('Error fetching available ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAd = async (adId, potentialEarning) => {
    if (!window.confirm(`Are you sure you want to assign this ad? You will earn ${potentialEarning} and have 2 minutes to review before it goes live.`)) {
      return;
    }

    setAssigning(adId);
    try {
      const response = await fetch('https://yepper-backend.onrender.com/api/web-advertise/assign', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          adId,
          categoryId: selectedCategory,
          websiteId: selectedWebsite
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign ad');
      }

      // Update wallet balance
      if (data.paymentDetails) {
        setWalletBalance(data.paymentDetails.walletBalance);
      }

      // Refresh available ads
      await fetchAvailableAds();
      
      alert(`Ad assigned successfully! ${potentialEarning} has been added to your wallet. You have until ${new Date(data.adDetails.rejectionDeadline).toLocaleTimeString()} to review and reject if needed.`);
      
    } catch (error) {
      console.error('Error assigning ad:', error);
      alert(error.message || 'Failed to assign ad');
    } finally {
      setAssigning(null);
    }
  };

  const filteredAds = availableAds.filter(ad =>
    ad.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.adDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.businessLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAdStatusBadge = (ad) => {
    const hasRejectedSelections = ad.websiteSelections?.some(sel => sel.isRejected);
    const hasActiveSelections = ad.websiteSelections?.some(sel => sel.approved && !sel.isRejected);
    
    if (hasRejectedSelections && !hasActiveSelections) {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Recently Rejected</span>;
    }
    if (ad.availableForReassignment) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Available for Reassignment</span>;
    }
    if (ad.websiteSelections?.length === 0) {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">New & Available</span>;
    }
    return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Available</span>;
  };

  const totalPotentialEarnings = filteredAds.reduce((sum, ad) => sum + (ad.potentialEarning || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Ads Marketplace</h1>
            <p className="text-gray-600 mt-2">Pick up rejected or unassigned ads and earn money</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Wallet Balance</p>
                  <p className="text-lg font-semibold text-green-600">${walletBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Website</label>
              <select
                value={selectedWebsite}
                onChange={(e) => {
                  setSelectedWebsite(e.target.value);
                  setSelectedCategory('');
                  setAvailableAds([]);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose website...</option>
                {websites.map((website) => (
                  <option key={website._id} value={website._id}>
                    {website.websiteName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedWebsite}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Choose category...</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName} - ${category.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Ads</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by business name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedCategory}
                />
              </div>
            </div>
          </div>

          {selectedCategoryData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">Category: {selectedCategoryData.categoryName}</h3>
                  <p className="text-sm text-blue-700">Base Price: ${selectedCategoryData.price} per ad</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Total Potential Earnings</p>
                  <p className="text-lg font-semibold text-blue-900">${totalPotentialEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {!selectedWebsite || !selectedCategory ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Website and Category</h3>
            <p className="text-gray-500">Choose a website and category to view available ads you can pick up</p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading available ads...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Ads</h3>
            <p className="text-gray-500">There are currently no available ads for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <div key={ad._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Ad Media */}
                {ad.imageUrl && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={ad.imageUrl}
                      alt={ad.businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    {getAdStatusBadge(ad)}
                    <div className="text-right">
                      <div className="flex items-center text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-lg font-bold">{ad.potentialEarning}</span>
                      </div>
                      <p className="text-xs text-gray-500">Potential Earning</p>
                    </div>
                  </div>

                  {/* Business Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ad.businessName}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{ad.businessLocation}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{ad.adDescription}</p>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Views: {ad.views}</span>
                    <span>Clicks: {ad.clicks}</span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center text-gray-500 text-xs mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created {new Date(ad.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAssignAd(ad._id, ad.potentialEarning)}
                    disabled={assigning === ad._id}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {assigning === ad._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Pick Up Ad (+${ad.potentialEarning})</span>
                      </>
                    )}
                  </button>

                  {/* Business Link */}
                  {ad.businessLink && (
                    <a
                      href={ad.businessLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline mt-2 block"
                    >
                      Visit Business Website →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableAds;