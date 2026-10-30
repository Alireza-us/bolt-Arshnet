import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
      align?: 'center' | 'start';
}) {
  const reduced = useReducedMotion();
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : 'text-start'}`}
    >
      {eyebrow && (
        <div className="mb-3 text-xs font-600 uppercase tracking-[0.2em] text-champagne-600">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-700 leading-[1.15] text-ink sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
