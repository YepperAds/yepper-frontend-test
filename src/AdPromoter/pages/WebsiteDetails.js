// WebsiteDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {  
    X,
    AlertCircle,
    ArrowLeft,
    Plus,
    Check,
    Palette,
    XCircle,
    RefreshCw,
    Edit,
    Globe,
    Users,
    Eye,
    Monitor,
    Smartphone,
    Tablet,
    TrendingUp,
    BarChart2,
    MapPin,
} from 'lucide-react';
import { MasterIntegration } from '../components/codeDisplay';
import AddNewCategory from './addNewCategory';
import { Button, Card, CardContent, Heading, Text, Input, Badge, Grid, Container } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import AdModalData from '../components/adModalData'
import DeleteCategoryModal from '../components/DeleteCategoryModal';
import AdCustomizationModal from '../components/AdCustomizationModal';
import api from '../../utils/api';


const WebsiteDetails = () => {
    const navigate = useNavigate();
    const { websiteId } = useParams();
    const { user, token } = useAuth();
    const [result, setResult] = useState(true);
    const [website, setWebsite] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoriesForm, setCategoriesForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isEditingWebsiteName, setIsEditingWebsiteName] = useState(false);
    const [tempWebsiteName, setTempWebsiteName] = useState('');
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('english');
    const [activeTab, setActiveTab] = useState('spaces');
    const [pendingAds, setPendingAds] = useState([]);
    const [activeAds, setActiveAds] = useState([]);
    const [showAdModal, setShowAdModal] = useState(false);
    const [adModalData, setAdModalData] = useState(null);
    const [adsLoading, setAdsLoading] = useState(false);
    const [rejecting, setRejecting] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [customizationModal, setCustomizationModal] = useState({
        isOpen: false,
        categoryId: null
    });

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsRange, setAnalyticsRange] = useState(30);
    const [earningsSummary, setEarningsSummary] = useState(null);
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    // Google Search Console state
    const [gscData, setGscData] = useState(null);
    const [gscLoading, setGscLoading] = useState(false);
    const [gscConnecting, setGscConnecting] = useState(false);
    useEffect(() => {
        fetchWebsiteData();
        if (token) {
            fetchAdsData();
            fetchWalletBalance();
        }
    }, [websiteId, token]);

    // Fetch earnings summary (traffic-based) whenever website or categories change
    useEffect(() => {
        if (!websiteId || !token) return;
        const fetchEarnings = async () => {
            try {
                const res = await api.get(`/api/websites/${websiteId}/earnings-summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setEarningsSummary(res.data);
            } catch (err) {
                // Non-fatal — earnings just won't show
                setEarningsSummary({ available: false, reason: 'error' });
            }
        };
        fetchEarnings();
    }, [websiteId, token, categories.length]); // re-fetch when categories count changes

    // Fetch analytics when tab switches to analytics or range changes
    useEffect(() => {
        if (activeTab === 'analytics' && token) {
            fetchAnalytics();
            fetchGscData();
        }
    }, [activeTab, analyticsRange, token]);

    // Handle redirect back from Google OAuth (?gsc=connected)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gscStatus = params.get('gsc');
        const tab = params.get('tab');
        if (gscStatus && tab === 'analytics') {
            setActiveTab('analytics');
            // Clean the URL
            const url = new URL(window.location.href);
            url.searchParams.delete('gsc');
            url.searchParams.delete('tab');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    // Init / re-render Leaflet map whenever analytics data arrives
    useEffect(() => {
        if (activeTab !== 'analytics' || !analytics?.mapPoints?.length) return;

        const init = () => {
            const container = mapRef.current;
            if (!container || !window.L) return;

            // Destroy previous map instance to avoid "already initialized" error
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }

            const map = window.L.map(container, { zoomControl: true }).setView([20, 0], 2);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            analytics.mapPoints.forEach(pt => {
                const deviceColor = pt.device === 'mobile' ? '#3b82f6' : pt.device === 'tablet' ? '#8b5cf6' : '#10b981';
                const circle = window.L.circleMarker([pt.lat, pt.lon], {
                    radius: 6,
                    fillColor: deviceColor,
                    color: '#fff',
                    weight: 1,
                    opacity: 0.9,
                    fillOpacity: 0.75,
                });
                circle.bindPopup(`<strong>${pt.city}, ${pt.country}</strong><br/>${pt.device}<br/>${new Date(pt.timestamp).toLocaleString()}`);
                circle.addTo(map);
            });

            leafletMapRef.current = map;
        };

        // Load Leaflet CSS + JS lazily if not already present
        if (!window.L) {
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = init;
            document.head.appendChild(script);
        } else {
            init();
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [analytics, activeTab]);
    
    const { data: websites } = useQuery({
        queryKey: ['websites', user?._id || user?.id],
        queryFn: async () => {
            try {
                const userId = user?._id || user?.id;
                const response = await api.get(`/api/createWebsite/${userId}`);
                return response.data;
            } catch (error) {
                throw error;
            }
        },
        enabled: !!(user?._id || user?.id) && !!token,
    });

    const languages = [
        { value: 'english', label: 'English' },
        { value: 'french', label: 'French (Français)' },
        { value: 'kinyarwanda', label: 'Kinyarwanda' },
        { value: 'kiswahili', label: 'Swahili' },
        { value: 'chinese', label: 'Chinese (中文)' },
        { value: 'spanish', label: 'Spanish (Español)' }
    ];

    const fetchWebsiteData = async () => {
        setLoading(true);
        setFetchError(null);

        try {
            const websiteResponse = await api.get(`/api/createWebsite/website/${websiteId}`);
            const categoriesResponse = await api.get(`/api/ad-categories/${websiteId}`);
            setWebsite(websiteResponse.data);
            setCategories(categoriesResponse.data.categories);
            setLoading(false);
        } catch (error) {
            setFetchError(error.message || 'Failed to load website data');
            setLoading(false);
        }
    };

    const fetchAdsData = async () => {
        if (!token) return;
        
        setAdsLoading(true);
        try {
            const [pendingResponse, activeResponse] = await Promise.all([
                api.get('/api/ad-categories/pending-rejections'),
                api.get('/api/ad-categories/active-ads')
            ]);

            setPendingAds(pendingResponse.data.pendingAds || []);
            setActiveAds(activeResponse.data.activeAds || []);
        } catch (error) {
            setPendingAds([]);
            setActiveAds([]);
        } finally {
            setAdsLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        if (!token) return;
        
        try {
            const response = await api.get('/api/ad-categories/wallet');
            setWalletBalance(response.data.wallet?.balance || 0);
        } catch (error) {
        }
    };

    const fetchAnalytics = async () => {
        if (!token) return;
        setAnalyticsLoading(true);
        try {
            const response = await api.get(`/api/analytics/${websiteId}?range=${analyticsRange}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnalytics(response.data);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchGscData = async () => {
        if (!token) return;
        setGscLoading(true);
        try {
            const response = await api.get(`/api/analytics/gsc/data/${websiteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGscData(response.data);
        } catch (err) {
            console.error('Failed to fetch GSC data', err);
        } finally {
            setGscLoading(false);
        }
    };

    const handleConnectGsc = async () => {
        if (!token) return;
        setGscConnecting(true);
        try {
            const response = await api.get(`/api/analytics/gsc/connect/${websiteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Redirect the user to Google's OAuth consent screen
            window.location.href = response.data.url;
        } catch (err) {
            console.error('Failed to start GSC connect', err);
            setGscConnecting(false);
        }
    };

    const handleDisconnectGsc = async () => {
        if (!window.confirm('Disconnect Google Search Console from this website?')) return;
        try {
            await api.delete(`/api/analytics/gsc/disconnect/${websiteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGscData(null);
        } catch (err) {
            console.error('Failed to disconnect GSC', err);
        }
    };

    const getAdsForWebsite = (websiteId) => {
        const pending = pendingAds.filter(ad => 
            ad.websiteSelections?.some(sel => 
                sel.websiteId === websiteId && sel.approved && !sel.isRejected
            )
        );
        
        const active = activeAds.filter(ad => 
            ad.websiteSelections?.some(sel => 
                sel.websiteId === websiteId && sel.approved && !sel.isRejected && sel.status === 'active'
            )
        );
        
        return { pending, active };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (deadline) => {
        const now = new Date();
        const timeLeft = new Date(deadline) - now;
        
        if (timeLeft <= 0) return 'Expired';
        
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        return `${minutes}m ${seconds}s`;
    };

    const handleOpenCustomization = (categoryId) => {
        setCustomizationModal({
            isOpen: true,
            categoryId: categoryId
        });
    };

    const handleCloseCustomization = () => {
        setCustomizationModal({
            isOpen: false,
            categoryId: null
        });
    };

    const handleCustomizationSave = (settings) => {
        // Refresh the category data to show updated customization
        fetchWebsiteData();
        alert('Ad customization saved successfully!');
    };

    const handleRejectAd = async () => {
        if (!selectedAd || !rejectionReason.trim()) return;

        setRejecting(selectedAd._id);
        try {
            const websiteSelection = selectedAd.websiteSelections.find(sel => sel.approved && !sel.isRejected);
            
            await api.post(
                `/ad-categories/reject/${selectedAd._id}/${websiteSelection.websiteId}/${websiteSelection.categories[0]}`,
                { rejectionReason: rejectionReason.trim() }
            );

            // Refresh data
            fetchAdsData();
            fetchWalletBalance();
            
            setShowRejectModal(false);
            setSelectedAd(null);
            setRejectionReason('');
            
        } catch (error) {
        } finally {
            setRejecting(null);
        }
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedAd(null);
        setRejectionReason('');
    };

    const handleUpdateWebsiteName = async () => {
        if (!tempWebsiteName.trim()) return;

        try {
            const response = await api.patch(`/api/createWebsite/${websiteId}/name`, {
                websiteName: tempWebsiteName.trim()
            });
            
            setWebsite(prevWebsite => ({
                ...prevWebsite,
                websiteName: response.data.websiteName
            }));
            
            setIsEditingWebsiteName(false);
        } catch (error) {
        }
    };

    const handleStartEditWebsiteName = () => {
        setTempWebsiteName(website.websiteName);
        setIsEditingWebsiteName(true);
    };

    const handleCancelEditWebsiteName = () => {
        setIsEditingWebsiteName(false);
    };

    const handleOpenCategoriesForm = () => {
        setCategoriesForm(true);
        setResult(false);
    };

    const handleCloseCategoriesForm = () => {
        setCategoriesForm(false);
        setResult(true);
        fetchWebsiteData();
    };

    const handleDeleteCategory = (category) => {
        setCategoryToDelete(category);
    };

    const handleDeleteSuccess = () => {
        setCategoryToDelete(null);
        fetchWebsiteData();
    };

    // Called from MasterIntegration when user sets language for all spaces at once
    const handleAllSpacesLanguageChange = async (lang) => {
        try {
            await Promise.all(
                categories.map(cat =>
                    api.patch(`/api/ad-categories/category/${cat._id}/language`, { defaultLanguage: lang })
                )
            );
            setCategories(categories.map(cat => ({ ...cat, defaultLanguage: lang })));
        } catch (error) {
            // silently ignore — UI already updated optimistically
        }
    };

    const handleSaveLanguage = async () => {
        if (!currentCategory) return;
        
        try {
            setCategories(categories.map(cat => 
                cat._id === currentCategory._id 
                    ? { ...cat, defaultLanguage: selectedLanguage } 
                    : cat
            ));
            
            setIsLanguageModalOpen(false);
            setCurrentCategory(null);
            
        } catch (error) {
        }
    };

    const openRejectModal = (ad) => {
        const websiteSelection = ad.websiteSelections.find(sel => sel.approved && !sel.isRejected);
        if (!websiteSelection) return;

        const paymentAmount = ad.paymentAmount || 0;
        if (walletBalance < paymentAmount) {
        alert('Insufficient balance in your wallet to process this rejection. Please contact support.');
        return;
        }

        setSelectedAd(ad);
        setShowRejectModal(true);
    };

    const openAdModal = (ad, websiteId) => {
        const currentWebsite = websites?.find(w => w._id === websiteId);
        const websiteSelection = ad.websiteSelections?.find(sel => 
            sel.websiteId === websiteId
        );

        const adData = {
            ...ad,
            currentWebsite,
            websiteSelection,
            status: websiteSelection?.status || 'pending'
        };

        setAdModalData(adData);
        setShowAdModal(true);
    };

    const closeAdModal = () => {
        setShowAdModal(false);
        setAdModalData(null);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <Heading level={2} className="mb-2">Failed to Load Data</Heading>
                    <Text variant="muted" className="mb-6">{fetchError}</Text>
                    <Button onClick={fetchWebsiteData} variant="primary">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Get ads for this website
    const { pending, active } = website ? getAdsForWebsite(website._id) : { pending: [], active: [] };

    return (
        <div className="min-h-screen bg-white">
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
                        <Badge variant="default">Website Details</Badge>
                    </div>
                </Container>
            </header>

            {result && (
                <Container className="py-12">
                    <div className="text-center mb-12">
                        <div className="mb-8">
                            {isEditingWebsiteName ? (
                                <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                                    <Input 
                                        type="text"
                                        value={tempWebsiteName}
                                        onChange={(e) => setTempWebsiteName(e.target.value)}
                                        className="text-center text-2xl font-bold"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateWebsiteName();
                                            if (e.key === 'Escape') handleCancelEditWebsiteName();
                                        }}
                                    />
                                    <button 
                                        onClick={handleUpdateWebsiteName}
                                        className="p-2 text-black hover:bg-gray-50 border border-black"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={handleCancelEditWebsiteName}
                                        className="p-2 text-black hover:bg-gray-50 border border-black"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="flex items-center justify-center gap-2 group cursor-pointer"
                                    onClick={handleStartEditWebsiteName}
                                >
                                    <Heading level={1} className="text-center">
                                        {website?.websiteName}
                                    </Heading>
                                    <Edit 
                                        className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                                    />
                                </div>
                            )}
                        </div>
                        
                        {website?.websiteLink && (
                            <div className="mb-8">
                                <a 
                                    href={website.websiteLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <span>{website.websiteLink}</span>
                                </a>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex justify-center">
                            <div className="border border-black inline-flex">
                                <button
                                    onClick={() => setActiveTab('spaces')}
                                    className={`px-6 py-2 font-medium transition-all ${
                                        activeTab === 'spaces' 
                                            ? 'bg-black text-white' 
                                            : 'bg-white text-black hover:bg-gray-50'
                                    }`}
                                >
                                    Ad Spaces
                                </button>
                                <button
                                    onClick={() => setActiveTab('ads')}
                                    className={`px-6 py-2 font-medium transition-all border-l border-black ${
                                        activeTab === 'ads' 
                                            ? 'bg-black text-white' 
                                            : 'bg-white text-black hover:bg-gray-50'
                                    }`}
                                >
                                    Ads
                                </button>
                                <button
                                    onClick={() => setActiveTab('customize')}
                                    className={`px-6 py-2 font-medium transition-all border-l border-black ${
                                        activeTab === 'customize' 
                                            ? 'bg-black text-white' 
                                            : 'bg-white text-black hover:bg-gray-50'
                                    }`}
                                >
                                    Customize Ads
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`px-6 py-2 font-medium transition-all border-l border-black ${
                                        activeTab === 'analytics' 
                                            ? 'bg-black text-white' 
                                            : 'bg-white text-black hover:bg-gray-50'
                                    }`}
                                >
                                    Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {activeTab === 'spaces' && (
                        <div>
                            {/* ── Earnings Panel — shown only when real traffic is detected ── */}
                            {earningsSummary?.available ? (
                                <div className="mb-6 border border-green-700 bg-green-50 p-5 rounded-none">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-green-800">💰 Your Estimated Monthly Earnings</p>
                                            <p className="text-xs text-green-700 mt-0.5">
                                                Based on {Number(earningsSummary.monthlyTraffic).toLocaleString()} visitors/month detected by your Yepper script
                                                &nbsp;·&nbsp; <span className="capitalize font-semibold">{earningsSummary.trafficTier}</span> tier
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-800">
                                                RWF {Number(earningsSummary.totalOwnerEarnsPerMonth).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-green-600">total / month across all spaces</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {earningsSummary.categories?.map(c => (
                                            <div key={c.categoryId} className="flex items-center justify-between bg-white border border-green-200 px-3 py-2 text-xs">
                                                <span className="text-gray-700 font-medium truncate mr-2">{c.name}</span>
                                                <span className="text-green-700 font-bold whitespace-nowrap">
                                                    RWF {Number(c.ownerEarns).toLocaleString()}/mo
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : earningsSummary?.reason === 'no_traffic' ? (
                                <div className="mb-6 border border-gray-300 bg-gray-50 p-5">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">📡 Install your script to see earnings</p>
                                    <p className="text-xs text-gray-500">
                                        {earningsSummary.message || 'Add the Yepper script below to your site. Once we detect visitors, your earnings per ad space will appear here — calculated from your real traffic.'}
                                    </p>
                                </div>
                            ) : null}

                            {/* Master Integration Container */}
                            <MasterIntegration
                                website={website}
                                categories={categories}
                                onAddSpace={handleOpenCategoriesForm}
                                onLanguageChange={handleAllSpacesLanguageChange}
                                onDeleteCategory={handleDeleteCategory}
                                earningsSummary={earningsSummary}
                            />
                        </div>
                    )}

                    {activeTab === 'ads' && (
                        <div>
                            {adsLoading ? (
                                <div className="flex justify-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {pending.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <Heading level={2}>Pending Review</Heading>
                                            </div>
                                            
                                            <Grid cols={2} gap={4}>
                                                {pending.map((ad) => {
                                                    const activeSelection = ad.websiteSelections.find(sel => sel.approved && !sel.isRejected);
                                                    const timeRemaining = activeSelection?.rejectionDeadline ? 
                                                        getTimeRemaining(activeSelection.rejectionDeadline) : 'No deadline';
                                                    
                                                    return (
                                                        <Card key={ad._id} className="border-orange-200 bg-orange-50">
                                                            <CardContent className="p-4">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex items-center">
                                                                        {ad.imageUrl && (
                                                                            <img 
                                                                                src={ad.imageUrl} 
                                                                                alt={ad.businessName}
                                                                                className="w-10 h-10 object-cover rounded mr-3"
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <Heading level={4}>{ad.businessName}</Heading>
                                                                            <Text variant="small" className="text-orange-600">{timeRemaining}</Text>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="secondary">{formatCurrency(ad.paymentAmount)}</Badge>
                                                                </div>
                                                                
                                                                <Text className="mb-4 text-gray-600">{ad.adDescription}</Text>
                                                                
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="flex-1"
                                                                        onClick={() => window.open(ad.imageUrl || ad.videoUrl, '_blank')}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                    <Button
                                                                        variant="danger"
                                                                        size="sm"
                                                                        className="flex-1"
                                                                        onClick={() => openRejectModal(ad)}
                                                                        disabled={rejecting === ad._id || walletBalance < (ad.paymentAmount || 0)}
                                                                        icon={rejecting === ad._id ? RefreshCw : XCircle}
                                                                        iconPosition="left"
                                                                    >
                                                                        {rejecting === ad._id ? 'Rejecting...' : 'Reject'}
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </Grid>
                                        </div>
                                    )}

                                    {active.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <Heading level={2}>Active Ads</Heading>
                                            </div>
                                            
                                            <Grid cols={2} gap={6}>
                                                {active.map((ad) => (
                                                    <div
                                                        key={ad._id}
                                                        className="border border-gray-200 bg-gray-50 overflow-hidden"
                                                    >
                                                        {ad.imageUrl && (
                                                            <div className="relative h-48 w-full bg-gray-100">
                                                                <img 
                                                                    src={ad.imageUrl} 
                                                                    alt={ad.businessName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <Badge variant='info' className="absolute top-4 left-4">
                                                                    Active
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Ad Content */}
                                                        <div className="p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex-1">
                                                                    <h4 className="text-lg font-bold text-black mb-1">{ad.businessName}</h4>
                                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.adDescription}</p>
                                                                </div>
                                                            </div>
                                                        
                                                            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded border">
                                                                <div className="text-center">
                                                                    <div className="text-xl font-bold text-black">{ad.views || 0}</div>
                                                                    <div className="text-xs text-gray-600">Views</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-xl font-bold text-black">{ad.clicks || 0}</div>
                                                                    <div className="text-xs text-gray-600">Clicks</div>
                                                                </div>
                                                            </div>
                                                        
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => openAdModal(ad, website._id)}
                                                        >
                                                            View Full Ad
                                                        </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Grid>
                                        </div>
                                    )}

                                    {pending.length === 0 && active.length === 0 && (
                                        <Card className="p-12 text-center">
                                            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <Heading level={3} className="mb-3">No Ads Yet</Heading>
                                            <Text variant="muted">
                                                This website doesn't have any ads running yet. Ads will appear here once they're approved and active.
                                            </Text>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {showAdModal && adModalData && (
                        <AdModalData 
                            adModalData={adModalData} 
                            closeAdModal={closeAdModal}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            getTimeRemaining={getTimeRemaining}
                        />
                    )}
                    
                    {activeTab === 'customize' && (
                        <div>
                            <div className="mb-8 text-center">
                            <Heading level={2} className="mb-3">Customize Your Ad Spaces</Heading>
                            <Text variant="muted" className="max-w-2xl mx-auto">
                                Design how ads appear on your website. Each ad space can have its own unique styling 
                                to match your site's design perfectly.
                            </Text>
                            </div>

                            {categories.length > 0 ? (
                            <Grid cols={2} gap={6}>
                                {categories.map((category) => (
                                <Card key={category._id} className="border-gray-200">
                                    <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                        <Badge variant="primary" className="mb-2">
                                            {category.spaceType}
                                        </Badge>
                                        <Heading level={4} className="mb-1">
                                            {category.categoryName}
                                        </Heading>
                                        <Text variant="small" className="text-gray-600">
                                            {category.customization ? 'Customized' : 'Default styling'}
                                        </Text>
                                        </div>
                                        <Palette className="text-gray-400" size={24} />
                                    </div>

                                    {/* Preview of current customization */}
                                    {category.customization && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                            <Text variant="small" className="text-gray-500">Size</Text>
                                            <Text variant="small" className="font-medium">
                                                {category.customization.width}×{category.customization.height}px
                                            </Text>
                                            </div>
                                            <div>
                                            <Text variant="small" className="text-gray-500">Layout</Text>
                                            <Text variant="small" className="font-medium capitalize">
                                                {category.customization.orientation || 'horizontal'}
                                            </Text>
                                            </div>
                                            <div>
                                            <Text variant="small" className="text-gray-500">Border Radius</Text>
                                            <Text variant="small" className="font-medium">
                                                {category.customization.borderRadius || 16}px
                                            </Text>
                                            </div>
                                            <div>
                                            <Text variant="small" className="text-gray-500">Effects</Text>
                                            <Text variant="small" className="font-medium">
                                                {category.customization.glassmorphism ? 'Glass' : 'Solid'}
                                            </Text>
                                            </div>
                                        </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleOpenCustomization(category._id)}
                                        variant="secondary"
                                        size="sm"
                                        icon={Palette}
                                        iconPosition="left"
                                        className="w-full"
                                    >
                                        {category.customization ? 'Edit Customization' : 'Customize Ad Space'}
                                    </Button>
                                    </CardContent>
                                </Card>
                                ))}
                            </Grid>
                            ) : (
                            <Card className="p-12 text-center">
                                <Palette className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <Heading level={3} className="mb-3">No Ad Spaces to Customize</Heading>
                                <Text variant="muted" className="mb-6">
                                Create an ad space first, then you can customize how ads appear.
                                </Text>
                                <Button
                                onClick={handleOpenCategoriesForm}
                                variant="secondary"
                                icon={Plus}
                                iconPosition="left"
                                >
                                Create Ad Space
                                </Button>
                            </Card>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            {/* Header + range selector */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-black">Website Analytics</h2>
                                    <p className="text-sm text-gray-500 mt-1">Real visitor data collected by your Yepper script</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {[7, 30, 90].map(d => (
                                        <button key={d}
                                            onClick={() => setAnalyticsRange(d)}
                                            className={`px-4 py-2 text-sm border border-black font-medium transition-colors ${analyticsRange === d ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                        >
                                            {d}d
                                        </button>
                                    ))}
                                    <button onClick={fetchAnalytics} className="px-4 py-2 text-sm border border-black bg-white hover:bg-gray-100 flex items-center gap-1">
                                        <RefreshCw size={14} /> Refresh
                                    </button>
                                </div>
                            </div>

                            {analyticsLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Loading analytics...</p>
                                    </div>
                                </div>
                            ) : !analytics ? (
                                <div className="border border-black p-12 text-center">
                                    <BarChart2 size={48} className="mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-semibold mb-2">No data yet</h3>
                                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                                        Install your Yepper script on your website and visitor data will appear here automatically.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* KPI cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Total Views', value: analytics.totalViews?.toLocaleString() || '0', icon: Eye },
                                            { label: 'Unique Visitors', value: analytics.uniqueVisitors?.toLocaleString() || '0', icon: Users },
                                            { label: 'Monthly Traffic', value: analytics.monthlyTraffic?.toLocaleString() || '0', icon: TrendingUp },
                                            { label: 'Traffic Tier', value: analytics.trafficTier?.charAt(0).toUpperCase() + analytics.trafficTier?.slice(1) || 'Starter', icon: BarChart2 },
                                        ].map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="border border-black p-5 bg-white">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
                                                    <Icon size={16} className="text-gray-400" />
                                                </div>
                                                <p className="text-2xl font-bold text-black">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Daily chart (simple SVG bar chart) */}
                                    {analytics.byDay?.length > 0 && (
                                        <div className="border border-black p-6 bg-white">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Views per Day</h3>
                                            <div className="flex items-end gap-1 h-32">
                                                {(() => {
                                                    const max = Math.max(...analytics.byDay.map(d => d.count), 1);
                                                    return analytics.byDay.map((d, i) => (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                            <div
                                                                style={{ height: `${(d.count / max) * 100}%` }}
                                                                className="w-full bg-black hover:bg-gray-600 transition-colors min-h-[2px]"
                                                            />
                                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">{d.count}</span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                                <span>{analytics.byDay[0]?.date}</span>
                                                <span>{analytics.byDay[analytics.byDay.length - 1]?.date}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Map + country breakdown side by side */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Leaflet map */}
                                        <div className="lg:col-span-2 border border-black">
                                            <div className="px-4 py-3 border-b border-black flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-500" />
                                                <span className="text-sm font-semibold">Visitor Locations</span>
                                                <span className="ml-auto text-xs text-gray-400">{analytics.mapPoints?.length || 0} data points</span>
                                            </div>
                                            <div className="p-2">
                                                <div ref={mapRef} style={{ height: '340px', width: '100%' }} />
                                            </div>
                                            <div className="px-4 py-2 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Desktop</span>
                                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> Mobile</span>
                                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-violet-500" /> Tablet</span>
                                            </div>
                                        </div>

                                        {/* Country breakdown */}
                                        <div className="border border-black">
                                            <div className="px-4 py-3 border-b border-black flex items-center gap-2">
                                                <Globe size={14} className="text-gray-500" />
                                                <span className="text-sm font-semibold">Top Countries</span>
                                            </div>
                                            <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
                                                {analytics.byCountry?.length > 0 ? analytics.byCountry.map((c, i) => {
                                                    const pct = analytics.totalViews > 0
                                                        ? Math.round((c.count / analytics.totalViews) * 100)
                                                        : 0;
                                                    return (
                                                        <div key={i} className="px-4 py-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-medium text-black">{c.country}</span>
                                                                <span className="text-sm text-gray-500">{c.count.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 h-1.5">
                                                                <div className="h-1.5 bg-black" style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No country data yet</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Device breakdown + top referrers + top pages */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Devices */}
                                        <div className="border border-black">
                                            <div className="px-4 py-3 border-b border-black text-sm font-semibold">Devices</div>
                                            <div className="divide-y divide-gray-100">
                                                {analytics.byDevice?.length > 0 ? analytics.byDevice.map((d, i) => {
                                                    const Icon = d.device === 'mobile' ? Smartphone : d.device === 'tablet' ? Tablet : Monitor;
                                                    const pct = analytics.totalViews > 0 ? Math.round((d.count / analytics.totalViews) * 100) : 0;
                                                    return (
                                                        <div key={i} className="px-4 py-3 flex items-center gap-3">
                                                            <Icon size={16} className="text-gray-400 shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between text-sm mb-1">
                                                                    <span className="capitalize">{d.device}</span>
                                                                    <span className="text-gray-500">{pct}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 h-1.5">
                                                                    <div className="h-1.5 bg-black" style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No device data</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Top referrers */}
                                        <div className="border border-black">
                                            <div className="px-4 py-3 border-b border-black text-sm font-semibold">Top Referrers</div>
                                            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                                {analytics.topReferrers?.length > 0 ? analytics.topReferrers.map((r, i) => (
                                                    <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                                                        <span className="text-xs text-black truncate flex-1">{r.referrer || '(direct)'}</span>
                                                        <span className="text-xs text-gray-500 shrink-0">{r.count}</span>
                                                    </div>
                                                )) : (
                                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No referrer data</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Top pages */}
                                        <div className="border border-black">
                                            <div className="px-4 py-3 border-b border-black text-sm font-semibold">Top Pages</div>
                                            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                                {analytics.topPages?.length > 0 ? analytics.topPages.map((p, i) => (
                                                    <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                                                        <span className="text-xs text-black truncate flex-1">{p.path}</span>
                                                        <span className="text-xs text-gray-500 shrink-0">{p.count}</span>
                                                    </div>
                                                )) : (
                                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No page data</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Google Search Console Section ── */}
                            <div className="mt-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-black flex items-center gap-2">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M21.35 11.1h-9.17v2.73h5.51c-.33 1.81-1.87 3.14-3.77 3.14a5.02 5.02 0 01-5.03-5.02 5.02 5.02 0 015.03-5.02c1.22 0 2.33.44 3.19 1.16l2.02-2.02A8.46 8.46 0 0014.51 4c-4.69 0-8.5 3.8-8.5 8.5s3.81 8.5 8.5 8.5c4.91 0 8.17-3.45 8.17-8.3 0-.56-.06-1.1-.17-1.6h-1.16z" fill="#4285F4"/>
                                            </svg>
                                            Organic Traffic (Search Console)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Real clicks & impressions from Google Search — last 28 days</p>
                                    </div>
                                    {gscData?.connected && (
                                        <button
                                            onClick={handleDisconnectGsc}
                                            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
                                        >
                                            Disconnect
                                        </button>
                                    )}
                                </div>

                                {gscLoading ? (
                                    <div className="border border-black p-8 flex items-center justify-center gap-3">
                                        <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                        <span className="text-sm text-gray-500">Loading Search Console data...</span>
                                    </div>
                                ) : !gscData || !gscData.connected ? (
                                    /* Not connected yet */
                                    <div className="border border-dashed border-gray-300 p-10 text-center">
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                                            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M43.6 20.2H24v7.3H35.2c-.9 4.8-5 8.4-11.2 8.4A13.4 13.4 0 0110.6 24a13.4 13.4 0 0113.4-13.4c3.2 0 6.2 1.2 8.5 3.1l5.4-5.4A22.5 22.5 0 0024 2C11.9 2 2 11.9 2 24s9.9 22 22 22c13.1 0 21.8-9.2 21.8-22.1 0-1.5-.2-2.9-.4-4.3l-1.8.6z" fill="#4285F4"/>
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-semibold text-black mb-2">Connect Google Search Console</h3>
                                        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                            See how many people find your site through Google — total clicks, impressions, CTR, and top search queries.
                                        </p>
                                        <button
                                            onClick={handleConnectGsc}
                                            disabled={gscConnecting}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                                        >
                                            {gscConnecting ? (
                                                <>
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.35 11.1h-9.17v2.73h5.51c-.33 1.81-1.87 3.14-3.77 3.14a5.02 5.02 0 01-5.03-5.02 5.02 5.02 0 015.03-5.02c1.22 0 2.33.44 3.19 1.16l2.02-2.02A8.46 8.46 0 0014.51 4c-4.69 0-8.5 3.8-8.5 8.5s3.81 8.5 8.5 8.5c4.91 0 8.17-3.45 8.17-8.3 0-.56-.06-1.1-.17-1.6h-1.16z" fill="white"/></svg>
                                                    Connect with Google
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-400 mt-3">Your website must be verified in Google Search Console first.</p>
                                    </div>
                                ) : gscData.connected && !gscData.siteMatched ? (
                                    /* Connected but no matching GSC property found */
                                    <div className="border border-yellow-300 bg-yellow-50 p-6 text-center">
                                        <p className="text-sm font-semibold text-yellow-800 mb-1">Connected — but no matching property found</p>
                                        <p className="text-xs text-yellow-700 mb-4">
                                            Make sure <strong>{website?.websiteLink}</strong> is verified in your Google Search Console account.
                                        </p>
                                        <button onClick={handleConnectGsc} className="text-xs underline text-yellow-800 hover:text-yellow-900">
                                            Reconnect
                                        </button>
                                    </div>
                                ) : (
                                    /* Connected + data available */
                                    <div className="space-y-6">
                                        {/* KPI cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Total Clicks', value: gscData.summary?.clicks?.toLocaleString() ?? '0', sub: 'from Google Search' },
                                                { label: 'Impressions', value: gscData.summary?.impressions?.toLocaleString() ?? '0', sub: 'times shown in results' },
                                                { label: 'Avg. CTR', value: `${gscData.summary?.ctr ?? 0}%`, sub: 'click-through rate' },
                                                { label: 'Avg. Position', value: gscData.summary?.position ?? '—', sub: 'mean ranking position' },
                                            ].map(({ label, value, sub }) => (
                                                <div key={label} className="border border-black p-5 bg-white">
                                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{label}</p>
                                                    <p className="text-2xl font-bold text-black">{value}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Clicks by day sparkline */}
                                        {gscData.byDay?.length > 0 && (
                                            <div className="border border-black p-6 bg-white">
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Clicks per Day</h3>
                                                <div className="flex items-end gap-1 h-24">
                                                    {(() => {
                                                        const max = Math.max(...gscData.byDay.map(d => d.clicks), 1);
                                                        return gscData.byDay.map((d, i) => (
                                                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                                                                <div
                                                                    style={{ height: `${(d.clicks / max) * 100}%` }}
                                                                    className="w-full bg-blue-500 hover:bg-blue-400 transition-colors min-h-[2px]"
                                                                />
                                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">{d.clicks}</span>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                                <div className="flex justify-between mt-2 text-xs text-gray-400">
                                                    <span>{gscData.byDay[0]?.date}</span>
                                                    <span>{gscData.byDay[gscData.byDay.length - 1]?.date}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Top queries + Top pages side by side */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Top queries */}
                                            <div className="border border-black">
                                                <div className="px-4 py-3 border-b border-black text-sm font-semibold">Top Search Queries</div>
                                                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                                                    {gscData.topQueries?.length > 0 ? gscData.topQueries.map((q, i) => (
                                                        <div key={i} className="px-4 py-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-black truncate flex-1 mr-2">{q.query}</span>
                                                                <span className="text-xs text-gray-500 shrink-0">{q.clicks} clicks</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                <span>{q.impressions.toLocaleString()} imp.</span>
                                                                <span>{q.ctr}% CTR</span>
                                                                <span>#{q.position}</span>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="px-4 py-8 text-center text-sm text-gray-400">No query data yet</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Top pages */}
                                            <div className="border border-black">
                                                <div className="px-4 py-3 border-b border-black text-sm font-semibold">Top Pages (Organic)</div>
                                                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                                                    {gscData.topPages?.length > 0 ? gscData.topPages.map((p, i) => (
                                                        <div key={i} className="px-4 py-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-black truncate flex-1 mr-2">{p.page.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                                                                <span className="text-xs text-gray-500 shrink-0">{p.clicks} clicks</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                <span>{p.impressions.toLocaleString()} imp.</span>
                                                                <span>{p.ctr}% CTR</span>
                                                                <span>#{p.position}</span>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="px-4 py-8 text-center text-sm text-gray-400">No page data yet</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 text-right">
                                            Connected to: {gscData.siteUrl} · Data: {gscData.dateRange?.start} → {gscData.dateRange?.end}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Container>
            )}

            {/* Language Modal */}
            {isLanguageModalOpen && currentCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <Heading level={3}>Set Default Language</Heading>
                            <Text variant="muted" className="mt-1">
                                Choose the default language for your ad space.
                            </Text>
                        </div>
                        
                        <div className="p-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-2">
                                {languages.map(lang => (
                                    <div 
                                        key={lang.value}
                                        className={`p-2 text-sm border cursor-pointer transition-all ${
                                            selectedLanguage === lang.value
                                                ? 'border-black bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedLanguage(lang.value)}
                                    >
                                        <div className="flex items-center">
                                            {selectedLanguage === lang.value && (
                                                <div className="w-4 h-4 bg-black flex items-center justify-center mr-2">
                                                    <Check size={10} className="text-white" />
                                                </div>
                                            )}
                                            <span>{lang.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            <Button
                                onClick={() => setIsLanguageModalOpen(false)}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveLanguage}
                                variant="primary"
                                size="sm"
                            >
                                Save
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && selectedAd && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-black max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Heading level={3}>Reject Ad</Heading>
                            <button
                                onClick={closeRejectModal}
                                className="text-gray-400 hover:text-black"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <Text className="mb-2">
                                Rejecting: <strong>{selectedAd.businessName}</strong>
                            </Text>
                            <Text className="mb-4">
                                Refund: <strong>{formatCurrency(selectedAd.paymentAmount)}</strong>
                            </Text>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-black mb-2">
                                Reason for rejection
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
                                rows={3}
                                placeholder="Why are you rejecting this ad?"
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={closeRejectModal}
                                disabled={rejecting === selectedAd._id}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleRejectAd}
                                disabled={!rejectionReason.trim() || rejecting === selectedAd._id}
                                icon={rejecting === selectedAd._id ? RefreshCw : null}
                                iconPosition="left"
                            >
                                {rejecting === selectedAd._id ? 'Rejecting...' : 'Reject Ad'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}


                    {customizationModal.isOpen && (
                <AdCustomizationModal
                    categoryId={customizationModal.categoryId}
                    onClose={handleCloseCustomization}
                    onSave={handleCustomizationSave}
                />
            )}

            {categoryToDelete && (
                <DeleteCategoryModal 
                    categoryId={categoryToDelete._id}
                    category={categoryToDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                    onCancel={() => setCategoryToDelete(null)}
                />
            )}
            
            {/* Category Form Modal */}
            {categoriesForm && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-red-500 backdrop-blur-sm" />
                    
                    <div className="relative w-full h-full bg-black overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-black backdrop-blur-xl border-b border-white/10">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex justify-end items-center h-16">
                                    <button
                                        onClick={handleCloseCategoriesForm}
                                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-white/80" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-7xl mx-auto px-6">
                            <AddNewCategory onSubmitSuccess={handleCloseCategoriesForm} monthlyTraffic={website?.monthlyTraffic} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebsiteDetails;