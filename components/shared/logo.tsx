export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="9" fill="#10b981" />
      {/* Left vertical stroke of E */}
      <rect x="9" y="9" width="3" height="18" rx="1" fill="white" />
      {/* Top bar */}
      <rect x="9" y="9" width="18" height="3" rx="1" fill="white" />
      {/* Middle bar (shorter) */}
      <rect x="9" y="16.5" width="13" height="3" rx="1" fill="white" />
      {/* Bottom bar */}
      <rect x="9" y="24" width="18" height="3" rx="1" fill="white" />
    </svg>
  )
}
