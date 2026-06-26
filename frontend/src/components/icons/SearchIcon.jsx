export default function SearchIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M17.4782 27.374C22.9435 27.374 27.3741 22.9435 27.3741 17.4782C27.3741 12.0129 22.9435 7.58238 17.4782 7.58238C12.0129 7.58238 7.5824 12.0129 7.5824 17.4782C7.5824 22.9435 12.0129 27.374 17.4782 27.374Z" 
        stroke="currentColor" // ➔ THE MAGIC CHAMELEON SWAP
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M28.4157 28.4157L26.3324 26.3324" 
        stroke="currentColor" // ➔ THE MAGIC CHAMELEON SWAP
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}