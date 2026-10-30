import { useI18n } from '@/lib/i18n/index.tsx';

type LogoProps = {
  variant?: 'mark' | 'full';
  className?: string;
  size?: number;
};

export function Logo({ variant = 'mark', className = '', size = 36 }: LogoProps) {
  const { locale } = useI18n();
  const id = 'logo-grad';

  const mark = (
    <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2F6BFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path
        d="M9 56 L32 14 L55 56"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 42 H29 L33 36 L37 42 H44"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 9.5 A13 13 0 0 1 41.5 9.5"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M26.5 14 A7 7 0 0 1 37.5 14"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="9" cy="56" r="4.5" fill="#2F6BFF" />
      <circle cx="55" cy="56" r="4.5" fill="#22D3EE" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={className}>{mark}</div>;
  }

  if (locale === 'fa') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {mark}
        <span
          className="font-display text-lg font-800 tracking-tight text-white"
          style={{ fontFamily: "'Vazirmatn', sans-serif" }}
        >
          عرش <span style={{ color: '#22D3EE' }}>نت</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {mark}
      <span className="font-display text-lg font-700 tracking-tight text-white">
        Arsh<span style={{ color: '#22D3EE' }}>net</span>
      </span>
    </div>
  );
}
