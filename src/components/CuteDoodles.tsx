import React from 'react';

// Hand-drawn floppy-eared dog head SVG peeking from the top/corner
export const CutePuppyHead: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-40 h-40 select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue decorative wave/curl lines on the left side of the puppy head */}
      <path
        d="M 30,120 Q 20,110 30,100"
        stroke="#AEDCF5"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 35,130 Q 15,115 35,95"
        stroke="#AEDCF5"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Tiny yellow sparkle on the left */}
      <path
        d="M 20,60 Q 25,60 25,55 Q 25,60 30,60 Q 25,60 25,65 Q 25,60 20,60"
        fill="#FCE068"
      />

      {/* Main Puppy Head Shape with friendly hand-drawn thick black stroke */}
      {/* Left floppy ear */}
      <path
        d="M 80,50 C 45,50 35,90 40,115 C 45,140 70,140 75,120 C 78,110 82,80 82,70"
        fill="#FFFFFF"
        stroke="#1A202C"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right floppy ear */}
      <path
        d="M 120,50 C 155,50 165,90 160,115 C 155,140 130,140 125,120 C 122,110 118,80 118,70"
        fill="#FFFFFF"
        stroke="#1A202C"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Face Circle/Oval (White filled) */}
      <path
        d="M 68,75 C 68,55 132,55 132,75 C 132,105 135,125 125,135 C 110,148 90,148 75,135 C 65,125 68,105 68,75 Z"
        fill="#FFFFFF"
        stroke="#1A202C"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cute Puppy Eyes (two thick vertical ovals, close together for cuteness) */}
      <ellipse cx="90" cy="98" rx="5" ry="8" fill="#1A202C" />
      <ellipse cx="110" cy="98" rx="5" ry="8" fill="#1A202C" />

      {/* Eye glints */}
      <circle cx="89" cy="95" r="1.5" fill="#FFFFFF" />
      <circle cx="109" cy="95" r="1.5" fill="#FFFFFF" />

      {/* Cute little curved eyelashes/eyebrows */}
      <path d="M 85,85 Q 90,83 95,86" stroke="#1A202C" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 105,86 Q 110,83 115,85" stroke="#1A202C" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Cute puppy nose - wide soft inverted triangle */}
      <path
        d="M 96,108 C 96,108 100,105 104,108 C 105,109 103,113 100,113 C 97,113 95,109 96,108 Z"
        fill="#1A202C"
        stroke="#1A202C"
        strokeWidth="1"
      />

      {/* Cute puppy mouth/snout lines */}
      <path d="M 100,113 Q 97,118 94,116" stroke="#1A202C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 100,113 Q 103,118 106,116" stroke="#1A202C" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Cute chubby cheeks blush (very soft pastel pink) */}
      <ellipse cx="78" cy="112" rx="7" ry="4" fill="#FBBF24" opacity="0.3" />
      <ellipse cx="122" cy="112" rx="7" ry="4" fill="#FBBF24" opacity="0.3" />

      {/* Paw peeking at the bottom right */}
      <path
        d="M 125,125 C 130,125 135,130 135,135 C 135,142 125,145 120,140"
        fill="#FFFFFF"
        stroke="#1A202C"
        strokeWidth="5.5"
        strokeLinecap="round"
        fillRule="evenodd"
      />
      <path d="M 127,130 L 126,138" stroke="#1A202C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

// Cute pink hand-drawn heart
export const PinkHeart: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-6 h-6 select-none inline-block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#F687B3"
        stroke="#1A202C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Cute hand-drawn blue sparkle/star
export const BlueSparkle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-6 h-6 select-none inline-block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4-point hand-drawn star */}
      <path
        d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2"
        fill="#B9E3F8"
        stroke="#1A202C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Cute hand-drawn yellow sparkle/star
export const YellowSparkle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 select-none inline-block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4-point hand-drawn star */}
      <path
        d="M12 4 Q12 12 4 12 Q12 12 12 20 Q12 12 20 12 Q12 12 12 4"
        fill="#FCE068"
        stroke="#1A202C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Cute cloud background for categories like 寄养/日托
