// WebsiteCreation.js - Modified version
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Button, Input, Alert, Container, Badge } from '../../components/components';

function WebsiteCreation() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    websiteName: '',
    websiteUrl: '',
    imageUrl: null
  });

  const [uiState, setUiState] = useState({
    filePreview: null,
    error: null,
    isSubmitting: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setUiState(prev => ({
        ...prev,
        error: 'Only JPEG, PNG, and GIF images are allowed.'
      }));
      return false;
    }

    if (file.size > maxSize) {
      setUiState(prev => ({
        ...prev,
        error: 'Image must be smaller than 5MB.'
      }));
      return false;
    }

    return true;
  };

  const processFile = (file) => {
    if (!file) return;

    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState(prev => ({
        ...prev,
        imageUrl: file
      }));
      setUiState(prev => ({
        ...prev,
        filePreview: reader.result,
        error: null
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    processFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const formData = new FormData();
      formData.append('websiteName', formState.websiteName);
      formData.append('websiteLink', formState.websiteUrl);
      if (formState.imageUrl) {
        formData.append('file', formState.imageUrl);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/createWebsite/prepareWebsite',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Store website data in sessionStorage to persist across page refreshes
        const websiteData = {
          tempId: response.data.tempId,
          name: formState.websiteName,
          url: formState.websiteUrl,
          imageUrl: response.data.imageUrl,
          ownerId: response.data.ownerId
        };
        
        sessionStorage.setItem('pendingWebsite', JSON.stringify(websiteData));
        
        // Navigate to business categories
        navigate(`/business-categories/${response.data.tempId}`, {
          state: {
            websiteDetails: websiteData
          }
        });
      }
      
    } catch (error) {
      setUiState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to prepare website'
      }));
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
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
            <Badge variant="default">Add Website Details</Badge>
          </div>
        </Container>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <div className="border border-black bg-white p-8">
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Website Name Input */}
              <Input
                label="Website Name"
                name="websiteName"
                placeholder="Enter your website name"
                value={formState.websiteName}
                onChange={handleInputChange}
                required
                className="border-black focus:ring-0 focus:border-black"
              />
              
              {/* Website URL Input */}
              <Input
                label="Website URL"
                name="websiteUrl"
                placeholder="https://yourwebsite.com"
                value={formState.websiteUrl}
                onChange={handleInputChange}
                required
                className="border-black focus:ring-0 focus:border-black"
              />
              
              {/* Logo Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Upload
                </label>
                <div 
                  className="border-2 border-dashed border-black bg-white p-8 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="text-black mb-3" size={32} />
                  <p className="text-black font-medium mb-1">Click to upload logo</p>
                  <p className="text-sm text-gray-700">
                    JPEG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
              
              {/* Error Message */}
              {uiState.error && (
                <Alert variant="error" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{uiState.error}</span>
                </Alert>
              )}
              
              {/* Image Preview */}
              {uiState.filePreview && (
                <div className="border border-black bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-black">Logo Preview</span>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={uiState.filePreview} 
                      alt="Logo Preview" 
                      className="max-h-32 object-contain" 
                    />
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={uiState.isSubmitting}
                loading={uiState.isSubmitting}
              >
                {uiState.isSubmitting ? 'Preparing...' : 'Continue to Categories'}
              </Button>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteCreation;