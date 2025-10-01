// AdModalData.js
import React, { useEffect } from 'react';
import { Globe, Eye, XCircle, Clock, CheckCircle, MousePointer, ExternalLink, Mail, Phone, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/components';

function AdModalData({ 
  adModalData, 
  closeAdModal, 
  formatCurrency, 
  formatDate, 
  getTimeRemaining 
}) {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !token) {
            navigate('/login');
            return;
        }
    }, [user, token, navigate]);

    // If no data is provided, don't render anything
    if (!adModalData) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-black z-10">
                <div className="flex justify-between items-center px-3 py-4">
                    <div className='px-3'>
                        <h1 className="text-3xl font-bold text-black">{adModalData.businessName}</h1>
                    </div>
                    <button
                        onClick={closeAdModal}
                        className="p-3 border border-black hover:bg-gray-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                {adModalData.imageUrl && (
                    <div className="mb-12">
                        <img 
                            src={adModalData.imageUrl} 
                            alt={adModalData.businessName}
                            className="w-full max-h-96 object-contain bg-gray-50 border border-gray-200"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-black mb-4">Campaign Description</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">{adModalData.adDescription}</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-black mb-6">Performance</h2>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-gray-50 border border-gray-200">
                                    <div className="text-4xl font-bold text-black mb-2">{adModalData.views || 0}</div>
                                    <div className="text-gray-600 flex items-center justify-center">
                                        Views
                                    </div>
                                </div>
                                <div className="text-center p-6 bg-gray-50 border border-gray-200">
                                    <div className="text-4xl font-bold text-black mb-2">{adModalData.clicks || 0}</div>
                                    <div className="text-gray-600 flex items-center justify-center">
                                        Clicks
                                    </div>
                                </div>
                                <div className="text-center p-6 bg-gray-50 border border-gray-200">
                                    <div className="text-4xl font-bold text-black mb-2">
                                        {adModalData.views > 0 ? ((adModalData.clicks || 0) / adModalData.views * 100).toFixed(1) : '0.0'}%
                                    </div>
                                    <div className="text-gray-600">CTR</div>
                                </div>
                            </div>
                        </div>

                        {/* Target Website */}
                        {adModalData.currentWebsite && (
                            <div>
                                <h2 className="text-2xl font-bold text-black mb-4">Showing on</h2>
                                <div className="flex items-center p-6 bg-gray-50 border border-gray-200">
                                    {adModalData.currentWebsite.imageUrl ? (
                                        <img 
                                            src={adModalData.currentWebsite.imageUrl} 
                                            alt={adModalData.currentWebsite.websiteName}
                                            className="w-16 h-16 object-contain mr-6"
                                        />
                                    ) : (
                                        <Globe size={64} className="mr-6 text-gray-400" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-black">{adModalData.currentWebsite.websiteName}</h3>
                                        <a 
                                            href={adModalData.currentWebsite.websiteLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-black flex items-center mt-1"
                                        >
                                            <ExternalLink className="mr-2" size={16} />
                                            {adModalData.currentWebsite.websiteLink}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-black mb-4">Status</h3>
                            <div className="flex items-center mb-4">
                                <span className={`text-lg font-semibold ${
                                    adModalData.status === 'active' ? 'text-gray-600' :
                                    adModalData.status === 'pending' ? 'text-gray-600' :
                                    'text-gray-600'
                                }`}>
                                    {adModalData.status?.charAt(0).toUpperCase() + adModalData.status?.slice(1) || 'Unknown'}
                                </span>
                            </div>
                            
                            {adModalData.websiteSelection?.rejectionDeadline && adModalData.status === 'pending' && getTimeRemaining && (
                                <div className="text-sm text-gray-600">
                                    <strong>Deadline:</strong> {getTimeRemaining(adModalData.websiteSelection.rejectionDeadline)}
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-black mb-4">Payment</h3>
                            <div className="text-3xl font-bold text-gray-600 mb-2">
                                {formatCurrency ? formatCurrency(adModalData.paymentAmount) : `$${adModalData.paymentAmount || 0}`}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-black mb-4">Contact</h3>
                            <div className="space-y-3">
                                {adModalData.adOwnerEmail && (
                                    <div className="text-sm flex gap-2 items-center">
                                        <span className="font-bold text-black">Email:</span>
                                        <span className="text-gray-600">{adModalData.adOwnerEmail}</span>
                                    </div>
                                )}
                                {adModalData.businessLocation && (
                                    <div className="text-sm flex gap-2 items-center">
                                        <span className="font-bold text-black">Location:</span>
                                        <div className="text-gray-600">{adModalData.businessLocation}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-black mb-4">Timeline</h3>
                            <div className="space-y-3 text-sm">
                                {adModalData.createdAt && (
                                    <div className="text-sm flex gap-2 items-center">
                                        <span className="font-bold text-black">Created:</span>
                                        <div className="text-gray-600">
                                            {formatDate ? formatDate(adModalData.createdAt) : new Date(adModalData.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {adModalData.imageUrl && (
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => window.open(adModalData.imageUrl, '_blank')}
                                >
                                    View Full Size Image
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdModalData;