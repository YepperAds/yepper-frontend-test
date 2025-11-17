import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Info, 
    Check, 
    Users,
    X,
    FileText,
    ArrowRight,
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
    Star,
    Search
} from 'lucide-react';
import { Button, Grid, Input, TextArea } from '../../components/components';
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

const AddNewCategory = ({ onSubmitSuccess }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const isCategoryDataEmpty = (category) => {
    const data = categoryData[category];
    return !data || 
      (!data.price && !data.userCount && !data.instructions);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token'); 

        
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, [navigate]);

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

  const AD_SIZES = [
    { width: 300, height: 250, label: 'Medium Rectangle' },
    { width: 728, height: 90, label: 'Leaderboard' },
    { width: 160, height: 600, label: 'Wide Skyscraper' },
    { width: 300, height: 600, label: 'Half Page' },
    { width: 320, height: 50, label: 'Mobile Banner' },
    { width: 320, height: 100, label: 'Large Mobile Banner' },
    { width: 970, height: 90, label: 'Large Leaderboard' },
    { width: 970, height: 250, label: 'Billboard' },
    { width: 250, height: 250, label: 'Square' },
    { width: 336, height: 280, label: 'Large Rectangle' },
    { width: 120, height: 600, label: 'Skyscraper' },
    { width: 468, height: 60, label: 'Banner' },
    { width: 234, height: 60, label: 'Half Banner' },
  ];

  const AD_TYPES = [
    { id: 'image', label: 'Static Image', icon: '🖼️', description: 'JPG, PNG formats' },
    { id: 'gif', label: 'Animated GIF', icon: '🎬', description: 'Animated image' },
    { id: 'video', label: 'Video', icon: '🎥', description: 'MP4, WebM formats' },
    { id: 'html5', label: 'HTML5', icon: '💻', description: 'Interactive ads' },
    { id: 'text', label: 'Text Ad', icon: '📝', description: 'Text-based ads' },
  ];

  const AdSizeSelector = ({ selectedSize, onSizeSelect }) => {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-gray-700">Ad Size *</span>
        </div>
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-300 p-3">
          {AD_SIZES.map((size) => (
            <button
              key={`${size.width}x${size.height}`}
              type="button"
              onClick={() => onSizeSelect(size)}
              className={`p-3 border text-left transition-all ${
                selectedSize?.width === size.width && selectedSize?.height === size.height
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              <div className="font-semibold text-sm">{size.label}</div>
              <div className="text-xs opacity-80">{size.width} × {size.height}px</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const AdTypeSelector = ({ selectedTypes, onTypeToggle }) => {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-gray-700">Allowed Ad Types *</span>
          <span className="text-xs text-gray-500">(Select one or more)</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {AD_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onTypeToggle(type.id)}
              className={`p-4 border text-left transition-all ${
                selectedTypes?.includes(type.id)
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{type.label}</div>
                  <div className="text-xs opacity-80">{type.description}</div>
                </div>
                {selectedTypes?.includes(type.id) && (
                  <Check size={20} className="flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const updateCategoryData = (category, field, value) => {
    if (field === 'price') {
      setCategoryData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          price: value.price,
          tier: value.tier,
          visitorRange: value.visitorRange
        }
      }));
    } else if (field === 'adSize') {
      setCategoryData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          adSize: value
        }
      }));
    } else if (field === 'allowedAdTypes') {
      setCategoryData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          allowedAdTypes: value
        }
      }));
    } else {
      setCategoryData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    }
  };

  const toggleAdType = (category, typeId) => {
    const currentTypes = categoryData[category]?.allowedAdTypes || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(t => t !== typeId)
      : [...currentTypes, typeId];
    updateCategoryData(category, 'allowedAdTypes', newTypes);
  };

  const AnimatedTemplate = ({ adSize, adTypes, isVisible }) => {
    // Simplified animation logic for a professional 'fade and scale' effect
    const [showTemplate, setShowTemplate] = useState(false);
    
    useEffect(() => {
      if (isVisible && adSize && adTypes.length > 0) {
        // Delay to allow visibility check to render
        const timer = setTimeout(() => setShowTemplate(true), 50);
        return () => clearTimeout(timer);
      } else {
        setShowTemplate(false);
      }
    }, [adSize, adTypes, isVisible]);

    const getAdTypeStyles = (type) => {
      // Simplified and standardized styles for a cleaner look
      const styles = {
        image: { color: 'bg-indigo-500', icon: '🖼️', label: 'Static Image' },
        gif: { color: 'bg-green-500', icon: '🎬', label: 'Animated GIF' },
        video: { color: 'bg-red-500', icon: '🎥', label: 'Video Content' },
        html5: { color: 'bg-yellow-500', icon: '💻', label: 'Interactive HTML' },
        text: { color: 'bg-gray-500', icon: '📝', label: 'Text-Only Ad' }
      };
      return styles[type] || styles.image;
    };

    if (!isVisible || !adSize || adTypes.length === 0) {
      // Professional Placeholder
      return (
        <div className="relative w-full h-[300px] border border-dashed border-gray-400 rounded-lg bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-2-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <div className="text-base font-semibold">Ad Preview Not Configured</div>
            <p className="text-sm mt-1">Select an Ad Size and at least one Ad Type to see the live preview.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative w-full border border-gray-300 bg-white rounded-lg p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">
          Preview for {adSize.width} × {adSize.height}px ({adTypes.length} Types)
        </h3>
          
        <div className="border border-gray-200 bg-gray-50 overflow-x-auto overflow-y-hidden rounded-md">
          <div className="flex p-4 gap-6 items-center" style={{ minHeight: `${Math.min(adSize.height, 350) + 32}px` }}>
            {adTypes.map((currentAdType, index) => {
              const typeStyles = getAdTypeStyles(currentAdType);
              const delay = index * 0.1; // Staggered animation delay
              
              return (
                <div
                  key={currentAdType}
                  className={`flex-shrink-0 transition-all duration-500 ease-out transform ${showTemplate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                  style={{
                    width: `${adSize.width}px`,
                    height: `${adSize.height}px`,
                    transitionDelay: `${delay}s`,
                  }}
                >
                  <div
                    className={`w-full h-full ${typeStyles.color} rounded-lg shadow-lg flex flex-col items-center justify-center relative overflow-hidden text-white`}
                  >
                    <div className="relative z-10 text-center px-4">
                      <div className="text-4xl mb-2">{typeStyles.icon}</div>
                      <div
                        className="font-bold mb-1"
                        style={{ fontSize: `${Math.min(adSize.width, adSize.height) / 10}px` }}
                      >
                        {adSize.width} × {adSize.height}
                      </div>
                      <div className="text-sm font-medium opacity-90">
                        {typeStyles.label}
                      </div>
                    </div>

                      {/* Subtle Overlay to act as a watermark/border */}
                      <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {adTypes.length > 1 && (
          <div className="mt-3 text-center text-xs text-gray-500 font-medium">
            Scroll horizontally to view all {adTypes.length} previews.
          </div>
        )}
      </div>
    );
  };

  const renderCategoryModal = () => {
    const [showFullImage, setShowFullImage] = useState(false);
    
    if (!activeCategory) return null;
    
    const details = categoryDetails[activeCategory];
    const currentData = categoryData[activeCategory] || {};
    const hasPrice = !!currentData.price;
    const hasAdSize = !!currentData.adSize;
    
    const selectedAdTypes = currentData.allowedAdTypes || [];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white border border-black w-full max-h-[92vh] overflow-y-auto">
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

          <div className="p-6">
            {showFullImage ? (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <PricingTiers 
                    selectedPrice={categoryData[activeCategory] || {}}
                    onPriceSelect={(price) => updateCategoryData(activeCategory, 'price', price)}
                  />

                  <AdSizeSelector
                    selectedSize={categoryData[activeCategory]?.adSize}
                    onSizeSelect={(size) => updateCategoryData(activeCategory, 'adSize', size)}
                  />

                  <AdTypeSelector
                    selectedTypes={selectedAdTypes}
                    onTypeToggle={(typeId) => toggleAdType(activeCategory, typeId)}
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

                <div className="space-y-6">
                  <AnimatedTemplate 
                    adSize={currentData.adSize}
                    adTypes={selectedAdTypes}
                    image={details.image}
                    isVisible={hasPrice && hasAdSize && selectedAdTypes.length > 0}
                  />

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

            {!showFullImage && (
              <div className="flex justify-end pt-6 mt-8 border-t border-black">
                <Button
                variant="secondary"
                onClick={handleNext}
                disabled={
                  !categoryData[activeCategory]?.price || 
                  !categoryData[activeCategory]?.adSize ||
                  !categoryData[activeCategory]?.allowedAdTypes?.length
                }
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


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const categoriesToSubmit = Object.entries(selectedCategories)
        .filter(([category]) => completedCategories.includes(category))
        .map(([category]) => {
          const data = categoryData[category] || {};
          const details = categoryDetails[category] || {};
          
          return {
            websiteId: websiteId,
            categoryName: category.charAt(0).toUpperCase() + category.slice(1),
            description: details.description || '',
            price: Number(data.price) || 0,
            spaceType: details.spaceType || 'banner',
            userCount: Number(data.userCount) || 0,
            instructions: data.instructions || '',
            customAttributes: data.customAttributes || {},
            visitorRange: {
              min: Number(data.visitorRange?.min) || 0,
              max: Number(data.visitorRange?.max) || 10000
            },
            tier: data.tier || 'bronze',
            adSize: data.adSize,
            allowedAdTypes: data.allowedAdTypes || []
          };
        });

        const token = localStorage.getItem('token');
        const responses = await Promise.all(
            categoriesToSubmit.map(async (category) => {
                const response = await axios.post('http://localhost:5000/api/ad-categories', category, {
                  headers: {
                    'Authorization': `Bearer ${token}` 
                  }
                });
                return { ...response.data, name: category.categoryName };
            })
        );
  
        const categoriesWithId = responses.reduce((acc, category) => {
          acc[category.name.toLowerCase()] = { 
            id: category.category?._id || category._id,
            price: category.category?.price || category.price,
            apiCodes: category.category?.apiCodes || category.apiCodes,
            adSize: category.category?.adSize || category.adSize,
            allowedAdTypes: category.category?.allowedAdTypes || category.allowedAdTypes
          };
          return acc;
        }, {});
  
        onSubmitSuccess();
    } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
    }
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Select Ad Spaces</h1>
          <p className="text-gray-700">Choose and configure advertising spaces for your website</p>
        </div>

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
                        <h3 className="text-lg font-semibold text-black">{details.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <img 
                      src={details.image} 
                      alt={`${details.name} preview`}
                      className="w-full h-32 object-cover border border-gray-300"
                    />
                  </div>

                  <p className="text-gray-700 text-sm mb-4">
                    {details.description}
                  </p>

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

export default AddNewCategory;