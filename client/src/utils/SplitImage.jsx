import { useRef, useEffect } from 'react';

import { gsap } from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SplitImage = ({
  src,
  alt = '',
  className = '',

  delay = 50,

  duration = 1.25,

  ease = 'power3.out',

  from = {
    opacity: 0,
    y: 40
  },

  to = {
    opacity: 1,
    y: 0
  },

  threshold = 0.1,

  rootMargin = '-100px',

  onAnimationComplete
}) => {
  const ref = useRef(null);

  const animationCompletedRef = useRef(false);

  const onCompleteRef = useRef(onAnimationComplete);

  // Keep callback updated
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useGSAP(
    () => {
      if (!ref.current) return;

      // Prevent re-animation
      if (animationCompletedRef.current) return;

      const el = ref.current;

      // Calculate ScrollTrigger start position
      const startPct = (1 - threshold) * 100;

      // Convert rootMargin
      const marginMatch =
        /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);

      const marginValue = marginMatch
        ? parseFloat(marginMatch[1])
        : 0;

      const marginUnit = marginMatch
        ? marginMatch[2] || 'px'
        : 'px';

      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;

      const start = `top ${startPct}%${sign}`;

      // GSAP animation
      gsap.fromTo(
        el,

        {
          ...from
        },

        {
          ...to,

          duration,

          delay: delay / 1000,

          ease,

          scrollTrigger: {
            trigger: el,

            start,

            once: true,

            fastScrollEnd: true,

            anticipatePin: 0.4
          },

          onComplete: () => {
            animationCompletedRef.current = true;

            onCompleteRef.current?.();
          },

          willChange: 'transform, opacity',

          force3D: true
        }
      );
    },

    {
      dependencies: [
        delay,
        duration,
        ease,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin
      ],

      scope: ref
    }
  );

  return (
    <div className="overflow-hidden">
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`block ${className}`}
      />
    </div>
  );
};

export default SplitImage;