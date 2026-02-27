/**
 * Animation utilities for Formation Builder
 * 
 * Provides smooth transitions between steps and interactions
 */

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothTransition = {
  type: "tween",
  duration: 0.3,
  ease: "easeInOut",
};

export const bounceTransition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

// Animation variants for specific elements
export const positionPop = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: bounceTransition,
};

export const cardHover = {
  scale: 1.02,
  transition: springTransition,
};

export const cardTap = {
  scale: 0.98,
};

// Step transition directions
export const getStepTransition = (direction: 'next' | 'prev') => {
  return direction === 'next' ? fadeInRight : fadeInLeft;
};
