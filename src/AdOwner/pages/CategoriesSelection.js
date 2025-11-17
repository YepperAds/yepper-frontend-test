// Updated Categories.js - Fixed property access errors
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  Eye,
  AlertCircle,
  Info
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
  const { selectedWebsites } = location.state || {};
  const [categoriesByWebsite, setCategoriesByWebsite] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (!selectedWebsites || selectedWebsites.length === 0) {
      navigate('/select-websites');
    }
  }, [selectedWebsites, navigate]);

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

  const handleCategorySelection = (categoryId, category) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedCategoryDetails(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedCategoryDetails(category);
    }
    setError(false);
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleNext = () => {
    if (!selectedCategory) {
      setError('Please select an ad placement to continue');
      return;
    }

    navigate('/upload-ad', {
      state: {
        selectedWebsites,
        selectedCategory,
        categoryRequirements: selectedCategoryDetails
      }
    });
  };

  if (!user && getAuthToken()) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate('/select-websites')} 
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back to Website Selection</span>
            </button>
            <Badge variant="default">Step 2: Choose Ad Placement</Badge>
          </div>
        </Container>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <Heading level={4} className="mb-2 text-blue-900">
                Select ONE Ad Placement
              </Heading>
              <Text className="text-blue-800 mb-2">
                Choose where you want your ad to appear. After selecting, you'll upload your ad file 
                that matches the specific requirements for that placement.
              </Text>
              <Text variant="small" className="text-blue-700">
                You can only select one placement at a time to ensure your ad meets the exact specifications.
              </Text>
            </div>
          </div>
        </div>

        {selectedCategoryDetails && selectedCategoryDetails.adSize && (
          <div className="bg-green-50 border border-green-200 p-6 mb-8">
            <div className="flex items-start gap-3">
              <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Heading level={4} className="mb-3 text-green-900">
                  Selected: {selectedCategoryDetails.categoryName}
                </Heading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Text variant="small" className="text-green-700 font-semibold mb-1">
                      Required Size
                    </Text>
                    <Text className="text-green-900">
                      {selectedCategoryDetails.adSize.width} × {selectedCategoryDetails.adSize.height}px
                    </Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-green-700 font-semibold mb-1">
                      Allowed Formats
                    </Text>
                    <Text className="text-green-900">
                      {selectedCategoryDetails.allowedAdTypes?.join(', ').toUpperCase() || 'N/A'}
                    </Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-green-700 font-semibold mb-1">
                      Price
                    </Text>
                    <Text className="text-green-900 font-bold">
                      ${selectedCategoryDetails.price || 0}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="border border-red-600 bg-red-50 p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <Text className="text-red-900">
                {typeof error === 'string' ? error : 'Please select an ad placement to continue'}
              </Text>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : categoriesByWebsite.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {categoriesByWebsite.map((website) => (
              <div key={website.websiteName} className="border border-black bg-white">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <Heading level={3} className="mb-1">{website.websiteName}</Heading>
                      <Text variant="muted">Available ad placements</Text>
                    </div>
                    <a 
                      href={website.websiteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Visit Site
                      </Button>
                    </a>
                  </div>
                </div>
                
                {website.categories.length > 0 ? (
                  <div className="p-6 space-y-6">
                    {website.categories.map((category) => {
                      // Safe property access with defaults
                      if (!category || !category.adSize) {
                        console.warn('Category missing required data:', category);
                        return null;
                      }

                      const adImage = getAdSpaceImage(category.categoryName);
                      const isExpanded = expandedCategory === category._id;
                      const isSelected = selectedCategory === category._id;
                      const isFullyBooked = category.isFullyBooked;
                      
                      return (
                        <div
                          key={category._id}
                          className={`border transition-all duration-200 bg-white relative ${
                            isSelected ? 'border-black shadow-lg ring-2 ring-black' : 'border-gray-300'
                          } ${isFullyBooked ? 'opacity-60' : ''}`}
                        >
                          {isFullyBooked && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-medium z-10">
                              FULLY BOOKED
                            </div>
                          )}
                          
                          <div
                            onClick={() => !isFullyBooked && handleCategorySelection(category._id, category)}
                            className={`p-6 ${isFullyBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
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
                                  <Heading level={4}>{category.categoryName || 'Unnamed Category'}</Heading>
                                </div>
                                
                                <Text className="mb-4">
                                  {category.description && category.description.length > 80 
                                    ? `${category.description.substring(0, 80)}...`
                                    : category.description || 'No description available'
                                  }
                                </Text>

                                <div className="flex items-center gap-4 mb-3">
                                  <div className="text-sm">
                                    <Text variant="small" className="text-gray-600">
                                      Size: {category.adSize?.width || 0}×{category.adSize?.height || 0}px
                                    </Text>
                                  </div>
                                  <div className="text-sm">
                                    <Text variant="small" className="text-gray-600">
                                      Types: {category.allowedAdTypes?.join(', ') || 'N/A'}
                                    </Text>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg font-semibold text-black">
                                      ${category.price || 0}
                                    </span>
                                  </div>
                                  
                                  {category.description && category.description.length > 80 && (
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

                          {isExpanded && category.description && (
                            <div className="px-6 pb-6 border-t border-gray-200">
                              <Text className="pt-4">{category.description}</Text>
                            </div>
                          )}
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Heading level={4} className="mb-2">No Ad Spaces Available</Heading>
                    <Text variant="muted">
                      This website doesn't have any available ad placements right now.
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
        
        <div className="border-t border-gray-200 pt-8 text-center">
          <Button 
            onClick={handleNext}
            disabled={!selectedCategory}
            variant="secondary"
            size="lg"
          >
            {selectedCategory ? 'Next: Upload Your Ad' : 'Select a Placement to Continue'}
          </Button>
          
          {selectedCategory && (
            <Text variant="muted" className="mt-4">
              You'll upload an ad that matches the selected placement requirements
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;