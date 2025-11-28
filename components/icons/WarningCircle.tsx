export default function WarningCircle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        fill="#a34646"
        stroke="#fa8282"
        strokeWidth="1"
      />
      <path
        d="M8 4V8M8 12H8.01"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
