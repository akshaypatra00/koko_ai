import React from 'react';

export function SunburstIcon({ className = "w-6 h-6", size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Koko Sunburst Logo"
    >
      {/* Central luminous core */}
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      
      {/* Radiant Cardinal & Diagonal rays */}
      <path
        d="M12 1.5V5M12 19V22.5M1.5 12H5M19 12H22.5M4.57 4.57L7.05 7.05M16.95 16.95L19.43 19.43M4.57 19.43L7.05 16.95M16.95 7.05L19.43 4.57"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Sub-cardinal minor rays */}
      <path
        d="M12 6.5V7.5M12 16.5V17.5M6.5 12H7.5M16.5 12H17.5M8.11 8.11L8.82 8.82M15.18 15.18L15.89 15.89M8.11 15.89L8.82 15.18M15.18 8.82L15.89 8.11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Outer subtle orbital ring */}
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeDasharray="1.5 2.5"
        opacity="0.45"
      />
    </svg>
  );
}

export default SunburstIcon;
