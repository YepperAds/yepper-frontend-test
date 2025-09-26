// FIXED: CheckEmail.js - Simple page that just tells user to check email
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/components';

const CheckEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { maskedEmail } = location.state || {};

  const handleBackToRegister = () => {
    navigate('/register');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

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
            We've sent a verification email to:
          </p>
          
          {maskedEmail && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="font-mono text-lg text-black font-semibold">
                {maskedEmail}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8 text-left">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-semibold">1</span>
            </div>
            <p className="text-gray-700">Check your email inbox (and spam folder)</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-semibold">2</span>
            </div>
            <p className="text-gray-700">Click "Verify Email Address & Sign In"</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-semibold">3</span>
            </div>
            <p className="text-gray-700">You'll be automatically signed in</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoToLogin}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            I'll sign in manually later
          </Button>

          <Button
            onClick={handleBackToRegister}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Button>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>The verification link expires in 1 hour.</p>
          <p>Once verified, you'll be automatically signed in to your account.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;