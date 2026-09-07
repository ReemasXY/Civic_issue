import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.05,
  baseRotation = 1.5,
  blurStrength = 8,
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom 80%",
  as = "text",
  delay = 0,
}) => {
  const containerRef = useRef(null);

  // ==========================================
  // TEXT MODE
  // ==========================================

  const splitText = useMemo(() => {
    if (as !== "text") return null;

    const text = typeof children === "string" ? children : "";

    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) {
        return word;
      }

      return (
        <span
          key={index}
          className="inline-block word"
        >
          {word}
        </span>
      );
    });
  }, [children, as]);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const scroller =
      scrollContainerRef?.current || window;

    const ctx = gsap.context(() => {

      // ==========================================
      // CARD / ELEMENT MODE
      // ==========================================

      if (as === "element") {
        gsap.fromTo(
          el,
          {
            opacity: baseOpacity,

            y: 30,

            rotate: baseRotation,

            filter: enableBlur
              ? `blur(${blurStrength}px)`
              : "blur(0px)",

            willChange:
              "transform, opacity, filter",
          },
          {
            opacity: 1,

            y: 0,

            rotate: 0,

            filter: "blur(0px)",

            ease: "none",

            delay: delay,

            scrollTrigger: {
              trigger: el,
              scroller,

              start: "top 88%",

              end: "top 55%",

              scrub: 1.2,

              // IMPORTANT
              // Allows animation to reverse
              // when scrolling back up.
              once: false,
            },
          }
        );

        return;
      }

      // ==========================================
      // TEXT MODE
      // ==========================================

      const words = el.querySelectorAll(".word");

      if (!words.length) return;

      // Opacity + blur
      gsap.fromTo(
        words,
        {
          opacity: baseOpacity,

          filter: enableBlur
            ? `blur(${blurStrength}px)`
            : "blur(0px)",

          willChange:
            "transform, opacity, filter",
        },
        {
          opacity: 1,

          filter: "blur(0px)",

          stagger: 0.08,

          ease: "none",

          scrollTrigger: {
            trigger: el,
            scroller,

            start: "top 85%",

            end: wordAnimationEnd,

            scrub: 1.2,

            once: false,
          },
        }
      );

      // Rotation
      gsap.fromTo(
        el,
        {
          transformOrigin: "50% 100%",
          rotate: baseRotation,
        },
        {
          rotate: 0,

          ease: "none",

          scrollTrigger: {
            trigger: el,
            scroller,

            start: "top 90%",

            end: rotationEnd,

            scrub: 1.5,

            once: false,
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [
    children,
    as,
    scrollContainerRef,
    enableBlur,
    baseOpacity,
    baseRotation,
    blurStrength,
    rotationEnd,
    wordAnimationEnd,
    delay,
  ]);

  // ==========================================
  // ELEMENT MODE
  // ==========================================

  if (as === "element") {
    return (
      <div ref={containerRef}>
        {children}
      </div>
    );
  }

  // ==========================================
  // TEXT MODE
  // ==========================================

  return (
    <span ref={containerRef}>
      {splitText}
    </span>
  );
};

export default ScrollReveal;