export const CuteCloudTag: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center px-6 py-2 select-none ${className}`}>
      {/* Blue Cloud Blob Shape */}
      <div className="absolute inset-0 bg-[#B9E3F8] border-2 border-[#1A202C] rounded-[40%_50%_45%_55%_/_50%_45%_55%_40%] rotate-[-1deg] shadow-[2px_3px_0px_0px_#1A202C]"></div>
      
      {/* Paw Prints decoration nearby */}
      <span className="relative font-hand font-black text-[#1A202C] text-sm tracking-wide z-10 flex items-center gap-1.5">
        🐾 {text}
      </span>
    </div>
  );
};

// Hand-drawn logo from user attachment
export const HolyPawfectLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hair tuft */}
      <path
        d="M 250 125 C 248 105, 256 100, 258 108"
        stroke="#FFE29D"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Head outer contour */}
      <path
        d="M 185 130 C 160 130, 145 160, 145 195 C 145 235, 175 255, 250 255 C 325 255, 355 235, 355 195 C 355 160, 340 130, 315 130"
        stroke="#FFE29D"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Left ear */}
      <path
        d="M 185 130 C 150 135, 130 160, 130 195 C 130 230, 155 230, 165 210 C 175 190, 180 160, 185 130"
        stroke="#FFE29D"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right ear */}
      <path
        d="M 315 130 C 350 135, 370 160, 370 195 C 370 230, 345 230, 335 210 C 325 190, 320 160, 315 130"
        stroke="#FFE29D"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Eyes (Cute vertical ovals) */}
      <ellipse cx="225" cy="180" rx="6" ry="9" fill="#FFE29D" />
      <ellipse cx="275" cy="180" rx="6" ry="9" fill="#FFE29D" />
      
      {/* Blush lines */}
      <path d="M 205 195 L 205 203 M 212 195 L 212 203" stroke="#FFE29D" strokeWidth="4" strokeLinecap="round" />
      <path d="M 288 195 L 288 203 M 295 195 L 295 203" stroke="#FFE29D" strokeWidth="4" strokeLinecap="round" />
      
      {/* Cute soft round nose */}
      <ellipse cx="250" cy="190" rx="9" ry="6" fill="#FFE29D" />
      
      {/* Mouth (double curved w-smile) */}
      <path
        d="M 238 202 Q 244 212 250 202 Q 256 212 262 202"
        stroke="#FFE29D"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Left paw */}
      <path
        d="M 205 242 C 190 242, 180 252, 180 262 C 180 268, 205 268, 215 258"
        stroke="#FFE29D"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right paw */}
      <path
        d="M 295 242 C 310 242, 320 252, 320 262 C 320 268, 295 268, 285 258"
        stroke="#FFE29D"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* TEXT: Holy */}
      <text
        x="250"
        y="335"
        fontFamily='"Fredoka", "Mali", cursive'
        fontSize="72"
        fontWeight="900"
        fill="#FFE29D"
        textAnchor="middle"
      >
        Holy
      </text>

      {/* TEXT: Pawfect Day! */}
      <text
        x="250"
        y="405"
        fontFamily='"Fredoka", "Mali", cursive'
        fontSize="58"
        fontWeight="900"
        fill="#FFE29D"
        textAnchor="middle"
      >
        Pawfect Day!
      </text>

      {/* TEXT: 好厉害宠物乐园 */}
      <text
        x="250"
        y="462"
        fontFamily='"ZCOOL KuaiLe", "Fredoka", sans-serif'
        fontSize="40"
        fontWeight="900"
        fill="#FFE29D"
        textAnchor="middle"
      >
        好厉害宠物乐园
      </text>

      {/* Underline decoration under 好厉害宠物乐园 */}
      <path
        d="M 120 480 Q 250 495 380 480"
        stroke="#FFE29D"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// Cute puppy drawing only (without internal text labels), optimized with tight viewBox
export const HolyPawfectPuppy: React.FC<{ className?: string; strokeColor?: string; fillColor?: string }> = ({
  className = '',
  strokeColor = '#EBA53B',
  fillColor = '#EBA53B'
}) => {
  return (
    <svg
      viewBox="125 95 250 180"
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hair tuft */}
      <path
        d="M 250 125 C 248 105, 256 100, 258 108"
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Head outer contour */}
      <path
        d="M 185 130 C 160 130, 145 160, 145 195 C 145 235, 175 255, 250 255 C 325 255, 355 235, 355 195 C 355 160, 340 130, 315 130"
        stroke={strokeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Left ear */}
      <path
        d="M 185 130 C 150 135, 130 160, 130 195 C 130 230, 155 230, 165 210 C 175 190, 180 160, 185 130"
        stroke={strokeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right ear */}
      <path
        d="M 315 130 C 350 135, 370 160, 370 195 C 370 230, 345 230, 335 210 C 325 190, 320 160, 315 130"
        stroke={strokeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Eyes (Cute vertical ovals) */}
      <ellipse cx="225" cy="180" rx="6" ry="9" fill={fillColor} />
      <ellipse cx="275" cy="180" rx="6" ry="9" fill={fillColor} />
      
      {/* Blush lines */}
      <path d="M 205 195 L 205 203 M 212 195 L 212 203" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 288 195 L 288 203 M 295 195 L 295 203" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      
      {/* Cute soft round nose */}
      <ellipse cx="250" cy="190" rx="9" ry="6" fill={fillColor} />
      
      {/* Mouth (double curved w-smile) */}
      <path
        d="M 238 202 Q 244 212 250 202 Q 256 212 262 202"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Left paw */}
      <path
        d="M 205 242 C 190 242, 180 252, 180 262 C 180 268, 205 268, 215 258"
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right paw */}
      <path
        d="M 295 242 C 310 242, 320 252, 320 262 C 320 268, 295 268, 285 258"
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

