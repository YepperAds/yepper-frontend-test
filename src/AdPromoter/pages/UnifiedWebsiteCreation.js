import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, ArrowLeft, Check, AlertTriangle,
  Building2, Code, Utensils, Home, Car, Heart, Gamepad2, 
  Shirt, BookOpen, Briefcase, Plane, Music, Camera, Gift, 
  Shield, Zap, Loader, X, Mail, Eye, EyeOff,
  Globe, BadgeCheck, AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const UnifiedWebsiteCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1 state
  const [websiteData, setWebsiteData] = useState({
    name: '', url: '', image: null, imagePreview: null,
  });

  // Domain verification state
  const [domainVerification, setDomainVerification] = useState({
    status: 'idle', // idle | loading | awaiting | verifying | verified | error
    token: null, txtRecord: null, txtHost: null, instructions: [], errorMessage: '',
  });

  // Step 2 state
  const [selectedBusinessCategories, setSelectedBusinessCategories] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Auth state
  const [authFormData, setAuthFormData] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const iconMap = {
    'any': Zap, 'technology': Code, 'food': Utensils, 'realestate': Home,
    'automotive': Car, 'health': Heart, 'gaming': Gamepad2, 'fashion': Shirt,
    'education': BookOpen, 'business': Briefcase, 'travel': Plane,
    'entertainment': Music, 'photography': Camera, 'ecommerce': Gift, 'finance': Shield
  };

  useEffect(() => { fetchBusinessCategories(); }, []);

  // ── Domain verification ──────────────────────────────────────────────────────
  const initiateDomainVerification = async () => {
    if (!websiteData.url) return;
    const token = localStorage.getItem('token');
    if (!token) { setShowAuthModal(true); return; }

    setDomainVerification(prev => ({ ...prev, status: 'loading', errorMessage: '' }));
    try {
      const response = await api.post(
        '/api/createWebsite/initiate-verification',
        { websiteLink: websiteData.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { verificationToken, txtRecord, txtHost, instructions } = response.data;
      setDomainVerification({
        status: 'awaiting', token: verificationToken,
        txtRecord, txtHost, instructions, errorMessage: '',
      });
    } catch (error) {
      setDomainVerification(prev => ({
        ...prev, status: 'error',
        errorMessage: error.response?.data?.message || 'Failed to initiate verification. Try again.',
      }));
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainVerification.token) return;
    setDomainVerification(prev => ({ ...prev, status: 'verifying', errorMessage: '' }));
    const token = localStorage.getItem('token');
    try {
      const response = await api.post(
        '/api/createWebsite/verify-domain',
        { websiteLink: websiteData.url, verificationToken: domainVerification.token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.verified) {
        setDomainVerification(prev => ({ ...prev, status: 'verified', errorMessage: '' }));
      } else {
        setDomainVerification(prev => ({
          ...prev, status: 'awaiting', errorMessage: response.data.message,
        }));
      }
    } catch (error) {
      setDomainVerification(prev => ({
        ...prev, status: 'awaiting',
        errorMessage: error.response?.data?.message || 'Verification check failed. Try again.',
      }));
    }
  };

  const fetchBusinessCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get(`/api/business-categories/categories`);
      if (response.data.success) {
        const categoriesWithIcons = response.data.data.categories.map(category => ({
          ...category, icon: iconMap[category.id] || Building2,
        }));
        setBusinessCategories(categoriesWithIcons);
      }
    } catch {
      setErrors({ general: 'Failed to load business categories. Please refresh.' });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWebsiteData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'url') {
      setDomainVerification({ status: 'idle', token: null, txtRecord: null, txtHost: null, instructions: [], errorMessage: '' });
    }
  };

  const validateFile = (file) => {
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, and GIF images are allowed.' }));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
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
        setWebsiteData(prev => ({ ...prev, image: file, imagePreview: reader.result }));
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
        setWebsiteData(prev => ({ ...prev, image: file, imagePreview: reader.result }));
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBusinessCategoryToggle = (categoryId) => {
    if (categoryId === 'any') {
      setSelectedBusinessCategories(prev => prev.includes('any') ? [] : ['any']);
    } else {
      setSelectedBusinessCategories(prev => {
        let next = prev.filter(id => id !== 'any');
        return next.includes(categoryId)
          ? next.filter(id => id !== categoryId)
          : [...next, categoryId];
      });
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────────
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
        const response = await api.post(`/api/auth/register`, {
          name: authFormData.name, email: authFormData.email, password: authFormData.password,
        });
        if (response.data.requiresVerification) {
          setVerificationSent(true);
          setMaskedEmail(response.data.maskedEmail);
        }
      } else {
        const response = await api.post(`/api/auth/login`, {
          email: authFormData.email, password: authFormData.password,
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          setShowAuthModal(false);
          // If we were waiting for auth to verify domain, retry that
          if (!domainVerification.token) {
            await initiateDomainVerification();
          }
        }
      }
    } catch (error) {
      setErrors({ auth: error.response?.data?.message || `${authMode === 'signup' ? 'Registration' : 'Login'} failed` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post(`/api/auth/resend-verification`, { email: authFormData.email });
      alert('Verification email resent successfully!');
    } catch {
      setErrors({ auth: 'Failed to resend verification email' });
    }
  };

  // ── Final submit: create site, upload image, navigate to details ──────────────
  const handleFinalSubmit = async (token) => {
    setIsSubmitting(true);
    setErrors({});
    try {
      // Create the website
      let websiteId;
      try {
        const websiteResponse = await api.post(
          `/api/createWebsite/createWebsiteWithCategories`,
          {
            websiteName: websiteData.name,
            websiteLink: websiteData.url,
            monthlyTraffic: 0,
            imageUrl: '',
            businessCategories: selectedBusinessCategories,
            verificationToken: domainVerification.token,
          },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        websiteId = websiteResponse.data.data.id;
      } catch (createError) {
        if (createError.response?.status === 409) {
          // Already exists — find it and still navigate there
          const allSites = await api.get(`/api/createWebsite/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const existing = allSites.data.find(
            s => s.websiteLink === websiteData.url || s.websiteLink === websiteData.url.replace(/\/+$/, '')
          );
          if (existing) {
            websiteId = existing._id;
          } else {
            throw new Error('This website URL is already registered by another account.');
          }
        } else {
          throw createError;
        }
      }

      // Upload logo if provided
      if (websiteData.image) {
        const formData = new FormData();
        formData.append('file', websiteData.image);
        try {
          await api.post(`/api/createWebsite/upload/${websiteId}`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          });
        } catch (uploadError) {
          console.error('Image upload failed (non-fatal):', uploadError);
        }
      }

      // Navigate directly to the website details page
      // The user will install the script there, then add ad spaces
      navigate(`/website/${websiteId}`);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.message || error.message || 'Failed to create website' });
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!websiteData.name || !websiteData.url) {
        setErrors({ general: 'Please fill in website name and URL.' });
        return;
      }
      if (domainVerification.status !== 'verified') {
        setErrors({ general: 'Please verify your domain ownership before continuing.' });
        return;
      }
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const handleFinish = async () => {
    if (selectedBusinessCategories.length === 0) {
      setErrors({ general: 'Please select at least one business category.' });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) { setShowAuthModal(true); return; }
    await handleFinalSubmit(token);
  };

  // ── STEP 1 — Website details ─────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black transition-colors">
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <span className="px-3 py-1 text-sm font-medium bg-black text-white">Step 1 of 2 — Website Details</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="border border-black bg-white p-8 space-y-8">

            {/* Website Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
              <input
                type="text" name="name" placeholder="Enter your website name"
                value={websiteData.name} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none"
              />
            </div>

            {/* Website URL + domain verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <div className="flex gap-2">
                <input
                  type="url" name="url" placeholder="https://yourwebsite.com"
                  value={websiteData.url} onChange={handleInputChange}
                  disabled={domainVerification.status === 'verified'}
                  className="flex-1 px-4 py-3 border border-black bg-white focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
                {domainVerification.status !== 'verified' && (
                  <button
                    type="button" onClick={initiateDomainVerification}
                    disabled={!websiteData.url || domainVerification.status === 'loading' || domainVerification.status === 'awaiting' || domainVerification.status === 'verifying'}
                    className="px-4 py-3 border border-black bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {domainVerification.status === 'loading' ? 'Loading...' : 'Verify Domain'}
                  </button>
                )}
                {domainVerification.status === 'verified' && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-green-600 bg-green-50 text-green-700 text-sm font-medium">
                    <BadgeCheck size={16} /> Verified
                  </div>
                )}
              </div>

              {/* DNS panel */}
              {(domainVerification.status === 'awaiting' || domainVerification.status === 'verifying') && (
                <div className="mt-4 border border-black bg-gray-50 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe size={18} className="text-black mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-black mb-1">Add this TXT record to your DNS</p>
                      <p className="text-xs text-gray-600">
                        Log in to the registrar where you <span className="font-semibold text-black">bought your domain</span> (e.g. Namecheap, GoDaddy, Cloudflare).{' '}
                        <span className="font-semibold text-black">Do not add this in Vercel</span> — add it at your domain registrar.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-300 pb-1">
                      <span>Type</span><span>Host / Name</span><span>Value</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-mono bg-white border border-gray-200 p-3">
                      <span className="text-gray-800">TXT</span>
                      <span className="text-black font-semibold break-all">{domainVerification.txtHost}</span>
                      <span className="text-black break-all">{domainVerification.txtRecord}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => navigator.clipboard.writeText(domainVerification.txtRecord)}
                      className="text-xs px-3 py-1.5 border border-black bg-white hover:bg-gray-100 font-medium">
                      Copy Value
                    </button>
                    <button type="button" onClick={() => navigator.clipboard.writeText(domainVerification.txtHost)}
                      className="text-xs px-3 py-1.5 border border-black bg-white hover:bg-gray-100 font-medium">
                      Copy Host
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 flex items-start gap-1">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                    DNS changes can take a few minutes to propagate. Click "Check Verification" once you've added the record.
                  </p>

                  {domainVerification.errorMessage && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} /> {domainVerification.errorMessage}
                    </p>
                  )}

                  <button type="button" onClick={handleVerifyDomain}
                    disabled={domainVerification.status === 'verifying'}
                    className="w-full py-2.5 border border-black bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2">
                    {domainVerification.status === 'verifying'
                      ? <><Loader size={14} className="animate-spin" /> Checking...</>
                      : <><Check size={14} /> Check Verification</>}
                  </button>
                </div>
              )}

              {domainVerification.status === 'verified' && (
                <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                  <BadgeCheck size={12} /> Domain ownership confirmed — you can proceed.
                </p>
              )}

              {domainVerification.status === 'error' && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {domainVerification.errorMessage}
                </p>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo <span className="text-gray-400 font-normal">(optional)</span></label>
              <div
                className="border-2 border-dashed border-black bg-white p-8 cursor-pointer hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
                onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" onChange={handleFileChange} className="hidden" />
                <Upload className="text-black mb-3" size={32} />
                <p className="text-black font-medium mb-1">Click to upload logo</p>
                <p className="text-sm text-gray-700">JPEG, PNG, GIF (max 5MB)</p>
              </div>
            </div>

            {(errors.general || errors.image) && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3">
                <AlertTriangle size={16} />
                <span>{errors.general || errors.image}</span>
              </div>
            )}

            {websiteData.imagePreview && (
              <div className="border border-black bg-white p-6">
                <span className="text-sm font-medium text-black block mb-4">Logo Preview</span>
                <div className="flex justify-center">
                  <img src={websiteData.imagePreview} alt="Logo Preview" className="max-h-32 object-contain" />
                </div>
              </div>
            )}

            <button onClick={handleNext} className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors font-medium">
              Continue to Business Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP 2 — Business categories (last step — submits directly) ───────────────
  const renderStep2 = () => {
    const isAnySelected = selectedBusinessCategories.includes('any');
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-black transition-colors">
                <ArrowLeft size={18} className="mr-2" /><span className="font-medium">Back</span>
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-black text-white">Step 2 of 2 — Business Categories</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-black mb-2">What kind of businesses can advertise on your site?</h1>
              <p className="text-gray-600">
                Select the business types you want to attract for <strong>{websiteData.name}</strong>.
                Ad spaces are configured after your site is live and the script is installed.
              </p>
            </div>
          </div>

          {selectedBusinessCategories.length > 0 && (
            <div className="mb-8 p-5 border border-black bg-white">
              <h3 className="font-semibold text-black mb-3">Selected:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedBusinessCategories.map(id => {
                  const cat = businessCategories.find(c => c.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-black text-white">
                      <Check size={12} /> {cat?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} /> {errors.general}
            </div>
          )}
          {errors.submit && (
            <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} /> {errors.submit}
            </div>
          )}

          {loadingCategories ? (
            <div className="flex items-center justify-center min-h-96"><LoadingSpinner /></div>
          ) : businessCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessCategories.map(category => {
                const Icon = category.icon;
                const isSelected = selectedBusinessCategories.includes(category.id);
                const isDisabled = isAnySelected && category.id !== 'any';
                return (
                  <div key={category.id}
                    onClick={() => !isDisabled && handleBusinessCategoryToggle(category.id)}
                    className={`border border-black bg-white p-6 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-gray-100' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Icon size={40} className="text-black" />
                      {isSelected && <div className="bg-black text-white p-1"><Check size={16} /></div>}
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">{category.name}</h3>
                    <p className="text-gray-700 text-sm">{category.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-black">No Categories Available</h2>
                <button onClick={fetchBusinessCategories} className="bg-black text-white px-6 py-2 hover:bg-gray-800">Refresh</button>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between items-center">
            <button onClick={handleBack} className="px-8 py-3 border border-black bg-white text-black hover:bg-gray-100 font-medium">
              Back
            </button>
            <button
              onClick={handleFinish}
              disabled={selectedBusinessCategories.length === 0 || isSubmitting}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting
                ? <><Loader size={16} className="animate-spin" /> Creating Website...</>
                : 'Create Website'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Auth modal ────────────────────────────────────────────────────────────────
  const renderAuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-black max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <h3 className="text-xl font-bold text-black">
            {verificationSent ? 'Check Your Email' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h3>
          <button onClick={() => { setShowAuthModal(false); setVerificationSent(false); setErrors({}); }} className="text-gray-600 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        {verificationSent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4"><Mail className="w-16 h-16 text-black" /></div>
            <p className="text-center text-gray-700">We've sent a verification email to <strong>{maskedEmail}</strong></p>
            <p className="text-center text-sm text-gray-600">Click the link to verify your account and complete website creation.</p>
            <button type="button" onClick={handleResendVerification} className="w-full text-black hover:text-gray-700 text-sm font-medium border-t border-black pt-4 mt-4">
              Resend verification email
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" name="name" value={authFormData.name} onChange={handleAuthInputChange}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none" placeholder="Your name" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={authFormData.email} onChange={handleAuthInputChange}
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={authFormData.password} onChange={handleAuthInputChange}
                  className="w-full px-4 pr-12 py-3 border border-black bg-white focus:outline-none" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {(errors.auth || errors.submit) && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 text-sm">
                {errors.auth || errors.submit}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-black text-white py-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium">
              {isSubmitting ? 'Processing...' : authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}
            </button>

            <div className="text-center border-t border-gray-200 pt-4">
              <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setErrors({}); }}
                className="text-black hover:text-gray-700 text-sm font-medium">
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
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
      {showAuthModal && renderAuthModal()}
    </>
  );
};

export default UnifiedWebsiteCreation;