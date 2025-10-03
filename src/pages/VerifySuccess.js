// VerifySuccess.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/components';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifySuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAutoLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [autoLoginSuccess, setAutoLoginSuccess] = useState(false);
  
  const token = searchParams.get('token');
  const autoLogin = searchParams.get('auto_login');
  const fromDirectAdvertise = searchParams.get('fromDirectAdvertise') === 'true';

  useEffect(() => {
    const processVerification = async () => {
      if (token && autoLogin) {
        try {
          await handleAutoLogin(token);
          setAutoLoginSuccess(true);
          
          if (fromDirectAdvertise) {
            
            localStorage.setItem('emailVerified', 'true');
            
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'emailVerified',
              newValue: 'true',
              url: window.location.href
            }));
          } else {
            // 
          }
        } catch (error) {
        }
      }
      setIsLoading(false);
    };

    processVerification();
  }, [token, autoLogin, handleAutoLogin, fromDirectAdvertise]);

  const handleContinue = () => {
    navigate('/');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (fromDirectAdvertise) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            
            <h1 className="text-3xl font-bold text-black mb-4">
              Email Verified Successfully!
            </h1>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                <p className="text-blue-900 font-medium mb-2">
                  Next Step:
                </p>
                <p className="text-blue-800 text-sm">
                  Please <strong>go back to your Direct Advertise tab/window</strong> (the page where you were creating your advertisement). 
                </p>
                <p className="text-blue-800 text-sm mt-2">
                  Your advertisement will automatically continue to the payment step once you return to that page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal verification success (not from DirectAdvertise)
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            Email Verified Successfully!
          </h1>
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
              </>
            ) : (
              <>
                Go to Sign In
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifySuccess;