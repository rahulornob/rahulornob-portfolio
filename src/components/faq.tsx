"use client";

import Image from "next/image";
import type { FaqContent } from "@/cms/types";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import RevealHeading from "./RevealHeading";
import styles from "./faq.module.css";

const fallbackFaqs = [
  {
    question: "What kind of projects are you best at?",
    answer:
      "Visual-heavy websites are where I do my best work. I also take on mobile UI, pitch decks, brand collateral, and design-engineering work when the project needs more than static screens.",
  },
  {
    question: "Can you work with an existing team or design system?",
    answer:
      "Absolutely. I’m comfortable joining an agency or remote team, picking up an existing system, and getting productive without needing everything explained ten times.",
  },
  {
    question: "Do you only design, or do you also prototype and build?",
    answer:
      "I like taking ideas further than Figma. Depending on the project, I’ll prototype interactions, test flows, and push the design closer to something real.",
  },
  {
    question: "How do you use AI in your process?",
    answer:
      "AI handles the busywork. I make coffee. Then I put the saved time into visual direction, UX decisions, and the details where taste and judgment actually matter.",
  },
  {
    question: "Are you available for freelance, agency, or remote roles?",
    answer:
      "Yes. I’m open to freelance projects, agency collaborations, and remote roles where I can contribute as a visual-first Design Engineer and stay close to both the design and the build.",
  },
];

export function Faq({ content }: { content?: FaqContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const cmsFaqs = content?.items
    ?.filter((item) => item.question && item.answer)
    .map((item) => ({
      question: item.question as string,
      answer: item.answer as string,
    }));
  const faqs = cmsFaqs?.length ? cmsFaqs : fallbackFaqs;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.faq} ${isVisible ? styles.visible : ""}`}
      aria-labelledby="faq-title"
    >
      <RevealHeading
        id="faq-title"
        className="type-heading-h1-medium"
        lines={[content?.heading ?? "Before we get into it"]}
      />

      <div className={styles.list}>
        {faqs.map((item, index) => {
          const isOpen = openItems.includes(index);
          const panelId = `faq-answer-${index}`;
          const itemStyle = { "--faq-index": index } as CSSProperties;
          const toggleItem = () =>
            setOpenItems((current) =>
              current.includes(index)
                ? current.filter((itemIndex) => itemIndex !== index)
                : [...current, index],
            );

          return (
            <article
              className={`${styles.item} ${isOpen ? styles.open : ""}`}
              style={itemStyle}
              onClick={toggleItem}
              key={item.question}
            >
              <button
                className={styles.question}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  <Image src="/icons/plus.svg" alt="" width={24} height={24} />
                </span>
              </button>

              <div
                className={styles.answer}
                id={panelId}
                aria-hidden={!isOpen}
              >
                <div className={styles.answerInner}>
                  <p>{item.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
