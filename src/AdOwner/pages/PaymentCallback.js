// PaymentCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button, Text, Heading, Container } from '../../components/components';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get('transaction_id');
      const txRef = searchParams.get('tx_ref');
      
      if (!transactionId) {
        setStatus('failed');
        setMessage('No transaction ID found');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/web-advertise/payment/verify', {
          transaction_id: transactionId
        });

        if (response.data.success) {
          setStatus('success');
          setMessage('Payment successful! Your ad is now live.');
        } else {
          setStatus('failed');
          setMessage('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 size={64} className="text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle size={64} className="text-green-600" />;
      case 'failed':
        return <XCircle size={64} className="text-red-600" />;
      default:
        return <Loader2 size={64} className="text-blue-600 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            {getIcon()}
          </div>
          
          <Heading level={2} className="mb-4">
            {getTitle()}
          </Heading>
          
          <Text variant="muted" className="mb-8">
            {message}
          </Text>

          <div className="space-y-4">
            {status === 'success' && (
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="secondary"
                size="lg"
              >
                Go to Dashboard
              </Button>
            )}
            
            {status === 'failed' && (
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  size="lg"
                >
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