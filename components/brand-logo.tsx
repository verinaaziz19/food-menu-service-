import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
}

export function BrandLogo({
  href = '/dashboard',
  className = '',
  imageClassName = '',
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Ostria Ristorante Italiano"
      className={`inline-flex max-w-full items-center transition-opacity hover:opacity-90 ${className}`}
    >
      <img
        src="/ostria-logo.svg"
        alt="Ostria Ristorante Italiano"
        className={`h-16 w-auto max-w-full object-contain ${imageClassName}`}
      />
    </Link>
  );
}
