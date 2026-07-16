import { Link } from 'react-router-dom';

interface LogoProps {
  small?: boolean;
  className?: string;
  to?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function Logo({
  small = false,
  className = '',
  to = '/',
  onClick,
  'aria-label': ariaLabel,
}: LogoProps) {
  const content = (
    <>
      <img src="/logo/favicon-32x32.png" alt="Mailvoidr" className="h-6 w-6" />
      {!small && (
        <span className="font-medium text-[15px] tracking-tight tracking-[0.03em] font-display font-semibold">
          Mailvoidr<span className="text-primary">.</span>
        </span>
      )}
    </>
  );

  const sharedClassName = `inline-flex items-center gap-2 group ${small ? 'justify-center' : ''} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        data-testid="brand-logo"
        aria-label={ariaLabel}
        className={sharedClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={to} data-testid="brand-logo" className={sharedClassName}>
      {content}
    </Link>
  );
}
