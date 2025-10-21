import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/components';

const VerifyError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'missing_token':
        return {
          title: 'Missing Verification Token',
          message: 'The verification link appears to be incomplete. Please try using the link from your email again.',
          suggestion: 'Check your email for the complete verification link.'
        };
      case 'invalid_token':
        return {
          title: 'Invalid or Expired Link',
          message: 'This verification link is either invalid or has expired.',
          suggestion: 'Please register again to receive a new verification email.'
        };
      case 'server_error':
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end while verifying your email.',
          suggestion: 'Please try again later or contact support if the issue persists.'
        };
      default:
        return {
          title: 'Verification Failed',
          message: 'We couldn\'t verify your email address.',
          suggestion: 'Please try registering again.'
        };
    }
  };

  const { title, message, suggestion } = getErrorMessage();

  const handleTryAgain = () => {
    navigate('/register');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 text-sm">
              {suggestion}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleTryAgain}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Registration Again
          </Button>

          <Button
            onClick={handleGoToLogin}
            variant="primary"
            size="lg"
            className="w-full"
          >
            I already have a verified account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyError;