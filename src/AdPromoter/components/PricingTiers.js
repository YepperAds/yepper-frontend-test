// PricingTiers.js — silent auto-pricer: emits price based on traffic, renders nothing.
// Prices are NOT shown to web owners during space selection.
// Earnings are revealed in WebsiteDetails once real traffic is detected.
import { useEffect } from 'react';

const TRAFFIC_TIERS = [
  { tier: 'starter',  label: 'Starter',  min: 500,    max: 2000,   basePrice: 6000   },
  { tier: 'basic',    label: 'Basic',    min: 2001,   max: 10000,  basePrice: 15000  },
  { tier: 'standard', label: 'Standard', min: 10001,  max: 50000,  basePrice: 35000  },
  { tier: 'premium',  label: 'Premium',  min: 50001,  max: 200000, basePrice: 80000  },
  { tier: 'elite',    label: 'Elite',    min: 200001, max: Infinity,basePrice: 180000 },
];

const FORMAT_MULTIPLIERS = {
  'Header': 1.0,
  'Above The Fold': 1.0,
  'Banner': 1.0,
  'Bottom': 1.0,
  'Pro Footer': 1.0,
  'Beneath Title': 1.1,
  'In-Feed': 1.1,
  'Inline Content': 1.1,
  'Left Rail': 1.1,
  'Right Rail': 1.1,
  'Sidebar': 1.3,
  'Sticky Sidebar': 1.3,
  'Skyscraper': 1.3,
  'Floating': 1.6,
  'Modal': 1.6,
  'Overlay': 1.6,
  'Mobile Interstitial': 1.6,
};

export function getTierFromTraffic(monthlyVisitors) {
  const v = parseInt(monthlyVisitors) || 0;
  return TRAFFIC_TIERS.find(t => v >= t.min && v <= t.max) || TRAFFIC_TIERS[0];
}

export function getAutoPrice(monthlyVisitors, spaceType) {
  const tier = getTierFromTraffic(monthlyVisitors);
  const multiplier = FORMAT_MULTIPLIERS[spaceType] || 1.0;
  return Math.round(tier.basePrice * multiplier);
}

// Silent component — emits price data upward but renders nothing visible.
const PricingTiers = ({ selectedPrice, onPriceSelect, monthlyTraffic, spaceType }) => {
  const effectiveTraffic = (monthlyTraffic && parseInt(monthlyTraffic) >= 500)
    ? parseInt(monthlyTraffic)
    : 1000;
  const tier        = getTierFromTraffic(effectiveTraffic);
  const autoPrice   = getAutoPrice(effectiveTraffic, spaceType);
  const ownerEarns  = Math.round(autoPrice * 0.70);
  const yepperCut   = autoPrice - ownerEarns;

  useEffect(() => {
    onPriceSelect({
      price: autoPrice,
      visitors: effectiveTraffic,
      tier: tier.tier,
      visitorRange: { min: tier.min, max: tier.max === Infinity ? 9999999 : tier.max },
      ownerEarns,
      yepperCut,
    });
  }, [effectiveTraffic, spaceType]);

  return null; // No UI — pricing is revealed in WebsiteDetails after traffic is tracked
};

export default PricingTiers;
