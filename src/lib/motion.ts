import { useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function staggerItem(): Variants {
  return {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: EASE },
    },
  };
}

export function useViewportOnce() {
  const reduced = useReducedMotion();
  return {
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: { once: true, margin: '-60px' },
    transition: { duration: reduced ? 0 : 0.6, ease: EASE },
  };
}

export function staggerContainer(stagger: number = 0.1, delay: number = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: EASE },
  },
};

export const cardHover = {
  rest: { y: 0 },
  hover: { y: -6, transition: { duration: 0.35, ease: EASE } },
};
