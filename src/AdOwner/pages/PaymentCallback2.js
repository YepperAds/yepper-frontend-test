// PaymentCallback2.js - Fixed version
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Text, Heading, Container } from '../../components/components';
import api from '../../utils/api';


const PaymentCallback2 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [details, setDetails] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebug = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { timestamp, message, data }]);
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    // Try multiple common token storage keys
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwt', 'userToken'];
    
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) {
        addDebug(`Found auth token in ${key}`);
        return token;
      }
    }
    
    addDebug('No auth token found in storage');
    return null;
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get('transaction_id');
      const txRef = searchParams.get('tx_ref');
      const flwStatus = searchParams.get('status');
      
      addDebug('Payment callback started', {
        transactionId,
        txRef,
        flwStatus,
        allParams: Object.fromEntries(searchParams.entries())
      });
      
      if (!transactionId && !txRef) {
        addDebug('ERROR: No transaction ID or reference found');
        setStatus('failed');
        setMessage('No transaction ID or reference found in the callback URL');
        return;
      }

      if (flwStatus === 'cancelled' || flwStatus === 'failed') {
        addDebug('Payment cancelled/failed by Flutterwave', { status: flwStatus });
        setStatus('failed');
        setMessage('Payment was cancelled or failed');
        return;
      }

      // Create authenticated axios instance
      const authAxios = createAuthenticatedAxios();
      const token = getAuthToken();

      if (!token) {
        addDebug('WARNING: No authentication token found');
        setStatus('error');
        setMessage('Authentication required. Please log in and try again.');
        setDetails({
          error: 'No auth token',
          suggestion: 'Please log in to your account and retry the payment',
          redirect: '/login'
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        setMessage('Verifying payment with server...');
        addDebug('Sending verification request with auth...');
        
        const requestData = {
          transaction_id: transactionId,
          tx_ref: txRef
        };
        
        addDebug('Verification request details', {
          url: '/api/web-advertise/payment/verify-with-refund',
          data: requestData,
          hasAuth: !!token,
          method: 'POST'
        });
        
        // Try public callback route first (for payment callbacks)
        const response = await api.post(
          '/api/web-advertise/payment/verify-callback', 
          requestData,
          {
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        addDebug('Verification response received', {
          status: response.status,
          data: response.data
        });

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Payment successful! Your ad is now live.');
          setDetails(response.data);
          addDebug('Payment verification successful');
          
          // Redirect to dashboard after success
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Payment verification failed');
          setDetails(response.data);
          addDebug('Payment verification failed', response.data);
        }
      } catch (error) {
        addDebug('Payment verification error', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        });

        setStatus('error');
        
        if (error.code === 'ECONNABORTED') {
          setMessage('Verification timed out. Please check your payment status in the dashboard.');
        } else if (error.response) {
          const statusCode = error.response.status;
          const errorData = error.response.data;
          
          switch (statusCode) {
            case 400:
              if (errorData?.error?.includes('Transaction ID required')) {
                setMessage('Invalid transaction data received from payment gateway');
              } else if (errorData?.message?.includes('token') || errorData?.message?.includes('auth')) {
                setMessage('Authentication expired. Please log in and retry.');
                setTimeout(() => navigate('/login'), 3000);
              } else {
                setMessage(errorData?.message || errorData?.error || 'Invalid payment data');
              }
              break;
            case 401:
              setMessage('Authentication expired. Redirecting to login...');
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              setMessage('Access denied. Please ensure you have the correct permissions.');
              break;
            case 404:
              setMessage('Payment verification service not found. Please contact support.');
              setDetails({
                error: 'Route not found',
                statusCode: 404,
                suggestion: 'The payment verification endpoint may not be properly configured'
              });
              break;
            case 409:
              setMessage('Payment already processed successfully.');
              setStatus('success');
              setTimeout(() => navigate('/'), 3000);
              break;
            case 500:
              setMessage('Server error during verification. Please try again or contact support.');
              break;
            default:
              setMessage(errorData?.message || errorData?.error || `Server error (${statusCode})`);
          }
          
          setDetails(errorData);
        } else if (error.request) {
          setMessage('Network error - unable to reach payment verification server');
          setDetails({
            error: 'Network error',
            suggestion: 'Check your internet connection or try again later'
          });
        } else {
          setMessage('Payment verification failed - unexpected error occurred');
        }
      }
    };

    const timer = setTimeout(verifyPayment, 500);
    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

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

  const getTitleColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-gray-500';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
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
              <Button 
                onClick={() => navigate('/')}
                variant="secondary"
                size="lg"
              >
                Go to Dashboard
              </Button>
            )}
            
            {status === 'failed' && (
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/')}
                  variant="secondary"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate('/')}
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

export default PaymentCallback2;