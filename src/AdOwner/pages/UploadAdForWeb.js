// UploadAdForWeb.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cloud, FileText, ArrowLeft, Upload, Loader, Sparkles, Wand2, ImagePlus, AlertCircle } from 'lucide-react';
import { Button, Alert, Container, Badge } from '../../components/components';
import api from '../../utils/api';

function UploadAdForWeb() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWebsites, selectedCategory, categoryRequirements } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [processingType, setProcessingType] = useState('');
  const fileInputRef = useRef(null);
  const multiFileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [multipleImages, setMultipleImages] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLayout, setAiLayout] = useState('grid');

  useEffect(() => {
    if (!categoryRequirements) {
      navigate('/select-categories');
    }
  }, [categoryRequirements, navigate]);

  // Disable right-click on preview images
  useEffect(() => {
    const preventRightClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.ad-preview')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventRightClick);
    return () => document.removeEventListener('contextmenu', preventRightClick);
  }, []);

  const validateFile = (selectedFile) => {
    const errors = [];
    const fileType = selectedFile.type.split('/')[0];
    let normalizedType = fileType;
    
    if (selectedFile.type === 'image/gif') {
      normalizedType = 'gif';
    } else if (selectedFile.type.includes('html')) {
      normalizedType = 'html5';
    }

    if (!categoryRequirements.allowedAdTypes.includes(normalizedType)) {
      errors.push(
        `File type '${normalizedType}' not allowed. Accepted types: ${categoryRequirements.allowedAdTypes.join(', ')}`
      );
    }

    if (fileType === 'image') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const requiredWidth = categoryRequirements.adSize.width;
          const requiredHeight = categoryRequirements.adSize.height;

          if (img.width !== requiredWidth || img.height !== requiredHeight) {
            errors.push(
              `Image dimensions must be exactly ${requiredWidth}x${requiredHeight}px. Your image is ${img.width}x${img.height}px`
            );
          }

          URL.revokeObjectURL(img.src);
          resolve(errors);
        };
        img.onerror = () => {
          errors.push('Failed to load image for validation');
          resolve(errors);
        };
        img.src = URL.createObjectURL(selectedFile);
      });
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    return Promise.resolve(errors);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    setError(null);
    setValidationErrors([]);

    const errors = await validateFile(selectedFile);

    // Always set the file, even if there are validation errors
    // This allows the auto-resize feature to work
    setFile(selectedFile);

    if (errors.length > 0) {
      setValidationErrors(errors);
      // Don't show preview for invalid files
      setFilePreview(null);
      return;
    }

    // Only show preview for valid files
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

  const handleAutoResize = async () => {
  if (!file) {
    setError('Please upload a file first');
    return;
  }

  setLoading(true);
  setProcessingType('Resizing image...');
  setError(null);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetWidth', categoryRequirements.adSize.width);
    formData.append('targetHeight', categoryRequirements.adSize.height);

    const response = await api.post('/api/web-advertise/auto-resize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    const base64Data = response.data.data.buffer;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const newFile = new File([blob], file.name, { type: 'image/jpeg' });

    await processFile(newFile);
    setValidationErrors([]);
    
  } catch (err) {
    console.error('Resize error:', err);
    setError(err.response?.data?.message || 'Failed to resize image');
  } finally {
    setLoading(false);
    setProcessingType('');
  }
};

const handleEnhanceQuality = async () => {
  if (!file) {
    setError('Please upload a file first');
    return;
  }

  setLoading(true);
  setProcessingType('Enhancing image quality...');
  setError(null);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/web-advertise/enhance-quality', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    const base64Data = response.data.data.buffer;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const newFile = new File([blob], file.name, { type: 'image/jpeg' });

    await processFile(newFile);
    
  } catch (err) {
    console.error('Enhancement error:', err);
    setError(err.response?.data?.message || 'Failed to enhance image');
  } finally {
    setLoading(false);
    setProcessingType('');
  }
};

