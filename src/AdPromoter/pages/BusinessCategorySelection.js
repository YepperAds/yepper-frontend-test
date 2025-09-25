import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowLeft, Building2, Code, Utensils, Home, Car, Heart, Gamepad2, Shirt, BookOpen, Briefcase, Plane, Music, Camera, Gift, Shield, Zap, Loader } from 'lucide-react';
import axios from 'axios';
import { Button, Grid, Badge, Container } from '../../components/components';

function BusinessCategorySelection() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const websiteDetails = location.state?.websiteDetails || {};

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    'any': Zap,
    'technology': Code,
    'food-beverage': Utensils,
    'real-estate': Home,
    'automotive': Car,
    'health-wellness': Heart,
    'entertainment': Gamepad2,
    'fashion': Shirt,
    'education': BookOpen,
    'business-services': Briefcase,
    'travel-tourism': Plane,
    'arts-culture': Music,
    'photography': Camera,
    'gifts-events': Gift,
    'government-public': Shield,
    'general-retail': Building2
  };

  const [businessCategories, setBusinessCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (websiteId) {
      fetchExistingCategories();
    }
  }, [websiteId]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://yepper-backend.onrender.com/api/business-categories/categories');
      if (response.data.success) {
        const categoriesWithIcons = response.data.data.categories.map(category => ({
          ...category,
          icon: iconMap[category.id] || Building2
        }));
        setBusinessCategories(categoriesWithIcons);
      }
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://yepper-backend.onrender.com/api/business-categories/website/${websiteId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSelectedCategories(response.data.data.businessCategories || []);
      }
    } catch (error) {
      console.log('No existing categories found or error fetching');
    }
  };

  const handleCategoryToggle = (categoryId) => {
    if (categoryId === 'any') {
      if (selectedCategories.includes('any')) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(['any']);
      }
    } else {
      let newSelection = selectedCategories.filter(id => id !== 'any');
      
      if (newSelection.includes(categoryId)) {
        newSelection = newSelection.filter(id => id !== categoryId);
      } else {
        newSelection = [...newSelection, categoryId];
      }
      
      setSelectedCategories(newSelection);
    }
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one business category');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://yepper-backend.onrender.com/api/business-categories/website/${websiteId}`,
        { businessCategories: selectedCategories },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        navigate(`/create-categories/${websiteId}`, {
          state: {
            websiteDetails: {
              ...websiteDetails,
              businessCategories: selectedCategories
            }
          }
        });
      }
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update business categories');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (error) return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error loading categories</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    </>
  );

  if (loading) return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center">
          <Loader className="animate-spin mr-2" size={24} />
          <span className="text-gray-700">Loading categories...</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
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
              <Badge variant="default">Choose Business Categiries</Badge>
            </div>
          </Container>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-12">
          
          <div className="flex items-start justify-between mb-12">
            <div className="flex-1">
              <p className="text-gray-600 max-w-2xl">
                Select the types of businesses you want to advertise on your website: <strong>{websiteDetails.name || 'Your Website'}</strong>. You can choose specific categories or select "Any Category" to accept all types of advertisements.
              </p>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="mb-8 p-6 border border-black bg-white">
              <h3 className="font-semibold text-black mb-4">Selected Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((categoryId) => {
                  const category = businessCategories.find(c => c.id === categoryId);
                  return (
                    <span
                      key={categoryId}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-black border border-gray-300"
                    >
                      {category?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {businessCategories && businessCategories.length > 0 ? (
            <Grid cols={3} gap={6}>
              {businessCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                const isAnySelected = selectedCategories.includes('any');
                const isDisabled = isAnySelected && category.id !== 'any';

                return (
                  <div
                    key={category.id}
                    onClick={() => !isDisabled && handleCategoryToggle(category.id)}
                    className={`
                      border border-black bg-white p-6 transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'bg-gray-100' 
                        : isDisabled 
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <Icon size={40} className="mr-3 text-black" />
                      </div>
                      {isSelected && (
                        <div className="bg-black text-white p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-black mb-2">{category.name}</h3>
                      <p className="text-gray-700 text-sm">{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </Grid>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Building2 size={64} className="mx-auto mb-6 text-black" />
                <h2 className="text-2xl font-semibold mb-4 text-black">No Categories Available</h2>
                <Button onClick={() => window.location.reload()} variant="primary">
                  Refresh
                </Button>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-end items-center">
            <Button
              onClick={handleSubmit}
              disabled={selectedCategories.length === 0 || isSubmitting}
              variant="secondary"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BusinessCategorySelection;