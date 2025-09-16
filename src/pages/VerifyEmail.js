// VerifyEmail.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button, Input } from '../components/components';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage('Email verified successfully! You can now log in.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed');
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    setResendLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          {status === 'verifying' && (
            <LoadingSpinner />
          )}
          
          {status === 'success' && (
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
          )}
          
          {status === 'error' && (
            <XCircle className="mx-auto h-16 w-16 text-red-600 mb-6" />
          )}
          
          <h2 className="text-3xl font-bold text-black mb-4">
            {status === 'verifying' ? 'Verifying Email...' : 'Email Verification'}
          </h2>
          
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="text-center">
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Go to Login
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            
            <Button
              onClick={resendVerification}
              disabled={resendLoading || !email}
              variant="secondary"
              size="lg"
              className="w-full"
              loading={resendLoading}
              icon={Mail}
              iconPosition="left"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;