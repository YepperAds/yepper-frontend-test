import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, ArrowLeft, ArrowRight, Check, AlertTriangle, X,
  Mail, Lock, User, Eye, EyeOff, Loader, Building2, Tag,
  MapPin, FileText, Globe, Search, DollarSign, CreditCard,
  Wallet, CheckCircle, Cloud, Monitor, Smartphone
} from 'lucide-react';
import axios from 'axios';

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

  // Render functions for each step
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Ad</h3>
        <p className="text-sm text-gray-600">
          Upload an image or video for your advertisement
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {filePreview ? (
          <div className="space-y-4">
            {filePreview.type.startsWith('image/') ? (
              <img
                src={filePreview.url}
                alt="Preview"
                className="mx-auto max-h-64 rounded-lg"
              />
            ) : (
              <video
                src={filePreview.url}
                controls
                className="mx-auto max-h-64 rounded-lg"
              />
            )}
            <div className="text-sm text-gray-600">
              <p className="font-medium">{filePreview.name}</p>
              <p>{formatFileSize(filePreview.size)}</p>
            </div>
            <p className="text-xs text-gray-500">Click to change file</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Cloud className="mx-auto h-16 w-16 text-gray-400" />
            <div>
              <p className="text-base text-gray-700 font-medium">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: JPEG, PNG, GIF, MP4 (max 50MB)
              </p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {errors.file && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {errors.file}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Details</h3>
        <p className="text-sm text-gray-600">
          Tell us about your business
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building2 className="inline w-4 h-4 mr-1" />
          Business Name *
        </label>
        <input
          type="text"
          name="businessName"
          value={businessData.businessName}
          onChange={handleBusinessInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Your Business Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="inline w-4 h-4 mr-1" />
          Business Website *
        </label>
        <input
          type="url"
          name="businessLink"
          value={businessData.businessLink}
          onChange={handleBusinessInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://yourbusiness.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-1" />
          Business Location *
        </label>
        <input
          type="text"
          name="businessLocation"
          value={businessData.businessLocation}
          onChange={handleBusinessInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="City, Country"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="inline w-4 h-4 mr-1" />
          Business Category *
        </label>
        <button
          type="button"
          onClick={() => setShowCategoryModal(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          {getSelectedCategory()?.label || 'Select a category'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline w-4 h-4 mr-1" />
          Ad Description *
        </label>
        <textarea
          name="adDescription"
          value={businessData.adDescription}
          onChange={handleBusinessInputChange}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your advertisement..."
        />
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Category</h3>
              <button onClick={() => setShowCategoryModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategorySelect(category.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    businessData.businessCategory === category.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Websites</h3>
        <p className="text-sm text-gray-600">
          Choose where you want your ad to appear
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search websites..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredWebsites.map((website) => (
            <button
              key={website._id}
              onClick={() => handleWebsiteSelect(website._id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedWebsites.includes(website._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {website.imageUrl ? (
                      <img
                        src={website.imageUrl}
                        alt={website.websiteName}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <Globe className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {website.websiteName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {website.websiteLink}
                  </p>
                </div>
                {selectedWebsites.includes(website._id) && (
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedWebsites.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          {selectedWebsites.length} website{selectedWebsites.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Ad Categories</h3>
        <p className="text-sm text-gray-600">
          Choose ad placements for each website
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesByWebsite.map((website) => (
            <div key={website.websiteId} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">{website.websiteName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {website.categories.map((category) => {
                  const isSelected = selectedCategories.includes(category._id);
                  const isExpanded = expandedCategory === category._id;

                  return (
                    <div key={category._id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleCategoryExpansion(category._id)}
                        className="w-full p-4 text-left hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{category.categoryName}</div>
                            <div className="text-sm text-gray-600 mt-1">{category.spaceType}</div>
                            <div className="text-lg font-bold text-blue-600 mt-2">
                              ${category.price}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategorySelection(category._id);
                            }}
                            className={`ml-4 w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </button>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mt-3">{category.description}</p>
                          {category.instructions && (
                            <div className="mt-3 text-sm text-gray-700">
                              <strong>Instructions:</strong> {category.instructions}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCategories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {selectedCategories.length} categor{selectedCategories.length > 1 ? 'ies' : 'y'} selected
            </span>
            <span className="text-xl font-bold">Total: ${totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );

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
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Payment</h3>
          <p className="text-sm text-gray-600">
            Review your selections before proceeding to payment
          </p>
        </div>

        {/* Ad Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Your Advertisement</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              {filePreview && (
                <div className="mb-3">
                  {filePreview.type.startsWith('image/') ? (
                    <img
                      src={filePreview.url}
                      alt="Ad preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={filePreview.url}
                      controls
                      className="w-full h-48 rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Business:</span>{' '}
                <span className="text-gray-900">{businessData.businessName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Website:</span>{' '}
                <span className="text-gray-900">{businessData.businessLink}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>{' '}
                <span className="text-gray-900">{businessData.businessLocation}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>{' '}
                <span className="text-gray-900">{getSelectedCategory()?.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Placements */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Selected Placements</h4>
          <div className="space-y-2">
            {selectedDetails.map((detail, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="font-medium text-gray-900">{detail.websiteName}</div>
                  <div className="text-sm text-gray-600">{detail.categoryName}</div>
                </div>
                <div className="font-semibold text-gray-900">${detail.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Cost</span>
            <span className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Payment will be processed after authentication
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> You'll be asked to sign in or create an account before payment.
              Your ad details will be saved and the payment will be processed immediately after authentication.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {verificationSent ? 'Check Your Email' : authMode === 'login' ? 'Sign In to Continue' : 'Create Account'}
          </h3>
          <button
            onClick={() => {
              setShowAuthModal(false);
              setVerificationSent(false);
              setErrors({});
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {verificationSent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-center text-gray-700">
              We've sent a verification email to <strong>{maskedEmail}</strong>
            </p>
            <p className="text-center text-sm text-gray-600">
              Click the link in the email to verify your account and complete your ad submission and payment.
            </p>
            <button
              onClick={handleResendVerification}
              className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={authFormData.name}
                    onChange={handleAuthInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errors.auth && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.auth}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                authMode === 'login' ? 'Sign In & Pay' : 'Create Account & Pay'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setErrors({});
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Advertisement</h1>
          <p className="text-gray-600">Follow these steps to launch your ad campaign</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { num: 1, label: 'Upload Ad' },
              { num: 2, label: 'Business Details' },
              { num: 3, label: 'Select Websites' },
              { num: 4, label: 'Ad Placements' },
              { num: 5, label: 'Review & Pay' }
            ].map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep === step.num
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.num
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-2 hidden md:block">
                    {step.label}
                  </span>
                </div>
                {index < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step.num ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {errors.general}
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {errors.submit}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex space-x-4">
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleProceedToPayment}
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment (${totalCost.toFixed(2)})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper Text */}
        {currentStep === 5 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              🔒 Secure payment processing • Your data is protected
            </p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && renderAuthModal()}
    </div>
  );
};

export default UnifiedAdUploadFlow;