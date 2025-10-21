// Categories.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import axios from 'axios';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [adCreated, setAdCreated] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  
  useEffect(() => {
    const loadFileFromStorage = async () => {
      if (file && file.data && !fileObject) {
        try {
          const response = await fetch(file.data);
          const blob = await response.blob();
          const restoredFile = new File([blob], file.name, {
            type: file.type
          });
          setFileObject(restoredFile);
        } catch (error) {
        }
      } else if (file instanceof File) {
        setFileObject(file);
      }
    };
    
    loadFileFromStorage();
  }, [file]);

  useEffect(() => {
    if (businessName) {
      const dataToSave = {
        ...initialData,
        selectedCategories
      };
      localStorage.setItem('adFormData', JSON.stringify(dataToSave));
    }
  }, [selectedCategories, businessName]);

  // Redirect if no business data
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
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
      setIsLoading(true);
      try {
        const promises = selectedWebsites.map(async (websiteId) => {
          const websiteResponse = await fetch(`http://localhost:5000/api/createWebsite/website/${websiteId}`);
          const websiteData = await websiteResponse.json();
          
          const categoriesResponse = await fetch(
            `http://localhost:5000/api/ad-categories/${websiteId}/advertiser`,
            {
              headers: getAuthHeaders()
            }
          );
          
          if (!categoriesResponse.ok) {
            if (categoriesResponse.status === 401) {
              navigate('/login');
              return;
            }
            throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
          }
          
          const categoriesData = await categoriesResponse.json();

          return {
            websiteId: websiteId,
            websiteName: websiteData.websiteName || 'Unknown Website',
            websiteLink: websiteData.websiteLink || '#',
            categories: categoriesData.categories || [],
          };
        });
        
        const result = await Promise.all(promises);
        setCategoriesByWebsite(result.filter(Boolean));
        
      } catch (error) {
        setError('Failed to load categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    if (selectedWebsites) fetchCategories();
  }, [selectedWebsites, navigate]);

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      selectedCategories.forEach(categoryId => {
        categoriesByWebsite.forEach(website => {
          const category = website.categories.find(cat => cat._id === categoryId);
          if (category) {
            total += category.price;
          }
        });
      });
      setTotalCost(total);
    };

    calculateTotal();
  }, [selectedCategories, categoriesByWebsite]);

  const handleCategorySelection = (categoryId) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId) 
        ? prevSelected.filter((id) => id !== categoryId) 
        : [...prevSelected, categoryId]
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
    if (selectedCategories.length === 0) {
      setError(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('adOwnerEmail', user?.email);
      
      // Use the restored File object
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
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      const response = await axios.post('http://localhost:5000/api/web-advertise', formData, config);

      if (response.data.success) {
        setAdCreated(response.data.data);
        setShowPaymentSummary(true);
        
        // Don't clear saved data yet - keep it in case user goes back
        // It will be cleared after successful payment
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

  const handleBulkPayment = async () => {
    try {
      const token = getAuthToken();
      
      // Prepare selections array
      const selections = getSelectedCategoryDetails().map(detail => ({
        websiteId: detail.websiteId,
        categoryId: detail.categoryId
      }));

      const response = await axios.post(
        'http://localhost:5000/api/web-advertise/payment/initiate', 
        {
          adId: adCreated._id,
          selections: selections
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Clear saved data when payment is initiated
        localStorage.removeItem('adFormData');
        // Redirect to payment URL
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initiate payment. Please try again.');
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
          <div className="text-center mb-8">
            <Heading level={2} className="mb-2">Ad Created Successfully!</Heading>
            <Text variant="muted">
              Review your ad placements and complete payment to publish
            </Text>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
            <Heading level={3} className="mb-4">Ad Summary</Heading>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className='flex gap-2'>
                <Text className="font-medium">Business:</Text>
                <Text>{businessName}</Text>
              </div>
              <div className='flex gap-2'>
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
                    <Text className="font-semibold">${selection.price}</Text>
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
                <Text className="text-3xl font-bold">${totalCost}</Text>
              </div>
            </div>

            <Button
              onClick={handleBulkPayment}
              variant="secondary"
              size="lg"
              className="w-full"
              iconPosition="left"
            >
              Pay ${totalCost} Now
            </Button>

            <Text variant="muted" className="text-center mt-4">
              Your ads will go live immediately after payment confirmation
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
                    <a 
                      href={website.websiteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        iconPosition="left"
                      >
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
                      // Allow re-selection of categories if they're currently selected
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
                          
                          {/* Main Content */}
                          <div
                            onClick={() => !isActuallyFullyBooked && handleCategorySelection(category._id)}
                            className={`p-6 ${isActuallyFullyBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                          >
                            <div className={`grid gap-6 items-center ${adImage ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
                              {/* Ad Preview Image */}
                              {adImage && (
                                <div className="w-full h-32 border border-gray-300 bg-gray-50 overflow-hidden">
                                  <img 
                                    src={adImage} 
                                    alt={`${category.categoryName} placement preview`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              {/* Category Info */}
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
                                    <span className="text-lg font-semibold text-black">
                                      ${category.price}
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
                              
                              {/* Selection Indicator */}
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

                          {/* Expanded Description */}
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