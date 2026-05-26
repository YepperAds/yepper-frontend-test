// PricingTiers.js — auto-prices based on traffic tier from the website
import React, { useEffect } from 'react';
import { TrendingUp, Users, Info } from 'lucide-react';

// Yepper pricing model (RWF) — matches yepper_web_owner_pricing.xlsx
const TRAFFIC_TIERS = [
  {
    tier: 'starter',
    label: 'Starter',
    min: 500,
    max: 2000,
    basePrice: 6000,      // Banner base (RWF)
    ownerPct: 0.70,
    color: '#6B7280',
    bg: '#F9FAFB',
  },
  {
    tier: 'basic',
    label: 'Basic',
    min: 2001,
    max: 10000,
    basePrice: 15000,
    ownerPct: 0.70,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    tier: 'standard',
    label: 'Standard',
    min: 10001,
    max: 50000,
    basePrice: 35000,
    ownerPct: 0.70,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    tier: 'premium',
    label: 'Premium',
    min: 50001,
    max: 200000,
    basePrice: 80000,
    ownerPct: 0.70,
    color: '#B45309',
    bg: '#FFFBEB',
  },
  {
    tier: 'elite',
    label: 'Elite',
    min: 200001,
    max: Infinity,
    basePrice: 180000,
    ownerPct: 0.70,
    color: '#000000',
    bg: '#F0FDF4',
  },
];

// Format multipliers per space type (matches xlsx Ad Format Definitions)
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

const formatRWF = (n) => `RWF ${Number(n).toLocaleString()}`;

const PricingTiers = ({ selectedPrice, onPriceSelect, monthlyTraffic, spaceType }) => {
  // If traffic is 0 or not yet measured, default to starter tier (1000 visitors).
  // Real traffic is auto-tracked by the Yepper script after installation.
  const effectiveTraffic = (monthlyTraffic && parseInt(monthlyTraffic) >= 500)
    ? parseInt(monthlyTraffic)
    : 1000;
  const isEstimated = !monthlyTraffic || parseInt(monthlyTraffic) < 500;

  const tier = getTierFromTraffic(effectiveTraffic);
  const autoPrice = getAutoPrice(effectiveTraffic, spaceType);
  const ownerEarns = Math.round(autoPrice * tier.ownerPct);
  const yepperCut = autoPrice - ownerEarns;

  // Auto-emit price whenever traffic or spaceType changes
  useEffect(() => {
    onPriceSelect({
      price: autoPrice,
      visitors: effectiveTraffic,
      tier: tier.tier,
      visitorRange: { min: tier.min, max: tier.max === Infinity ? 9999999 : tier.max },
      ownerEarns,
      yepperCut,
    });
  // eslint-disable-line
  }, [effectiveTraffic, spaceType]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-black">Pricing — Based on Your Traffic</h3>

      {/* Tier badge */}
      <div
        className="border p-4 flex items-center justify-between"
        style={{ borderColor: tier.color, backgroundColor: tier.bg }}
      >
        <div className="flex items-center gap-3">
          <TrendingUp size={22} style={{ color: tier.color }} />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: tier.color }}>
              {tier.label} Tier
            </span>
            <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
              <Users size={13} />
              {Number(tier.min).toLocaleString()}–{tier.max === Infinity ? '200K+' : Number(tier.max).toLocaleString()} monthly visitors
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {isEstimated ? 'starter tier (traffic not yet measured)' : 'detected from your traffic'}
        </span>
      </div>

      {/* Price breakdown */}
      <div className="border border-black p-5 space-y-3 bg-white">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Advertiser pays (monthly)</span>
          <span className="text-base font-bold text-black">{formatRWF(autoPrice)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Yepper commission (30%)</span>
          <span className="text-sm text-gray-500">− {formatRWF(yepperCut)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-black">You earn per space / month</span>
          <span className="text-lg font-bold text-green-700">{formatRWF(ownerEarns)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 flex items-start gap-1.5">
        <Info size={12} className="mt-0.5 shrink-0" />
        Price is automatically set by Yepper based on your traffic tier. You will earn 70% of each booking.
      </p>
    </div>
  );
};

export default PricingTiers;