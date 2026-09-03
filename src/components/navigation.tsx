"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./navigation.module.css";

export type NavItem = { href?: string; label?: string };

const defaultMenuItems: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About (coming soon)", href: "" },
  { label: "Playground", href: "#playground" },
  { label: "Book a Call", href: "mailto:hey@rahulornob.com" },
];

export type SocialLink = { label?: string; url?: string };

// The icon set only covers these five platforms, so unlike the menu
// links this list of labels is fixed - the CMS supplies a URL per
// platform (matched by label below) rather than a free-form list.
const socialItems = [
  { label: "X", icon: "/icons/nav-social-3.svg" },
  { label: "Dribbble", icon: "/icons/nav-social-4.svg" },
  { label: "LinkedIn", icon: "/icons/nav-social-5.svg" },
  { label: "Instagram", icon: "/icons/nav-social-6.svg" },
  { label: "Facebook", icon: "/icons/nav-social-2.svg" },
];

export function Navigation({
  items,
  socials,
}: {
  items?: NavItem[];
  socials?: SocialLink[];
}) {
  const menuItems = items?.length ? items : defaultMenuItems;
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
            {menuItems.map((item) =>
              item.href ? (
                <a
                  className="type-heading-h4-medium"
                  href={item.href}
                  key={item.label}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                // No URL set for this item (used for "coming soon" links,
                // e.g. from the admin) - render inert instead of a dead #.
                <a
                  className="type-heading-h4-medium"
                  href="#"
                  aria-disabled="true"
                  key={item.label}
                  tabIndex={-1}
                  onClick={(event) => event.preventDefault()}
                >
                  {item.label}
                </a>
              ),
            )}
          </div>

          <Image
            className={styles.divider}
            src="/icons/nav-social-1.svg"
            alt=""
            width={264}
            height={1}
          />

          <div className={styles.socials} aria-label="Social links">
            {socialItems.map((item) => {
              const url = socials?.find((social) => social.label === item.label)?.url;
              const content = (
                <>
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className={styles.visuallyHidden}>{item.label}</span>
                </>
              );
              return url ? (
                <a
                  className={styles.social}
                  href={url}
                  key={item.label}
                  title={item.label}
                  rel="noreferrer"
                  target="_blank"
                  tabIndex={isOpen ? 0 : -1}
                >
                  {content}
                </a>
              ) : (
                // No URL set for this platform yet - render inert instead
                // of a dead link, same treatment as an empty menu item.
                <span
                  className={styles.social}
                  key={item.label}
                  title={item.label}
                  aria-hidden="true"
                >
                  {content}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
