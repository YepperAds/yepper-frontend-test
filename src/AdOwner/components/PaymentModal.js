// PaymentModal.js
import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert, Heading, Text } from '../../components/components';

const PaymentModal = ({ ad, websiteId, onClose }) => {
    const { user, token } = useAuth();
    const [email, setEmail] = useState('icyatwandoba@gmail.com');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const userId = user?.id || user?._id || user?.userId;

    const initiatePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!ad?._id || !websiteId) {
                setError('Missing ad or website information');
                setLoading(false);
                return;
            }

            if (!userId) {
                setError('User authentication required. Please log in again.');
                setLoading(false);
                return;
            }

            console.log('Token available:', !!token);
            console.log('User ID:', userId);

            const websiteSelection = ad.websiteStatuses?.find(
                status => status.websiteId === websiteId
            ) || ad.websiteSelections?.find(
                selection => selection.websiteId === websiteId || selection.websiteId._id === websiteId
            );

            if (!websiteSelection) {
                setError('Website selection not found');
                setLoading(false);
                return;
            }

            const totalPrice = websiteSelection.categories?.reduce(
                (sum, cat) => sum + (cat.price || 0), 0
            ) || 0;

            if (totalPrice <= 0) {
                setError('Invalid payment amount');
                setLoading(false);
                return;
            }

            const requestConfig = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (token) {
                requestConfig.headers.Authorization = `Bearer ${token}`;
            }

            console.log('Request headers:', requestConfig.headers);

            const response = await axios.post('https://yepper-backend.onrender.com/api/web-advertise/initiate-payment', {
                adId: ad._id,
                websiteId,
                amount: totalPrice,
                email: email || undefined,
                userId
            }, requestConfig);

            if (response.data.success && response.data.paymentLink) {
                window.location.href = response.data.paymentLink;
            } else {
                setError(response.data.message || 'Payment link generation failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'An error occurred. Please try again.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data.message || 'Invalid request data.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-black max-w-md w-full mx-4">
                <div className="flex justify-between items-center p-6 border-b border-black">
                    <Heading level={3}>Complete Payment</Heading>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 border border-black"
                    >
                        <X size={16} />
                    </button>
                </div>
                
                <div className="p-6">
                    {error && (
                        <Alert variant="error" className="mb-6">
                            {error}
                        </Alert>
                    )}
                    
                    <Input
                        type="email"
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="mb-6"
                    />
                    
                    <div className="flex gap-3">
                        <Button
                            onClick={initiatePayment}
                            disabled={loading}
                            loading={loading}
                            variant="secondary"
                            className="flex-1"
                        >
                            Pay Now
                        </Button>
                        
                        <Button
                            onClick={onClose}
                            disabled={loading}
                            variant="primary"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-black">
                        <Text variant="muted" className="block">Debug: User ID: {userId}</Text>
                        <Text variant="muted" className="block">Debug: Token: {token ? 'Present' : 'Missing'}</Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;