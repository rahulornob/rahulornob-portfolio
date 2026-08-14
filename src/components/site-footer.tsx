"use client";

import Image from "next/image";
import type { FooterContent } from "@/sanity/types";
import { useEffect, useRef, useState } from "react";
import ButtonSwooshContent from "./ButtonSwooshContent";
import Magnet from "./Magnet";
import ParticleText from "./ParticleText";
import styles from "./site-footer.module.css";

const fallbackSitemap = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Playground", href: "#playground" },
  { label: "Contact", href: "#contact" },
];

const fallbackSocialLinks = ["Linkedin", "X (Twitter)", "Instagram", "Behance"];

export function SiteFooter({ content }: { content?: FooterContent }) {
  const footerRef = useRef<HTMLElement>(null);
  const revealSpaceRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [toastId, setToastId] = useState<number | null>(null);
  const email = content?.email ?? "hey@rahulornob.com";
  const sitemap = content?.sitemap?.length
    ? content.sitemap.filter((link) => link.label && link.href)
    : fallbackSitemap;
  const socialLinks: Array<{ label?: string; url?: string }> =
    content?.socialLinks?.length
    ? content.socialLinks.filter((link) => link.label)
    : fallbackSocialLinks.map((label) => ({ label }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastId(Date.now());
    toastTimerRef.current = window.setTimeout(() => setToastId(null), 2400);
  };

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const revealSpace = revealSpaceRef.current;
    if (!revealSpace) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(revealSpace);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    const revealSpace = revealSpaceRef.current;
    if (!footer || !revealSpace) return;

    const syncRevealSpace = () => {
      revealSpace.style.height = `${footer.offsetHeight}px`;
    };
    const resizeObserver = new ResizeObserver(syncRevealSpace);

    syncRevealSpace();
    resizeObserver.observe(footer);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <div
        ref={revealSpaceRef}
        id="contact"
        className={styles.revealSpace}
        aria-hidden="true"
      />
      <footer
        ref={footerRef}
        className={`${styles.footer} ${isVisible ? styles.visible : ""}`}
      >
      <div className={styles.contactRow}>
        <div className={styles.contactInfo}>
          <div className={styles.emailInfo}>
            <p>{content?.availabilityText ?? "Available for projects"}</p>
            <button
              className={styles.emailButton}
              type="button"
              aria-label={`Copy ${email}`}
              onClick={copyEmail}
            >
              {email}
            </button>
          </div>

          <div className={styles.actions}>
            <Magnet
              padding={50}
              disabled={false}
              magnetStrength={10}
              activeTransition="transform 280ms cubic-bezier(0.16, 1, 0.3, 1)"
              inactiveTransition="transform 850ms cubic-bezier(0.16, 1, 0.3, 1)"
              wrapperClassName={styles.actionMagnet}
            >
              <a
                className={`${styles.primaryAction} button-swoosh`}
                href={`mailto:${email}`}
              >
                <ButtonSwooshContent
                  text={content?.ctaLabel ?? "Start conversation"}
                />
              </a>
            </Magnet>
          </div>
        </div>

        <nav className={styles.linkGroups} aria-label="Footer navigation">
          <div className={styles.linkGroup}>
            <p>Sitemap</p>
            <div>
              {sitemap.map((link) => (
                <a href={link.href as string} key={link.label}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.linkGroup}>
            <p>Connect</p>
            <div>
              {socialLinks.map((link) =>
                link.url ? (
                  <a href={link.url} key={link.label} rel="noreferrer" target="_blank">
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label}>{link.label}</span>
                ),
              )}
            </div>
          </div>
        </nav>
      </div>

      <div className={styles.banner}>
        <ParticleText
          text={content?.particleText ?? "rahulornob"}
          particleSize={3}
          particleGap={5}
          mouseRadius={80}
          mouseStrength={5}
        />
      </div>

      <div className={styles.metaRow}>
        <div className={styles.location}>
          <Image
            src="/footer/location-toggle.svg"
            alt=""
            width={22}
            height={16}
          />
          <p>{content?.locationText ?? "Based in Dhaka & Serve worldwide."}</p>
        </div>

        <div className={styles.metadata}>
          <p>
            {content?.copyrightText ??
              "Rahulornob © 2026 All Rights Reserved"}
          </p>
        </div>
      </div>

      {toastId !== null && (
        <div className={styles.toast} role="status" key={toastId}>
          Email copied
        </div>
      )}
      </footer>
    </>
  );
}
