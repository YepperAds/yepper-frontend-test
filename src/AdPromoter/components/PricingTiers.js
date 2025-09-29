// PricingTiers.js
import React, { useState, useEffect } from 'react';
import { DollarSign, Users } from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent,
  Text,
  Grid,
} from '../../components/components';

const PricingTiers = ({ selectedPrice, onPriceSelect }) => {
  const [customPrice, setCustomPrice] = useState(selectedPrice?.price || '');
  const [customVisitors, setCustomVisitors] = useState(selectedPrice?.visitors || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedPrice?.price) setCustomPrice(selectedPrice.price);
    if (selectedPrice?.visitors) setCustomVisitors(selectedPrice.visitors);
  }, [selectedPrice]);

  const formatNumber = (num) => {
    if (!num) return '';
    const number = parseInt(num.toString().replace(/,/g, ''));
    return number.toLocaleString();
  };

  const getTierFromVisitors = (visitors) => {
    const visitorCount = parseInt(visitors) || 0;
    if (visitorCount <= 5000) return 'bronze';
    if (visitorCount <= 25000) return 'silver';
    if (visitorCount <= 100000) return 'gold';
    return 'platinum';
  };

  const getDisplayTier = (visitors) => {
    const visitorCount = parseInt(visitors) || 0;
    if (visitorCount <= 5000) return 'Bronze (Starter)';
    if (visitorCount <= 25000) return 'Silver (Growth)';
    if (visitorCount <= 100000) return 'Gold (Professional)';
    return 'Platinum (Enterprise)';
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomPrice(value);
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: null }));
    }
    
    // Auto-save when both fields have values
    if (value && customVisitors) {
      const visitors = parseInt(customVisitors);
      const tier = getTierFromVisitors(visitors);
      
      onPriceSelect({
        price: parseInt(value),
        visitors: visitors,
        tier: tier,
        visitorRange: {
          min: Math.max(0, visitors - 1000),
          max: visitors + 1000
        }
      });
    }
  };

  const handleVisitorsChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomVisitors(value);
    if (errors.visitors) {
      setErrors(prev => ({ ...prev, visitors: null }));
    }
    
    // Auto-save when both fields have values
    if (customPrice && value) {
      const visitors = parseInt(value);
      const tier = getTierFromVisitors(visitors);
      
      onPriceSelect({
        price: parseInt(customPrice),
        visitors: visitors,
        tier: tier,
        visitorRange: {
          min: Math.max(0, visitors - 1000),
          max: visitors + 1000
        }
      });
    }
  };

  const getPricePerVisitor = () => {
    if (!customPrice || !customVisitors) return 0;
    return (parseInt(customPrice) / parseInt(customVisitors) * 1000).toFixed(4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Set Your Custom Pricing</h3>
        <Card>
          <CardContent className="p-6">
            <Grid cols={2} gap={4}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Text variant="body" className="font-medium">Monthly Price</Text>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                  <input
                    type="text"
                    value={customPrice ? formatNumber(customPrice) : ''}
                    onChange={handlePriceChange}
                    placeholder="0"
                    className={`w-full pl-8 pr-4 py-3 border border-gray-300 bg-white text-lg font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-gray-500 ${
                      errors.price ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.price && <Text variant="error">{errors.price}</Text>}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Text variant="body" className="font-medium">Monthly Visitors</Text>
                </div>
                <input
                  type="text"
                  value={customVisitors ? formatNumber(customVisitors) : ''}
                  onChange={handleVisitorsChange}
                  placeholder="10,000"
                  className={`w-full px-4 py-3 border border-gray-300 bg-white text-lg font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-gray-500 ${
                    errors.visitors ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.visitors && <Text variant="error">{errors.visitors}</Text>}
              </div>
            </Grid>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default PricingTiers;