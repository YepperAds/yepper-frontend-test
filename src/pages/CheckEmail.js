import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Badge, Grid, Container } from '../components/components';

const CheckEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { maskedEmail } = location.state || {};

  const handleBackToRegister = () => {
    navigate('/register');
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
      <Container>
        <div className="h-16 flex items-center justify-between">
          <button 
            onClick={handleBackToRegister}
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </Container>
    </header>
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            Check your email
          </h1>
          
          {maskedEmail && (
              <p className="text-gray-600 mb-6">
                We've sent a verification email to: {maskedEmail}
              </p>
          )}
        </div>

      </div>
    </div>
    </>
  );
};

export default CheckEmail;