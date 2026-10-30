import { Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/index.tsx';

export function MobileCallBar() {
  const { t, dir } = useI18n();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <a
        href={`tel:${t.common.phoneDial}`}
        className="flex items-center justify-center gap-2 bg-emerald px-4 py-3.5 text-base font-600 text-cream-50 shadow-soft"
        dir={dir}
      >
        <Phone className="h-5 w-5" />
        {t.common.callNow} — {t.common.phoneNumber}
      </a>
    </div>
  );
}
