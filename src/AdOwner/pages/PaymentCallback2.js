// PaymentCallback2.js - Fixed version
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Bug } from 'lucide-react';
import axios from 'axios';

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

  // Create axios instance with auth
  const createAuthenticatedAxios = () => {
    const token = getAuthToken();
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:5000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (token) {
      // Try different auth header formats
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Some APIs might use different formats
      axiosInstance.defaults.headers.common['x-auth-token'] = token;
    }

    return axiosInstance;
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
        const response = await axios.post(
          'http://localhost:5000/api/web-advertise/payment/verify-callback', 
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
          setTimeout(() => navigate('/dashboard'), 3000);
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
              setTimeout(() => navigate('/dashboard'), 3000);
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

  const renderStatus = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h1>
            <p className="text-gray-600">{message}</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 text-center">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
            <p className="text-gray-600 text-center">{message}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-yellow-800 mb-2">Verification Error</h1>
            <p className="text-gray-600 text-center">{message}</p>
            <div className="mt-4 space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {renderStatus()}
        
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center mb-2">
              <Bug className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Debug Info</h3>
            </div>
            <div className="max-h-40 overflow-y-auto text-xs text-gray-600 space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="border-b border-gray-200 pb-1">
                  <span className="font-mono text-gray-500">[{info.timestamp}]</span>
                  <span className="ml-2">{info.message}</span>
                  {info.data && (
                    <pre className="mt-1 text-gray-500 whitespace-pre-wrap">
                      {JSON.stringify(info.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Section */}
        {details && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback2;