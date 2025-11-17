// WebsiteSelection.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, Check, Search, ArrowLeft } from 'lucide-react';
import { Button, Grid, Badge, Container } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

function WebsiteSelection() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredWebsites, setFilteredWebsites] = useState([]);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/createWebsite');
        const data = await response.json();
        setWebsites(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch websites. Please try again.');
        console.error('Failed to fetch websites:', error);
        setLoading(false);
      }
    };
    fetchWebsites();
  }, []);

  useEffect(() => {
    let result = websites;
    
    if (searchTerm) {
      result = result.filter(site => 
        site.websiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.websiteLink.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredWebsites(result);
  }, [searchTerm, websites]);

  const handleSelect = (websiteId) => {
    setSelectedWebsites(prev => 
      prev.includes(websiteId) 
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const handleNext = () => {
    if (selectedWebsites.length === 0) return;
    navigate('/select-categories', { state: { selectedWebsites } });
  };

  if (loading) return (
    <LoadingSpinner />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Select Websites
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search websites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Websites Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredWebsites.map((website) => (
              <div
                key={website._id}
                onClick={() => handleSelect(website._id)}
                className={`
                  cursor-pointer rounded-lg border-2 transition-all duration-200 p-6
                  ${selectedWebsites.includes(website._id)
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {website.websiteName}
                    </h3>
                    
                    <a
                      href={website.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-indigo-600 hover:text-indigo-800 break-all"
                    >
                      {website.websiteLink}
                    </a>
                  </div>
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3
                      ${selectedWebsites.includes(website._id)
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                      }
                    `}
                  >
                    {selectedWebsites.includes(website._id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {website.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {website.description}
                  </p>
                )}

                {website.businessCategories && website.businessCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {website.businessCategories.slice(0, 3).map((cat, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                    {website.businessCategories.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{website.businessCategories.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWebsites.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No websites found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {/* Selected Count & Next Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedWebsites.length} website{selectedWebsites.length !== 1 ? 's' : ''} selected
              </div>
              <button
                onClick={handleNext}
                disabled={selectedWebsites.length === 0}
                className={`
                  px-8 py-3 rounded-lg font-medium transition-all duration-200
                  ${selectedWebsites.length > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Next: Select Categories →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteSelection;