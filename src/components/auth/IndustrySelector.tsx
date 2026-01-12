'use client';

import { INDUSTRIES } from '@/lib/constants/industries';

interface IndustrySelectorProps {
  value: string;
  onChange: (industryId: string) => void;
}

export function IndustrySelector({ value, onChange }: IndustrySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">What&apos;s your industry?</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry.id}
            onClick={() => onChange(industry.id)}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              value === industry.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{industry.icon}</div>
            <div className="font-medium text-sm">{industry.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
