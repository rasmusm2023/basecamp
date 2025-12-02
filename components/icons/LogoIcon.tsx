export default function LogoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4e8a0" />
          <stop offset="50%" stopColor="#a8d5ba" />
          <stop offset="100%" stopColor="#5a9c76" />
        </linearGradient>
      </defs>
      {/* Mountain/Tent shape - inverted V with flat base */}
      <path
        d="M10 5L5 15L15 15L10 5Z"
        fill="url(#logoGradient)"
      />
      {/* Vertical line inside, offset to the left, stopping before base */}
      <line
        x1="7.5"
        y1="7"
        x2="7.5"
        y2="13"
        stroke="white"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

