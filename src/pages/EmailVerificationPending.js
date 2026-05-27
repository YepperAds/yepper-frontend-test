import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '../components/components';
import api from '../utils/api';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { maskedEmail, email } = location.state || {};

  useEffect(() => {
    // If no email data, redirect to register
    if (!maskedEmail || !email) {
      navigate('/register');
      return;
    }

    // Set up cooldown timer if needed
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [maskedEmail, email, navigate, resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await api.post(
        '/api/auth/resend-verification',
        { email }
      );

      if (response.data.success) {
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (error) {
      return;
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  if (!maskedEmail || !email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-black mb-4">
            Check your email
          </h1>
          
          <p className="text-gray-600 mb-6">
            To continue, you must first verify your email address
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-500 mb-2">We sent a verification email to:</p>
            <p className="font-mono text-lg text-black font-semibold">
              {maskedEmail}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start text-left space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-semibold">1</span>
            </div>
            <p className="text-gray-700">Check your email inbox (and spam folder)</p>
          </div>
          
          <div className="flex items-start text-left space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-semibold">2</span>
            </div>
            <p className="text-gray-700">Click the "Verify Email Address" button in the email</p>
          </div>
          
          <div className="flex items-start text-left space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-semibold">3</span>
            </div>
            <p className="text-gray-700">You'll be automatically signed in and redirected</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend email in ${resendCooldown}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend verification email
              </>
            )}
          </Button>

          <Button
            onClick={handleBackToRegister}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Use different email address
          </Button>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Didn't receive the email? Check your spam folder or try resending.</p>
          <p className="mt-2">The verification link expires in 1 hour.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;