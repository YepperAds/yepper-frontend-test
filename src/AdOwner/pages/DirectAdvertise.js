import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff, ArrowLeft, Building2, Link as LinkIcon, MapPin, FileText, Upload, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function DirectAdvertise() {
  const { user, isAuthenticated, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const websiteId = queryParams.get('websiteId');
  const categoryId = queryParams.get('categoryId');
  const verificationReturn = queryParams.get('verificationReturn');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [websiteInfo, setWebsiteInfo] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [step, setStep] = useState(1);
  const [adId, setAdId] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessLink: '',
    businessLocation: '',
    adDescription: '',
    businessCategory: ''
  });

  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const businessCategories = [
    { value: 'technology', label: 'Technology' },
    { value: 'food-beverage', label: 'Food & Beverage' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'health-wellness', label: 'Health & Wellness' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'education', label: 'Education' },
    { value: 'business-services', label: 'Business Services' },
    { value: 'travel-tourism', label: 'Travel & Tourism' },
    { value: 'arts-culture', label: 'Arts & Culture' },
    { value: 'photography', label: 'Photography' },
    { value: 'gifts-events', label: 'Gifts & Events' },
    { value: 'government-public', label: 'Government & Public' },
    { value: 'general-retail', label: 'General Retail' }
  ];

  const [fileLoaded, setFileLoaded] = useState(false);
  
  useEffect(() => {
    const loadSavedFile = async () => {
      try {
        const savedFile = await getFileFromIndexedDB(FILE_STORAGE_KEY);
        if (savedFile) {
          setFile(savedFile);
          const reader = new FileReader();
          reader.onloadend = () => {
            setFilePreview({
              url: reader.result,
              type: savedFile.type
            });
          };
          reader.readAsDataURL(savedFile);
        }
      } catch (error) {
      } finally {
        setFileLoaded(true);
      }
    };

    loadSavedFile();
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('directAdvertise_formData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBusinessData(parsed.businessData || businessData);
        setStep(parsed.step || 1);
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'emailVerified' && e.newValue === 'true') {
        localStorage.removeItem('emailVerified');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isLoading || !fileLoaded) return;
    
    const savedData = localStorage.getItem('directAdvertise_formData');
    
    if (isAuthenticated && savedData && !adId && step !== 3) {
      try {
        const parsed = JSON.parse(savedData);
        
        if (parsed.step === 2) {
          setBusinessData(parsed.businessData || {});
          
          setAuthSuccess('You are successfully signed in! Now continue with paying for your advertisement...');
          setAuthError(null);
          
          setTimeout(() => {
            setAuthSuccess(null);
            createAdAndProceed();
          }, 2000);
        }
      } catch (e) {
      }
    }
  }, [isAuthenticated, isLoading, fileLoaded]);

  useEffect(() => {
    const fetchData = async () => {
      if (!websiteId || !categoryId) {
        setIsLoading(false);
        return;
      }

      try {
        const [websiteResponse, categoryResponse] = await Promise.all([
          axios.get(`${API_URL}/createWebsite/website/${websiteId}`),
          axios.get(`${API_URL}/ad-categories/category/${categoryId}`)
        ]);
        
        setWebsiteInfo(websiteResponse.data);
        setCategoryInfo(categoryResponse.data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [websiteId, categoryId]);

  const processFile = async (selectedFile) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'application/pdf'];
    const maxSize = 50 * 1024 * 1024;

    if (!selectedFile) return;
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload an image, video, or PDF.');
      return;
    }
    
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 50MB.');
      return;
    }

    // Allow re-uploading the same file by clearing previous state
    setFile(null);
    setFilePreview(null);
    
    // Small delay to ensure state is cleared
    setTimeout(async () => {
      setFile(selectedFile);
      setError(null);

      try {
        await saveFileToIndexedDB(FILE_STORAGE_KEY, selectedFile);
      } catch (dbError) {
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          url: reader.result,
          type: selectedFile.type
        });
      };
      reader.readAsDataURL(selectedFile);
    }, 50);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    // Reset the input value to allow re-selecting the same file
    e.target.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
    setAuthError(null);
  };

  const validateForm = () => {
    if (!businessData.businessName) {
      setError('Business name is required');
      return false;
    }
    if (!businessData.businessLink) {
      setError('Business link is required');
      return false;
    }
    if (!businessData.businessLocation) {
      setError('Business location is required');
      return false;
    }
    if (!businessData.adDescription) {
      setError('Advertisement description is required');
      return false;
    }
    if (!businessData.businessCategory) {
      setError('Business category is required');
      return false;
    }
    // Validate that a file has been uploaded
    if (!file) {
      setError('Please upload an image, video, or PDF for your advertisement');
      return false;
    }
    return true;
  };

  const checkCategoryMatch = () => {
    if (!businessData.businessCategory) {
      setError('Please select your business category');
      return false;
    }

    const allowedCategories = websiteInfo?.businessCategories || [];
    
    if (!allowedCategories.includes('any') && !allowedCategories.includes(businessData.businessCategory)) {
      setError(`Sorry, this website only accepts ads from: ${allowedCategories.map(cat => 
        businessCategories.find(bc => bc.value === cat)?.label || cat
      ).join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!checkCategoryMatch()) return;

    try {
      localStorage.setItem('directAdvertise_formData', JSON.stringify({
        businessData,
        hasFile: !!file,
        fileName: file?.name,
        fileType: file?.type,
        step: 2,
        websiteId,
        categoryId
      }));
    } catch (storageError) {
    }

    setSuccess('Ad details saved! Category verified.');
    setTimeout(() => {
      setStep(2);
      setSuccess(null);
    }, 1000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        if (!authData.email || !authData.password) {
          setAuthError('Email and password are required');
          setIsLoading(false);
          return;
        }
        await login(authData.email, authData.password);
        setAuthSuccess('Authentication successful!');
        await createAdAndProceed();
      } else {
        if (!authData.name || !authData.email || !authData.password) {
          setAuthError('All fields are required');
          setIsLoading(false);
          return;
        }
        
        const returnUrl = `${window.location.origin}/direct-advertise?websiteId=${websiteId}&categoryId=${categoryId}&verificationReturn=true`;
        const result = await signup(authData.email, authData.password, authData.name, returnUrl);
        
        if (result.requiresVerification) {
          setAuthSuccess('Registration successful! Please check your email to verify your account. After verification, you\'ll be redirected back here to complete your advertisement.');
          setIsLoading(false);
          return;
        }
      }
      
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const createAdAndProceed = async () => {
    try {
      setIsLoading(true);
      
      let fileToUpload = file;
      if (!fileToUpload) {
        try {
          fileToUpload = await getFileFromIndexedDB(FILE_STORAGE_KEY);
          if (fileToUpload) {
            setFile(fileToUpload);
          }
        } catch (dbError) {
        }
      }
      
      const formData = new FormData();
      formData.append('adOwnerEmail', user?.email || authData.email);
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      }
      formData.append('businessName', businessData.businessName);
      formData.append('businessLink', businessData.businessLink);
      formData.append('businessLocation', businessData.businessLocation);
      formData.append('adDescription', businessData.adDescription);
      formData.append('selectedWebsites', JSON.stringify([websiteId]));
      formData.append('selectedCategories', JSON.stringify([categoryId]));

      const response = await axios.post(`${API_URL}/web-advertise`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
      });

      if (response.data.success) {
        setAdId(response.data.data.adId || response.data.data._id);
        
        localStorage.removeItem('directAdvertise_formData');
        
        try {
          await deleteFileFromIndexedDB(FILE_STORAGE_KEY);
        } catch (clearError) {
        }
        
        setStep(3);
      }
      
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Failed to create advertisement');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      const paymentResponse = await axios.post(`${API_URL}/web-advertise/payment/initiate`, {
        adId: adId,
        selections: [{
          websiteId: websiteId,
          categoryId: categoryId
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (paymentResponse.data.success && paymentResponse.data.paymentUrl) {
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        throw new Error('Failed to get payment URL');
      }
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError(null);
    setSuccess(null);
    setAuthError(null);
    setAuthSuccess(null);
  };

  if (isLoading && !websiteInfo) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {[
              { num: 1, label: 'Ad Details' },
              { num: 2, label: 'Authentication' },
              { num: 3, label: 'Payment' }
            ].map((item, index) => (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 border-2 flex items-center justify-center transition-all ${
                    step >= item.num 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <span className="text-sm font-semibold">{item.num}</span>
                  </div>
                  <span className="text-xs mt-2 text-gray-600 font-medium">{item.label}</span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > item.num ? 'bg-black' : 'bg-gray-300'
                  } transition-all`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Alerts - Only show when NOT in step 2 */}
          {step !== 2 && (
            <>
              {error && (
                <div className="mb-6 border border-red-600 bg-red-50 p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 border border-green-600 bg-green-50 p-4">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}
            </>
          )}

          <div className="border border-black bg-white p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Website Details</h3>
                <p className="text-base font-medium mb-1">{websiteInfo?.websiteName}</p>
                <a 
                  href={websiteInfo?.websiteLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  {websiteInfo?.websiteLink}
                </a>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">ACCEPTED CATEGORIES</p>
                  <div className="flex flex-wrap gap-2">
                    {websiteInfo?.businessCategories?.includes('any') ? (
                      <span className="px-2 py-1 border border-gray-300 bg-gray-50 text-gray-700 text-xs">
                        All Categories
                      </span>
                    ) : (
                      websiteInfo?.businessCategories?.map(cat => (
                        <span key={cat} className="px-2 py-1 border border-gray-300 bg-gray-50 text-gray-700 text-xs">
                          {businessCategories.find(bc => bc.value === cat)?.label || cat}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Category Details</h3>
                <p className="text-base font-medium mb-2">{categoryInfo?.categoryName}</p>
                <p className="text-sm text-gray-600 mb-4">{categoryInfo?.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">${categoryInfo?.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tier:</span>
                    <span className="font-medium capitalize">{categoryInfo?.tier}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Ad Details Form */}
          {step === 1 && (
            <div className="border border-black bg-white p-8">
              <h2 className="text-xl font-semibold mb-6">Advertisement Details</h2>
              
              <form onSubmit={handleSubmitBasicInfo} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Ad Media <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {filePreview ? (
                      <div className="space-y-4">
                        {filePreview.type.startsWith('image/') && (
                          <img src={filePreview.url} alt="Preview" className="max-h-48 mx-auto" />
                        )}
                        {filePreview.type.startsWith('video/') && (
                          <video src={filePreview.url} controls className="max-h-48 mx-auto" />
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-sm text-gray-600">{file?.name}</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setFilePreview(null);
                              deleteFileFromIndexedDB(FILE_STORAGE_KEY);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-1">Drop your file here or click to browse</p>
                        <p className="text-xs text-gray-500">Images, Videos, or PDFs (Max 50MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf"
                    className="hidden"
                  />
                </div>

                {/* Business Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={businessData.businessName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                  <Building2 size={16} className="absolute left-3 top-11 text-gray-400" />
                </div>

                {/* Business Category */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessCategory"
                    value={businessData.businessCategory}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    required
                  >
                    <option value="">Select a category</option>
                    {businessCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <FileText size={16} className="absolute left-3 top-11 text-gray-400" />
                </div>

                {/* Business Link */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Website <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="businessLink"
                    value={businessData.businessLink}
                    onChange={handleInputChange}
                    placeholder="https://www.yourbusiness.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                  <LinkIcon size={16} className="absolute left-3 top-11 text-gray-400" />
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
                    onChange={handleInputChange}
                    placeholder="City, State, or Country"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                  <MapPin size={16} className="absolute left-3 top-11 text-gray-400" />
                </div>

                {/* Ad Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advertisement Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="adDescription"
                    value={businessData.adDescription}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about your business in a few compelling words..."
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Continue to Authentication'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Authentication */}
          {step === 2 && (
            <div className="border border-black bg-white p-8 relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {isAuthenticated ? 'Review & Create Ad' : 'Sign In to Continue'}
                </h2>
                {!adId && (
                  <button
                    onClick={handleBackToStep1}
                    className="text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back to Edit</span>
                  </button>
                )}
              </div>
              
              {/* Auth-specific alerts - appears as modal overlay */}
              {(authError || authSuccess) && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-8">
                  <div className="bg-white border-2 border-black p-6 max-w-md w-full shadow-2xl">
                    {authError && (
                      <div className="border border-red-600 bg-red-50 p-4">
                        <p className="text-red-700 text-sm">{authError}</p>
                      </div>
                    )}
                    {authSuccess && (
                      <div className="border border-green-600 bg-green-50 p-4">
                        <p className="text-green-700 text-sm">{authSuccess}</p>
                      </div>
                    )}
                    {authError && (
                      <button
                        onClick={() => setAuthError(null)}
                        className="mt-4 w-full bg-black text-white py-2 font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {!isAuthenticated ? (
                <div className="space-y-6">
                  <p className="text-gray-600 text-sm">Please sign in or create an account to proceed with your advertisement.</p>
                  
                  {/* Auth Mode Tabs */}
                  <div className="flex gap-4 border-b border-gray-200">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`pb-3 px-1 font-medium transition-colors ${
                        authMode === 'login' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`pb-3 px-1 font-medium transition-colors ${
                        authMode === 'signup' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={authData.name}
                          onChange={handleAuthInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                          required={authMode === 'signup'}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={authData.email}
                        onChange={handleAuthInputChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={authData.password}
                          onChange={handleAuthInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue')}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border border-green-600 bg-green-50 p-4">
                    <span className="text-green-700 text-sm">You're signed in as {user?.email}</span>
                  </div>
                  
                  <button
                    onClick={createAdAndProceed}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Ad...' : 'Create Ad & Proceed to Payment'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="border border-black bg-white p-8">
              <h2 className="text-xl font-semibold mb-6">Complete Payment</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 bg-gray-50 p-6">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Website:</span>
                      <span className="font-medium">{websiteInfo?.websiteName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{categoryInfo?.categoryName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Business:</span>
                      <span className="font-medium">{businessData.businessName}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span>${categoryInfo?.price}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// IndexedDB helper functions for file storage
const FILE_STORAGE_KEY = 'directAdvertise_uploadedFile';
const DB_NAME = 'DirectAdvertiseDB';
const STORE_NAME = 'files';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function saveFileToIndexedDB(key, file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(file, key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getFileFromIndexedDB(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteFileFromIndexedDB(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export default DirectAdvertise; 