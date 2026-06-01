// Categories.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  Eye,
  FlaskConical,
} from 'lucide-react';
import { Button, Text, Heading, Container, Badge } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

import AboveTheFold from '../img/aboveTheFold.png';
import BeneathTitle from '../img/beneathTitle.png';
import Bottom from '../img/bottom.png';
import Floating from '../img/floating.png';
import HeaderPic from '../img/header.png';
import InFeed from '../img/inFeed.png';
import InlineContent from '../img/inlineContent.png';
import LeftRail from '../img/leftRail.png';
import MobileInterstial from '../img/mobileInterstitial.png';
import ModalPic from '../img/modal.png';
import Overlay from '../img/overlay.png';
import ProFooter from '../img/proFooter.png';
import RightRail from '../img/rightRail.png';
import Sidebar from '../img/sidebar.png';
import StickySidebar from '../img/stickySidebar.png';
import api from '../../utils/api';


const Categories = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialData = () => {
    if (location.state && Object.keys(location.state).length > 0) {
      return location.state;
    }
    const savedData = localStorage.getItem('adFormData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {};
  };

  const initialData = getInitialData();
  const { 
    file,
    businessName,
    businessLink,
    businessLocation,
    adDescription,
    selectedWebsites
  } = initialData;

  const [categoriesByWebsite, setCategoriesByWebsite] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    initialData.selectedCategories || []
  );
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);          // FIX: loading state for pay button
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [adCreated, setAdCreated] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [sandboxMode, setSandboxMode] = useState(false);    // FIX: sandbox indicator state
  
  // FIX: fetch sandbox mode status from backend when payment summary is shown
  useEffect(() => {
    if (!showPaymentSummary) return;
    const token = getAuthToken();
    api.get('/api/web-advertise/payment/debug-config', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSandboxMode(!!res.data.testMode))
      .catch(() => {
        // non-critical — just leave sandboxMode false if the call fails
      });
  }, [showPaymentSummary]);

  useEffect(() => {
    const loadFileFromStorage = async () => {
      if (file && file.data && !fileObject) {
        try {
          const response = await fetch(file.data);
          const blob = await response.blob();
          const restoredFile = new File([blob], file.name, { type: file.type });
          setFileObject(restoredFile);
        } catch (error) {
          // ignore
        }
      } else if (file instanceof File) {
        setFileObject(file);
      }
    };
    loadFileFromStorage();
  }, [file]);

  useEffect(() => {
    if (businessName) {
      const dataToSave = { ...initialData, selectedCategories };
      localStorage.setItem('adFormData', JSON.stringify(dataToSave));
    }
  }, [selectedCategories, businessName]);

  useEffect(() => {
    const savedData = localStorage.getItem('adFormData');
    if (!savedData && !businessName) {
      navigate('/insert-data');
    }
  }, [businessName, navigate]);

  const getAdSpaceImage = (categoryName) => {
    const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '');
    const imageMap = {
      'abovethefold': AboveTheFold,
      'beneathtitle': BeneathTitle,
      'bottom': Bottom,
      'floating': Floating,
      'header': HeaderPic,
      'infeed': InFeed,
      'inlinecontent': InlineContent,
      'leftrail': LeftRail,
      'mobileinterstitial': MobileInterstial,
      'modal': ModalPic,
      'overlay': Overlay,
      'profooter': ProFooter,
      'rightrail': RightRail,
      'sidebar': Sidebar,
      'stickysidebar': StickySidebar
    };
    return imageMap[normalizedName] || null;
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = getAuthToken();
      if (!token) { navigate('/login'); return; }
      try {
        const response = await api.get('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const promises = selectedWebsites.map(async (websiteId) => {
          const websiteResponse = await fetch(`/api/createWebsite/website/${websiteId}`);
          const websiteData = await websiteResponse.json();
          
          const categoriesResponse = await fetch(
            `/api/ad-categories/${websiteId}/advertiser`,
            { headers: getAuthHeaders() }
          );
          
          if (!categoriesResponse.ok) {
            if (categoriesResponse.status === 401) { navigate('/login'); return; }
            throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
          }
          
          const categoriesData = await categoriesResponse.json();
          return {
            websiteId,
            websiteName: websiteData.websiteName || 'Unknown Website',
            websiteLink: websiteData.websiteLink || '#',
            categories: categoriesData.categories || [],
          };
        });
        
        const result = await Promise.all(promises);
        setCategoriesByWebsite(result.filter(Boolean));
      } catch (error) {
        setError('Failed to load categories. Please try again.');
      }
    };

    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }
    if (selectedWebsites) fetchCategories();
  }, [selectedWebsites, navigate]);

  useEffect(() => {
    let total = 0;
    selectedCategories.forEach(categoryId => {
      categoriesByWebsite.forEach(website => {
        const category = website.categories.find(cat => cat._id === categoryId);
        if (category) total += category.price;
      });
    });
    setTotalCost(total);
  }, [selectedCategories, categoriesByWebsite]);

  const handleCategorySelection = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setError(false);
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getSelectedCategoryDetails = () => {
    const details = [];
    selectedCategories.forEach(categoryId => {
      categoriesByWebsite.forEach(website => {
        const category = website.categories.find(cat => cat._id === categoryId);
        if (category) {
          details.push({
            categoryId: category._id,
            websiteId: website.websiteId,
            websiteName: website.websiteName,
            categoryName: category.categoryName,
            price: category.price
          });
        }
      });
    });
    return details;
  };

  const handleCreateAd = async () => {
    if (selectedCategories.length === 0) { setError(true); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('adOwnerEmail', user?.email);
      if (fileObject) {
        formData.append('file', fileObject);
      } else if (file instanceof File) {
        formData.append('file', file);
      }
      formData.append('businessName', businessName);
      formData.append('businessLink', businessLink);
      formData.append('businessLocation', businessLocation);
      formData.append('adDescription', adDescription);
      formData.append('selectedWebsites', JSON.stringify(selectedWebsites));
      formData.append('selectedCategories', JSON.stringify(selectedCategories));

      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await api.post('/api/web-advertise', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setAdCreated(response.data.data);
        setShowPaymentSummary(true);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const errorMessage = error.response?.data?.message || 'An error occurred while creating the ad';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIX: added isPaying loading state + better error message extraction
  const handleBulkPayment = async () => {
    setIsPaying(true);
    setError(false);
    try {
      const token = getAuthToken();
      const selections = getSelectedCategoryDetails().map(detail => ({
        websiteId: detail.websiteId,
        categoryId: detail.categoryId
      }));

      const response = await api.post(
        '/api/web-advertise/payment/initiate',
        { adId: adCreated._id, selections },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        localStorage.removeItem('adFormData');
        window.location.href = response.data.paymentUrl;
      } else {
        setError(response.data.message || 'Payment URL not returned. Please try again.');
        setIsPaying(false);
      }
    } catch (error) {
      // FIX: extract the most useful message from the error response
      const errData = error.response?.data;
      const msg =
        errData?.message ||
        errData?.error ||
        'Failed to initiate payment. Please try again.';
      setError(msg);
      setIsPaying(false);
    }
  };

  if (!user && getAuthToken()) {
    return <LoadingSpinner />;
  }

  if (showPaymentSummary && adCreated) {
    const paymentSelections = getSelectedCategoryDetails();
    
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <Container>
            <div className="h-16 flex items-center justify-between">
              <button 
                onClick={() => {
                  setShowPaymentSummary(false);
                  setAdCreated(null);
                  setError(false);
                }} 
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span className="font-medium">Back to Edit Selections</span>
              </button>
              <Badge variant="default">Complete Your Payment</Badge>
            </div>
          </Container>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* FIX: Sandbox / test-mode banner */}
          {sandboxMode && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-400 text-amber-800 rounded px-4 py-3 mb-6">
              <FlaskConical size={18} className="shrink-0" />
              <div>
                <span className="font-semibold">Sandbox Mode — </span>
                <span className="text-sm">
                  You are using the XentriPay test environment. No real money will be charged.
                  Use the test card: <code className="bg-amber-100 px-1 rounded">4187 4274 1556 4246</code> · Exp <code className="bg-amber-100 px-1 rounded">09/32</code> · CVV <code className="bg-amber-100 px-1 rounded">828</code>
                </span>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="border border-red-600 bg-red-50 p-4 mb-6 rounded">
              <Text variant="error">
                {typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}
              </Text>
            </div>
          )}

          <div className="text-center mb-8">
            <Heading level={2} className="mb-2">Ad Created Successfully!</Heading>
            <Text variant="muted">
              Review your ad placements and complete payment to publish
            </Text>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
            <Heading level={3} className="mb-4">Ad Summary</Heading>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2">
                <Text className="font-medium">Business:</Text>
                <Text>{businessName}</Text>
              </div>
              <div className="flex gap-2">
                <Text className="font-medium">Location:</Text>
                <Text>{businessLocation}</Text>
              </div>
            </div>
          </div>

          {/* Selected Placements */}
          <div className="mb-8">
            <Heading level={3} className="mb-4">Selected Ad Placements</Heading>
            <div className="space-y-3">
              {paymentSelections.map((selection, index) => (
                <div key={index} className="border border-gray-300 bg-white p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Text className="font-semibold">{selection.websiteName}</Text>
                        <span className="text-gray-400">•</span>
                        <Text variant="muted">{selection.categoryName}</Text>
                      </div>
                    </div>
                    {/* FIX: currency is RWF, not $ */}
                    <Text className="font-semibold">RWF {selection.price.toLocaleString()}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total and Payment Button */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Heading level={3}>Total Payment</Heading>
                <Text variant="muted" className="mt-1">
                  {paymentSelections.length} ad placement{paymentSelections.length > 1 ? 's' : ''}
                </Text>
              </div>
              <div className="text-right">
                {/* FIX: currency is RWF */}
                <Text className="text-3xl font-bold">RWF {totalCost.toLocaleString()}</Text>
              </div>
            </div>

            {/* FIX: button now uses isPaying for loading state */}
            <Button
              onClick={handleBulkPayment}
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={isPaying}
              loading={isPaying}
              iconPosition="left"
            >
              {isPaying ? 'Redirecting to payment...' : `Pay RWF ${totalCost.toLocaleString()} Now`}
            </Button>

            <Text variant="muted" className="text-center mt-4">
              {sandboxMode
                ? 'Test mode: your ad will go live after sandbox payment confirmation'
                : 'Your ads will go live immediately after payment confirmation'}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
            <Badge variant="default">Choose Where Your Ad Will Appear</Badge>
          </div>
        </Container>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Info Banner */}
        <div className="py-6">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-gray-600 max-w-2xl">
                Choose where you want your advertisement to appear on each website. 
                Each location shows exactly where visitors will see your ad.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border border-red-600 bg-red-50 p-4 mb-8">
            <div className="flex items-center gap-3">
              <Text variant="error">
                {typeof error === 'string' ? error : 'Please select at least one ad placement to proceed'}
              </Text>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {categoriesByWebsite.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {categoriesByWebsite.map((website) => (
              <div key={website.websiteName} className="border border-black bg-white">
                {/* Website Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <Heading level={3} className="mb-1">{website.websiteName}</Heading>
                      <Text variant="muted">Available ad placements on this website</Text>
                    </div>
                    <a href={website.websiteLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" iconPosition="left">
                        Visit Site
                      </Button>
                    </a>
                  </div>
                </div>
                
                {/* Categories */}
                {website.categories.length > 0 ? (
                  <div className="p-6 space-y-6">
                    {website.categories.map((category) => {
                      const adImage = getAdSpaceImage(category.categoryName);
                      const isExpanded = expandedCategory === category._id;
                      const isSelected = selectedCategories.includes(category._id);
                      const isActuallyFullyBooked = category.isFullyBooked && !isSelected;
                      
                      return (
                        <div
                          key={category._id}
                          className={`border transition-all duration-200 bg-white relative ${
                            isSelected ? 'border-black shadow-md' : 'border-gray-300'
                          } ${isActuallyFullyBooked ? 'opacity-60' : ''}`}
                        >
                          {isActuallyFullyBooked && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-medium z-10">
                              FULLY BOOKED
                            </div>
                          )}
                          
                          <div
                            onClick={() => !isActuallyFullyBooked && handleCategorySelection(category._id)}
                            className={`p-6 ${isActuallyFullyBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                          >
                            <div className={`grid gap-6 items-center ${adImage ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
                              {adImage && (
                                <div className="w-full h-32 border border-gray-300 bg-gray-50 overflow-hidden">
                                  <img 
                                    src={adImage} 
                                    alt={`${category.categoryName} placement preview`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              <div className={adImage ? 'md:col-span-2' : 'md:col-span-3'}>
                                <div className="flex items-center gap-3 mb-3">
                                  <Heading level={4}>{category.categoryName}</Heading>
                                </div>
                                
                                <Text className="mb-4">
                                  {category.description.length > 80 
                                    ? `${category.description.substring(0, 80)}...`
                                    : category.description
                                  }
                                </Text>

                                <div className="flex items-center gap-6">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* FIX: RWF instead of $ */}
                                    <span className="text-lg font-semibold text-black">
                                      RWF {category.price.toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  {category.description.length > 80 && (
                                    <Button 
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategoryExpansion(category._id);
                                      }}
                                      icon={Eye}
                                      iconPosition="left"
                                    >
                                      {isExpanded ? 'Show Less' : 'Read More'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className={`w-10 h-10 border-2 flex items-center justify-center mx-auto mb-2 transition-colors ${
                                  isSelected ? 'bg-black border-black' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check size={20} className="text-white" />}
                                </div>
                                <Text 
                                  variant="small" 
                                  className={`font-medium ${isSelected ? 'text-black' : 'text-gray-500'}`}
                                >
                                  {isSelected ? 'SELECTED' : 'SELECT'}
                                </Text>
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-6 pb-6 border-t border-gray-200">
                              <Text className="pt-4">{category.description}</Text>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Heading level={4} className="mb-2">No Ad Spaces Available</Heading>
                    <Text variant="muted">
                      This website doesn't have any available ad placements right now. Check back later!
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heading level={2} className="mb-4">No Ad Spaces Found</Heading>
            <Text variant="muted" className="mb-8">
              The selected websites don't have any available ad placements. 
              Please try selecting different websites.
            </Text>
          </div>
        )}
        
        {/* Footer Actions */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <Button 
            onClick={handleCreateAd}
            disabled={selectedCategories.length === 0 || isSubmitting}
            loading={isSubmitting}
            variant="secondary"
            size="lg"
          >
            {isSubmitting ? 'Creating Ad...' : selectedCategories.length > 0 ? `Continue to Payment` : 'Select Ad Spaces to Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;