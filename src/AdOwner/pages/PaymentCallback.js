// PaymentCallback.js — XentriPay version
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Text, Heading, Container } from '../../components/components';
import api from '../../utils/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      // XentriPay redirects with ?reference=... or ?tx_ref=...
      const reference = searchParams.get('reference') || searchParams.get('tx_ref');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await api.post('/api/web-advertise/payment/verify', {
          tx_ref: reference,
        });

        if (response.data.success) {
          setStatus('success');
          setMessage('Payment successful! Your ad is now live.');
        } else {
          setStatus('failed');
          setMessage('Payment verification failed');
        }
      } catch (error) {
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getTitle = () => {
    switch (status) {
      case 'verifying': return 'Verifying Payment...';
      case 'success':   return 'Payment Successful!';
      case 'failed':    return 'Payment Failed';
      default:          return 'Processing...';
    }
  };

  const getTitleColor = () => {
    switch (status) {
      case 'verifying': return 'text-gray-500';
      case 'success':   return 'text-green-600';
      case 'failed':    return 'text-red-600';
      default:          return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <Heading level={2} className={`mb-4 ${getTitleColor()}`}>
            {getTitle()}
          </Heading>

          <Text variant="muted" className="mb-8">
            {message}
          </Text>

          <div className="space-y-4">
            {status === 'success' && (
              <Button onClick={() => navigate('/')} variant="secondary" size="lg">
                Go to Dashboard
              </Button>
            )}

            {status === 'failed' && (
              <div className="space-y-2">
                <Button onClick={() => navigate(-1)} variant="secondary" size="lg">
                  Try Again
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" size="lg">
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PaymentCallback;
