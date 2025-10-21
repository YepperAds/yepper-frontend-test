// WebsiteDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {  
    X,
    ChevronDown,
    Code,
    AlertCircle,
    ArrowLeft,
    Plus,
    Trash2,
    Edit,
    Check,
    Palette,
    Copy,
    XCircle,
    RefreshCw
} from 'lucide-react';
import CodeDisplay from '../components/codeDisplay';
import AddNewCategory from './addNewCategory';
import { Button, Card, CardContent, Heading, Text, Input, Badge, Grid, Container } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import AdModalData from '../components/adModalData'
import DeleteCategoryModal from '../components/DeleteCategoryModal';

const WebsiteDetails = () => {
    const navigate = useNavigate();
    const { websiteId } = useParams();
    const { user, token } = useAuth();
    const [result, setResult] = useState(true);
    const [website, setWebsite] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [categoriesForm, setCategoriesForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isEditingWebsiteName, setIsEditingWebsiteName] = useState(false);
    const [tempWebsiteName, setTempWebsiteName] = useState('');
    const [editingUserCount, setEditingUserCount] = useState(null);
    const [newUserCount, setNewUserCount] = useState('');
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('english');
    const [activeTab, setActiveTab] = useState('spaces');
    const [copiedText, setCopiedText] = useState('');
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

    const authenticatedAxios = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        fetchWebsiteData();
        if (token) {
            fetchAdsData();
            fetchWalletBalance();
        }
    }, [websiteId, token]);
    
    const { data: websites } = useQuery({
        queryKey: ['websites', user?._id || user?.id],
        queryFn: async () => {
            try {
                const userId = user?._id || user?.id;
                const response = await authenticatedAxios.get(`/createWebsite/${userId}`);
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
            const websiteResponse = await axios.get(`http://localhost:5000/api/createWebsite/website/${websiteId}`);
            const categoriesResponse = await axios.get(`http://localhost:5000/api/ad-categories/${websiteId}`);
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
                authenticatedAxios.get('/ad-categories/pending-rejections'),
                authenticatedAxios.get('/ad-categories/active-ads')
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
            const response = await authenticatedAxios.get('/ad-categories/wallet');
            setWalletBalance(response.data.wallet?.balance || 0);
        } catch (error) {
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

    const handleRejectAd = async () => {
        if (!selectedAd || !rejectionReason.trim()) return;

        setRejecting(selectedAd._id);
        try {
            const websiteSelection = selectedAd.websiteSelections.find(sel => sel.approved && !sel.isRejected);
            
            await authenticatedAxios.post(
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
            const errorMessage = error.response?.data?.error || 'Failed to reject ad';
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
            const response = await axios.patch(`http://localhost:5000/api/createWebsite/${websiteId}/name`, {
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
    
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    };
    
    const handleCategoryClick = (id) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };
    
    const CodeBlock = ({ code, label }) => (
        <div className="relative bg-black rounded-lg p-4 border border-gray-700">
            <button
                onClick={() => copyToClipboard(code, label)}
                className="absolute top-2 right-2 p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
            >
                {copiedText === label ? (
                    <Check size={16} className="text-green-400" />
                ) : (
                    <Copy size={16} className="text-gray-400" />
                )}
            </button>
            <pre className="text-sm text-gray-300 overflow-x-auto pr-12">
                <code>{code}</code>
            </pre>
        </div>
    );
    
    const customizations = [
    {
      title: "Change Colors",
      code: `
.yepper-ad-item {
    background: rgba(0, 100, 200, 0.25) !important;
}`,
      description: "Make ads blue"
    },
    {
      title: "Round Corners",
      code: `
.yepper-ad-item {
    border-radius: 20px !important;
}`,
      description: "Make ads more rounded"
    },
    {
      title: "Custom Button",
      code: `
.yepper-ad-cta {
    background: #ff6b6b !important;
    color: white !important;
}`,
      description: "Red button style"
    }
  ];

    const handleOpenCategoriesForm = () => {
        setCategoriesForm(true);
        setResult(false);
    };

    const handleUserCountEdit = (category) => {
        setEditingUserCount(category._id);
        setNewUserCount(category.userCount.toString());
    };

    const handleUserCountSave = async (categoryId) => {
        try {
            const parsedCount = parseInt(newUserCount, 10);
            
            if (isNaN(parsedCount) || parsedCount < 0) {
                return;
            }

            const response = await axios.put(`http://localhost:5000/api/ad-categories/${categoryId}/reset-user-count`, {
                newUserCount: parsedCount
            });

            const updatedCategories = categories.map(cat => 
                cat._id === categoryId 
                    ? { ...cat, userCount: response.data.category.userCount } 
                    : cat
            );
            setCategories(updatedCategories);

            setEditingUserCount(null);
            setNewUserCount('');

        } catch (error) {
            
            const errorMessage = error.response?.data?.message || 'Failed to update user count';
        }
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

    const handleOpenLanguageModal = (category) => {
        setCurrentCategory(category);
        setSelectedLanguage(category.defaultLanguage || 'english');
        setIsLanguageModalOpen(true);
    };

    const handleSaveLanguage = async () => {
        if (!currentCategory) return;
        
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/ad-categories/category/${currentCategory._id}/language`,
                { defaultLanguage: selectedLanguage }
            );
            
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
                            </div>
                        </div>
                    </div>
                    
                    {activeTab === 'spaces' && (
                        <div>
                            <div className="text-center mb-12">
                                <Button
                                    onClick={handleOpenCategoriesForm}
                                    variant="secondary"
                                    size="lg"
                                    icon={Plus}
                                    iconPosition="left"
                                >
                                    Add New Ad Space
                                </Button>
                            </div>

                            {/* Website Spaces */}
                            <div className="mb-12">
                                {categories.length > 0 ? (
                                    <Grid cols={2} gap={6}>
                                        {categories.map((category) => (
                                            <Card key={category._id} className="border-gray-200">
                                                <div 
                                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => handleCategoryClick(category._id)}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <Badge variant="primary" className="mb-2">
                                                                    {category.spaceType}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div 
                                                            className={`p-2 transition-transform duration-300 ${
                                                                expandedCategory === category._id ? 'rotate-180' : ''
                                                            }`}
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Metrics */}
                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div className="border border-gray-200 p-3">
                                                            <div className="flex items-center mb-1">
                                                                <Text variant="small">Price</Text>
                                                            </div>
                                                            <Text variant="large" className="font-semibold">${category.price}</Text>
                                                        </div>
                                                        
                                                        <div className="border border-gray-200 p-3">
                                                            {editingUserCount === category._id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <input 
                                                                        type="number" 
                                                                        value={newUserCount}
                                                                        onChange={(e) => setNewUserCount(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                handleUserCountSave(category._id);
                                                                            } else if (e.key === 'Escape') {
                                                                                setEditingUserCount(null);
                                                                                setNewUserCount('');
                                                                            }
                                                                        }}
                                                                        className="w-16 px-1 py-1 text-sm border border-gray-300 focus:outline-none focus:border-black"
                                                                        autoFocus
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleUserCountSave(category._id)}
                                                                        className="text-green-600 hover:bg-green-50 p-1"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setEditingUserCount(null);
                                                                            setNewUserCount('');
                                                                        }}
                                                                        className="text-red-600 hover:bg-red-50 p-1"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleUserCountEdit(category)
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <div className="flex items-center mb-1">
                                                                        <Text variant="small">Users</Text>
                                                                    </div>
                                                                    <Text variant="large" className="font-semibold">{category.userCount}</Text>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div 
                                                            className="border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenLanguageModal(category);
                                                            }}
                                                        >
                                                            <div className="flex items-center mb-1">
                                                                <Text variant="small">Language</Text>
                                                            </div>
                                                            <Text variant="large" className="font-semibold capitalize">
                                                                {category.defaultLanguage || 'English'}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>

                                                {expandedCategory === category._id && (
                                                    <>
                                                        <CardContent className="border-t border-gray-200 bg-gray-50">
                                                            {category.instructions && (
                                                                <div className="mb-6">
                                                                    <div className="flex items-center mb-3">
                                                                        <Text variant="small" className="font-medium uppercase tracking-wide">
                                                                            Instructions
                                                                        </Text>
                                                                    </div>
                                                                    <div className="border border-gray-200 bg-white p-4">
                                                                        <Text>{category.instructions}</Text>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <div>
                                                                <div className="flex items-center mb-3">
                                                                    <Text variant="small" className="font-medium uppercase tracking-wide">
                                                                        Integration Code
                                                                    </Text>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <CodeDisplay codes={category.apiCodes} />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        
                                                        <div className="p-4 border-t border-gray-200">
                                                            <Button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleDeleteCategory(category);
                                                                }}
                                                                variant="danger"
                                                                size="sm"
                                                                icon={Trash2}
                                                                iconPosition="left"
                                                            >
                                                                Delete Space
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </Card>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Card className="p-12 text-center">
                                        <Heading level={3} className="mb-3">No Ad Spaces Yet</Heading>
                                    </Card>
                                )}
                            </div>
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
                            {/* Introduction */}
                            <Card className="mb-8">
                                <CardContent className="p-6">
                                    <Heading level={2} className="mb-4 flex items-center">
                                        <Palette className="w-6 h-6 mr-3" />
                                        Customize Your Ads
                                    </Heading>
                                    <Text className="mb-4">
                                        Copy any code below and add it to your website's CSS to change how your ads look.
                                    </Text>
                                    <div className="bg-gray-50 border border-gray-200 p-3">
                                        <Text variant="small">
                                            <strong>Tip:</strong> Always add <code className="bg-gray-200 px-1 rounded">!important</code> to make sure your styles work.
                                        </Text>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customization Examples */}
                            <div className="space-y-6 mb-8">
                                {customizations.map((example, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <Heading level={3}>{example.title}</Heading>
                                                <Text variant="small" className="text-gray-600">{example.description}</Text>
                                            </div>
                                            <CodeBlock code={example.code} label={example.title} />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* How to Use */}
                            <Card className="mb-8">
                                <CardContent className="p-6">
                                    <Heading level={3} className="mb-4 flex items-center">
                                        <Code className="w-5 h-5 mr-2" />
                                        How to Use This Code
                                    </Heading>
                                    <div className="space-y-6">
                                        <div>
                                            <Heading level={4} className="mb-2">Method 1: Add to your CSS file</Heading>
                                            <CodeBlock 
                                                code={`/* Paste the code in your main CSS file */
.yepper-ad-item {
    /* Your custom styles here */
}`}
                                                label="css-method"
                                            />
                                        </div>
                                        <div>
                                            <Heading level={4} className="mb-2">Method 2: Add to your HTML</Heading>
                                            <CodeBlock 
                                                code={`<style>
    /* Paste the code here */
    .yepper-ad-item {
        /* Your custom styles here */
    }
</style>`}
                                                label="html-method"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ad HTML Structure */}
                            <Card className="mb-8">
                                <CardContent className="p-6">
                                    <Heading level={3} className="mb-4">How Your Ad HTML Looks</Heading>
                                    <Text className="mb-4">This is the basic structure of your ads. Use these class names to style them:</Text>
                                    <CodeBlock 
                                        code={`<div class="yepper-ad-wrapper">
    <div class="yepper-ad-container">
        <div class="yepper-ad-item">
            
            <!-- Top section -->
            <div class="yepper-ad-header">
                <span class="yepper-ad-header-logo">Ad by Yepper</span>
                <span class="yepper-ad-header-badge">Sponsored</span>
            </div>
            
            <!-- Main content -->
            <div class="yepper-ad-content">
                <div class="yepper-ad-image-wrapper">
                    <img class="yepper-ad-image" src="ad-image.jpg" alt="Ad">
                </div>
                <h3 class="yepper-ad-business-name">Business Name</h3>
                <p class="yepper-ad-description">Ad description text</p>
                <button class="yepper-ad-cta">Click Here</button>
            </div>
            
            <!-- Bottom section -->
            <div class="yepper-ad-footer">
                <span class="yepper-ad-footer-brand">Powered by Yepper</span>
                <span class="yepper-ad-footer-business">Business Info</span>
            </div>
            
        </div>
    </div>
</div>`}
                                        label="ad-html-structure"
                                    />
                                </CardContent>
                            </Card>

                            {/* Common Classes */}
                            <Card>
                                <CardContent className="p-6">
                                    <Heading level={3} className="mb-4">Classes You Can Style</Heading>
                                    <Grid cols={2} gap={4}>
                                        {[
                                            { class: '.yepper-ad-wrapper', desc: 'Outer wrapper container' },
                                            { class: '.yepper-ad-container', desc: 'Inner container' },
                                            { class: '.yepper-ad-item', desc: 'Main ad card' },
                                            { class: '.yepper-ad-header', desc: 'Top section ("Ad by Yepper")' },
                                            { class: '.yepper-ad-header-logo', desc: 'Yepper branding text' },
                                            { class: '.yepper-ad-header-badge', desc: 'Sponsored badge' },
                                            { class: '.yepper-ad-content', desc: 'Main content area' },
                                            { class: '.yepper-ad-image-wrapper', desc: 'Image container' },
                                            { class: '.yepper-ad-image', desc: 'The actual ad image' },
                                            { class: '.yepper-ad-business-name', desc: 'Business title (h3)' },
                                            { class: '.yepper-ad-description', desc: 'Ad description text (p)' },
                                            { class: '.yepper-ad-cta', desc: 'Click button' },
                                            { class: '.yepper-ad-footer', desc: 'Bottom section' },
                                            { class: '.yepper-ad-footer-brand', desc: 'Powered by Yepper text' },
                                            { class: '.yepper-ad-footer-business', desc: 'Business info text' }
                                        ].map((item, index) => (
                                            <div key={index} className="border border-gray-200 p-3">
                                                <div className="flex items-center justify-between">
                                                    <code className="text-black font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                        {item.class}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(item.class, item.class)}
                                                        className="p-1 hover:bg-gray-100 transition-colors border border-gray-300"
                                                    >
                                                        {copiedText === item.class ? (
                                                            <Check size={14} className="text-green-600" />
                                                        ) : (
                                                            <Copy size={14} className="text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                                <Text variant="small" className="mt-1">{item.desc}</Text>
                                            </div>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
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
                            <AddNewCategory onSubmitSuccess={handleCloseCategoriesForm} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebsiteDetails;