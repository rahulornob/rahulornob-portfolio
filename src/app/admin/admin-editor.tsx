"use client";

import {
  ChangeEvent,
  DragEvent as ReactDragEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type {
  CmsImage,
  ProjectContent,
  ServiceContent,
  SiteContent,
  TestimonialContent,
} from "@/cms/types";
import styles from "./admin.module.css";

const sections = [
  ["hero", "Hero"],
  ["about", "About"],
  ["projects", "Projects"],
  ["services", "Services"],
  ["testimonials", "Testimonials"],
  ["faq", "FAQ"],
  ["footer", "Footer"],
] as const;

type Section = (typeof sections)[number][0];

function Field({
  children,
  hint,
  label,
}: {
  children: ReactNode;
  hint?: string;
  label: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function TextInput({
  multiline = false,
  onChange,
  placeholder,
  value,
}: {
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
}) {
  const props = {
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    placeholder,
    value: value || "",
  };
  return multiline ? <textarea rows={4} {...props} /> : <input {...props} />;
}

function TagsInput({ onChange, value }: { onChange: (value: string[]) => void; value?: string[] }) {
  return (
    <input
      value={(value || []).join(", ")}
      onChange={(event) =>
        onChange(event.target.value.split(",").map((tag) => tag.trim()))
      }
      onBlur={() => onChange((value || []).filter(Boolean))}
      placeholder="Web design, UI design, Motion"
    />
  );
}

async function imageDimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: 1200, height: 800 };
  }
}

function ImageList({
  images = [],
  label = "Images",
  onChange,
  single = false,
}: {
  images?: CmsImage[];
  label?: string;
  onChange: (images: CmsImage[]) => void;
  single?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    const uploaded: CmsImage[] = [];

    try {
      for (const file of files) {
        const dimensions = await imageDimensions(file);
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/media", { method: "POST", body: form });
        const result = (await response.json()) as { error?: string; url?: string };
        if (!response.ok || !result.url) throw new Error(result.error || "Upload failed.");
        uploaded.push({ ...dimensions, alt: file.name.replace(/\.[^.]+$/, ""), url: result.url });
      }
      onChange(single ? uploaded.slice(-1) : [...images, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  }

  return (
    <div className={styles.imageField}>
      <div className={styles.fieldLabel}>{label}</div>
      {images.length ? (
        <div className={styles.imageGrid}>
          {images.map((image, index) => (
            <div className={styles.imageItem} key={`${image.url}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" />
              <input
                aria-label="Image alt text"
                value={image.alt || ""}
                onChange={(event) => {
                  const next = [...images];
                  next[index] = { ...image, alt: event.target.value };
                  onChange(next);
                }}
                placeholder="Alt text"
              />
              <div className={styles.imageActions}>
                {!single ? <button type="button" onClick={() => move(index, -1)}>←</button> : null}
                {!single ? <button type="button" onClick={() => move(index, 1)}>→</button> : null}
                <button type="button" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {(!single || !images.length) ? (
        <label className={styles.uploadButton}>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple={!single} onChange={upload} disabled={uploading} />
          {uploading ? "Uploading…" : `+ Upload ${single ? "image" : "images"}`}
        </label>
      ) : null}
      {error ? <p className={styles.formError}>{error}</p> : null}
    </div>
  );
}

function ItemHeader({
  expanded,
  index,
  label,
  onDragEnd,
  onDragStart,
  onRemove,
  onToggle,
}: {
  expanded?: boolean;
  index: number;
  label: string;
  onDragEnd: () => void;
  onDragStart: (event: ReactDragEvent<HTMLButtonElement>) => void;
  onRemove: () => void;
  onToggle?: () => void;
}) {
  return (
    <div className={styles.itemHeader}>
      {onToggle ? (
        <button
          type="button"
          className={styles.collapseTrigger}
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span>{label || `Item ${index + 1}`}</span>
          <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </button>
      ) : (
        <h3>{label || `Item ${index + 1}`}</h3>
      )}
      <div>
        <button
          type="button"
          className={styles.dragHandle}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          aria-label={`Drag to reorder ${label || `item ${index + 1}`}`}
          title="Drag to reorder"
        >
          <svg aria-hidden="true" viewBox="0 0 12 18">
            <circle cx="3" cy="3" r="1.25" />
            <circle cx="9" cy="3" r="1.25" />
            <circle cx="3" cy="9" r="1.25" />
            <circle cx="9" cy="9" r="1.25" />
            <circle cx="3" cy="15" r="1.25" />
            <circle cx="9" cy="15" r="1.25" />
          </svg>
        </button>
        <button type="button" className={styles.dangerButton} onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}

function moveItem<T>(items: T[], from: number, destination: number) {
  if (from === destination || destination < 0 || destination >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(destination, 0, item);
  return next;
}

export function AdminEditor({
  editingEnabled,
  initialContent,
}: {
  editingEnabled: boolean;
  initialContent: SiteContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(() => structuredClone(initialContent));
  const [publishedSnapshot, setPublishedSnapshot] = useState(() => JSON.stringify(initialContent));
  const [active, setActive] = useState<Section>("hero");
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    () => new Set(),
  );
  const [dragging, setDragging] = useState<{
    group: "projects" | "services" | "testimonials" | "faq";
    index: number;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  const contentSnapshot = useMemo(() => JSON.stringify(content), [content]);
  const dirty = contentSnapshot !== publishedSnapshot;

  function setProjects(projects: ProjectContent[]) {
    setContent((current) => ({ ...current, projects }));
  }

  function toggleProject(index: number) {
    setExpandedProjects((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function startDrag(
    event: ReactDragEvent<HTMLButtonElement>,
    group: "projects" | "services" | "testimonials" | "faq",
    index: number,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${group}:${index}`);
    setDragging({ group, index });
  }

  function allowDrop(
    event: ReactDragEvent<HTMLDivElement>,
    group: "projects" | "services" | "testimonials" | "faq",
  ) {
    if (dragging?.group !== group) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function setServices(items: ServiceContent[]) {
    setContent((current) => ({
      ...current,
      servicesSection: { ...current.servicesSection, items },
    }));
  }

  function setTestimonials(items: TestimonialContent[]) {
    setContent((current) => ({
      ...current,
      testimonialsSection: { ...current.testimonialsSection, items },
    }));
  }

  const saveContent = useCallback(async (
    snapshot: string,
    automatic = false,
  ) => {
    if (!editingEnabled) return;
    setPublishing(true);
    setNotice(automatic ? "Autosaving…" : "Saving…");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: snapshot,
    });
    const result = (await response.json()) as { error?: string };
    setPublishing(false);
    if (!response.ok) return setNotice(result.error || "Unable to publish.");
    setPublishedSnapshot(snapshot);
    setNotice(automatic ? "Autosaved locally" : "Saved locally");
  }, [editingEnabled]);

  useEffect(() => {
    if (!editingEnabled || !dirty) return;

    const timer = window.setTimeout(() => {
      void saveContent(contentSnapshot, true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [contentSnapshot, dirty, editingEnabled, saveContent]);

  function publish() {
    void saveContent(contentSnapshot);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const hero = content.hero || {};
  const about = content.about || {};
  const services = content.servicesSection || {};
  const testimonials = content.testimonialsSection || {};
  const faq = content.faqSection || {};
  const footer = content.footer || {};

  return (
    <main className={styles.dashboard} data-read-only={!editingEnabled}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandMark}>R</div>
          <div><strong>Portfolio CMS</strong><span>rahulornob.com</span></div>
        </div>
        <nav>
          {sections.map(([id, label]) => (
            <button key={id} type="button" className={active === id ? styles.activeNav : ""} onClick={() => setActive(id)}>{label}</button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <a href="/" target="_blank">View website ↗</a>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <section className={styles.editorShell}>
        <header className={styles.topbar}>
          <div>
            <span className={`${styles.statusDot} ${dirty ? styles.statusUnsaved : ""}`} />
            {!editingEnabled
              ? "Production preview — edit locally"
              : dirty
                ? "Unsaved changes"
                : "Everything published"}
          </div>
          <div className={styles.topbarActions}>
            {notice ? <span>{notice}</span> : null}
            <button className={styles.primaryButton} type="button" onClick={publish} disabled={!editingEnabled || !dirty || publishing}>{publishing ? "Saving…" : editingEnabled ? "Save locally" : "Local editing only"}</button>
          </div>
        </header>

        <div className={styles.editor}>
          <div className={styles.mobileTabs}>
            {sections.map(([id, label]) => <button key={id} type="button" className={active === id ? styles.activeTab : ""} onClick={() => setActive(id)}>{label}</button>)}
          </div>

          {active === "hero" ? (
            <SectionPanel title="Hero" description="The first screen people see.">
              <Field label="Headline"><TextInput multiline value={hero.headline} onChange={(headline) => setContent((current) => ({ ...current, hero: { ...current.hero, headline } }))} /></Field>
              <Field label="Intro"><TextInput multiline value={hero.intro} onChange={(intro) => setContent((current) => ({ ...current, hero: { ...current.hero, intro } }))} /></Field>
              <Field label="Button label"><TextInput value={hero.ctaLabel} onChange={(ctaLabel) => setContent((current) => ({ ...current, hero: { ...current.hero, ctaLabel } }))} /></Field>
              <ImageList single label="Background image" images={hero.backgroundImage ? [hero.backgroundImage] : []} onChange={(images) => setContent((current) => ({ ...current, hero: { ...current.hero, backgroundImage: images[0] } }))} />
            </SectionPanel>
          ) : null}

          {active === "about" ? (
            <SectionPanel title="About" description="Your positioning and client logo strip.">
              <Field label="Eyebrow"><TextInput value={about.eyebrow} onChange={(eyebrow) => setContent((current) => ({ ...current, about: { ...current.about, eyebrow } }))} /></Field>
              <Field label="Heading"><TextInput multiline value={about.heading} onChange={(heading) => setContent((current) => ({ ...current, about: { ...current.about, heading } }))} /></Field>
              <ImageList label="Logos" images={about.logos} onChange={(images) => setContent((current) => ({ ...current, about: { ...current.about, logos: images.map((image, index) => ({ ...image, name: image.alt || `Logo ${index + 1}` })) } }))} />
            </SectionPanel>
          ) : null}

          {active === "projects" ? (
            <SectionPanel title="Projects" description="Manage project copy, tags, gallery order, and carousel speed.">
              <Field label="Section heading" hint="Use a new line to control the heading break."><TextInput multiline value={content.projectsHeading} onChange={(projectsHeading) => setContent((current) => ({ ...current, projectsHeading }))} /></Field>
              {(content.projects || []).map((project, index) => {
                const expanded = expandedProjects.has(index);
                return (
                <div className={styles.itemCard} data-collapsed={!expanded} data-dragging={dragging?.group === "projects" && dragging.index === index} onDragOver={(event) => allowDrop(event, "projects")} onDrop={(event) => { event.preventDefault(); if (dragging?.group === "projects") setProjects(moveItem(content.projects || [], dragging.index, index)); setDragging(null); setExpandedProjects(new Set()); }} key={`project-${index}`}>
                  <ItemHeader expanded={expanded} index={index} label={project.title || "New project"} onToggle={() => toggleProject(index)} onDragStart={(event) => startDrag(event, "projects", index)} onDragEnd={() => setDragging(null)} onRemove={() => { setProjects((content.projects || []).filter((_, itemIndex) => itemIndex !== index)); setExpandedProjects(new Set()); }} />
                  {expanded ? <>
                  <div className={styles.twoColumns}>
                    <Field label="Title"><TextInput value={project.title} onChange={(title) => { const next = [...(content.projects || [])]; next[index] = { ...project, title }; setProjects(next); }} /></Field>
                    <Field label="Slug"><TextInput value={project.slug} onChange={(slug) => { const next = [...(content.projects || [])]; next[index] = { ...project, slug }; setProjects(next); }} /></Field>
                  </div>
                  <Field label="Description"><TextInput multiline value={project.description} onChange={(description) => { const next = [...(content.projects || [])]; next[index] = { ...project, description }; setProjects(next); }} /></Field>
                  <div className={styles.twoColumns}>
                    <Field label="Tags" hint="Separate tags with commas."><TagsInput value={project.tags} onChange={(tags) => { const next = [...(content.projects || [])]; next[index] = { ...project, tags }; setProjects(next); }} /></Field>
                    <Field label="Carousel duration (seconds)"><input type="number" min="10" max="180" value={project.autoplayDuration || 42} onChange={(event) => { const next = [...(content.projects || [])]; next[index] = { ...project, autoplayDuration: Number(event.target.value) }; setProjects(next); }} /></Field>
                  </div>
                  <ImageList images={project.images} onChange={(images) => { const next = [...(content.projects || [])]; next[index] = { ...project, images }; setProjects(next); }} />
                  </> : null}
                </div>
              );})}
              <button className={styles.addButton} type="button" onClick={() => { const nextIndex = (content.projects || []).length; setProjects([...(content.projects || []), { title: "New project", slug: `project-${Date.now()}`, description: "", tags: [], autoplayDuration: 42, images: [] }]); setExpandedProjects(new Set([nextIndex])); }}>+ Add project</button>
            </SectionPanel>
          ) : null}

          {active === "services" ? (
            <SectionPanel title="Services" description="The accordion items in your services section.">
              <Field label="Heading"><TextInput value={services.heading} onChange={(heading) => setContent((current) => ({ ...current, servicesSection: { ...current.servicesSection, heading } }))} /></Field>
              <Field label="Intro"><TextInput multiline value={services.intro} onChange={(intro) => setContent((current) => ({ ...current, servicesSection: { ...current.servicesSection, intro } }))} /></Field>
              {(services.items || []).map((service, index) => (
                <div className={styles.itemCard} data-dragging={dragging?.group === "services" && dragging.index === index} onDragOver={(event) => allowDrop(event, "services")} onDrop={(event) => { event.preventDefault(); if (dragging?.group === "services") setServices(moveItem(services.items || [], dragging.index, index)); setDragging(null); }} key={`service-${index}`}>
                  <ItemHeader index={index} label={service.title || "New service"} onDragStart={(event) => startDrag(event, "services", index)} onDragEnd={() => setDragging(null)} onRemove={() => setServices((services.items || []).filter((_, itemIndex) => itemIndex !== index))} />
                  <div className={styles.twoColumns}>
                    <Field label="Title"><TextInput value={service.title} onChange={(title) => { const next = [...(services.items || [])]; next[index] = { ...service, title }; setServices(next); }} /></Field>
                    <Field label="ID"><TextInput value={service.id} onChange={(id) => { const next = [...(services.items || [])]; next[index] = { ...service, id }; setServices(next); }} /></Field>
                  </div>
                  <Field label="Description"><TextInput multiline value={service.description} onChange={(description) => { const next = [...(services.items || [])]; next[index] = { ...service, description }; setServices(next); }} /></Field>
                  <Field label="Tags"><TagsInput value={service.tags} onChange={(tags) => { const next = [...(services.items || [])]; next[index] = { ...service, tags }; setServices(next); }} /></Field>
                  <ImageList images={service.images} onChange={(images) => { const next = [...(services.items || [])]; next[index] = { ...service, images }; setServices(next); }} />
                </div>
              ))}
              <button className={styles.addButton} type="button" onClick={() => setServices([...(services.items || []), { title: "New service", id: `service-${Date.now()}`, description: "", tags: [], images: [] }])}>+ Add service</button>
            </SectionPanel>
          ) : null}

          {active === "testimonials" ? (
            <SectionPanel title="Testimonials" description="Client quotes, people, and company details.">
              <Field label="Heading"><TextInput value={testimonials.heading} onChange={(heading) => setContent((current) => ({ ...current, testimonialsSection: { ...current.testimonialsSection, heading } }))} /></Field>
              {(testimonials.items || []).map((item, index) => (
                <div className={styles.itemCard} data-dragging={dragging?.group === "testimonials" && dragging.index === index} onDragOver={(event) => allowDrop(event, "testimonials")} onDrop={(event) => { event.preventDefault(); if (dragging?.group === "testimonials") setTestimonials(moveItem(testimonials.items || [], dragging.index, index)); setDragging(null); }} key={`testimonial-${index}`}>
                  <ItemHeader index={index} label={item.author || "New testimonial"} onDragStart={(event) => startDrag(event, "testimonials", index)} onDragEnd={() => setDragging(null)} onRemove={() => setTestimonials((testimonials.items || []).filter((_, itemIndex) => itemIndex !== index))} />
                  <Field label="Quote"><TextInput multiline value={item.quote} onChange={(quote) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, quote }; setTestimonials(next); }} /></Field>
                  <div className={styles.threeColumns}>
                    <Field label="Name"><TextInput value={item.author} onChange={(author) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, author }; setTestimonials(next); }} /></Field>
                    <Field label="Role"><TextInput value={item.role} onChange={(role) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, role }; setTestimonials(next); }} /></Field>
                    <Field label="Company"><TextInput value={item.company} onChange={(company) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, company }; setTestimonials(next); }} /></Field>
                  </div>
                  <div className={styles.twoColumns}>
                    <ImageList single label="Portrait" images={item.portrait ? [item.portrait] : []} onChange={(images) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, portrait: images[0] }; setTestimonials(next); }} />
                    <ImageList single label="Company logo" images={item.companyLogo ? [item.companyLogo] : []} onChange={(images) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, companyLogo: images[0] }; setTestimonials(next); }} />
                  </div>
                </div>
              ))}
              <button className={styles.addButton} type="button" onClick={() => setTestimonials([...(testimonials.items || []), { quote: "", author: "New testimonial", role: "", company: "" }])}>+ Add testimonial</button>
            </SectionPanel>
          ) : null}

          {active === "faq" ? (
            <SectionPanel title="FAQ" description="Questions shown before the footer.">
              <Field label="Heading"><TextInput value={faq.heading} onChange={(heading) => setContent((current) => ({ ...current, faqSection: { ...current.faqSection, heading } }))} /></Field>
              {(faq.items || []).map((item, index) => (
                <div className={styles.itemCard} data-dragging={dragging?.group === "faq" && dragging.index === index} onDragOver={(event) => allowDrop(event, "faq")} onDrop={(event) => { event.preventDefault(); if (dragging?.group === "faq") setContent((current) => ({ ...current, faqSection: { ...current.faqSection, items: moveItem(current.faqSection?.items || [], dragging.index, index) } })); setDragging(null); }} key={`faq-${index}`}>
                  <ItemHeader index={index} label={item.question || "New question"} onDragStart={(event) => startDrag(event, "faq", index)} onDragEnd={() => setDragging(null)} onRemove={() => setContent((current) => ({ ...current, faqSection: { ...current.faqSection, items: (current.faqSection?.items || []).filter((_, itemIndex) => itemIndex !== index) } }))} />
                  <Field label="Question"><TextInput value={item.question} onChange={(question) => setContent((current) => { const items = [...(current.faqSection?.items || [])]; items[index] = { ...item, question }; return { ...current, faqSection: { ...current.faqSection, items } }; })} /></Field>
                  <Field label="Answer"><TextInput multiline value={item.answer} onChange={(answer) => setContent((current) => { const items = [...(current.faqSection?.items || [])]; items[index] = { ...item, answer }; return { ...current, faqSection: { ...current.faqSection, items } }; })} /></Field>
                </div>
              ))}
              <button className={styles.addButton} type="button" onClick={() => setContent((current) => ({ ...current, faqSection: { ...current.faqSection, items: [...(current.faqSection?.items || []), { question: "New question", answer: "" }] } }))}>+ Add question</button>
            </SectionPanel>
          ) : null}

          {active === "footer" ? (
            <SectionPanel title="Footer" description="Contact CTA, location, navigation, and social links.">
              <div className={styles.twoColumns}>
                <Field label="Availability text"><TextInput value={footer.availabilityText} onChange={(availabilityText) => setContent((current) => ({ ...current, footer: { ...current.footer, availabilityText } }))} /></Field>
                <Field label="Email"><TextInput value={footer.email} onChange={(email) => setContent((current) => ({ ...current, footer: { ...current.footer, email } }))} /></Field>
                <Field label="Button label"><TextInput value={footer.ctaLabel} onChange={(ctaLabel) => setContent((current) => ({ ...current, footer: { ...current.footer, ctaLabel } }))} /></Field>
                <Field label="Particle text"><TextInput value={footer.particleText} onChange={(particleText) => setContent((current) => ({ ...current, footer: { ...current.footer, particleText } }))} /></Field>
                <Field label="Location"><TextInput value={footer.locationText} onChange={(locationText) => setContent((current) => ({ ...current, footer: { ...current.footer, locationText } }))} /></Field>
                <Field label="Copyright"><TextInput value={footer.copyrightText} onChange={(copyrightText) => setContent((current) => ({ ...current, footer: { ...current.footer, copyrightText } }))} /></Field>
              </div>
              <LinkEditor title="Sitemap" items={footer.sitemap || []} onChange={(sitemap) => setContent((current) => ({ ...current, footer: { ...current.footer, sitemap } }))} />
              <LinkEditor title="Social links" items={(footer.socialLinks || []).map((item) => ({ label: item.label, href: item.url }))} onChange={(items) => setContent((current) => ({ ...current, footer: { ...current.footer, socialLinks: items.map((item) => ({ label: item.label, url: item.href })) } }))} />
            </SectionPanel>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function SectionPanel({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return (
    <section className={styles.sectionPanel}>
      <header><p className={styles.eyebrow}>Content</p><h1>{title}</h1><p className={styles.muted}>{description}</p></header>
      <div className={styles.formStack}>{children}</div>
    </section>
  );
}

function LinkEditor({
  items,
  onChange,
  title,
}: {
  items: Array<{ href?: string; label?: string }>;
  onChange: (items: Array<{ href?: string; label?: string }>) => void;
  title: string;
}) {
  return (
    <div className={styles.linkEditor}>
      <div className={styles.fieldLabel}>{title}</div>
      {items.map((item, index) => (
        <div className={styles.linkRow} key={`link-${index}`}>
          <input aria-label={`${title} label`} value={item.label || ""} placeholder="Label" onChange={(event) => { const next = [...items]; next[index] = { ...item, label: event.target.value }; onChange(next); }} />
          <input aria-label={`${title} URL`} value={item.href || ""} placeholder="URL or #section" onChange={(event) => { const next = [...items]; next[index] = { ...item, href: event.target.value }; onChange(next); }} />
          <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>×</button>
        </div>
      ))}
      <button className={styles.addButton} type="button" onClick={() => onChange([...items, { label: "New link", href: "" }])}>+ Add link</button>
    </div>
  );
}
