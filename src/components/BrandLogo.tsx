import Image from 'next/image';
import { useState } from 'react';
import { cn } from '../lib/cn';

const LOGO_STATIC = '/images/logo.png';
const LOGO_API = '/api/assets/logo';

type BrandLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  rounded?: 'lg' | 'full' | 'none';
};

export default function BrandLogo({
  className,
  width = 44,
  height = 44,
  priority = false,
  rounded = 'lg',
}: BrandLogoProps) {
  const [src, setSrc] = useState(LOGO_STATIC);
  const radius =
    rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-none';

  return (
    <span
      className={cn('relative inline-block shrink-0', radius, className)}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt="TrustedMM"
        width={width}
        height={height}
        priority={priority}
        unoptimized={src === LOGO_API}
        className={cn('object-contain', radius)}
        onError={() => setSrc(LOGO_API)}
      />
    </span>
  );
}
