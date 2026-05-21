import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, ArrowLeft, Check, Info, AlertTriangle,
  Building2, Code, Utensils, Home, Car, Heart, Gamepad2, 
  Shirt, BookOpen, Briefcase, Plane, Music, Camera, Gift, 
  Shield, Zap, Loader, X, Mail, Lock, User, Eye, EyeOff,
  Layers, Monitor, Smartphone, Search, CheckCircle,
  Sidebar as SidebarIcon, PanelRight, PanelLeft, AlignJustify,
  PanelBottom, PieChart, Layout, Maximize
} from 'lucide-react';
import axios from 'axios';

import LoadingSpinner from '../../components/LoadingSpinner';

import PricingTiers from '../components/PricingTiers';

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

const API_URL = process.env.REACT_APP_API_URL || 'https://yepper-backend-test.onrender.com';

const UnifiedWebsiteCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [websiteData, setWebsiteData] = useState({
    name: '',
    url: '',
    image: null,
    imagePreview: null
  });

  const [selectedBusinessCategories, setSelectedBusinessCategories] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [selectedAdCategories, setSelectedAdCategories] = useState({});
  const [adCategoryData, setAdCategoryData] = useState({});
  const [completedAdCategories, setCompletedAdCategories] = useState([]);
  const [activeAdCategory, setActiveAdCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFullImage, setShowFullImage] = useState(false);

  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const iconMap = {
    'any': Zap,
    'technology': Code,
    'food': Utensils,
    'realestate': Home,
    'automotive': Car,
    'health': Heart,
    'gaming': Gamepad2,
    'fashion': Shirt,
    'education': BookOpen,
    'business': Briefcase,
    'travel': Plane,
    'entertainment': Music,
    'photography': Camera,
    'ecommerce': Gift,
    'finance': Shield
  };

  const adCategoryDetails = {
    aboveTheFold: {
      name: 'Above the Fold',
      icon: <Layers className="w-6 h-6" />,
      spaceType: "Above The Fold",
      description: "Prime visibility area at the top of webpage before scrolling",
      category: "primary",
      position: "top",
      image: AboveTheFold
    },
    beneathTitle: {
      name: 'Beneath Title',
      icon: <AlignJustify className="w-6 h-6" />,
      spaceType: "Beneath Title",
      description: "Ad space directly below the page title",
      category: "content",
      position: "top",
      image: BeneathTitle
    },
    bottom: {
      name: 'Bottom',
      icon: <PanelBottom className="w-6 h-6" />,
      spaceType: "Bottom",
      description: "Bottom section spanning full width",
      category: "primary",
      position: "bottom",
      image: Bottom
    },
    floating: {
      name: 'Floating',
      icon: <Maximize className="w-6 h-6" />,
      spaceType: "Floating",
      description: "Floating advertisement that follows scroll",
      category: "special",
      position: "overlay",
      image: Floating
    },
    header: {
      name: 'Header',
      icon: <Monitor className="w-6 h-6" />,
      spaceType: "Header",
      description: "Top banner spanning full width of website",
      category: "primary",
      position: "top",
      image: HeaderPic
    },
    inFeed: {
      name: 'In-Feed',
      icon: <AlignJustify className="w-6 h-6" />,
      spaceType: "In-Feed",
      description: "Native ads within content feed",
      category: "content",
      position: "content",
      image: InFeed
    },
    inlineContent: {
      name: 'Inline Content',
      icon: <Layout className="w-6 h-6" />,
      spaceType: "Inline Content",
      description: "Ad embedded within article content",
      category: "content",
      position: "content",
      image: InlineContent
    },
    leftRail: {
      name: 'Left Rail',
      icon: <PanelLeft className="w-6 h-6" />,
      spaceType: "Left Rail",
      description: "Left sidebar for vertical ads",
      category: "sidebar",
      position: "side",
      image: LeftRail
    },
    mobileInterstial: {
      name: 'Mobile Interstitial',
      icon: <Smartphone className="w-6 h-6" />,
      spaceType: "Mobile Interstitial",
      description: "Full-screen mobile advertisement",
      category: "mobile",
      position: "overlay",
      image: MobileInterstial
    },
    modal: {
      name: 'Modal',
      icon: <Maximize className="w-6 h-6" />,
      spaceType: "Modal",
      description: "Overlay popup advertisement",
      category: "special",
      position: "overlay",
      image: ModalPic
    },
    overlay: {
      name: 'Overlay',
      icon: <Layers className="w-6 h-6" />,
      spaceType: "Overlay",
      description: "Semi-transparent overlay advertisement",
      category: "special",
      position: "overlay",
      image: Overlay
    },
    proFooter: {
      name: 'Pro Footer',
      icon: <PanelBottom className="w-6 h-6" />,
      spaceType: "Pro Footer",
      description: "Enhanced footer with multiple ad slots",
      category: "primary",
      position: "bottom",
      image: ProFooter
    },
    rightRail: {
      name: 'Right Rail',
      icon: <PanelRight className="w-6 h-6" />,
      spaceType: "Right Rail",
      description: "Right sidebar for vertical ads",
      category: "sidebar",
      position: "side",
      image: RightRail
    },
    sidebar: {
      name: 'Sidebar',
      icon: <SidebarIcon className="w-6 h-6" />,
      spaceType: "Sidebar",
      description: "Vertical advertisement space alongside main content",
      category: "sidebar",
      position: "side",
      image: Sidebar
    },
    stickySidebar: {
      name: 'Sticky Sidebar',
      icon: <SidebarIcon className="w-6 h-6" />,
      spaceType: "Sticky Sidebar",
      description: "Sidebar that remains visible while scrolling",
      category: "sidebar",
      position: "side",
      image: StickySidebar
    }
  };

  const categoryFilters = [
    { id: 'all', name: 'All Spaces' },
    { id: 'primary', name: 'Primary' },
    { id: 'sidebar', name: 'Sidebar' },
    { id: 'content', name: 'Content' },
    { id: 'special', name: 'Special' },
    { id: 'mobile', name: 'Mobile' }
  ];

  useEffect(() => {
    fetchBusinessCategories();
  }, []);

  const fetchBusinessCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${API_URL}/api/business-categories/categories`);
      if (response.data.success) {
        const categoriesWithIcons = response.data.data.categories.map(category => ({
          ...category,
          icon: iconMap[category.id] || Building2
        }));
        setBusinessCategories(categoriesWithIcons);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setErrors({ general: 'Failed to load business categories. Please refresh the page.' });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWebsiteData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, and GIF images are allowed.' }));
      return false;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'Image must be smaller than 5MB.' }));
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWebsiteData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWebsiteData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleBusinessCategoryToggle = (categoryId) => {
    if (categoryId === 'any') {
      setSelectedBusinessCategories(prev => 
        prev.includes('any') ? [] : ['any']
      );
    } else {
      setSelectedBusinessCategories(prev => {
        let newSelection = prev.filter(id => id !== 'any');
        if (newSelection.includes(categoryId)) {
          newSelection = newSelection.filter(id => id !== categoryId);
        } else {
          newSelection = [...newSelection, categoryId];
        }
        return newSelection;
      });
    }
  };

  const handleAdCategorySelect = (category) => {
    setActiveAdCategory(category);
    if (!selectedAdCategories[category]) {
      setSelectedAdCategories(prev => ({ ...prev, [category]: true }));
    }
  };

  const updateAdCategoryData = (category, field, value) => {
    if (field === 'price') {
      setAdCategoryData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          price: value.price,
          tier: value.tier,
          visitorRange: value.visitorRange
        }
      }));
    } else {
      setAdCategoryData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    }
  };

  const handleAdCategoryComplete = () => {
    const data = adCategoryData[activeAdCategory];
    if (data?.price && data?.userCount && data?.instructions) {
      setCompletedAdCategories(prev => 
        prev.includes(activeAdCategory) ? prev : [...prev, activeAdCategory]
      );
    }
    setActiveAdCategory(null);
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (authMode === 'signup') {
        const response = await axios.post(`${API_URL}/api/auth/register`, {
          name: authFormData.name,
          email: authFormData.email,
          password: authFormData.password
        });

        if (response.data.requiresVerification) {
          setVerificationSent(true);
          setMaskedEmail(response.data.maskedEmail);
        }
      } else {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          email: authFormData.email,
          password: authFormData.password
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          await handleFinalSubmit(response.data.token);
        }
      }
    } catch (error) {
      setErrors({ 
        auth: error.response?.data?.message || `${authMode === 'signup' ? 'Registration' : 'Login'} failed` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email: authFormData.email
      });
      alert('Verification email resent successfully!');
    } catch (error) {
      setErrors({ auth: 'Failed to resend verification email' });
    }
  };

  const handleFinalSubmit = async (token) => {
    setIsSubmitting(true);
    try {
      const websiteResponse = await axios.post(
        `${API_URL}/api/createWebsite/createWebsiteWithCategories`,
        {
          websiteName: websiteData.name,
          websiteLink: websiteData.url,
          imageUrl: '',
          businessCategories: selectedBusinessCategories
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const websiteId = websiteResponse.data.data._id;

      if (websiteData.image) {
        const formData = new FormData();
        formData.append('file', websiteData.image);
        
        try {
          await axios.post(
            `${API_URL}/api/createWebsite/upload/${websiteId}`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
        }
      }

      if (completedAdCategories.length > 0) {
        const adCategoriesToSubmit = completedAdCategories.map(category => {
          const data = adCategoryData[category] || {};
          const details = adCategoryDetails[category] || {};
          
          return {
            websiteId,
            categoryName: details.name || category.charAt(0).toUpperCase() + category.slice(1),
            description: details.description || '',
            price: Number(data.price) || 0,
            spaceType: details.spaceType || 'banner',
            userCount: Number(data.userCount) || 0,
            instructions: data.instructions || '',
            visitorRange: {
              min: Number(data.visitorRange?.min) || 0,
              max: Number(data.visitorRange?.max) || 10000
            },
            tier: data.tier || 'bronze'
          };
        });

        await Promise.all(
          adCategoriesToSubmit.map(category =>
            axios.post(`${API_URL}/api/ad-categories`, category, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          )
        );
      }

      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create website' });
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!websiteData.name || !websiteData.url) {
        setErrors({ general: 'Please fill in all required fields' });
        return;
      }
    } else if (currentStep === 2) {
      if (selectedBusinessCategories.length === 0) {
        setErrors({ general: 'Please select at least one business category' });
        return;
      }
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setShowAuthModal(true);
    } else {
      await handleFinalSubmit(token);
    }
  };

  const filteredAdCategories = Object.entries(adCategoryDetails).filter(([key, details]) => {
    const matchesSearch = details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         details.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || details.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderStep1 = () => (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <span className="px-3 py-1 text-sm font-medium bg-black text-white">
              Add Website Details
            </span>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="border border-black bg-white p-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your website name"
                  value={websiteData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://yourwebsite.com"
                  value={websiteData.url}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Upload
                </label>
                <div 
                  className="border-2 border-dashed border-black bg-white p-8 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="text-black mb-3" size={32} />
                  <p className="text-black font-medium mb-1">Click to upload logo</p>
                  <p className="text-sm text-gray-700">
                    JPEG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
              
              {errors.general && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3">
                  <span>{errors.general}</span>
                </div>
              )}

              {errors.image && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3">
                  <span>{errors.image}</span>
                </div>
              )}
              
              {websiteData.imagePreview && (
                <div className="border border-black bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-black">Logo Preview</span>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={websiteData.imagePreview} 
                      alt="Logo Preview" 
                      className="max-h-32 object-contain" 
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleNext}
                className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors font-medium"
              >
                Continue to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const isAnySelected = selectedBusinessCategories.includes('any');
    
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <button 
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span className="font-medium">Back</span>
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-black text-white">
                Select Business Categories
              </span>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between mb-12">
            <div className="flex-1">
              <p className="text-gray-600 max-w-2xl">
                Select the types of businesses you want to advertise on your website: <strong>{websiteData.name || 'Your Website'}</strong>. You can choose specific categories or select "Any Category" to accept all types of advertisements.
              </p>
            </div>
          </div>

          {selectedBusinessCategories.length > 0 && (
            <div className="mb-8 p-6 border border-black bg-white">
              <h3 className="font-semibold text-black mb-4">Selected Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedBusinessCategories.map((categoryId) => {
                  const category = businessCategories.find(c => c.id === categoryId);
                  return (
                    <span
                      key={categoryId}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-black border border-gray-300"
                    >
                      {category?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-8 p-4 border border-red-300 bg-red-50 text-red-700">
              {errors.general}
            </div>
          )}

          {loadingCategories ? (
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner />
            </div>
          ) : businessCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedBusinessCategories.includes(category.id);
                const isDisabled = isAnySelected && category.id !== 'any';

                return (
                  <div
                    key={category.id}
                    onClick={() => !isDisabled && handleBusinessCategoryToggle(category.id)}
                    className={`
                      border border-black bg-white p-6 transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'bg-gray-100' 
                        : isDisabled 
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <Icon size={40} className="mr-3 text-black" />
                      </div>
                      {isSelected && (
                        <div className="bg-black text-white p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-black mb-2">{category.name}</h3>
                      <p className="text-gray-700 text-sm">{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-black">No Categories Available</h2>
                <button 
                  onClick={fetchBusinessCategories}
                  className="bg-black text-white px-6 py-2 hover:bg-gray-800"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-end items-center">
            <button
              onClick={handleNext}
              disabled={selectedBusinessCategories.length === 0}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue to Ad Spaces
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStep3 = () => (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <span className="px-3 py-1 text-sm font-medium bg-black text-white">
              Step 3 of 3
            </span>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-black mb-2">Configure Ad Spaces</h1>
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

        {filteredAdCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredAdCategories.map(([category, details]) => {
              const isCompleted = completedAdCategories.includes(category);
              
              return (
                <div
                  key={category}
                  className={`border p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    isCompleted
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300'
                  }`}
                  onClick={() => handleAdCategorySelect(category)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${
                        isCompleted 
                          ? 'bg-black text-white' 
                          : 'bg-white border border-black'
                      }`}>
                        {isCompleted ? (
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
                    {isCompleted && adCategoryData[category]?.price && (
                      <span className="text-sm font-bold text-black">
                        ${adCategoryData[category].price}/mo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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

        <div className="flex justify-between pt-6">
          <button
            onClick={handleBack}
            className="px-8 py-3 border border-black bg-white text-black hover:bg-gray-100 transition-colors font-medium"
          >
            Previous
          </button>

          <button 
            onClick={handleFinish}
            disabled={completedAdCategories.length === 0}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                Creating Website...
              </>
            ) : (
              <>Create Ad Space{completedAdCategories.length > 1 ? 's' : ''}</>
            )}
          </button>
          
          {/* {completedAdCategories.length > 0 ? (
            <button 
              onClick={handleFinish}
              disabled={isSubmitting}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  Creating Website...
                </>
              ) : (
                <>Create Ad Space{completedAdCategories.length > 1 ? 's' : ''}</>
              )}
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              disabled={isSubmitting}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  Creating Website...
                </>
              ) : (
                'Skip & Create Website'
              )}
            </button>
          )} */}
        </div>
      </div>

      {/* Ad Category Modal - Matching CategoryCreation.js style */}
      {activeAdCategory && (() => {
        const details = adCategoryDetails[activeAdCategory];
        
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
                  onClick={() => {
                    setActiveAdCategory(null);
                    setShowFullImage(false);
                  }}
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
                      <button 
                        onClick={() => setShowFullImage(false)}
                        className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-medium"
                      >
                        Back to Details
                      </button>
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
                        selectedPrice={adCategoryData[activeAdCategory] || {}}
                        onPriceSelect={(price) => updateAdCategoryData(activeAdCategory, 'price', price)}
                      />

                      <div className="space-y-6">
                        <div className="w-full">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-700">Number of ads for this space</span>
                          </div>
                          <input
                            type="number"
                            placeholder="Number of ads"
                            value={adCategoryData[activeAdCategory]?.userCount || ''}
                            onChange={(e) => updateAdCategoryData(activeAdCategory, 'userCount', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 bg-white text-lg font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-gray-500"
                          />
                        </div>

                        <div className="w-full">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-700">Additional Requirements</span>
                          </div>
                          <textarea
                            placeholder="Enter any additional requirements or notes"
                            value={adCategoryData[activeAdCategory]?.instructions || ''}
                            onChange={(e) => updateAdCategoryData(activeAdCategory, 'instructions', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-gray-500"
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
                    <button
                      onClick={handleAdCategoryComplete}
                      disabled={!adCategoryData[activeAdCategory]?.price}
                      className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Save & Continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  const renderAuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-black max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <h3 className="text-xl font-bold text-black">
            {verificationSent ? 'Check Your Email' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h3>
          <button
            onClick={() => {
              setShowAuthModal(false);
              setVerificationSent(false);
              setErrors({});
            }}
            className="text-gray-600 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {verificationSent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-16 h-16 text-black" />
            </div>
            <p className="text-center text-gray-700">
              We've sent a verification email to <strong>{maskedEmail}</strong>
            </p>
            <p className="text-center text-sm text-gray-600">
              Click the link in the email to verify your account and complete the website creation.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              className="w-full text-black hover:text-gray-700 text-sm font-medium border-t border-black pt-4 mt-4"
            >
              Resend verification email
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={authFormData.name}
                    onChange={handleAuthInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-black bg-white focus:outline-none focus:ring-0"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-black bg-white focus:outline-none focus:ring-0"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-black bg-white focus:outline-none focus:ring-0"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errors.auth && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 text-sm">
                {errors.auth}
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 text-sm">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {isSubmitting ? (
                <>
                  Processing...
                </>
              ) : (
                authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'
              )}
            </button>

            <div className="text-center border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setErrors({});
                }}
                className="text-black hover:text-gray-700 text-sm font-medium"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {showAuthModal && renderAuthModal()}
    </>
  );
};

export default UnifiedWebsiteCreation;