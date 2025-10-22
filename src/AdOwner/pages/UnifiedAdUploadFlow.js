// UnifiedAdUploadFlow.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, ArrowLeft, Check, AlertTriangle, X,
  Mail, Lock, User, Eye, EyeOff, Building2, Tag,
  MapPin, FileText, Globe, Search, Cloud
} from 'lucide-react';
import { Button, Container, Badge } from '../../components/components';
import axios from 'axios';
import LoadingSpinner from "../../components/LoadingSpinner";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UnifiedAdUploadFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1: File Upload
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Step 2: Business Details
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessLink: '',
    businessLocation: '',
    adDescription: '',
    businessCategory: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Step 3: Website Selection
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Step 4: Category Selection
  const [categoriesByWebsite, setCategoriesByWebsite] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Step 5: Payment Summary
  const [paymentSelections, setPaymentSelections] = useState([]);
  const [walletInfo, setWalletInfo] = useState({ balance: 0, hasWallet: false });
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    totalCost: 0,
    walletBalance: 0,
    paidFromWallet: 0,
    needsExternalPayment: 0
  });

  // Auth form data
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  // Business categories
  const businessCategories = [
    { value: 'technology', label: 'Technology', description: 'Software, hardware, IT services' },
    { value: 'food', label: 'Food & Beverage', description: 'Restaurants, cafes, catering' },
    { value: 'realestate', label: 'Real Estate', description: 'Property sales and rentals' },
    { value: 'automotive', label: 'Automotive', description: 'Cars, parts, services' },
    { value: 'health', label: 'Health & Wellness', description: 'Medical, fitness, beauty' },
    { value: 'education', label: 'Education', description: 'Schools, courses, training' },
    { value: 'entertainment', label: 'Entertainment', description: 'Events, media, arts' },
    { value: 'ecommerce', label: 'E-commerce', description: 'Online retail stores' }
  ];

  // Load websites when reaching step 3
  useEffect(() => {
    if (currentStep === 3 && websites.length === 0) {
      fetchWebsites();
    }
  }, [currentStep]);

  // Filter websites based on search
  useEffect(() => {
    if (searchTerm) {
      setFilteredWebsites(
        websites.filter(website =>
          website.websiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          website.websiteLink.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredWebsites(websites);
    }
  }, [searchTerm, websites]);

  // Fetch categories when websites are selected
  useEffect(() => {
    if (currentStep === 4 && selectedWebsites.length > 0 && categoriesByWebsite.length === 0) {
      fetchCategories();
    }
  }, [currentStep, selectedWebsites]);

  // Calculate total cost
  useEffect(() => {
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
  }, [selectedCategories, categoriesByWebsite]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/createWebsite`);
      
      if (Array.isArray(response.data)) {
        setWebsites(response.data);
        setFilteredWebsites(response.data);
      } else if (response.data.success && response.data.websites) {
        setWebsites(response.data.websites);
        setFilteredWebsites(response.data.websites);
      }
    } catch (error) {
      setErrors({ general: 'Failed to load websites' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const promises = selectedWebsites.map(async (websiteId) => {
        try {
          const websiteResponse = await axios.get(`${API_URL}/api/createWebsite/website/${websiteId}`);
          
          // Try without auth first (public endpoint)
          let categoriesResponse;
          try {
            categoriesResponse = await axios.get(`${API_URL}/api/ad-categories/${websiteId}/advertiser`);
          } catch (authError) {
            // If advertiser endpoint requires auth, try public endpoint
            categoriesResponse = await axios.get(`${API_URL}/api/ad-categories/website/${websiteId}`);
          }
          
          return {
            websiteId: websiteId,
            websiteName: websiteResponse.data.websiteName || 'Unknown Website',
            websiteLink: websiteResponse.data.websiteLink || '#',
            categories: categoriesResponse.data.categories || categoriesResponse.data.data?.categories || []
          };
        } catch (error) {
          console.error(`Failed to fetch data for website ${websiteId}:`, error);
          return null;
        }
      });
      
      const result = await Promise.all(promises);
      const validResults = result.filter(Boolean);
      
      if (validResults.length === 0) {
        setErrors({ general: 'Failed to load categories. Please try again.' });
      } else {
        setCategoriesByWebsite(validResults);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setErrors({ general: 'Failed to load categories. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: File Upload Handlers
  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    const maxSize = 50 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      setErrors({ file: 'Unsupported file type. Please upload JPEG, PNG, GIF, or MP4.' });
      return;
    }

    if (selectedFile.size > maxSize) {
      setErrors({ file: 'File is too large. Maximum size is 50MB.' });
      return;
    }

    setFile(selectedFile);
    setErrors({ ...errors, file: '' });

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        url: reader.result,
        type: selectedFile.type,
        name: selectedFile.name,
        size: selectedFile.size
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFile(e.dataTransfer.files[0]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Step 2: Business Details Handlers

  const isFormValid = () => {
    return (
      Object.values(businessData).every((value) => value.trim()) &&
      (!businessData.businessLink || 
       /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(businessData.businessLink))
    );
  };

  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategorySelect = (categoryValue) => {
    setBusinessData(prev => ({ ...prev, businessCategory: categoryValue }));
    setShowCategoryModal(false);
    setErrors(prev => ({ ...prev, businessCategory: '' }));
  };

  const getSelectedCategory = () => {
    return businessCategories.find(cat => cat.value === businessData.businessCategory);
  };

  // Step 3: Website Selection Handlers
  const handleWebsiteSelect = (websiteId) => {
    setSelectedWebsites(prev =>
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  // Step 4: Category Selection Handlers
  const handleCategorySelection = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Auth handlers
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

  // Final submission
  const handleFinalSubmit = async (token) => {
    try {
      setIsSubmitting(true);

      // Step 1: Upload ad with file
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('businessName', businessData.businessName);
      formData.append('businessLink', businessData.businessLink);
      formData.append('businessLocation', businessData.businessLocation);
      formData.append('adDescription', businessData.adDescription);
      formData.append('businessCategory', businessData.businessCategory);

      const adResponse = await axios.post(`${API_URL}/api/web-advertise`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const adId = adResponse.data.data._id;

      // Step 2: Add website and category selections
      await axios.post(
        `${API_URL}/api/web-advertise/${adId}/add-selections`,
        {
          selectedWebsites: JSON.stringify(selectedWebsites),
          selectedCategories: JSON.stringify(selectedCategories)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Step 3: Build payment selections
      const selections = [];
      selectedCategories.forEach(categoryId => {
        categoriesByWebsite.forEach(website => {
          const category = website.categories.find(cat => cat._id === categoryId);
          if (category) {
            selections.push({
              adId: adId,
              websiteId: website.websiteId,
              categoryId: categoryId
            });
          }
        });
      });

      // Step 4: Process payment
      const paymentResponse = await axios.post(
        `${API_URL}/api/web-advertise/payment/process-wallet`,
        { selections },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paymentResponse.data.success) {
        if (paymentResponse.data.allPaid) {
          // Payment completed with wallet
          window.location.href = '/my-ads';
        } else if (paymentResponse.data.paymentUrl) {
          // Redirect to external payment
          window.location.href = paymentResponse.data.paymentUrl;
        }
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to complete ad submission'
      });
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!file) {
        setErrors({ general: 'Please upload a file' });
        return;
      }
    } else if (currentStep === 2) {
      const requiredFields = ['businessName', 'businessLink', 'businessLocation', 'adDescription', 'businessCategory'];
      const missingFields = requiredFields.filter(field => !businessData[field]);
      
      if (missingFields.length > 0) {
        setErrors({ general: 'Please fill in all required fields' });
        return;
      }
    } else if (currentStep === 3) {
      if (selectedWebsites.length === 0) {
        setErrors({ general: 'Please select at least one website' });
        return;
      }
    } else if (currentStep === 4) {
      if (selectedCategories.length === 0) {
        setErrors({ general: 'Please select at least one ad category' });
        return;
      }
    }

    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleProceedToPayment = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (!token) {
      setShowAuthModal(true);
    } else {
      handleFinalSubmit(token);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* File Requirements - Only show when no file is selected */}
      {!filePreview && (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-300">
          <h3 className="text-lg font-semibold text-black mb-3">File Requirements</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p>• Supported formats: JPEG, PNG, GIF, MP4</p>
            <p>• Maximum file size: 50MB</p>
            <p>• Recommended dimensions: 1920x1080 for videos, 1200x630 for images</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.file && (
        <div className="mb-6 border border-red-600 bg-red-50 p-4 flex items-start">
          <AlertTriangle size={20} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700">{errors.file}</span>
        </div>
      )}

      {/* Upload Area - Only show if no file is selected */}
      {!filePreview && (
        <div 
          className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
            dragActive 
              ? 'border-black bg-gray-50' 
              : 'border-gray-400 hover:border-gray-600 hover:bg-gray-50'
          }`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <Cloud size={64} className="mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-black mb-2">
                {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-gray-600">or click to browse files</p>
            </div>
            <button 
              type="button"
              className="inline-flex items-center px-6 py-3 border border-black bg-white text-black hover:bg-gray-50 transition-colors"
            >
              <Upload size={20} className="mr-2" />
              Choose File
            </button>
          </div>
        </div>
      )}

      {/* File Preview - Only show if file is selected */}
      {filePreview && (
        <div className="mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Large Media Display */}
          <div className="relative border border-black bg-black">
            {/* Replace Button in Corner */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="px-4 py-2 bg-black text-white border border-white hover:bg-gray-900 transition-colors"
              >
                Replace File
              </button>
            </div>
            
            {/* Media Content */}
            <div className="flex items-center justify-center min-h-96">
              {filePreview.type.startsWith('image/') ? (
                <img 
                  src={filePreview.url} 
                  alt="Advertisement Preview" 
                  className="max-w-full max-h-[600px] object-contain"
                />
              ) : (
                <video 
                  src={filePreview.url} 
                  controls 
                  className="max-w-full max-h-[600px] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* First Row - Business Name & Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={businessData.businessName}
              onChange={handleBusinessInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              placeholder="Enter your business name"
            />
            <Building2 size={16} className="absolute left-3 top-11 text-gray-400" />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Website <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="businessLink"
              value={businessData.businessLink}
              onChange={handleBusinessInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              placeholder="https://www.yourbusiness.com"
            />
            <Globe size={16} className="absolute left-3 top-11 text-gray-400" />
          </div>
        </div>

        {/* Business Category - Custom Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className={businessData.businessCategory ? 'text-black' : 'text-gray-500'}>
                  {getSelectedCategory()?.label || 'Select your business category'}
                </span>
              </div>
            </button>
            <Tag size={16} className="absolute left-3 top-4 text-gray-400" />
          </div>
        </div>

        {/* Business Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="businessLocation"
            value={businessData.businessLocation}
            onChange={handleBusinessInputChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            placeholder="City, State, or Country"
          />
          <MapPin size={16} className="absolute left-3 top-11 text-gray-400" />
        </div>

        {/* Business Description */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="adDescription"
            value={businessData.adDescription}
            onChange={handleBusinessInputChange}
            rows={4}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            placeholder="Tell us about your business in a few compelling words..."
          />
          <FileText size={16} className="absolute left-3 top-11 text-gray-400" />
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-black p-6 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold text-black">Select Business Category</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = businessData.businessCategory === category.value;
                  
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      className={`p-4 border text-left transition-all duration-200 hover:shadow-lg group ${
                        isSelected 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-white bg-opacity-20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          {IconComponent && (
                            <IconComponent 
                              size={24} 
                              className={isSelected ? 'text-white' : 'text-gray-700'}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium mb-1 ${
                            isSelected ? 'text-white' : 'text-black'
                          }`}>
                            {category.label}
                          </h4>
                          <p className={`text-sm ${
                            isSelected ? 'text-white text-opacity-80' : 'text-gray-600'
                          }`}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 flex items-center justify-end">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search websites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner/>
        </div>
      ) : filteredWebsites.length === 0 ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-black">No websites available</h2>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'No websites are currently available'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebsites.map((website) => {
            const isSelected = selectedWebsites.includes(website._id);
            
            return (
              <div 
                key={website._id} 
                onClick={() => handleWebsiteSelect(website._id)}
                className={`border p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  isSelected 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    {website.imageUrl ? (
                      <img 
                        src={website.imageUrl} 
                        alt={website.websiteName}
                        className="w-10 h-10 object-contain mr-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/global.png';
                        }}
                      />
                    ) : (
                      <Globe size={40} className="mr-3 text-black" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-black">{website.websiteName}</h3>
                      <p className="text-sm text-gray-600 break-all">{website.websiteLink}</p>
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 border flex items-center justify-center ${
                    isSelected 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {website.businessCategories && (
                    <div className="text-xs px-2 py-1 bg-black text-white">
                      {website.businessCategories}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const getAdSpaceImage = (categoryName) => {
      return null;
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-gray-600">
            Select where your ad will appear on each website. Each placement shows exactly where visitors will see it.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : categoriesByWebsite.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {categoriesByWebsite.map((website) => (
              <div key={website.websiteId} className="border border-black bg-white">
                {/* Website Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-black mb-1">{website.websiteName}</h3>
                      <p className="text-sm text-gray-600">Available ad placements on this website</p>
                    </div>
                  </div>
                </div>
                
                {/* Categories */}
                {website.categories.length > 0 ? (
                  <div className="p-6 space-y-6">
                    {website.categories.map((category) => {
                      const adImage = getAdSpaceImage(category.categoryName);
                      const isExpanded = expandedCategory === category._id;
                      const isSelected = selectedCategories.includes(category._id);
                      
                      return (
                        <div
                          key={category._id}
                          className={`border transition-all duration-200 bg-white ${
                            isSelected ? 'border-black shadow-md' : 'border-gray-300'
                          }`}
                        >
                          {/* Main Content */}
                          <div
                            onClick={() => handleCategorySelection(category._id)}
                            className="p-6 cursor-pointer hover:bg-gray-50"
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
                                  <h4 className="text-lg font-semibold text-black">{category.categoryName}</h4>
                                </div>
                                
                                <p className="text-gray-700 mb-4">
                                  {category.description.length > 80 
                                    ? `${category.description.substring(0, 80)}...`
                                    : category.description
                                  }
                                </p>

                                <div className="flex items-center gap-6">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg font-semibold text-black">
                                      ${category.price}
                                    </span>
                                  </div>
                                  
                                  {category.description.length > 80 && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategoryExpansion(category._id);
                                      }}
                                      className="text-sm text-gray-600 hover:text-black underline"
                                    >
                                      {isExpanded ? 'Show Less' : 'Read More'}
                                    </button>
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
                                <p className={`text-xs font-medium ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                                  {isSelected ? 'SELECTED' : 'SELECT'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Description */}
                          {isExpanded && (
                            <div className="px-6 pb-6 border-t border-gray-200">
                              <p className="text-gray-700 pt-4">{category.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <h4 className="text-lg font-semibold text-black mb-2">No Ad Spaces Available</h4>
                    <p className="text-gray-600">
                      This website doesn't have any available ad placements right now.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-black mb-4">No Ad Spaces Found</h2>
            <p className="text-gray-600 mb-8">
              The selected websites don't have any available ad placements. Please try selecting different websites.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep5 = () => {
    const getSelectedDetails = () => {
      const details = [];
      selectedCategories.forEach(categoryId => {
        categoriesByWebsite.forEach(website => {
          const category = website.categories.find(cat => cat._id === categoryId);
          if (category) {
            details.push({
              websiteName: website.websiteName,
              categoryName: category.categoryName,
              price: category.price
            });
          }
        });
      });
      return details;
    };

    const selectedDetails = getSelectedDetails();

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-black mb-2">Review Your Order</h2>
          <p className="text-gray-600">
            Complete payment for each ad placement to publish your ad
          </p>
        </div>

        {/* Ad Summary */}
        <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Ad Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {filePreview && (
                <div className="mb-4">
                  {filePreview.type.startsWith('image/') ? (
                    <img
                      src={filePreview.url}
                      alt="Ad preview"
                      className="w-full h-48 object-cover border border-gray-300"
                    />
                  ) : (
                    <video
                      src={filePreview.url}
                      controls
                      className="w-full h-48 border border-gray-300"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-black">Business:</span>
                <p className="text-gray-700">{businessData.businessName}</p>
              </div>
              <div>
                <span className="font-medium text-black">Website:</span>
                <p className="text-gray-700 break-all">{businessData.businessLink}</p>
              </div>
              <div>
                <span className="font-medium text-black">Location:</span>
                <p className="text-gray-700">{businessData.businessLocation}</p>
              </div>
              <div>
                <span className="font-medium text-black">Category:</span>
                <p className="text-gray-700">{getSelectedCategory()?.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="border border-black p-6 mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Payment Breakdown</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-700">Total Cost:</span>
              <span className="text-xl font-semibold text-black">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Selected Categories */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Selected Placements</h3>
          {selectedDetails.map((detail, index) => (
            <div key={index} className="border border-gray-300 bg-white p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-black mb-1">{detail.websiteName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{detail.categoryName}</p>
                </div>
                <div className="text-lg font-semibold text-black">
                  ${detail.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            {currentStep === 1 && (
              <Badge variant="default">
                Upload Advertisement
              </Badge>
            )}

            {currentStep === 2 && (
              <Badge variant="default">
                Business Details
              </Badge>
            )}

            {currentStep === 3 && (
              <Badge variant="default">
                Add Websites
              </Badge>
            )}

            {currentStep === 4 && (
              <Badge variant="default">
                Add New Ad Placements
              </Badge>
            )}

            {currentStep === 5 && (
              <Badge variant="default">
                Payments
              </Badge>
            )}
          </div>
        </Container>
      </header>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          {errors.general}
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          {errors.submit}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      <div className='text-center py-8'>
        {currentStep === 1 && (
          <Button
            onClick={handleNext} 
            variant="secondary"
            size="lg"
            loading={loading}
            disabled={loading || !file}
          >
            {loading ? 'Processing...' : 'Continue to Ad Details'}
          </Button>
        )}

        {currentStep === 2 && (
          <Button
            onClick={handleNext} 
            variant="secondary"
            size="lg"
            loading={loading}
            disabled={!isFormValid() || loading}
          >
            {loading ? 'Processing...' : 'Continue to Select Websites'}
          </Button>
        )}

        {currentStep === 3 && (
          <Button
            onClick={handleNext} 
            variant="secondary"
            size="lg"
            loading={loading}
            disabled={selectedWebsites.length === 0 || loading}
          >
            {loading ? 'Processing...' : 'Continue Select Categories'}
          </Button>
        )}

        {currentStep === 4 && (
          <Button
            onClick={handleNext} 
            variant="secondary"
            size="lg"
            loading={loading}
            disabled={selectedCategories.length === 0 || loading}
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        )}

        {currentStep === 5 && (
          <Button
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
            variant="secondary"
            size="lg"
          >
            {isSubmitting ? (
              <>
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
              </>
            )}
          </Button>
        )}
      </div>

      {showAuthModal && renderAuthModal()}
    </div>
  );
};

export default UnifiedAdUploadFlow;