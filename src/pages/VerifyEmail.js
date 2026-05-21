// VerifyEmail.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button, Input } from '../components/components';
import api from '../utils/api';


const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      await api.get(`/api/auth/verify-email?token=${token}`);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Verification failed');
      }
    }
  };

  const resendVerification = async () => {
    if (!email) return;

    setResendLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { email });
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to resend verification email');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            {status === 'verifying' ? 'Verifying Email...' : 'Email Verification'}
          </h2>

          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="text-center">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={handleLoginRedirect}
              className="w-full"
            >
              Go to Login
            </Button>
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
            >
              <Mail className="mr-2 h-4 w-4" />
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;