const handleGenerateWithAI = async () => {
  if (multipleImages.length === 0) {
    setError('Please select at least one image');
    return;
  }

  if (!aiPrompt.trim()) {
    setError('Please describe what kind of advertisement you want to create');
    return;
  }

  setLoading(true);
  setProcessingType('Generating advertisement with AI...');
  setError(null);

  try {
    const formData = new FormData();
    multipleImages.forEach(img => {
      formData.append('images', img.file);
    });
    
    formData.append('prompt', aiPrompt);
    formData.append('targetWidth', categoryRequirements.adSize.width);
    formData.append('targetHeight', categoryRequirements.adSize.height);
    formData.append('adSizeLabel', categoryRequirements.adSize.label);
    formData.append('businessName', location.state?.businessName || '');
    formData.append('businessLocation', location.state?.businessLocation || '');
    formData.append('adDescription', location.state?.adDescription || '');
    formData.append('layout', aiLayout);

    const response = await api.post('/api/web-advertise/generate-ai-ad', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    const base64Data = response.data.data.buffer;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const newFile = new File([blob], 'ai-generated-ad.jpg', { type: 'image/jpeg' });

    await processFile(newFile);
    setShowAIModal(false);
    setMultipleImages([]);
    setAiPrompt('');
    
  } catch (err) {
    console.error('AI generation error:', err);
    setError(err.response?.data?.message || 'Failed to generate advertisement');
  } finally {
    setLoading(false);
    setProcessingType('');
  }
};

  const handleMultipleImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const imagePreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setMultipleImages(prev => [...prev, ...imagePreviews].slice(0, 5));
    setError(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const selectedFile = e.dataTransfer.files[0];
    processFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleNext = () => {
    if (!file) {
      setError('Please upload a valid ad file');
      return;
    }

    navigate('/insert-data', {
      state: {
        selectedWebsites, 
        selectedCategory, 
        categoryRequirements,
        file,
        filePreview 
      }
    });
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
            <Badge variant="default">Upload Advertisement</Badge>
          </div>
        </Container>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="border border-black bg-white p-8">
          {/* Requirements Section */}
          {!filePreview && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-300">
              <h3 className="text-lg font-semibold text-black mb-3">File Requirements</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• Allowed Types: {categoryRequirements.allowedAdTypes.join(', ').toUpperCase()}</p>
                <p>• Required Size: {categoryRequirements.adSize.width}x{categoryRequirements.adSize.height}px ({categoryRequirements.adSize.label})</p>
              </div>
            </div>
          )}

          {/* AI Generation Button */}
          {!filePreview && (
            <div className="mb-6 flex gap-3">
              <Button
                onClick={() => setShowAIModal(true)}
                variant="primary"
                className="flex-1"
              >
                <Sparkles size={20} className="mr-2" />
                Generate Ad with AI
              </Button>
            </div>
          )}
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert variant="error">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </Alert>
            </div>
          )}

          {/* Upload Area */}
          {!filePreview && (
            <div 
              className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
                dragActive 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-400 hover:border-gray-600 hover:bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
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
                <Button variant="outline" size="lg">
                  <Upload size={20} className="mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertCircle size={18} className="mr-2" />
                File does not meet requirements:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
              <div className="mt-4">
                <Button
                  onClick={handleAutoResize}
                  variant="primary"
                  size="sm"
                  loading={loading && processingType.includes('Resizing')}
                  disabled={loading}
                >
                  <Wand2 size={16} className="mr-2" />
                  Auto-Resize to Required Size
                </Button>
              </div>
            </div>
          )}

          {/* File Preview */}
          {filePreview && (
            <div className="mb-8">
              <div className="relative border border-black bg-black ad-preview" 
                   style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button 
                    onClick={handleEnhanceQuality}
                    variant="primary"
                    size="sm"
                    loading={loading && processingType.includes('Enhancing')}
                    disabled={loading}
                  >
                    <Sparkles size={16} className="mr-1" />
                    Enhance Quality
                  </Button>
                  <Button 
                    onClick={triggerFileInput}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Replace File
                  </Button>
                </div>
                
                <div className="flex items-center justify-center min-h-96">
                  {filePreview.type.startsWith('image/') ? (
                    <img 
                      src={filePreview.url} 
                      alt="Advertisement Preview" 
                      className="max-w-full max-h-[600px] object-contain"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    />
                  ) : (
                    <video 
                      src={filePreview.url} 
                      controls 
                      className="max-w-full max-h-[600px] object-contain"
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  )}
                </div>
                
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded flex items-center">
                      <Loader className="animate-spin mr-3" size={24} />
                      <span className="font-medium">{processingType}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleNext} 
            variant="secondary"
            size="lg"
            loading={loading && !processingType}
            disabled={loading || !file}
            className="w-full"
          >
            {loading && !processingType ? 'Processing...' : 'Continue to Ad Details'}
          </Button>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles size={24} className="mr-2" />
                Generate Ad with AI
              </h2>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setMultipleImages([]);
                  setAiPrompt('');
                  setError(null);
                }}
                className="text-gray-500 hover:text-black text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <Alert variant="info">
                <AlertCircle size={16} className="mr-2" />
                Upload up to 5 images and describe your advertisement. AI will combine and optimize them to match the required dimensions.
              </Alert>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Upload Images (1-5)
                </label>
                <input
                  ref={multiFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => multiFileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <ImagePlus size={20} className="mr-2" />
                  Select Images
                </Button>
              </div>

              {/* Image Previews */}
              {multipleImages.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {multipleImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover border border-gray-300"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                      <button
                        onClick={() => setMultipleImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Layout Selection */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Layout Style
                </label>
                <select
                  value={aiLayout}
                  onChange={(e) => setAiLayout(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                >
                  <option value="grid">Grid Layout</option>
                  <option value="collage">Creative Collage</option>
                  <option value="featured">Featured Image</option>
                </select>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Describe Your Advertisement
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Create a professional banner highlighting our summer sale with bright colors and modern design..."
                  className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-black min-h-32"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {aiPrompt.length}/500 characters
                </p>
              </div>

              {/* Target Size Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Target Size:</strong> {categoryRequirements.adSize.width}x{categoryRequirements.adSize.height}px ({categoryRequirements.adSize.label})
                </p>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateWithAI}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading || multipleImages.length === 0 || !aiPrompt.trim()}
                  className="flex-1"
                >
                  {loading ? 'Generating...' : 'Generate Advertisement'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAIModal(false);
                    setMultipleImages([]);
                    setAiPrompt('');
                  }}
                  variant="outline"
                  size="lg"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadAdForWeb;