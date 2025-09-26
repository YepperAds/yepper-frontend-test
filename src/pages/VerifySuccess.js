// FIXED: New VerifySuccess.js component
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { Button } from '../components/components';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerifySuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAutoLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [autoLoginSuccess, setAutoLoginSuccess] = useState(false);
  
  const token = searchParams.get('token');
  const autoLogin = searchParams.get('auto_login');

  useEffect(() => {
    const processVerification = async () => {
      if (token && autoLogin) {
        try {
          await handleAutoLogin(token);
          setAutoLoginSuccess(true);
          toast.success('Email verified! You are now signed in.');
        } catch (error) {
          console.error('Auto-login failed:', error);
          toast.error('Email verified but auto-login failed. Please sign in manually.');
        }
      }
      setIsLoading(false);
    };

    processVerification();
  }, [token, autoLogin, handleAutoLogin]);

  const handleContinue = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-black mb-4">
            Email Verified Successfully!
          </h1>
          
          {autoLoginSuccess ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your email has been verified and you're now signed in to your account.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Account verified<br/>
                  ✅ Automatically signed in<br/>
                  ✅ Ready to use the platform
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your email has been verified successfully! You can now sign in to your account.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  ✅ Account verified<br/>
                  → Please sign in to continue
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            {autoLoginSuccess ? (
              <>
                Continue to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Welcome to the platform! You can now access all features.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifySuccess;