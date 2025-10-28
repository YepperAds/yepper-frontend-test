// AdCustomizationModal.js
import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Code, Monitor, Smartphone, Tablet } from 'lucide-react';
import axios from 'axios';

const AdCustomizationModal = ({ categoryId, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    orientation: 'horizontal',
    width: 600,
    height: 300,
    maxWidth: 100,
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    imagePosition: 'top',
    showImage: true,
    showDescription: true,
    showCTA: true,
    titleSize: 16,
    descriptionSize: 13,
    ctaSize: 12,
    titleColor: 'rgba(0, 0, 0, 0.9)',
    descriptionColor: 'rgba(0, 0, 0, 0.6)',
    ctaBackground: 'rgba(255, 255, 255, 0.2)',
    ctaColor: 'rgba(0, 0, 0, 0.8)',
    glassmorphism: true,
    shadow: 'medium',
    hoverEffect: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('layout');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  useEffect(() => {
    fetchCategoryCustomization();
  }, [categoryId]);

  const fetchCategoryCustomization = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/ad-categories/categoriees/${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.customization) {
        setSettings(prev => ({ ...prev, ...response.data.customization }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customization:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/ad-categories/categoriees/${categoryId}/customization`,
        { customization: settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onSave) onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving customization:', error);
      alert('Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const orientationPresets = [
    { name: 'Horizontal Banner', value: 'horizontal', width: 600, height: 300, imagePosition: 'left' },
    { name: 'Vertical Sidebar', value: 'vertical', width: 300, height: 600, imagePosition: 'top' },
    { name: 'Square', value: 'square', width: 400, height: 400, imagePosition: 'top' },
    { name: 'Wide Banner', value: 'wide', width: 728, height: 90, imagePosition: 'left' },
    { name: 'Skyscraper', value: 'skyscraper', width: 160, height: 600, imagePosition: 'top' }
  ];

  const shadowOptions = [
    { label: 'None', value: 'none', css: 'none' },
    { label: 'Small', value: 'small', css: '0 2px 4px rgba(0,0,0,0.1)' },
    { label: 'Medium', value: 'medium', css: '0 8px 32px rgba(31, 38, 135, 0.37)' },
    { label: 'Large', value: 'large', css: '0 20px 50px rgba(0,0,0,0.3)' }
  ];

  const handlePresetSelect = (preset) => {
    setSettings(prev => ({
      ...prev,
      orientation: preset.value,
      width: preset.width,
      height: preset.height,
      imagePosition: preset.imagePosition
    }));
  };

  const generateAdPreview = () => {
    const containerWidth = previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : 1200;
    const scale = Math.min(1, (containerWidth - 40) / settings.width);

    const adStyle = {
      width: `${settings.width}px`,
      height: `${settings.height}px`,
      maxWidth: `${settings.maxWidth}%`,
      borderRadius: `${settings.borderRadius}px`,
      padding: `${settings.padding}px`,
      backgroundColor: settings.backgroundColor,
      border: `${settings.borderWidth}px solid ${settings.borderColor}`,
      boxShadow: shadowOptions.find(s => s.value === settings.shadow)?.css || 'none',
      backdropFilter: settings.glassmorphism ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: settings.glassmorphism ? 'blur(10px)' : 'none',
      transition: 'all 0.3s ease',
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    };

    return (
      <div style={adStyle}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '8px 16px',
          fontSize: '11px',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ opacity: 0.7 }}>Yepper Ad</span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '9px'
          }}>Sponsored</span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: settings.imagePosition === 'left' ? 'row' : 'column',
          gap: '16px',
          flex: 1,
          padding: '16px'
        }}>
          {settings.showImage && (
            <div style={{
              flex: settings.imagePosition === 'left' ? '0 0 40%' : '0 0 auto',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              minHeight: settings.imagePosition === 'top' ? '150px' : 'auto'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px'
              }}>
                Ad Image
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{
              fontSize: `${settings.titleSize}px`,
              fontWeight: '600',
              color: settings.titleColor,
              margin: '0 0 10px 0',
              lineHeight: 1.3
            }}>
              Your Business Name
            </h3>

            {settings.showDescription && (
              <p style={{
                fontSize: `${settings.descriptionSize}px`,
                color: settings.descriptionColor,
                margin: '0 0 16px 0',
                lineHeight: 1.5
              }}>
                This is a sample ad description that shows how your ad will appear to visitors.
              </p>
            )}

            {settings.showCTA && (
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: settings.ctaBackground,
                color: settings.ctaColor,
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: `${settings.ctaSize}px`,
                fontWeight: '500',
                border: `1px solid ${settings.borderColor}`,
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}>
                Learn More →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customize Ad Space</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="flex gap-2 mb-6 border-b">
                {['layout', 'style', 'content'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium capitalize ${
                      activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Orientation Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {orientationPresets.map(preset => (
                        <button
                          key={preset.value}
                          onClick={() => handlePresetSelect(preset)}
                          className={`p-3 border-2 rounded-lg text-xs font-medium ${
                            settings.orientation === preset.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Width: {settings.width}px</label>
                    <input
                      type="range"
                      min="160"
                      max="1200"
                      value={settings.width}
                      onChange={(e) => updateSetting('width', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Height: {settings.height}px</label>
                    <input
                      type="range"
                      min="90"
                      max="800"
                      value={settings.height}
                      onChange={(e) => updateSetting('height', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Image Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['top', 'left'].map(pos => (
                        <button
                          key={pos}
                          onClick={() => updateSetting('imagePosition', pos)}
                          className={`p-2 border-2 rounded-lg text-sm capitalize ${
                            settings.imagePosition === pos
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Border Radius: {settings.borderRadius}px</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={settings.borderRadius}
                      onChange={(e) => updateSetting('borderRadius', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Padding: {settings.padding}px</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={settings.padding}
                      onChange={(e) => updateSetting('padding', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Shadow</label>
                    <select
                      value={settings.shadow}
                      onChange={(e) => updateSetting('shadow', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      {shadowOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Glassmorphism</label>
                    <button
                      onClick={() => updateSetting('glassmorphism', !settings.glassmorphism)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.glassmorphism ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.glassmorphism ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Image</label>
                    <button
                      onClick={() => updateSetting('showImage', !settings.showImage)}
                      className={`w-12 h-6 rounded-full ${settings.showImage ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showImage ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Description</label>
                    <button
                      onClick={() => updateSetting('showDescription', !settings.showDescription)}
                      className={`w-12 h-6 rounded-full ${settings.showDescription ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showDescription ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title Size: {settings.titleSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      value={settings.titleSize}
                      onChange={(e) => updateSetting('titleSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description Size: {settings.descriptionSize}px</label>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={settings.descriptionSize}
                      onChange={(e) => updateSetting('descriptionSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4 flex gap-2">
                {[
                  { name: 'desktop', icon: Monitor },
                  { name: 'tablet', icon: Tablet },
                  { name: 'mobile', icon: Smartphone }
                ].map(device => (
                  <button
                    key={device.name}
                    onClick={() => setPreviewDevice(device.name)}
                    className={`p-2 rounded-lg ${
                      previewDevice === device.name ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <device.icon size={20} />
                  </button>
                ))}
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-8 overflow-auto">
                {generateAdPreview()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Customization</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdCustomizationModal;