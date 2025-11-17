// Updated BusinessForm.js - Final step before payment
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Link as LinkIcon, MapPin, FileText, X, Tag } from 'lucide-react';
import axios from 'axios';
import { Container, Badge, Input, Button, TextArea } from '../../components/components';

function BusinessForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    selectedWebsites, 
    selectedCategory, 
    categoryRequirements,
    file,
    filePreview 
  } = location.state || {};
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessLink: '',
    businessLocation: '',
    adDescription: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!file || !selectedCategory || !categoryRequirements) {
      navigate('/select-websites');
    }
  }, [file, selectedCategory, categoryRequirements, navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!businessData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (businessData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }
    
    if (!businessData.businessLink.trim()) {
      newErrors.businessLink = 'Business website is required';
    } else if (!/^https?:\/\/.+/.test(businessData.businessLink.trim())) {
      newErrors.businessLink = 'Please enter a valid URL (starting with http:// or https://)';
    }
    
    if (!businessData.businessLocation.trim()) {
      newErrors.businessLocation = 'Business location is required';
    }
    
    if (!businessData.adDescription.trim()) {
      newErrors.adDescription = 'Ad description is required';
    } else if (businessData.adDescription.trim().length < 10) {
      newErrors.adDescription = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return businessData.businessName.trim() &&
           businessData.businessLink.trim() &&
           businessData.businessLocation.trim() &&
           businessData.adDescription.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('adOwnerEmail', user?.email);
      formData.append('file', file);
      formData.append('businessName', businessData.businessName);
      formData.append('businessLink', businessData.businessLink);
      formData.append('businessLocation', businessData.businessLocation);
      formData.append('adDescription', businessData.adDescription);
      formData.append('selectedWebsites', JSON.stringify(selectedWebsites));
      formData.append('selectedCategories', JSON.stringify([selectedCategory]));

      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/web-advertise',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        navigate('/payment-summary', {
          state: { 
            adData: response.data.data,
            categoryRequirements,
            businessData
          }
        });
      }
      
    } catch (error) {
      console.error('Ad creation error:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while creating the ad';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back to Upload</span>
            </button>
            <Badge variant="default">Step 4: Business Details</Badge>
          </div>
        </Container>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Your Ad Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Ad File</p>
              {filePreview && (
                <div className="border border-gray-300 bg-white p-2">
                  {filePreview.type.startsWith('image') && (
                    <img 
                      src={filePreview.url} 
                      alt="Ad preview" 
                      className="w-full h-auto"
                      style={{
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  {filePreview.type.startsWith('video') && (
                    <video 
                      src={filePreview.url} 
                      controls 
                      className="w-full h-auto"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                  <p className="text-xs text-gray-600 mt-2">{filePreview.name}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Ad Placement</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{categoryRequirements?.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">
                    {categoryRequirements?.adSize.width} × {categoryRequirements?.adSize.height}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-lg">${categoryRequirements?.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black bg-white p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Tell Us About Your Business</h2>
            <p className="text-gray-600">
              This information will help users learn more about your business when they click on your ad.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label="Business Name"
                  name="businessName"
                  placeholder="Enter your business name"
                  value={businessData.businessName}
                  onChange={handleInputChange}
                  error={errors.businessName}
                  required
                  className="pl-10"
                />
                <Building2 size={16} className="absolute left-3 top-9 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  label="Business Website"
                  name="businessLink"
                  placeholder="https://www.yourbusiness.com"
                  value={businessData.businessLink}
                  onChange={handleInputChange}
                  error={errors.businessLink}
                  required
                  className="pl-10"
                />
                <LinkIcon size={16} className="absolute left-3 top-9 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <Input
                label="Business Location"
                name="businessLocation"
                placeholder="City, State, or Country"
                value={businessData.businessLocation}
                onChange={handleInputChange}
                error={errors.businessLocation}
                required
                className="pl-10"
              />
              <MapPin size={16} className="absolute left-3 top-9 text-gray-400" />
            </div>

            <div className="relative">
              <TextArea
                label="Ad Description"
                name="adDescription"
                placeholder="Tell potential customers about your business in a few compelling words..."
                value={businessData.adDescription}
                onChange={handleInputChange}
                error={errors.adDescription}
                required
                rows={4}
                className="pl-10"
              />
              <FileText size={16} className="absolute left-3 top-9 text-gray-400" />
              <p className="text-sm text-gray-500 mt-1">
                {businessData.adDescription.length} characters
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={!isFormValid() || loading}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Creating Your Ad...' : 'Continue to Payment'}
              </Button>
            </div>

            {error && (
              <div className="border border-red-600 bg-red-50 p-4 flex items-start">
                <FileText size={20} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            After completing your business details, you'll proceed to secure payment
          </p>
        </div>
      </div>
    </div>
  );
}

export default BusinessForm;