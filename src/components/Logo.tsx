import { useI18n } from '@/lib/i18n/index.tsx';

type LogoProps = {
  variant?: 'mark' | 'full';
  className?: string;
  size?: number;
};

export function Logo({ variant = 'mark', className = '', size = 36 }: LogoProps) {
  const { locale } = useI18n();
  const markColor = '#1F3D36';

  const mark = (
    <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0" aria-hidden="true">
      <path
        d="M9 56 L32 14 L55 56"
        fill="none"
        stroke={markColor}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 42 H29 L33 36 L37 42 H44"
        fill="none"
        stroke={markColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 9.5 A13 13 0 0 1 41.5 9.5"
        fill="none"
        stroke={markColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M26.5 14 A7 7 0 0 1 37.5 14"
        fill="none"
        stroke="#C8A15A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="9" cy="56" r="4.5" fill={markColor} />
      <circle cx="55" cy="56" r="4.5" fill={markColor} />
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
          className="font-display text-lg font-800 tracking-tight text-ink"
          style={{ fontFamily: "'Vazirmatn', sans-serif" }}
        >
          عرش <span style={{ color: '#C8A15A' }}>نت</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {mark}
      <span className="font-display text-lg font-700 tracking-tight text-ink">
        Arsh<span style={{ color: '#C8A15A' }}>net</span>
      </span>
    </div>
  );
}
