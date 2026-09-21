"use client";

import { useEffect, useRef } from "react";
import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type RevealOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
};

type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>;

/**
 * 원본 mockup의 `.reveal` scroll-in 애니메이션을 그대로 옮긴 wrapper.
 * IntersectionObserver로 15% 노출 시 `is-visible`을 붙이고 이후 관찰을 해제한다.
 * (threshold: 0.15, rootMargin: "0px 0px -8% 0px" — 원본과 동일한 값)
 */
export default function Reveal<T extends ElementType = "div">({
  as,
  children,
  className,
  ...rest
}: RevealProps<T>) {
  const Tag = (as || "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mergedClassName = className ? `reveal ${className}` : "reveal";

  return (
    <Tag ref={ref} className={mergedClassName} {...rest}>
      {children}
    </Tag>
  );
}
