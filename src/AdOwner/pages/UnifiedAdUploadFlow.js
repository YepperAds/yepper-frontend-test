import React, { useState, useRef, useEffect } from 'react';
import api, { websiteAPI, categoryAPI } from '../../utils/api';
import {
  Upload, ArrowLeft, Check, AlertTriangle, X,
  Mail, Lock, User, Eye, EyeOff, Building2, Tag,
  MapPin, FileText, Globe, Search, Cloud, Sparkles, RotateCcw
} from 'lucide-react';

const UnifiedAdUploadFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1: File Upload
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Step 2: Business Details
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessLink: '',
    businessLocation: '',
    adDescription: '',
    businessCategory: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Step 3: Website Selection
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Step 4: Category Selection
  const [categoriesByWebsite, setCategoriesByWebsite] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // AI Editing States
  const [showAIEditor, setShowAIEditor] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiEditedPreviews, setAiEditedPreviews] = useState([]);
  const [selectedAIPreview, setSelectedAIPreview] = useState(null);

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  // Auth form data
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Business categories
  const businessCategories = [
    { value: 'technology', label: 'Technology', description: 'Software, hardware, IT services' },
    { value: 'food', label: 'Food & Beverage', description: 'Restaurants, cafes, catering' },
    { value: 'realestate', label: 'Real Estate', description: 'Property sales and rentals' },
    { value: 'automotive', label: 'Automotive', description: 'Cars, parts, services' },
    { value: 'health', label: 'Health & Wellness', description: 'Medical, fitness, beauty' },
    { value: 'education', label: 'Education', description: 'Schools, courses, training' },
    { value: 'entertainment', label: 'Entertainment', description: 'Events, media, arts' },
    { value: 'ecommerce', label: 'E-commerce', description: 'Online retail stores' }
  ];

  // Fetch real websites from backend
  useEffect(() => {
    if (currentStep === 3 && websites.length === 0) {
      setLoading(true);
      websiteAPI.getAll()
        .then((res) => {
          const data = res.data?.websites || res.data || [];
          setWebsites(data);
          setFilteredWebsites(data);
        })
        .catch((err) => {
          console.error('Failed to fetch websites:', err);
          setErrors({ general: 'Failed to load websites. Please try again.' });
        })
        .finally(() => setLoading(false));
    }
  }, [currentStep, websites.length]);

  // Filter websites by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWebsites(websites);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredWebsites(
        websites.filter(
          (w) =>
            w.websiteName?.toLowerCase().includes(lower) ||
            w.websiteLink?.toLowerCase().includes(lower) ||
            w.businessCategories?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, websites]);
  useEffect(() => {
    if (currentStep === 4 && selectedWebsites.length > 0 && categoriesByWebsite.length === 0) {
      setLoading(true);
      Promise.all(
        selectedWebsites.map((websiteId) =>
          categoryAPI.getByWebsiteAdvertiser(websiteId).then((res) => {
            const websiteInfo = websites.find((w) => w._id === websiteId);
            const categories = res.data?.categories || res.data || [];
            return {
              websiteId,
              websiteName: websiteInfo?.websiteName || websiteId,
              websiteLink: websiteInfo?.websiteLink || '',
              categories,
            };
          })
        )
      )
        .then((results) => setCategoriesByWebsite(results))
        .catch((err) => {
          console.error('Failed to fetch categories:', err);
          setErrors({ general: 'Failed to load ad placements. Please try again.' });
        })
        .finally(() => setLoading(false));
    }
  }, [currentStep, selectedWebsites, categoriesByWebsite.length, websites]);

  useEffect(() => {
    let total = 0;
    selectedCategories.forEach(categoryId => {
      categoriesByWebsite.forEach(website => {
        const category = website.categories.find(cat => cat._id === categoryId);
        if (category) {
          total += category.price;
        }
      });
    });
    setTotalCost(total);
  }, [selectedCategories, categoriesByWebsite]);

  // Stability AI Image-to-Image (Edit existing image with prompt)
  const editWithStabilityAI = async (imageFile, prompt, apiKey) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);
      formData.append('output_format', 'png');
      formData.append('mode', 'image-to-image');
      formData.append('strength', 0.35);

      const response = await fetch(
        'https://api.stability.ai/v2beta/stable-image/generate/sd3',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'image/*',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = `Stability AI error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
        } catch {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (error) {
      console.error('Stability AI error:', error);
      throw error;
    }
  };

  // Clipdrop Reimagine API (Edit existing image based on prompt)
  const editWithClipdrop = async (imageFile, prompt, apiKey) => {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('prompt', prompt);

      const response = await fetch('https://clipdrop-api.co/reimagine/v1/reimagine', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Clipdrop error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error || JSON.stringify(errorData)}`;
        } catch {
          const errorText = await response.text();
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (error) {
      console.error('Clipdrop error:', error);
      throw error;
    }
  };

  // Main AI refinement function - ONLY edits existing images
  const refineImageWithAI = async (imageFile, prompt) => {
    try {
      setIsProcessingAI(true);
      
      const stabilityKey = process.env.REACT_APP_STABILITY_API_KEY;
      const clipdropKey = process.env.REACT_APP_CLIPDROP_API_KEY;

      if (!stabilityKey && !clipdropKey) {
        throw new Error('No API keys configured. Please add REACT_APP_STABILITY_API_KEY or REACT_APP_CLIPDROP_API_KEY to your .env file.');
      }

      let lastError = null;

      if (clipdropKey) {
        try {
          console.log('Using Clipdrop Reimagine API for image refinement...');
          return await editWithClipdrop(imageFile, prompt, clipdropKey);
        } catch (clipError) {
          console.error('Clipdrop failed:', clipError);
          lastError = clipError;
          
          if (stabilityKey) {
            try {
              console.log('Falling back to Stability AI...');
              return await editWithStabilityAI(imageFile, prompt, stabilityKey);
            } catch (stabError) {
              console.error('Stability AI also failed:', stabError);
              lastError = stabError;
            }
          }
        }
      } else if (stabilityKey) {
        try {
          console.log('Using Stability AI for image refinement...');
          return await editWithStabilityAI(imageFile, prompt, stabilityKey);
        } catch (stabError) {
          console.error('Stability AI failed:', stabError);
          lastError = stabError;
        }
      }

      throw lastError || new Error('All AI services failed');
      
    } catch (error) {
      console.error('AI Image processing error:', error);
      
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        throw new Error('AI service temporarily unavailable. Please try again later or check if your API keys are valid.');
      } else if (errorMessage.includes('api key') || errorMessage.includes('.env')) {
        throw new Error('API keys not configured. Please add your API keys to the .env file and restart the application.');
      } else if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('403') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        throw new Error('Invalid API key or insufficient credits. Please check your API account and ensure you have credits available.');
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        throw new Error('AI service is temporarily unavailable. Please try again in a few moments.');
      } else if (errorMessage.includes('no api keys configured')) {
        throw error;
      } else {
        throw new Error(`AI processing failed: ${error.message}. Please try again or contact support if the issue persists.`);
      }
    } finally {
      setIsProcessingAI(false);
    }
  };

  const resetAIEdits = () => {
    setSelectedAIPreview(null);
    setAiEditedPreviews([]);
    setAiPrompt('');
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    const maxSize = 50 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      setErrors({ file: 'Unsupported file type. Please upload JPEG, PNG, GIF, or MP4.' });
      return;
    }

    if (selectedFile.size > maxSize) {
      setErrors({ file: 'File is too large. Maximum size is 50MB.' });
      return;
    }

    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: '' }));
    resetAIEdits();

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        url: reader.result,
        type: selectedFile.type,
        name: selectedFile.name,
        size: selectedFile.size
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFile(e.dataTransfer.files[0]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFormValid = () => {
    return (
      Object.values(businessData).every((value) => value.trim()) &&
      (!businessData.businessLink || 
       /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(businessData.businessLink))
    );
  };

  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategorySelect = (categoryValue) => {
    setBusinessData(prev => ({ ...prev, businessCategory: categoryValue }));
    setShowCategoryModal(false);
    setErrors(prev => ({ ...prev, businessCategory: '' }));
  };

  const getSelectedCategory = () => {
    return businessCategories.find(cat => cat.value === businessData.businessCategory);
  };

  const handleWebsiteSelect = (websiteId) => {
    setSelectedWebsites(prev =>
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const handleCategorySelection = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !file) {
      setErrors({ general: 'Please upload a file' });
      return;
    }
    if (currentStep === 2 && !isFormValid()) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }
    if (currentStep === 3 && selectedWebsites.length === 0) {
      setErrors({ general: 'Please select at least one website' });
      return;
    }
    if (currentStep === 4 && selectedCategories.length === 0) {
      setErrors({ general: 'Please select at least one category' });
      return;
    }

    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setErrors({});
  };

  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {!filePreview && (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-300">
          <h3 className="text-lg font-semibold text-black mb-3">File Requirements</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p>• Supported formats: JPEG, PNG, GIF, MP4</p>
            <p>• Maximum file size: 50MB</p>
            <p>• Recommended dimensions: 1920x1080 for videos, 1200x630 for images</p>
            <p>• Use AI refinement to enhance your uploaded image</p>
          </div>
        </div>
      )}

      {errors.file && (
        <div className="mb-6 border border-red-600 bg-red-50 p-4 flex items-start">
          <AlertTriangle size={20} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700">{errors.file}</span>
        </div>
      )}

      {!filePreview && (
        <div 
          className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
            dragActive 
              ? 'border-black bg-gray-50' 
              : 'border-gray-400 hover:border-gray-600 hover:bg-gray-50'
          }`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <Cloud size={64} className="mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-black mb-2">
                {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-gray-600">or click to browse files</p>
            </div>
            <button 
              type="button"
              className="inline-flex items-center px-6 py-3 border border-black bg-white text-black hover:bg-gray-50 transition-colors"
            >
              <Upload size={20} className="mr-2" />
              Choose File
            </button>
          </div>
        </div>
      )}

      {filePreview && (
        <div className="mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="relative border border-black bg-black">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {filePreview.type.startsWith('image/') && (
                <button 
                  onClick={() => setShowAIEditor(true)}
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white border border-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Refine with AI
                </button>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="px-4 py-2 bg-black text-white border border-white hover:bg-gray-900 transition-colors"
              >
                Replace File
              </button>
            </div>
            
            <div className="flex items-center justify-center min-h-96">
              {filePreview.type.startsWith('image/') ? (
                <img 
                  src={selectedAIPreview || filePreview.url} 
                  alt="Advertisement Preview" 
                  className="max-w-full max-h-[600px] object-contain"
                />
              ) : (
                <video 
                  src={filePreview.url} 
                  controls 
                  className="max-w-full max-h-[600px] object-contain"
                />
              )}
            </div>
          </div>

          {isProcessingAI && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                <span className="text-blue-700">AI is refining your image... This may take a few seconds.</span>
              </div>
            </div>
          )}

          {aiEditedPreviews.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-black">AI Refined Versions</h4>
                <button
                  onClick={resetAIEdits}
                  type="button"
                  className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                >
                  <RotateCcw size={14} />
                  Reset all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  className={`border-2 cursor-pointer transition-all ${
                    !selectedAIPreview ? 'border-black bg-gray-50' : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedAIPreview(null)}
                >
                  <img 
                    src={filePreview.url} 
                    alt="Original"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 text-center text-sm">
                    <div className="font-medium">Original</div>
                  </div>
                </div>
                
                {aiEditedPreviews.map((preview, index) => (
                  <div 
                    key={index}
                    className={`border-2 cursor-pointer transition-all ${
                      selectedAIPreview === preview.url ? 'border-black bg-gray-50' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedAIPreview(preview.url)}
                  >
                    <img 
                      src={preview.url} 
                      alt={`AI Refined ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 text-center text-sm">
                      <div className="font-medium">Version {index + 1}</div>
                      <div className="text-xs text-gray-600 truncate" title={preview.prompt}>
                        "{preview.prompt.substring(0, 20)}..."
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedAIPreview && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200">
                  <p className="text-green-700 text-sm">
                    ✓ AI refined version selected. This will be used for your ad.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAIEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-black p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-blue-600" size={24} />
                  <h3 className="text-xl font-semibold text-black">Refine Your Uploaded Image with AI</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAIEditor(false);
                    setAiPrompt('');
                    setErrors(prev => ({ ...prev, ai: '' }));
                  }}
                  type="button"
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Current Image:</p>
                <img 
                  src={selectedAIPreview || filePreview.url} 
                  alt="Current ad" 
                  className="w-full max-h-48 object-contain border border-gray-300"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you like to improve this image?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    setErrors(prev => ({ ...prev, ai: '' }));
                  }}
                  placeholder="Example: Make the colors more vibrant, improve lighting, enhance contrast, add professional touch, make it more eye-catching..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                  disabled={isProcessingAI}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe improvements to your uploaded image. The AI will edit your image based on your description while keeping the main content.
                </p>
              </div>

              {errors.ai && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm">{errors.ai}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 flex-shrink-0">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAIEditor(false);
                    setAiPrompt('');
                    setErrors(prev => ({ ...prev, ai: '' }));
                  }}
                  type="button"
                  className="px-4 py-2 border border-black bg-white text-black hover:bg-gray-50 transition-colors"
                  disabled={isProcessingAI}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!aiPrompt.trim()) {
                      setErrors({ ai: 'Please enter a description of how you want to improve the image' });
                      return;
                    }

                    try {
                      setErrors(prev => ({ ...prev, ai: '' }));
                      const editedImageUrl = await refineImageWithAI(file, aiPrompt);
                      
                      setAiEditedPreviews(prev => [
                        ...prev,
                        { url: editedImageUrl, prompt: aiPrompt }
                      ]);
                      
                      setSelectedAIPreview(editedImageUrl);
                      setShowAIEditor(false);
                      setAiPrompt('');
                      
                    } catch (error) {
                      setErrors({ ai: error.message });
                    }
                  }}
                  type="button"
                  disabled={isProcessingAI || !aiPrompt.trim()}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Refine Uploaded Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={businessData.businessName}
              onChange={handleBusinessInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              placeholder="Enter your business name"
            />
            <Building2 size={16} className="absolute left-3 top-11 text-gray-400" />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Website <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="businessLink"
              value={businessData.businessLink}
              onChange={handleBusinessInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              placeholder="https://www.yourbusiness.com"
            />
            <Globe size={16} className="absolute left-3 top-11 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className={businessData.businessCategory ? 'text-black' : 'text-gray-500'}>
                  {getSelectedCategory()?.label || 'Select your business category'}
                </span>
              </div>
            </button>
            <Tag size={16} className="absolute left-3 top-4 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="businessLocation"
            value={businessData.businessLocation}
            onChange={handleBusinessInputChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            placeholder="City, State, or Country"
          />
          <MapPin size={16} className="absolute left-3 top-11 text-gray-400" />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="adDescription"
            value={businessData.adDescription}
            onChange={handleBusinessInputChange}
            rows={4}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            placeholder="Tell us about your business in a few compelling words..."
          />
          <FileText size={16} className="absolute left-3 top-11 text-gray-400" />
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="border-b border-black p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black">Select Business Category</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessCategories.map((category) => {
                  const isSelected = businessData.businessCategory === category.value;
                  
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      type="button"
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
                          <Tag size={24} className={isSelected ? 'text-white' : 'text-gray-700'} />
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

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search websites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : filteredWebsites.length === 0 ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-black">No websites available</h2>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'No websites are currently available'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebsites.map((website) => {
            const isSelected = selectedWebsites.includes(website._id);
            
            return (
              <div 
                key={website._id} 
                onClick={() => handleWebsiteSelect(website._id)}
                className={`border p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  isSelected 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    {website.imageUrl ? (
                      <img 
                        src={website.imageUrl} 
                        alt={website.websiteName}
                        className="w-10 h-10 object-contain mr-3"
                      />
                    ) : (
                      <Globe size={40} className="mr-3 text-black" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-black">{website.websiteName}</h3>
                      <p className="text-sm text-gray-600 break-all">{website.websiteLink}</p>
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 border flex items-center justify-center ${
                    isSelected 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {website.businessCategories && (
                    <div className="text-xs px-2 py-1 bg-black text-white">
                      {website.businessCategories}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-gray-600">
          Select where your ad will appear on each website. Each placement shows exactly where visitors will see it.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : categoriesByWebsite.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {categoriesByWebsite.map((website) => (
            <div key={website.websiteId} className="border border-black bg-white">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-1">{website.websiteName}</h3>
                    <p className="text-sm text-gray-600">Available ad placements on this website</p>
                  </div>
                </div>
              </div>
              
              {website.categories.length > 0 ? (
                <div className="p-6 space-y-6">
                  {website.categories.map((category) => {
                    const isExpanded = expandedCategory === category._id;
                    const isSelected = selectedCategories.includes(category._id);
                    
                    return (
                      <div
                        key={category._id}
                        className={`border transition-all duration-200 bg-white ${
                          isSelected ? 'border-black shadow-md' : 'border-gray-300'
                        }`}
                      >
                        <div
                          onClick={() => handleCategorySelection(category._id)}
                          className="p-6 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="grid gap-6 items-center grid-cols-1 md:grid-cols-4">
                            <div className="md:col-span-3">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-lg font-semibold text-black">{category.categoryName}</h4>
                              </div>
                              
                              <p className="text-gray-700 mb-4">
                                {category.description.length > 80 
                                  ? `${category.description.substring(0, 80)}...`
                                  : category.description
                                }
                              </p>

                              <div className="flex items-center gap-6">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-lg font-semibold text-black">
                                    ${category.price}
                                  </span>
                                </div>
                                
                                {category.description.length > 80 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCategoryExpansion(category._id);
                                    }}
                                    type="button"
                                    className="text-sm text-gray-600 hover:text-black underline"
                                  >
                                    {isExpanded ? 'Show Less' : 'Read More'}
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`w-10 h-10 border-2 flex items-center justify-center mx-auto mb-2 transition-colors ${
                                isSelected ? 'bg-black border-black' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check size={20} className="text-white" />}
                              </div>
                              <p className={`text-xs font-medium ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                                {isSelected ? 'SELECTED' : 'SELECT'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-6 pb-6 border-t border-gray-200">
                            <p className="text-gray-700 pt-4">{category.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <h4 className="text-lg font-semibold text-black mb-2">No Ad Spaces Available</h4>
                  <p className="text-gray-600">
                    This website doesn't have any available ad placements right now.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-black mb-4">No Ad Spaces Found</h2>
          <p className="text-gray-600 mb-8">
            The selected websites don't have any available ad placements. Please try selecting different websites.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => {
    const getSelectedDetails = () => {
      const details = [];
      selectedCategories.forEach(categoryId => {
        categoriesByWebsite.forEach(website => {
          const category = website.categories.find(cat => cat._id === categoryId);
          if (category) {
            details.push({
              websiteName: website.websiteName,
              categoryName: category.categoryName,
              price: category.price
            });
          }
        });
      });
      return details;
    };

    const selectedDetails = getSelectedDetails();

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-black mb-2">Review Your Order</h2>
          <p className="text-gray-600">
            Complete payment for each ad placement to publish your ad
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Ad Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {filePreview && (
                <div className="mb-4">
                  {filePreview.type.startsWith('image/') ? (
                    <img
                      src={selectedAIPreview || filePreview.url}
                      alt="Ad preview"
                      className="w-full h-48 object-cover border border-gray-300"
                    />
                  ) : (
                    <video
                      src={filePreview.url}
                      controls
                      className="w-full h-48 border border-gray-300"
                    />
                  )}
                  {selectedAIPreview && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200">
                      <p className="text-green-700 text-sm flex items-center gap-1">
                        <Sparkles size={14} />
                        AI Enhanced Version Selected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-black">Business:</span>
                <p className="text-gray-700">{businessData.businessName}</p>
              </div>
              <div>
                <span className="font-medium text-black">Website:</span>
                <p className="text-gray-700 break-all">{businessData.businessLink}</p>
              </div>
              <div>
                <span className="font-medium text-black">Location:</span>
                <p className="text-gray-700">{businessData.businessLocation}</p>
              </div>
              <div>
                <span className="font-medium text-black">Category:</span>
                <p className="text-gray-700">{getSelectedCategory()?.label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black p-6 mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Payment Breakdown</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-700">Total Cost:</span>
              <span className="text-xl font-semibold text-black">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Selected Placements</h3>
          {selectedDetails.map((detail, index) => (
            <div key={index} className="border border-gray-300 bg-white p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-black mb-1">{detail.websiteName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{detail.categoryName}</p>
                </div>
                <div className="text-lg font-semibold text-black">
                  ${detail.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button 
              onClick={handleBack}
              type="button"
              className="flex items-center text-gray-600 hover:text-black transition-colors"
              disabled={currentStep === 1}
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="px-3 py-1 bg-black text-white text-sm font-medium">
              {currentStep === 1 && 'Upload Advertisement'}
              {currentStep === 2 && 'Business Details'}
              {currentStep === 3 && 'Select Websites'}
              {currentStep === 4 && 'Select Ad Placements'}
              {currentStep === 5 && 'Review & Payment'}
            </div>
          </div>
        </div>
      </header>

      {errors.general && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center">
            <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
            <span>{errors.general}</span>
          </div>
        </div>
      )}

      <div className="bg-white p-8 mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      <div className="text-center py-8">
        <button
          onClick={handleNext}
          disabled={
            (currentStep === 1 && !file) ||
            (currentStep === 2 && !isFormValid()) ||
            (currentStep === 3 && selectedWebsites.length === 0) ||
            (currentStep === 4 && selectedCategories.length === 0) ||
            loading
          }
          className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Processing...' : currentStep === 5 ? 'Proceed to Payment' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default UnifiedAdUploadFlow;