// UploadAdForWeb.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, FileText, ArrowLeft, Upload, Loader } from 'lucide-react';
import { Button, Alert, Container, Badge } from '../../components/components';
import axios from 'axios';

function Select() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const userId = user?.id;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get('https://yepper-backend.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload JPEG, PNG, GIF, or MP4.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 50MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);

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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      navigate('/insert-data', {
        state: { userId, file }
      });
    } catch (error) {
      setError('An error occurred during upload');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center">
          <Loader className="animate-spin mr-2" size={24} />
          <span className="text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

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
          {/* File Requirements - Only show when no file is selected */}
          {!filePreview && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-300">
              <h3 className="text-lg font-semibold text-black mb-3">File Requirements</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• Supported formats: JPEG, PNG, GIF, MP4</p>
                <p>• Maximum file size: 50MB</p>
                <p>• Recommended dimensions: 1920x1080 for videos, 1200x630 for images</p>
              </div>
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <Alert variant="error">
                <FileText size={16} className="mr-2" />
                {error}
              </Alert>
            </div>
          )}

          {/* Upload Area - Only show if no file is selected */}
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

          {/* File Preview - Only show if file is selected */}
          {filePreview && (
            <div className="mb-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Large Media Display */}
              <div className="relative border border-black bg-black">
                {/* Replace Button in Corner */}
                <div className="absolute top-4 right-4 z-10">
                  <Button 
                    onClick={triggerFileInput}
                    variant="primary"
                    size="sm"
                  >
                    Replace File
                  </Button>
                </div>
                
                {/* Media Content */}
                <div className="flex items-center justify-center min-h-96">
                  {filePreview.type.startsWith('image/') ? (
                    <img 
                      src={filePreview.url} 
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
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleSave} 
            variant="secondary"
            size="lg"
            loading={loading}
            disabled={loading || !file}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Continue to Ad Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Select;