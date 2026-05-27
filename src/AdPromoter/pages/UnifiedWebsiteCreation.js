import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, ArrowLeft, Check, AlertTriangle,
  Building2, Code, Utensils, Home, Car, Heart, Gamepad2, 
  Shirt, BookOpen, Briefcase, Plane, Music, Camera, Gift, 
  Shield, Zap, Loader, X, Mail, Eye, EyeOff,
  Layers, Monitor, Smartphone, Search, CheckCircle,
  Sidebar as SidebarIcon, PanelRight, PanelLeft, AlignJustify,
  PanelBottom, Layout, Maximize, Globe, TrendingUp,
  BadgeCheck, AlertCircle, DollarSign
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import PricingTiers, { getTierFromTraffic, getAutoPrice } from '../components/PricingTiers';

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
import api from '../../utils/api';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const formatRWF = (n) => `RWF ${Number(n || 0).toLocaleString()}`;

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
const UnifiedWebsiteCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [createdWebsiteId, setCreatedWebsiteId] = useState(null); // track if website already saved
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1 state
  const [websiteData, setWebsiteData] = useState({
    name: '',
    url: '',
    image: null,
    imagePreview: null,
  });

  // Domain verification state (Resend-style)
  const [domainVerification, setDomainVerification] = useState({
    status: 'idle',           // idle | loading | awaiting | verifying | verified | error
    token: null,
    txtRecord: null,
    txtHost: null,
    instructions: [],
    errorMessage: '',
  });

  // Step 2 state
  const [selectedBusinessCategories, setSelectedBusinessCategories] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Step 3 state
  const [selectedAdCategories, setSelectedAdCategories] = useState({});
  const [adCategoryData, setAdCategoryData] = useState({});
  const [completedAdCategories, setCompletedAdCategories] = useState([]);
  const [activeAdCategory, setActiveAdCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFullImage, setShowFullImage] = useState(false);

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

  const adCategoryDetails = {
    aboveTheFold: { name: 'Above the Fold', icon: <Layers className="w-6 h-6" />, spaceType: 'Above The Fold', description: 'Prime visibility area at the top of webpage before scrolling', category: 'primary', position: 'top', image: AboveTheFold },
    beneathTitle: { name: 'Beneath Title', icon: <AlignJustify className="w-6 h-6" />, spaceType: 'Beneath Title', description: 'Ad space directly below the page title', category: 'content', position: 'top', image: BeneathTitle },
    bottom: { name: 'Bottom', icon: <PanelBottom className="w-6 h-6" />, spaceType: 'Bottom', description: 'Bottom section spanning full width', category: 'primary', position: 'bottom', image: Bottom },
    floating: { name: 'Floating', icon: <Maximize className="w-6 h-6" />, spaceType: 'Floating', description: 'Floating advertisement that follows scroll', category: 'special', position: 'overlay', image: Floating },
    header: { name: 'Header', icon: <Monitor className="w-6 h-6" />, spaceType: 'Header', description: 'Top banner spanning full width of website', category: 'primary', position: 'top', image: HeaderPic },
    inFeed: { name: 'In-Feed', icon: <AlignJustify className="w-6 h-6" />, spaceType: 'In-Feed', description: 'Native ads within content feed', category: 'content', position: 'content', image: InFeed },
    inlineContent: { name: 'Inline Content', icon: <Layout className="w-6 h-6" />, spaceType: 'Inline Content', description: 'Ad embedded within article content', category: 'content', position: 'content', image: InlineContent },
    leftRail: { name: 'Left Rail', icon: <PanelLeft className="w-6 h-6" />, spaceType: 'Left Rail', description: 'Left sidebar for vertical ads', category: 'sidebar', position: 'side', image: LeftRail },
    mobileInterstial: { name: 'Mobile Interstitial', icon: <Smartphone className="w-6 h-6" />, spaceType: 'Mobile Interstitial', description: 'Full-screen mobile advertisement', category: 'mobile', position: 'overlay', image: MobileInterstial },
    modal: { name: 'Modal', icon: <Maximize className="w-6 h-6" />, spaceType: 'Modal', description: 'Overlay popup advertisement', category: 'special', position: 'overlay', image: ModalPic },
    overlay: { name: 'Overlay', icon: <Layers className="w-6 h-6" />, spaceType: 'Overlay', description: 'Semi-transparent overlay advertisement', category: 'special', position: 'overlay', image: Overlay },
    proFooter: { name: 'Pro Footer', icon: <PanelBottom className="w-6 h-6" />, spaceType: 'Pro Footer', description: 'Enhanced footer with multiple ad slots', category: 'primary', position: 'bottom', image: ProFooter },
    rightRail: { name: 'Right Rail', icon: <PanelRight className="w-6 h-6" />, spaceType: 'Right Rail', description: 'Right sidebar for vertical ads', category: 'sidebar', position: 'side', image: RightRail },
    sidebar: { name: 'Sidebar', icon: <SidebarIcon className="w-6 h-6" />, spaceType: 'Sidebar', description: 'Vertical advertisement space alongside main content', category: 'sidebar', position: 'side', image: Sidebar },
    stickySidebar: { name: 'Sticky Sidebar', icon: <SidebarIcon className="w-6 h-6" />, spaceType: 'Sticky Sidebar', description: 'Sidebar that remains visible while scrolling', category: 'sidebar', position: 'side', image: StickySidebar },
  };

  const categoryFilters = [
    { id: 'all', name: 'All Spaces' }, { id: 'primary', name: 'Primary' },
    { id: 'sidebar', name: 'Sidebar' }, { id: 'content', name: 'Content' },
    { id: 'special', name: 'Special' }, { id: 'mobile', name: 'Mobile' },
  ];

  useEffect(() => { fetchBusinessCategories(); }, []);

  // ── Domain verification (Resend-style) ──────────────────────────────────────
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
        status: 'awaiting',
        token: verificationToken,
        txtRecord,
        txtHost,
        instructions,
        errorMessage: '',
      });
    } catch (error) {
      setDomainVerification(prev => ({
        ...prev,
        status: 'error',
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
          ...prev,
          status: 'awaiting',
          errorMessage: response.data.message,
        }));
      }
    } catch (error) {
      setDomainVerification(prev => ({
        ...prev,
        status: 'awaiting',
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
          ...category,
          icon: iconMap[category.id] || Building2,
        }));
        setBusinessCategories(categoriesWithIcons);
      }
    } catch (error) {
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
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
        [category]: { ...prev[category], price: value.price, tier: value.tier, visitorRange: value.visitorRange, ownerEarns: value.ownerEarns },
      }));
    } else {
      setAdCategoryData(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
    }
  };

  const handleAdCategoryComplete = () => {
    const data = adCategoryData[activeAdCategory];
    if (data?.price && data?.userCount && data?.instructions) {
      setCompletedAdCategories(prev => prev.includes(activeAdCategory) ? prev : [...prev, activeAdCategory]);
    }
    setActiveAdCategory(null);
  };

  // ── Earnings summary helper ──────────────────────────────────
  const computeTotalEarnings = () => {
    return completedAdCategories.reduce((sum, cat) => {
      const d = adCategoryData[cat];
      return sum + (d?.ownerEarns || Math.round((d?.price || 0) * 0.7));
    }, 0);
  };

  // ── Auth ────────────────────────────────────────────────────
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
          await handleFinalSubmit(response.data.token);
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

  const handleFinalSubmit = async (token) => {
    setIsSubmitting(true);
    try {
      let websiteId = createdWebsiteId; // reuse if we already created it this session

      if (!websiteId) {
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
          websiteId = websiteResponse.data.data._id;
          setCreatedWebsiteId(websiteId);
        } catch (createError) {
          if (createError.response?.status === 409) {
            // Website already exists — fetch its ID so we can still save ad spaces
            try {
              const allSites = await api.get(`/api/createWebsite/`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const existing = allSites.data.find(
                s => s.websiteLink === websiteData.url || s.websiteLink === websiteData.url.replace(/\/+$/, '')
              );
              if (existing) {
                websiteId = existing._id;
                setCreatedWebsiteId(websiteId);
              } else {
                throw new Error('This website URL is already registered by another account.');
              }
            } catch (fetchError) {
              if (fetchError.message.includes('already registered')) throw fetchError;
              throw new Error('This website URL already exists. Please use a different URL.');
            }
          } else {
            throw createError;
          }
        }
      }

      if (websiteData.image) {
        const formData = new FormData();
        formData.append('file', websiteData.image);
        try {
          await api.post(`/api/createWebsite/upload/${websiteId}`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          });
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
        }
      }

      if (completedAdCategories.length > 0) {
        const adCategoriesToSubmit = completedAdCategories.map(category => {
          const data = adCategoryData[category] || {};
          const details = adCategoryDetails[category] || {};
          const tier = getTierFromTraffic(websiteData.monthlyTraffic);
          return {
            websiteId,
            categoryName: details.name || category,
            description: details.description || '',
            price: Number(data.price) || 0,
            spaceType: details.spaceType || 'banner',
            userCount: Number(data.userCount) || 0,
            instructions: data.instructions || '',
            visitorRange: { min: tier.min, max: tier.max === Infinity ? 9999999 : tier.max },
            tier: data.tier || tier.tier,
          };
        });

        await Promise.all(
          adCategoriesToSubmit.map(cat =>
            api.post(`/api/ad-categories`, cat, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        setErrors({ general: 'Please fill in website name and URL.' });
        return;
      }
      if (domainVerification.status !== 'verified') {
        setErrors({ general: 'Please verify your domain ownership before continuing.' });
        return;
      }
    } else if (currentStep === 2) {
      if (selectedBusinessCategories.length === 0) {
        setErrors({ general: 'Please select at least one business category.' });
        return;
      }
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const handleFinish = async () => {
    const token = localStorage.getItem('token');
    if (!token) setShowAuthModal(true);
    else await handleFinalSubmit(token);
  };

  const filteredAdCategories = Object.entries(adCategoryDetails).filter(([key, details]) => {
    const matchesSearch = details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         details.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || details.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // ──────────────────────────────────────────────────────────────
  // STEP 1 — Website details
  // ──────────────────────────────────────────────────────────────
  const renderStep1 = () => {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black transition-colors">
                <ArrowLeft size={18} className="mr-2" />
                <span className="font-medium">Back</span>
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-black text-white">Add Website Details</span>
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

              {/* Website URL + domain ownership verification */}
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
                      type="button"
                      onClick={initiateDomainVerification}
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

                {/* DNS record instructions panel */}
                {(domainVerification.status === 'awaiting' || domainVerification.status === 'verifying') && (
                  <div className="mt-4 border border-black bg-gray-50 p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <Globe size={18} className="text-black mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-black mb-1">Add this TXT record to your DNS</p>
                        <p className="text-xs text-gray-600">Log in to the registrar where you <span className="font-semibold text-black">bought your domain</span> (e.g. Namecheap, GoDaddy, Cloudflare). <span className="font-semibold text-black">Do not add this in Vercel</span> — add it at your domain registrar.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-300 pb-1">
                        <span>Type</span>
                        <span>Host / Name</span>
                        <span>Value</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-mono bg-white border border-gray-200 p-3">
                        <span className="text-gray-800">TXT</span>
                        <span className="text-black font-semibold break-all">{domainVerification.txtHost}</span>
                        <span className="text-black break-all">{domainVerification.txtRecord}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(domainVerification.txtRecord)}
                        className="text-xs px-3 py-1.5 border border-black bg-white hover:bg-gray-100 font-medium"
                      >
                        Copy Value
                      </button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(domainVerification.txtHost)}
                        className="text-xs px-3 py-1.5 border border-black bg-white hover:bg-gray-100 font-medium"
                      >
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

                    <button
                      type="button"
                      onClick={handleVerifyDomain}
                      disabled={domainVerification.status === 'verifying'}
                      className="w-full py-2.5 border border-black bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {domainVerification.status === 'verifying'
                        ? <><Loader size={14} className="animate-spin" /> Checking...</>
                        : <><CheckCircle size={14} /> Check Verification</>}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
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
                Continue to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // STEP 2 — Business categories (unchanged UI)
  // ──────────────────────────────────────────────────────────────
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
              <span className="px-3 py-1 text-sm font-medium bg-black text-white">Select Business Categories</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between mb-12">
            <p className="text-gray-600 max-w-2xl">
              Select the types of businesses you want to advertise on <strong>{websiteData.name || 'Your Website'}</strong>.
            </p>
          </div>

          {selectedBusinessCategories.length > 0 && (
            <div className="mb-8 p-6 border border-black bg-white">
              <h3 className="font-semibold text-black mb-4">Selected Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedBusinessCategories.map(id => {
                  const cat = businessCategories.find(c => c.id === id);
                  return (
                    <span key={id} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-black border border-gray-300">
                      {cat?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {errors.general && <div className="mb-8 p-4 border border-red-300 bg-red-50 text-red-700">{errors.general}</div>}

          {loadingCategories ? (
            <div className="flex items-center justify-center min-h-96"><LoadingSpinner /></div>
          ) : businessCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessCategories.map(category => {
                const Icon = category.icon;
                const isSelected = selectedBusinessCategories.includes(category.id);
                const isDisabled = isAnySelected && category.id !== 'any';
                return (
                  <div key={category.id} onClick={() => !isDisabled && handleBusinessCategoryToggle(category.id)}
                    className={`border border-black bg-white p-6 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-gray-100' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
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

          <div className="mt-12 flex justify-end">
            <button onClick={handleNext} disabled={selectedBusinessCategories.length === 0}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
              Continue to Ad Spaces
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // STEP 3 — Ad spaces (auto-priced)
  // ──────────────────────────────────────────────────────────────
  const renderStep3 = () => {
    const totalEarnings = computeTotalEarnings();
    // Traffic is auto-tracked after the script is installed — use starter tier as baseline
    const tier = getTierFromTraffic(1000);

    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-black transition-colors">
                <ArrowLeft size={18} className="mr-2" /><span className="font-medium">Back</span>
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-black text-white">Step 3 of 3</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Configure Ad Spaces</h1>
            <p className="text-gray-700">
              Choose advertising spaces for <strong>{websiteData.name}</strong>. Prices start at the <strong>{tier.label}</strong> tier and update automatically as your real traffic is measured after installing the script.
            </p>
          </div>

          {/* Earnings summary bar */}
          {completedAdCategories.length > 0 && (
            <div className="mb-8 p-5 border border-black bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={24} />
                <div>
                  <p className="text-sm text-gray-300">Estimated monthly earnings</p>
                  <p className="text-2xl font-bold">{formatRWF(totalEarnings)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">{completedAdCategories.length} ad space{completedAdCategories.length > 1 ? 's' : ''} configured</p>
                <p className="text-xs text-gray-400 mt-0.5">Based on your {tier.label} tier traffic</p>
              </div>
            </div>
          )}

          {/* Search / filter */}
          <div className="flex justify-between items-center gap-4 mb-8">
            <div className="flex-1 max-w-md relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search ad spaces..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              {categoryFilters.map(filter => (
                <button key={filter.id} onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 text-sm border border-black transition-colors ${activeFilter === filter.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          {filteredAdCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredAdCategories.map(([category, details]) => {
                const isCompleted = completedAdCategories.includes(category);
                const autoPrice = getAutoPrice(websiteData.monthlyTraffic, details.spaceType);
                const ownerEarns = Math.round(autoPrice * 0.70);

                return (
                  <div key={category}
                    className={`border p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${isCompleted ? 'border-black bg-gray-50' : 'border-gray-300'}`}
                    onClick={() => handleAdCategorySelect(category)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${isCompleted ? 'bg-black text-white' : 'bg-white border border-black'}`}>
                          {isCompleted ? <Check size={20} /> : details.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-black">{details.name}</h3>
                      </div>
                    </div>

                    <div className="mb-4">
                      <img src={details.image} alt={`${details.name} preview`} className="w-full h-32 object-cover border border-gray-300" />
                    </div>

                    <p className="text-gray-700 text-sm mb-4">{details.description}</p>

                    {/* Price preview on card */}
                    <div className="border-t border-gray-200 pt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 uppercase">{details.position}</span>
                        <span className="text-sm font-bold text-black">{formatRWF(autoPrice)}<span className="font-normal text-gray-500">/mo</span></span>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs text-green-700 font-medium">You earn: {formatRWF(ownerEarns)}/mo</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Search size={64} className="mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-semibold mb-4 text-black">No ad spaces found</h2>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}

          {/* Earnings summary before submit */}
          {completedAdCategories.length > 0 && (
            <div className="mb-6 p-6 border border-green-700 bg-green-50">
              <div className="flex items-start gap-3">
                <TrendingUp size={22} className="text-green-700 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 text-lg">
                    You will be earning {formatRWF(totalEarnings)} / month
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    Based on your <strong>{tier.label}</strong> starter tier across {completedAdCategories.length} configured ad space{completedAdCategories.length > 1 ? 's' : ''}.
                    Pricing updates automatically as Yepper measures your real traffic.
                    Yepper pays you 70% of every booking — typically within 30 days of campaign delivery.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button onClick={handleBack} className="px-8 py-3 border border-black bg-white text-black hover:bg-gray-100 font-medium">Previous</button>
            <button onClick={handleFinish} disabled={completedAdCategories.length === 0 || isSubmitting}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
              {isSubmitting ? 'Creating Website...' : `Create Ad Space${completedAdCategories.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        {/* Ad space config modal */}
        {activeAdCategory && (() => {
          const details = adCategoryDetails[activeAdCategory];
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-black max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-black">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white">{details.icon}</div>
                    <div>
                      <h2 className="text-xl font-semibold text-black">{details.name}</h2>
                      <p className="text-sm text-gray-600">{details.category} • {details.position}</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveAdCategory(null); setShowFullImage(false); }} className="p-2 hover:bg-gray-100 border border-black">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6">
                  {showFullImage ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-black">Preview Image</h3>
                        <button onClick={() => setShowFullImage(false)} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-medium">Back to Details</button>
                      </div>
                      <div className="flex justify-center">
                        <img src={details.image} alt={`${details.name} full preview`} className="max-w-full max-h-[70vh] border border-black object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left — pricing (auto) + inputs */}
                      <div className="space-y-6">
                        <PricingTiers
                          selectedPrice={adCategoryData[activeAdCategory] || {}}
                          onPriceSelect={(price) => updateAdCategoryData(activeAdCategory, 'price', price)}
                          monthlyTraffic={websiteData.monthlyTraffic}
                          spaceType={details.spaceType}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of ads for this space</label>
                          <input type="number" placeholder="Number of ads"
                            value={adCategoryData[activeAdCategory]?.userCount || ''}
                            onChange={(e) => updateAdCategoryData(activeAdCategory, 'userCount', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 bg-white text-lg font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
                          <textarea placeholder="Enter any additional requirements or notes"
                            value={adCategoryData[activeAdCategory]?.instructions || ''}
                            onChange={(e) => updateAdCategoryData(activeAdCategory, 'instructions', e.target.value)}
                            rows={4} className="w-full px-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-black" />
                        </div>
                      </div>

                      {/* Right — image + description */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-black">Description & Preview</h3>
                        <div className="cursor-pointer group" onClick={() => setShowFullImage(true)}>
                          <img src={details.image} alt={`${details.name} preview`} className="w-full border border-black group-hover:opacity-80 transition-opacity" />
                          <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-black mb-2">About this space</h4>
                          <p className="text-gray-700 mb-4">{details.description}</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Position: {details.position}</p>
                            <p>Category: {details.category}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showFullImage && (
                    <div className="flex justify-end pt-6 mt-8 border-t border-black">
                      <button onClick={handleAdCategoryComplete}
                        disabled={!adCategoryData[activeAdCategory]?.price || !adCategoryData[activeAdCategory]?.userCount || !adCategoryData[activeAdCategory]?.instructions}
                        className="bg-black text-white px-6 py-3 hover:bg-gray-800 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
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
  };

  // ──────────────────────────────────────────────────────────────
  // Auth modal (unchanged)
  // ──────────────────────────────────────────────────────────────
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
      {currentStep === 3 && renderStep3()}
      {showAuthModal && renderAuthModal()}
    </>
  );
};

export default UnifiedWebsiteCreation;