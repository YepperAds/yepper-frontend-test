import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Grid, Badge, Container } from '../../components/components';
import LoadingSpinner from "../../components/LoadingSpinner";
import api from '../../utils/api';


const Ads = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAds, setFilteredAds] = useState([]);

    useEffect(() => {
        if (user && token) {
            fetchUserAds();
        }
    }, [user, token]);

    useEffect(() => {
        if (!ads) return;

        const performSearch = () => {
            const query = searchQuery.toLowerCase().trim();
            
            // ONLY show incomplete OR active ads
            let statusFiltered = ads.filter(ad => {
                const isIncomplete = !ad.websiteSelections || ad.websiteSelections.length === 0;
                const hasActive = ad.websiteSelections && 
                    ad.websiteSelections.some(ws => ws.status === 'active' && !ws.isRejected);
                
                return isIncomplete || hasActive;
            });

            // Apply specific filter
            if (selectedFilter === 'incomplete') {
                statusFiltered = statusFiltered.filter(ad => 
                    !ad.websiteSelections || ad.websiteSelections.length === 0
                );
            } else if (selectedFilter === 'active') {
                statusFiltered = statusFiltered.filter(ad => 
                    ad.websiteSelections && 
                    ad.websiteSelections.some(ws => ws.status === 'active' && !ws.isRejected)
                );
            }

            // Apply search query
            if (!query) {
                setFilteredAds(statusFiltered);
                return;
            }

            const searched = statusFiltered.filter(ad => {
                const searchFields = [
                    ad.businessName?.toLowerCase(),
                    ad.adDescription?.toLowerCase(),
                ];
                return searchFields.some(field => field?.includes(query));
            });
            
            setFilteredAds(searched);
        };

        performSearch();
    }, [searchQuery, selectedFilter, ads]);

    const fetchUserAds = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/web-advertise/my-ads');
            
            if (response.data.success) {
                const adsData = response.data.ads || [];
                setAds(adsData);
                setFilteredAds(adsData);
            } else {
                setAds([]);
                setFilteredAds([]);
            }
        } catch (error) {
            setAds([]);
            setFilteredAds([]);
        } finally {
            setLoading(false);
        }
    };

    const getAdStatus = (ad) => {
        // Check if no websites selected (incomplete ad)
        if (!ad.websiteSelections || ad.websiteSelections.length === 0) {
            return { 
                status: 'Incomplete',
                label: 'Needs Website Selection',
                color: 'bg-orange-100 text-orange-800',
                action: 'Complete Setup'
            };
        }
        
        // Check if has active websites
        const hasActiveSelections = ad.websiteSelections.some(
            ws => ws.status === 'active' && !ws.isRejected
        );
        
        if (hasActiveSelections) {
            return { 
                status: 'Active',
                label: 'Live',
                color: 'bg-green-100 text-green-800',
                action: null
            };
        }
        
        return null; // Hide everything else
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const formatNumber = (number) => {
        if (number >= 1000 && number < 1000000) {
            return (number / 1000).toFixed(1) + 'K';
        } else if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        }
        return number;
    };

    const handleActionButton = (ad, statusInfo) => {
        if (statusInfo.status === 'Incomplete') {
            // Navigate to complete the ad setup
            navigate('/update-ad-selections', {
                state: { adId: ad._id, isUpdate: true }
            });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-gray-200 bg-white">
                <Container>
                    <div className="h-16 flex items-center justify-between">
                        <Link to='/'>
                            <button 
                                className="flex items-center text-gray-600 hover:text-black transition-colors"
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                <span className="font-medium">Back</span>
                            </button>
                        </Link>
                        <Badge variant="default">Ad</Badge>
                    </div>
                </Container>
            </header>
            <div className="max-w-6xl mx-auto px-4 py-12">

                <div className='flex justify-between items-center gap-4 mb-8'>
                    {/* Search Section */}
                    <div className="flex justify-start flex-1">
                        <div className="relative w-full max-w-md">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search my campaigns..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Add Button */}
                    <div className="flex-shrink-0">
                        <Button
                            onClick={() => navigate('/upload-ad')}
                            variant="secondary"
                            size="lg"
                            icon={Plus}
                            iconPosition="left"
                        >
                            Add New Ad
                        </Button>
                    </div>

                    <div className="flex-shrink-0">
                        <Button
                            onClick={() => navigate('/upload-ad')}
                            variant="secondary"
                            size="lg"
                            icon={Plus}
                            iconPosition="left"
                        >
                            Add Website
                        </Button>
                    </div>
                </div>
                
                {/* Campaigns Grid */}
                {filteredAds.length > 0 ? (
                    <Grid cols={3} gap={6}>
                        {filteredAds.slice().reverse().map((ad, index) => {
                            const statusInfo = getAdStatus(ad);
                            
                            // Add null check
                            if (!statusInfo) return null;
                            
                            return (
                                <div 
                                    key={ad._id || index}
                                    className="border border-black bg-white transition-all duration-200 hover:bg-gray-50"
                                >
                                    {/* Rest of your JSX */}
                                    <div className="h-48 border-b border-black">
                                        {ad.videoUrl ? (
                                            <video 
                                                autoPlay 
                                                loop 
                                                muted 
                                                className="w-full h-full object-cover"
                                            >
                                                <source src={ad.videoUrl} type="video/mp4" />
                                            </video>
                                        ) : ad.imageUrl ? (
                                            <img 
                                                src={ad.imageUrl} 
                                                alt={ad.businessName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-black">{ad.businessName}</h3>
                                        </div>
                                        
                                        <div className="border border-gray-200 p-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Status:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {statusInfo.status === 'Active' && (
                                            <div className="flex items-center justify-between mb-4 border border-gray-200 p-3">
                                                <div className="flex items-center">
                                                    <div className='flex justify-center gap-1 items-center'>
                                                        <div className="text-xs text-gray-600">Views</div>
                                                        <div className="text-sm font-semibold text-black">{formatNumber(ad.views || 0)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className='flex justify-center gap-1 items-center'>
                                                        <div className="text-xs text-gray-600">Clicks</div>
                                                        <div className="text-sm font-semibold text-black">{formatNumber(ad.clicks || 0)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Link to={`/ad-details/${ad._id}`}>
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full flex items-center justify-center space-x-2"
                                                >
                                                    <span>View Campaign</span>
                                                </Button>
                                            </Link>

                                            {statusInfo.action && (
                                                <Button 
                                                    onClick={() => handleActionButton(ad, statusInfo)}
                                                    variant="outline" 
                                                    className={`w-full flex items-center justify-center space-x-1 text-xs ${
                                                        statusInfo.status === 'Incomplete' 
                                                            ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                                                            : statusInfo.status === 'Pending Payment'
                                                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                                                            : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    <span>{statusInfo.action}</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Grid>
                ) : (
                    <div className="flex items-center justify-center min-h-96">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold mb-4 text-black">
                                {searchQuery ? 'No Campaigns Found' : 'No Campaigns Yet'}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {searchQuery 
                                    ? 'Try adjusting your search terms or filters'
                                    : 'Create your first campaign to get started'
                                }
                            </p>
                            <Button 
                                onClick={() => navigate('/upload-ad')}
                                variant="secondary"
                                size="lg"
                                icon={Plus}
                                iconPosition="left"
                            >
                                Create Your First Campaign
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ads;