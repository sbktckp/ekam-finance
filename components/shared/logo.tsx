import Image from 'next/image'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Ekam Finance"
      width={size}
      height={size}
      style={{ objectFit: 'contain', width: 'auto', height: size }}
      priority
    />
  )
}
