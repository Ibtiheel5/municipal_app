import React from 'react';

export const LogoRepublic = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#0A1F3D', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#1A3A5C', stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#C9A84C', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#E8D5A3', stopOpacity:1}} />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>

    {/* Cercle extérieur avec dégradé */}
    <circle cx="100" cy="100" r="95" fill="url(#bgGrad)" stroke="url(#goldGrad)" strokeWidth="3"/>

    {/* Cercle intérieur blanc */}
    <circle cx="100" cy="100" r="82" fill="white" stroke="#C9A84C" strokeWidth="1.5"/>

    {/* Étoile rouge - positionnée correctement */}
    <path
      d="M100 30 L109 58 L139 58 L115 75 L124 103 L100 86 L76 103 L85 75 L61 58 L91 58 Z"
      fill="#E31B23"
    />

    {/* Croissant rouge */}
    <path
      d="M68 45 C88 25, 140 35, 135 78 C130 120, 78 130, 58 105 C38 80, 48 65, 68 45Z"
      fill="#E31B23"
    />

    {/* Texte "RÉPUBLIQUE TUNISIENNE" */}
    <text
      x="100"
      y="175"
      textAnchor="middle"
      fontSize="12"
      fill="#1A3A5C"
      fontWeight="700"
      fontFamily="Arial, Helvetica, sans-serif"
      letterSpacing="2.5"
    >
      RÉPUBLIQUE
    </text>
    <text
      x="100"
      y="190"
      textAnchor="middle"
      fontSize="10"
      fill="#1A3A5C"
      fontWeight="600"
      fontFamily="Arial, Helvetica, sans-serif"
      letterSpacing="3"
    >
      TUNISIENNE
    </text>
  </svg>
);