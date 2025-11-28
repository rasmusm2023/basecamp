export default function XCircle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="8" cy="8" r="7" fill="none" stroke="white" strokeWidth="1" />
      <path
        d="M6 6L10 10M10 6L6 10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
