import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FileUp, Building2, Link, MapPin, FileText, Tag, CreditCard, AlertCircle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function DirectAdvertise() {
  const { user, isAuthenticated, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const websiteId = queryParams.get('websiteId');
  const categoryId = queryParams.get('categoryId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [websiteInfo, setWebsiteInfo] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [step, setStep] = useState(1);
  const [adId, setAdId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      if (!websiteId || !categoryId) {
        setError('Missing website or category information.');
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
        console.error('Error fetching data:', err);
        setError('Failed to load website or category information');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [websiteId, categoryId]);

  const processFile = (selectedFile) => {
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

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        url: reader.result,
        type: selectedFile.type
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
    setError(null);
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

    setSuccess('Ad details saved! Category verified.');
    setTimeout(() => {
      setStep(2);
      setSuccess(null);
    }, 1000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        if (!authData.email || !authData.password) {
          setError('Email and password are required');
          setIsLoading(false);
          return;
        }
        await login(authData.email, authData.password);
      } else {
        if (!authData.name || !authData.email || !authData.password) {
          setError('All fields are required');
          setIsLoading(false);
          return;
        }
        const result = await signup(authData.email, authData.password, authData.name);
        if (result.requiresVerification) {
          setSuccess('Registration successful! Please check your email to verify your account.');
          setIsLoading(false);
          return;
        }
      }

      setShowAuthModal(false);
      setSuccess('Authentication successful!');
      await createAdAndProceed();
      
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const createAdAndProceed = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('adOwnerEmail', user?.email || authData.email);
      if (file) formData.append('file', file);
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
        setStep(3);
      }
      
    } catch (error) {
      console.error('Error creating ad:', error);
      setError(error.response?.data?.message || 'Failed to create advertisement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      createAdAndProceed();
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
      console.error('Payment error:', error);
      setError(error.response?.data?.error || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  if (isLoading && !websiteInfo) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-20">
        
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Ad Details' },
              { num: 2, label: 'Authentication' },
              { num: 3, label: 'Payment' }
            ].map((item, index) => (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step >= item.num ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-white/10'
                  } transition-all duration-300`}>
                    {step > item.num ? (
                      <CheckCircle size={24} />
                    ) : (
                      <span className="font-semibold">{item.num}</span>
                    )}
                  </div>
                  <span className="text-sm mt-2 text-white/60">{item.label}</span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > item.num ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-white/10'
                  } transition-all duration-300`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start">
              <AlertCircle className="text-red-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start">
              <CheckCircle className="text-green-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-200">{success}</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-md bg-gradient-to-b from-purple-900/30 to-purple-900/10 rounded-3xl overflow-hidden border border-white/10 p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-xl font-medium text-white mb-2">{websiteInfo?.websiteName}</p>
                <a href={websiteInfo?.websiteLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                  {websiteInfo?.websiteLink}
                </a>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm mb-2">Accepted Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {websiteInfo?.businessCategories?.includes('any') ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">All Categories</span>
                    ) : (
                      websiteInfo?.businessCategories?.map(cat => (
                        <span key={cat} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          {businessCategories.find(bc => bc.value === cat)?.label || cat}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-lg font-medium text-white mb-2">{categoryInfo?.categoryName}</p>
                <p className="text-white/60 text-sm mb-4">{categoryInfo?.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Price:</span>
                    <span className="text-white font-medium">${categoryInfo?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Tier:</span>
                    <span className="text-white font-medium capitalize">{categoryInfo?.tier}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {step === 1 && (
            <form onSubmit={handleSubmitBasicInfo} className="backdrop-blur-md bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Advertisement Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Ad Media</label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    {filePreview ? (
                      <div className="space-y-4">
                        {filePreview.type.startsWith('image/') && (
                          <img src={filePreview.url} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        )}
                        {filePreview.type.startsWith('video/') && (
                          <video src={filePreview.url} controls className="max-h-48 mx-auto rounded-lg" />
                        )}
                        <p className="text-sm text-white/60">{file?.name}</p>
                      </div>
                    ) : (
                      <div>
                        <FileUp className="mx-auto mb-4 text-white/40" size={48} />
                        <p className="text-white/60">Drop your file here or click to browse</p>
                        <p className="text-xs text-white/40 mt-2">Images, Videos, or PDFs (Max 50MB)</p>
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Building2 className="inline mr-2" size={16} />
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={businessData.businessName}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Tag className="inline mr-2" size={16} />
                    Business Category
                  </label>
                  <select
                    name="businessCategory"
                    value={businessData.businessCategory}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {businessCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Link className="inline mr-2" size={16} />
                    Business Website/Link
                  </label>
                  <input
                    type="url"
                    name="businessLink"
                    value={businessData.businessLink}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Business Location
                  </label>
                  <input
                    type="text"
                    name="businessLocation"
                    value={businessData.businessLocation}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FileText className="inline mr-2" size={16} />
                    Advertisement Description
                  </label>
                  <textarea
                    name="adDescription"
                    value={businessData.adDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="backdrop-blur-md bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">
                {isAuthenticated ? 'Review & Create Ad' : 'Sign In to Continue'}
              </h2>
              
              {!isAuthenticated ? (
                <div className="space-y-6">
                  <p className="text-white/60">Please sign in or create an account to proceed with your advertisement.</p>
                  
                  <div className="flex gap-4 border-b border-white/10">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`pb-3 px-4 font-medium transition-colors ${
                        authMode === 'login' 
                          ? 'text-blue-400 border-b-2 border-blue-400' 
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`pb-3 px-4 font-medium transition-colors ${
                        authMode === 'signup' 
                          ? 'text-blue-400 border-b-2 border-blue-400' 
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={authData.name}
                          onChange={handleAuthInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                          required={authMode === 'signup'}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={authData.email}
                        onChange={handleAuthInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={authData.password}
                          onChange={handleAuthInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue')}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
                    <CheckCircle className="inline mr-2 text-green-400" size={20} />
                    <span className="text-green-200">You're signed in as {user?.email}</span>
                  </div>
                  
                  <button
                    onClick={createAdAndProceed}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Ad...' : 'Create Ad & Proceed to Payment'}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="backdrop-blur-md bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>
              
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Website:</span>
                      <span>{websiteInfo?.websiteName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Category:</span>
                      <span>{categoryInfo?.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Business:</span>
                      <span>{businessData.businessName}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${categoryInfo?.price}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
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

export default DirectAdvertise;