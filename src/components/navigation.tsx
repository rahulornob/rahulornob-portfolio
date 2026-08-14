"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./navigation.module.css";

const menuItems = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Approach", href: "#approach" },
  { label: "Book a Call", href: "#contact" },
];

const socialItems = [
  { label: "X", icon: "/icons/nav-social-3.svg" },
  { label: "Dribbble", icon: "/icons/nav-social-4.svg" },
  { label: "LinkedIn", icon: "/icons/nav-social-5.svg" },
  { label: "Instagram", icon: "/icons/nav-social-6.svg" },
  { label: "Facebook", icon: "/icons/nav-social-2.svg" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Main navigation">
      <div className={`${styles.shell} ${isOpen ? styles.open : ""}`}>
        <div className={styles.bar}>
          <a
            className={styles.logo}
            href="#top"
            aria-label="Rahul Ornob, home"
          >
            <Image src="/images/logo.svg" alt="" width={52} height={32} />
          </a>

          <button
            className={styles.toggle}
            type="button"
            aria-expanded={isOpen}
            aria-controls="main-menu"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
            <span />
          </button>
        </div>

        <div
          className={styles.panel}
          id="main-menu"
          aria-hidden={!isOpen}
        >
          <div className={styles.menuLinks}>
            {menuItems.map((item) => (
              <a
                className="type-heading-h4-medium"
                href={item.href}
                key={item.label}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <Image
            className={styles.divider}
            src="/icons/nav-social-1.svg"
            alt=""
            width={264}
            height={1}
          />

          <div className={styles.socials} aria-label="Social links">
            {socialItems.map((item) => (
              <span className={styles.social} key={item.label} title={item.label}>
                <Image src={item.icon} alt="" width={20} height={20} />
                <span className={styles.visuallyHidden}>{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
