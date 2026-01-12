export type Industry =
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'roofing'
  | 'landscaping'
  | 'tree_service'
  | 'construction'
  | 'cleaning'
  | 'painting'
  | 'pest_control'
  | 'locksmith'
  | 'appliance_repair'
  | 'automotive'
  | 'general';

export interface IndustryTemplate {
  id: Industry;
  label: string;
  description: string;
  services: string[];
  sources: string[];
  icon: string;
}

export const INDUSTRY_TEMPLATES: Record<Industry, IndustryTemplate> = {
  hvac: {
    id: 'hvac',
    label: 'HVAC',
    description: 'Heating, ventilation, and air conditioning services',
    services: [
      'AC Installation',
      'AC Repair',
      'Heating Installation',
      'Heating Repair',
      'Maintenance',
      'Ductwork',
      'Thermostat Installation',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Yelp', 'Angies List'],
    icon: '❄️',
  },
  plumbing: {
    id: 'plumbing',
    label: 'Plumbing',
    description: 'Plumbing repair and installation services',
    services: [
      'Leak Repair',
      'Pipe Installation',
      'Water Heater',
      'Drain Cleaning',
      'Fixture Installation',
      'Toilet Repair',
      'Sump Pump',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Yelp', 'Emergency'],
    icon: '🔧',
  },
  electrical: {
    id: 'electrical',
    label: 'Electrical',
    description: 'Electrical repair and installation services',
    services: [
      'Outlet Installation',
      'Panel Upgrade',
      'Light Installation',
      'Electrical Repair',
      'Generator Installation',
      'Wiring',
      'EV Charger Installation',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Yelp', 'Contractor'],
    icon: '⚡',
  },
  roofing: {
    id: 'roofing',
    label: 'Roofing',
    description: 'Roofing repair and replacement services',
    services: [
      'Roof Inspection',
      'Roof Repair',
      'Roof Replacement',
      'Shingles',
      'Metal Roofing',
      'Flat Roofing',
      'Gutter Installation',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Storm Damage', 'Insurance'],
    icon: '🏠',
  },
  landscaping: {
    id: 'landscaping',
    label: 'Landscaping',
    description: 'Landscaping and lawn care services',
    services: [
      'Lawn Mowing',
      'Landscaping Design',
      'Mulch Installation',
      'Patio Installation',
      'Irrigation',
      'Seasonal Cleanup',
      'Hardscape',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Seasonal'],
    icon: '🌱',
  },
  tree_service: {
    id: 'tree_service',
    label: 'Tree Service',
    description: 'Tree trimming, removal, and care services',
    services: [
      'Tree Removal',
      'Tree Trimming',
      'Stump Grinding',
      'Emergency Service',
      'Land Clearing',
      'Pruning',
      'Cable & Bracing',
      'Tree Health Assessment',
    ],
    sources: [
      'Google Ads',
      'Facebook Ads',
      'Referral',
      'Organic Search',
      'Direct',
      'Yelp',
      'Thumbtack',
      'Nextdoor',
      'Other',
    ],
    icon: '🌳',
  },
  construction: {
    id: 'construction',
    label: 'Construction',
    description: 'General construction and remodeling services',
    services: [
      'Kitchen Remodel',
      'Bathroom Remodel',
      'Room Addition',
      'Deck Building',
      'Framing',
      'Foundation Repair',
      'Demolition',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Contractor Referral'],
    icon: '🔨',
  },
  cleaning: {
    id: 'cleaning',
    label: 'Cleaning',
    description: 'Residential and commercial cleaning services',
    services: [
      'House Cleaning',
      'Office Cleaning',
      'Window Cleaning',
      'Carpet Cleaning',
      'Pressure Washing',
      'Post-Construction Cleaning',
      'Deep Cleaning',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Recurring Accounts'],
    icon: '🧹',
  },
  painting: {
    id: 'painting',
    label: 'Painting',
    description: 'Interior and exterior painting services',
    services: [
      'Interior Painting',
      'Exterior Painting',
      'Cabinet Painting',
      'Deck Staining',
      'Primer Application',
      'Specialty Finishes',
      'Drywall Prep',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Contractor'],
    icon: '🎨',
  },
  pest_control: {
    id: 'pest_control',
    label: 'Pest Control',
    description: 'Pest control and extermination services',
    services: [
      'Termite Treatment',
      'Bed Bug Treatment',
      'Ant Control',
      'Rodent Control',
      'Mosquito Treatment',
      'Wildlife Removal',
      'Pest Inspection',
    ],
    sources: ['Google Ads', 'Facebook Ads', 'Direct Call', 'Referral', 'Website', 'Recurring'],
    icon: '🦟',
  },
  locksmith: {
    id: 'locksmith',
    label: 'Locksmith',
    description: 'Locksmith and security services',
    services: [
      'Lock Installation',
      'Lock Repair',
      'Rekeying',
      'Emergency Lockout',
      'Key Duplication',
      'Safe Installation',
      'Security Upgrade',
    ],
    sources: ['Google Ads', 'Direct Call', 'Referral', 'Emergency', 'Website', 'Police Referral'],
    icon: '🔐',
  },
  appliance_repair: {
    id: 'appliance_repair',
    label: 'Appliance Repair',
    description: 'Home appliance repair services',
    services: [
      'Washer/Dryer Repair',
      'Refrigerator Repair',
      'Dishwasher Repair',
      'Oven Repair',
      'Microwave Repair',
      'Garbage Disposal',
      'Appliance Installation',
    ],
    sources: ['Google Ads', 'Direct Call', 'Referral', 'Website', 'Insurance', 'Warranty Work'],
    icon: '🔌',
  },
  automotive: {
    id: 'automotive',
    label: 'Automotive',
    description: 'Auto repair and maintenance services',
    services: [
      'Oil Change',
      'Tire Service',
      'Brake Service',
      'Engine Repair',
      'Transmission Repair',
      'Diagnostic Service',
      'Detailing',
    ],
    sources: ['Google Ads', 'Direct Call', 'Referral', 'Website', 'Insurance', 'Repeat Customers'],
    icon: '🚗',
  },
  general: {
    id: 'general',
    label: 'General Services',
    description: 'General handyman and service business',
    services: ['Service 1', 'Service 2', 'Service 3'],
    sources: ['Direct Call', 'Referral', 'Online', 'Website'],
    icon: '🛠️',
  },
};

export const INDUSTRIES = Object.values(INDUSTRY_TEMPLATES);

export function getIndustryTemplate(industryId: Industry): IndustryTemplate {
  return INDUSTRY_TEMPLATES[industryId] || INDUSTRY_TEMPLATES.general;
}
