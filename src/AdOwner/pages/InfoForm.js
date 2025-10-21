// BusinessForm.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Tag, MapPin, FileText, X } from 'lucide-react';
import { Container, Badge, Input, Button, TextArea } from '../../components/components';

function BusinessForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getInitialData = () => {
    if (location.state?.file || location.state?.userId) {
      return location.state;
    }
    
    const savedData = localStorage.getItem('adFormData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return { ...parsed, file: null };
    }
    
    return {};
  };

  const initialData = getInitialData();
  const { file: initialFile, userId: initialUserId } = initialData;
  
  const [file, setFile] = useState(initialFile || null);
  const [userId, setUserId] = useState(initialUserId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [businessData, setBusinessData] = useState({
    businessName: initialData.businessName || '',
    businessLink: initialData.businessLink || '',
    businessLocation: initialData.businessLocation || '',
    adDescription: initialData.adDescription || '',
    businessCategory: initialData.businessCategory || ''
  });

  const [errors, setErrors] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    const dataToSave = {
      userId,
      ...businessData
      // Do NOT include file here
    };
    
    try {
      localStorage.setItem('adFormData', JSON.stringify(dataToSave));
    } catch (e) {
      localStorage.removeItem('adFormData');
    }
  }, [businessData, userId]);

//  useEffect(() => {
//     const loadFileFromStorage = () => {
//       const savedData = localStorage.getItem('adFormData');
//       if (savedData) {
//         const parsed = JSON.parse(savedData);
//         if (parsed.file && parsed.file.data && !file) {
//           fetch(parsed.file.data)
//             .then(res => res.blob())
//             .then(blob => {
//               const restoredFile = new File([blob], parsed.file.name, {
//                 type: parsed.file.type
//               });
//               setFile(restoredFile);
//             });
//         }
//       }
//     };
    
//     loadFileFromStorage();
//   }, []);
  
  useEffect(() => {
    if (!file && !location.state?.file) {
      navigate('/upload-ad');
    }
  }, [file, location.state, navigate]);

  const businessCategories = [
    { value: 'technology', label: 'Technology', icon: 'Monitor', description: 'Software, hardware, IT services' },
    { value: 'food-beverage', label: 'Food & Beverage', icon: 'Coffee', description: 'Restaurants, cafes, food services' },
    { value: 'real-estate', label: 'Real Estate', icon: 'Home', description: 'Property sales, rentals, development' },
    { value: 'automotive', label: 'Automotive', icon: 'Car', description: 'Car sales, repairs, services' },
    { value: 'health-wellness', label: 'Health & Wellness', icon: 'Heart', description: 'Healthcare, fitness, beauty' },
    { value: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', description: 'Gaming, events, recreation' },
    { value: 'fashion', label: 'Fashion', icon: 'Shirt', description: 'Clothing, accessories, style' },
    { value: 'education', label: 'Education', icon: 'GraduationCap', description: 'Schools, training, courses' },
    { value: 'business-services', label: 'Business Services', icon: 'Briefcase', description: 'Consulting, legal, finance' },
    { value: 'travel-tourism', label: 'Travel & Tourism', icon: 'Plane', description: 'Hotels, tours, travel agencies' },
    { value: 'arts-culture', label: 'Arts & Culture', icon: 'Palette', description: 'Museums, galleries, creative' },
    { value: 'photography', label: 'Photography', icon: 'Camera', description: 'Photo services, studios' },
    { value: 'gifts-events', label: 'Gifts & Events', icon: 'Gift', description: 'Party planning, gift shops' },
    { value: 'government-public', label: 'Government & Public', icon: 'Users', description: 'Public services, non-profit' },
    { value: 'general-retail', label: 'General Retail', icon: 'ShoppingBag', description: 'Stores, e-commerce, shopping' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCategorySelect = (categoryValue) => {
    setBusinessData(prev => ({
      ...prev,
      businessCategory: categoryValue
    }));
    
    if (errors.businessCategory) {
      setErrors(prev => ({
        ...prev,
        businessCategory: undefined
      }));
    }
    
    setShowCategoryModal(false);
  };

  const getSelectedCategory = () => {
    return businessCategories.find(cat => cat.value === businessData.businessCategory);
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(businessData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = 'This field is required';
      }
    });

    if (businessData.businessLink && 
        !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(businessData.businessLink)) {
      newErrors.businessLink = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      Object.values(businessData).every((value) => value.trim()) &&
      (!businessData.businessLink || 
       /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(businessData.businessLink))
    );
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const handleSaveAd = async () => {
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('businessName', businessData.businessName);
      formData.append('businessLink', businessData.businessLink);
      formData.append('businessLocation', businessData.businessLocation);
      formData.append('adDescription', businessData.adDescription);

      const token = getAuthToken();
      const response = await axios.post('http://localhost:5000/api/web-advertise', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Clear saved data after successful save
        localStorage.removeItem('adFormData');
        
        navigate('/my-ads', {
          state: { message: 'Ad saved successfully!' }
        });
      }
    } catch (error) {
      setError('Failed to save ad');
    }
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        if (e.target.name === 'saveOnly') {
          handleSaveAd();
        } else {
          // Pass file through state, not localStorage
          const dataToPass = {
            file,
            userId,
            ...businessData
          };
          
          navigate('/select-websites', {
            state: dataToPass
          });
        }
      } catch (error) {
        setError('An error occurred during upload');
      } finally {
        setLoading(false);
      }
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
              <span className="font-medium">Back</span>
            </button>
            <Badge variant="default">Business Details</Badge>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="border border-black bg-white p-8">
          <form onSubmit={handleNext} className="space-y-6">
            {/* First Row - Business Name & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative flex gap-1">
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
                <Link size={16} className="absolute left-3 top-9 text-gray-400" />
              </div>
            </div>

            {/* Business Category - Custom Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                    errors.businessCategory ? 'border-red-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={businessData.businessCategory ? 'text-black' : 'text-gray-500'}>
                      {getSelectedCategory()?.label || 'Select your business category'}
                    </span>
                  </div>
                </button>
                <Tag size={16} className="absolute left-3 top-4 text-gray-400" />
                {errors.businessCategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessCategory}</p>
                )}
              </div>
            </div>

            {/* Business Location */}
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

            {/* Business Description */}
            <div className="relative">
              <TextArea
                label="Business Description"
                name="adDescription"
                placeholder="Tell us about your business in a few compelling words..."
                value={businessData.adDescription}
                onChange={handleInputChange}
                error={errors.adDescription}
                required
                rows={4}
                className="pl-10"
              />
              <FileText size={16} className="absolute left-3 top-9 text-gray-400" />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={!isFormValid() || loading}
              loading={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Continue to Next Step'}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="border border-red-600 bg-red-50 p-4 flex items-start">
                <FileText size={20} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-black p-6 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold text-black">Select Business Category</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = businessData.businessCategory === category.value;
                  
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      className={`p-4 border text-left transition-all duration-200 hover:shadow-lg group ${
                        isSelected 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-white bg-opacity-20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <IconComponent 
                            size={24} 
                            className={isSelected ? 'text-white' : 'text-gray-700'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium mb-1 ${
                            isSelected ? 'text-white' : 'text-black'
                          }`}>
                            {category.label}
                          </h4>
                          <p className={`text-sm ${
                            isSelected ? 'text-white text-opacity-80' : 'text-gray-600'
                          }`}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 flex items-center justify-end">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessForm;