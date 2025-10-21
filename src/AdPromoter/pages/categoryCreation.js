// categoryCreation.js
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Info, 
    Check, 
    Users,
    X,
    ArrowLeft,
    FileText,
    Monitor,
    Smartphone,
    Sidebar as SidebarIcon,
    Layers,
    PanelRight,
    PanelLeft,
    AlignJustify,
    PanelBottom,
    PieChart,
    Layout,
    Maximize,
    Search
} from 'lucide-react';
import { Button, Grid, Input, TextArea, Badge, Container } from '../../components/components';
import PricingTiers from '../components/PricingTiers';
import CategoryInfoModal from '../components/CategoryInfoModal';

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

const CategoryCreation = () => {
  const [user, setUser] = useState(null); // NEW: Custom user state
  const [loading, setLoading] = useState(true); // NEW: Loading state for auth check
  const { websiteId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [websiteDetails] = useState(state?.websiteDetails || null);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [completedCategories, setCompletedCategories] = useState([]);
  const [activeInfoModal, setActiveInfoModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage

        // Verify token and get user data
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data.user); // Set user data from your API
        setLoading(false);
      } catch (error) {
        localStorage.removeItem('token'); // Remove invalid token
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!websiteId) {
        navigate('/create-website');
        return;
    }

    if (!websiteDetails) {
        const fetchWebsiteDetails = async () => {
            try {
                // CHANGED: Added authorization header for API calls
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/websites/${websiteId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}` // NEW: Added auth header
                  }
                });
                // Handle the website details...
            } catch (error) {
                navigate('/create-website');
            }
        };
        fetchWebsiteDetails();
    }
  }, [websiteId, websiteDetails, navigate]);

  const isCategoryDataEmpty = (category) => {
      const data = categoryData[category];
      return !data || 
             (!data.price && !data.userCount && !data.instructions);
  };

  useEffect(() => {
      completedCategories.forEach(category => {
          if (isCategoryDataEmpty(category)) {
              setCompletedCategories(prev => 
                  prev.filter(cat => cat !== category)
              );
          }
      });
  }, [categoryData, completedCategories]);

  const categoryDetails = useMemo(() => ({
      aboveTheFold: {
          name: 'Above the Fold',
          icon: <Layers className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Above The Fold",
          description: "Prime visibility area at the top of webpage before scrolling",
          visualization: "/api/placeholder/300/120",
          category: "primary",
          position: "top",
          image: AboveTheFold
      },
      beneathTitle: {
          name: 'Beneath Title',
          icon: <AlignJustify className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Beneath Title",
          description: "Ad space directly below the page title",
          visualization: "/api/placeholder/300/120",
          category: "content",
          position: "top",
          image: BeneathTitle

      },
      bottom: {
          name: 'Bottom',
          icon: <PanelBottom className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Bottom",
          description: "Ad placement at the bottom of the webpage",
          visualization: "/api/placeholder/300/120",
          category: "secondary",
          position: "bottom",
          image: Bottom
      },
      floating: {
          name: 'Floating',
          icon: <Maximize className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Floating",
          description: "Ads that float over page content, follows user scrolling",
          visualization: "/api/placeholder/300/120",
          category: "special",
          position: "overlay",
          image: Floating
      },
      HeaderPic: {
          name: 'Header',
          icon: <Monitor className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Header",
          description: "Banner ad space in the header section of the website",
          visualization: "/api/placeholder/300/120",
          category: "primary",
          position: "top",
          image: HeaderPic
      },
      inFeed: {
          name: 'In Feed',
          icon: <Layout className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "In Feed",
          description: "Native ad placement within content feeds",
          visualization: "/api/placeholder/300/120",
          category: "content",
          position: "middle",
          image: InFeed
      },
      inlineContent: {
          name: 'Inline Content',
          icon: <AlignJustify className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Inline Content",
          description: "Ad placement directly within article text",
          visualization: "/api/placeholder/300/120",
          category: "content",
          position: "middle",
          image: InlineContent
      },
      leftRail: {
          name: 'Left Rail',
          icon: <PanelLeft className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Left Rail",
          description: "Ad space along the left side of the webpage",
          visualization: "/api/placeholder/300/120",
          category: "sidebar",
          position: "left",
          image: LeftRail
      },
      mobileInterstial: {
          name: 'Mobile Interstitial',
          icon: <Smartphone className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "Mobile Interstitial",
          description: "Full-screen mobile ads that appear between content",
          visualization: "/api/placeholder/300/120",
          category: "mobile",
          position: "overlay",
          image: MobileInterstial
      },
      modalPic: {
          name: 'Modal',
          icon: <Info className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "modalPic",
          description: "Pop-up ad that appears in a modal window",
          visualization: "/api/placeholder/300/120",
          category: "special",
          position: "overlay",
          image: ModalPic
      },
      overlay: {
          name: 'Overlay',
          icon: <Layers className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "overlay",
          description: "Ad that overlays on top of page content",
          visualization: "/api/placeholder/300/120",
          category: "special",
          position: "overlay",
          image: Overlay
      },
      proFooter: {
          name: 'Pro Footer',
          icon: <PanelBottom className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "proFooter",
          description: "Premium ad space in the footer section",
          visualization: "/api/placeholder/300/120",
          category: "secondary",
          position: "bottom",
          image: ProFooter
      },
      rightRail: {
          name: 'Right Rail',
          icon: <PanelRight className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "rightRail",
          description: "Ad space along the right side of the webpage",
          visualization: "/api/placeholder/300/120",
          category: "sidebar",
          position: "right",
          image: RightRail
      },
      sidebar: {
          name: 'Sidebar',
          icon: <SidebarIcon className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "sidebar",
          description: "Ad placement in the website sidebar",
          visualization: "/api/placeholder/300/120",
          category: "sidebar",
          position: "side",
          image: Sidebar
      },
      stickySidebar: {
          name: 'Sticky Sidebar',
          icon: <PieChart className="w-6 h-6" />,
          infoIcon: <Info className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />,
          spaceType: "stickySidebar",
          description: "Sidebar ad that stays visible as user scrolls",
          visualization: "/api/placeholder/300/120",
          category: "sidebar",
          position: "side",
          image: StickySidebar
      },
  }), []);

  const filteredCategories = useMemo(() => {
      return Object.entries(categoryDetails).filter(([key, value]) => {
          const matchesSearch = value.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  value.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesFilter = activeFilter === 'all' || value.category === activeFilter;
          return matchesSearch && matchesFilter;
      });
  }, [categoryDetails, searchTerm, activeFilter]);

  const handleCategorySelect = (category) => {
      setActiveCategory(category);
      if (!selectedCategories[category]) {
          setSelectedCategories(prev => ({
              ...prev,
              [category]: true
          }));
      }
  };

  const handleCloseModal = () => {
      setActiveCategory(null);
  };

  const updateCategoryData = (category, field, value) => {
      if (field === 'price') {
          // value will now be an object containing price, tier, and visitorRange
          setCategoryData(prev => ({
              ...prev,
              [category]: {
                  ...prev[category],
                  price: value.price,
                  tier: value.tier,
                  visitorRange: value.visitorRange
              }
          }));
          } else {
              // Handle other fields normally
              setCategoryData(prev => ({
                  ...prev,
                  [category]: {
                      ...prev[category],
                      [field]: value
                  }
          }));
      }
  };

  const handleNext = () => {
      if (activeCategory && !isCategoryDataEmpty(activeCategory)) {
          setCompletedCategories(prev => 
              prev.includes(activeCategory) 
                  ? prev 
                  : [...prev, activeCategory]
          );
      }
      setActiveCategory(null);
  };

  // Fixed handleSubmit method for CategoryCreation.js
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const categoriesToSubmit = Object.entries(selectedCategories)
        .filter(([category]) => completedCategories.includes(category))
        .map(([category]) => {
          const data = categoryData[category] || {};
          const details = categoryDetails[category] || {};
          
          // Ensure proper data structure
          return {
            websiteId: websiteId, // Make sure this is a valid ObjectId
            categoryName: category.charAt(0).toUpperCase() + category.slice(1),
            description: details.description || '',
            price: Number(data.price) || 0, // Ensure it's a number
            spaceType: details.spaceType || 'banner', // Required field
            userCount: Number(data.userCount) || 0,
            instructions: data.instructions || '',
            customAttributes: data.customAttributes || {},
            // Required fields that were missing or incorrectly structured
            visitorRange: {
              min: Number(data.visitorRange?.min) || 0,
              max: Number(data.visitorRange?.max) || 10000
            },
            tier: data.tier || 'bronze' // Must be one of: bronze, silver, gold, platinum
          };
        });


      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const responses = await Promise.all(
        categoriesToSubmit.map(async (category) => {
          try {
            const response = await axios.post(
              'http://localhost:5000/api/ad-categories', 
              category, 
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            return { ...response.data, name: category.categoryName };
          } catch (error) {
            throw error;
          }
        })
      );

      const categoriesWithId = responses.reduce((acc, category) => {
        acc[category.name.toLowerCase()] = { 
          id: category.category?._id || category._id, // Handle different response structures
          price: category.category?.price || category.price,
          apiCodes: category.category?.apiCodes || category.apiCodes
        };
        return acc;
      }, {});

      navigate('/websites', {
        state: {
          websiteId,
          websiteDetails,
          selectedCategories: categoriesWithId,
          categoryData
        },
      });
    } catch (error) {
      
      // Handle specific error types
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 400) {
      } else {
      }
    }
  };

  const renderCategoryModal = () => {
    const [showFullImage, setShowFullImage] = useState(false);
    
    if (!activeCategory) return null;
    
    const details = categoryDetails[activeCategory];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white border border-black max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-white">
                {details.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">{details.name}</h2>
                <p className="text-sm text-gray-600">{details.category} • {details.position}</p>
              </div>
            </div>
            <button 
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 border border-black"
            >
              <X size={16} />
            </button>
          </div>
  
          {/* Content */}
          <div className="p-6">
            {showFullImage ? (
              /* Full Image View */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-black">Preview Image</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFullImage(false)}
                    size="sm"
                  >
                    Back to Details
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={details.image} 
                    alt={`${details.name} full preview`}
                    className="max-w-full max-h-[70vh] border border-black object-contain"
                  />
                </div>
              </div>
            ) : (
              /* Side by Side Layout */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Pricing and Inputs */}
                <div className="space-y-6">
                  <PricingTiers 
                    selectedPrice={categoryData[activeCategory] || {}}
                    onPriceSelect={(price) => updateCategoryData(activeCategory, 'price', price)}
                  />
  
                  <div className="space-y-6">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-700">Number of ads for this space</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="Number of ads"
                        value={categoryData[activeCategory]?.userCount || ''}
                        onChange={(e) => updateCategoryData(activeCategory, 'userCount', e.target.value)}
                        className="w-full"
                      />
                    </div>
  
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-700">Additional Requirements</span>
                      </div>
                      <TextArea
                        placeholder="Enter any additional requirements or notes"
                        value={categoryData[activeCategory]?.instructions || ''}
                        onChange={(e) => updateCategoryData(activeCategory, 'instructions', e.target.value)}
                        rows={4}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
  
                {/* Right Side - Description and Image */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Description & Preview</h3>
                    
                    <div className="space-y-4">
                      <div 
                        className="cursor-pointer group"
                        onClick={() => setShowFullImage(true)}
                      >
                        <img 
                          src={details.image} 
                          alt={`${details.name} preview`}
                          className="w-full border border-black group-hover:opacity-80 transition-opacity"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-black mb-2">About this category</h4>
                        <p className="text-gray-700 mb-4">{details.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Position: {details.position}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Category: {details.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            {/* Footer - only show when not in full image mode */}
            {!showFullImage && (
              <div className="flex justify-end pt-6 mt-8 border-t border-black">
                <Button
                  variant="secondary"
                  onClick={handleNext}
                  disabled={!categoryData[activeCategory]?.price}
                  size="lg"
                >
                  Save & Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const categoryFilters = [
    { id: 'all', name: 'All Spaces' },
    { id: 'primary', name: 'Primary' },
    { id: 'secondary', name: 'Secondary' },
    { id: 'sidebar', name: 'Sidebar' },
    { id: 'content', name: 'Content' },
    { id: 'special', name: 'Special' },
    { id: 'mobile', name: 'Mobile' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
            <Badge variant="default">Choose Ad Spaces</Badge>
          </div>
        </Container>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-gray-700">Choose and configure advertising spaces for your website</p>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search ad spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {categoryFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 text-sm border border-black transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <form onSubmit={handleSubmit}>
          {filteredCategories.length > 0 ? (
            <Grid cols={3} gap={6} className="mb-8">
              {filteredCategories.map(([category, details]) => (
                <div
                  key={category}
                  className={`border p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    completedCategories.includes(category)
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${
                        completedCategories.includes(category) 
                          ? 'bg-black text-white' 
                          : 'bg-white border-black'
                      } text-black`}>
                        {completedCategories.includes(category) ? (
                          <Check size={20} />
                        ) : (
                          details.icon
                        )}
                      </div>
                      <div>
                        {/* <div className="text-xs font-medium text-gray-500 uppercase">
                          {details.category}
                        </div> */}
                        <h3 className="text-lg font-semibold text-black">{details.name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Preview Image */}
                  <div className="mb-4">
                    <img 
                      src={details.image} 
                      alt={`${details.name} preview`}
                      className="w-full h-32 object-cover border border-gray-300"
                    />
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-4">
                    {details.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500 uppercase">
                      {details.position}
                    </span>
                    {completedCategories.includes(category) && categoryData[category]?.price && (
                      <span className="text-sm font-bold text-black">
                        ${categoryData[category].price}/mo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Grid>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Search size={64} className="mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-semibold mb-4 text-black">
                  No ad spaces found
                </h2>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {completedCategories.length > 0 && (
            <div className="flex justify-center">
              <Button 
                type="submit"
                variant="secondary"
                size="lg"
              >
                Create {completedCategories.length} Ad Space{completedCategories.length > 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Modals */}
      {renderCategoryModal()}
      {activeInfoModal && (
        <CategoryInfoModal 
          isOpen={!!activeInfoModal}
          onClose={() => setActiveInfoModal(null)}
          category={activeInfoModal}
        />
      )}
    </div>
  );
};

export default CategoryCreation;