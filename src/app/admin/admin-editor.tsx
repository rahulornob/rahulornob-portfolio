"use client";

import {
  ChangeEvent,
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  CmsImage,
  ProjectContent,
  ServiceContent,
  SiteContent,
  TestimonialContent,
} from "@/cms/types";
import styles from "./admin.module.css";

// Must match the labels in navigation.tsx's socialItems - the icon set
// only covers these five platforms, so this list is fixed rather than a
// free-form add/remove editor.
const SOCIAL_PLATFORMS = ["X", "Dribbble", "LinkedIn", "Instagram", "Facebook"];

const sections = [
  ["hero", "Hero"],
  ["navigation", "Navigation"],
  ["preloader", "Preloader"],
  ["about", "About"],
  ["projects", "Projects"],
  ["services", "Services"],
  ["testimonials", "Testimonials"],
  ["faq", "FAQ"],
  ["footer", "Footer"],
] as const;

type Section = (typeof sections)[number][0];

const sectionIconPaths: Record<Section, string[]> = {
  hero: ["M3 11.5 12 4l9-7 9 7v8a2 2 0 0 1-2 2h-4v-6H8v6H5a2 2 0 0 1-2-2z"],
  navigation: ["M4 6h16", "M4 12h16", "M4 18h16"],
  preloader: ["M12 3v4", "M12 17v4", "M3 12h4", "M17 12h4", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  about: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21a8 8 0 0 1 16 0"],
  projects: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  services: ["m14.7 6.3 3-3 3 3-3 3", "M16 8 8 16", "m6.5 13.5-4-4 3-3 4 4", "m10 14 4 4"],
  testimonials: ["M5 6h6v6H7l-3 3V7a1 1 0 0 1 1-1Z", "M14 6h5a1 1 0 0 1 1 1v8l-3-3h-3Z"],
  faq: ["M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.3-.7.8-.7 1.6", "M12 17h.01", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
  footer: ["M4 5h16", "M4 10h16", "M4 15h10", "M4 20h6"],
};

function SectionIcon({ id }: { id: Section }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {sectionIconPaths[id].map((path) => <path d={path} key={path} />)}
    </svg>
  );
}

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

function SortableList({
  children,
  grid = false,
  ids,
  onMove,
}: {
  children: ReactNode;
  grid?: boolean;
  ids: string[];
  onMove: (from: number, to: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = ids.indexOf(String(event.active.id));
    const to = ids.indexOf(String(event.over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

function DragDots() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 18">
      <circle cx="3" cy="3" r="1.25" />
      <circle cx="9" cy="3" r="1.25" />
      <circle cx="3" cy="9" r="1.25" />
      <circle cx="9" cy="9" r="1.25" />
      <circle cx="3" cy="15" r="1.25" />
      <circle cx="9" cy="15" r="1.25" />
    </svg>
  );
}

function SortableImageItem({
  id,
  image,
  images,
  index,
  onChange,
  onSelect,
  selected,
}: {
  id: string;
  image: CmsImage;
  images: CmsImage[];
  index: number;
  onChange: (images: CmsImage[]) => void;
  onSelect: () => void;
  selected: boolean;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    transition: { duration: 280, easing: "cubic-bezier(.2, .8, .2, 1)" },
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 3 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.imageItem}
      data-dragging={isDragging}
      data-selected={selected}
      aria-label={`Drag image ${index + 1} to reorder`}
      {...attributes}
      {...listeners}
      onPointerDown={(event) => {
        listeners?.onPointerDown?.(event);
        event.stopPropagation();
      }}
    >
      <div className={styles.imagePreview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt="" draggable={false} />
        <button
          type="button"
          className={styles.imageSelectButton}
          data-selected={selected}
          aria-label={`${selected ? "Deselect" : "Select"} image ${index + 1}`}
          aria-pressed={selected}
          onClick={onSelect}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
        </button>
        <span className={styles.imageDragHandle} aria-hidden="true">
          <DragDots />
        </span>
      </div>
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
        <button type="button" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
      </div>
    </div>
  );
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
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(() => new Set());
  const imageIds = images.map((_, index) => `image-${index}`);
  const imageKeys = images.map((image, index) => image.url || `image-${index}`);
  const selectedCount = imageKeys.filter((key) => selectedImages.has(key)).length;
  const allSelected = images.length > 0 && selectedCount === images.length;

  function toggleSelected(key: string) {
    setSelectedImages((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setSelectedImages(allSelected ? new Set() : new Set(imageKeys));
  }

  function removeSelected() {
    onChange(images.filter((_, index) => !selectedImages.has(imageKeys[index]!)));
    setSelectedImages(new Set());
  }

  async function uploadFiles(files: File[]) {
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
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    await uploadFiles(Array.from(event.target.files || []));
    event.target.value = "";
  }

  return (
    <div className={styles.imageField}>
      <div className={styles.imageFieldHeader}>
        <div className={styles.fieldLabel}>{label}</div>
        {!single && images.length ? (
          <div className={styles.imageSelectionActions}>
            <button type="button" className={styles.selectAllButton} data-selected={allSelected} aria-pressed={allSelected} onClick={toggleAll}>
              <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg></span>
              {allSelected ? "Clear selection" : "Select all"}
            </button>
            {selectedCount ? <button type="button" className={styles.removeSelectedButton} onClick={removeSelected}>Remove selected ({selectedCount})</button> : null}
          </div>
        ) : null}
      </div>
      {images.length ? (
        single ? (
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
                  <button type="button" onClick={() => onChange([])}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SortableList grid ids={imageIds} onMove={(from, to) => onChange(arrayMove(images, from, to))}>
            <div className={styles.imageGrid}>
              {images.map((image, index) => (
                <SortableImageItem
                  id={imageIds[index]}
                  image={image}
                  images={images}
                  index={index}
                  key={`${image.url}-${index}`}
                  onChange={onChange}
                  onSelect={() => toggleSelected(imageKeys[index]!)}
                  selected={selectedImages.has(imageKeys[index]!)}
                />
              ))}
            </div>
          </SortableList>
        )
      ) : null}
      {(!single || !images.length) ? (
        <label
          className={styles.uploadButton}
          data-drag-active={dragActive}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragActive(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            void uploadFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple={!single} onChange={upload} disabled={uploading} />
          <span>
            <strong>{uploading ? "Uploading…" : `Upload ${single ? "image" : "images"}`}</strong>
            <small>{dragActive ? "Drop to upload" : "Choose files or drag them here"}</small>
          </span>
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
  onRemove,
  onToggle,
}: {
  expanded?: boolean;
  index: number;
  label: string;
  onRemove: () => void;
  onToggle?: () => void;
}) {
  return (
    <div className={styles.itemHeader}>
      <div className={styles.itemHeaderMain}>
        <span className={styles.dragHandle} aria-hidden="true"><DragDots /></span>
        {onToggle ? (
          <button
            type="button"
            className={styles.collapseTrigger}
            aria-expanded={expanded}
            onClick={onToggle}
          >
            <span>{label || `Item ${index + 1}`}</span>
          </button>
        ) : (
          <h3>{label || `Item ${index + 1}`}</h3>
        )}
      </div>
      <div className={styles.itemHeaderActions}>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={onRemove}
          aria-label={`Remove ${label || `item ${index + 1}`}`}
          title="Remove"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SortableItemCard({
  children,
  expanded,
  id,
  index,
  label,
  onRemove,
  onToggle,
}: {
  children: ReactNode;
  expanded?: boolean;
  id: string;
  index: number;
  label: string;
  onRemove: () => void;
  onToggle?: () => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    transition: { duration: 280, easing: "cubic-bezier(.2, .8, .2, 1)" },
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.itemCard}
      data-collapsed={onToggle ? !expanded : undefined}
      data-dragging={isDragging}
      aria-label={`Drag to reorder ${label || `item ${index + 1}`}`}
      {...attributes}
      {...listeners}
    >
      <ItemHeader
        expanded={expanded}
        index={index}
        label={label}
        onRemove={onRemove}
        onToggle={onToggle}
      />
      {children}
    </div>
  );
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
  const navigation = content.navigation || {};
  const preloader = content.preloader || {};
  const about = content.about || {};
  const services = content.servicesSection || {};
  const testimonials = content.testimonialsSection || {};
  const faq = content.faqSection || {};
  const footer = content.footer || {};
  const projectCarouselSpeed = Math.min(100, Math.max(20, content.projectsCarouselSpeed ?? 60));
  const activeLabel = sections.find(([id]) => id === active)?.[1] || "Content";
  const saveStatus = !editingEnabled
    ? "Production preview"
    : notice || (dirty ? "Waiting to autosave" : "All changes saved");

  return (
    <main className={styles.dashboard} data-read-only={!editingEnabled}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandMark}>R</div>
          <div><strong>Portfolio CMS</strong><span>rahulornob.com</span></div>
        </div>
        <nav aria-label="Content sections">
          {sections.map(([id, label]) => (
            <button key={id} type="button" className={active === id ? styles.activeNav : ""} onClick={() => setActive(id)}>
              <span className={styles.navIcon}><SectionIcon id={id} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <a href="/" target="_blank">View website ↗</a>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <section className={styles.editorShell}>
        <header className={styles.topbar}>
          <div className={styles.topbarContext}>
            <span className={styles.activeSectionIcon}><SectionIcon id={active} /></span>
            <div>
              <span>Website content</span>
              <strong>{activeLabel}</strong>
            </div>
          </div>
          <div className={styles.topbarActions}>
            <div className={styles.saveState} role="status" aria-live="polite">
              <span className={`${styles.statusDot} ${dirty ? styles.statusUnsaved : ""}`} />
              <span>{saveStatus}</span>
            </div>
            <a className={styles.secondaryButton} href="/" target="_blank">Preview</a>
            <button className={styles.primaryButton} type="button" onClick={publish} disabled={!editingEnabled || !dirty || publishing}>{publishing ? "Saving…" : editingEnabled ? "Save locally" : "Local editing only"}</button>
          </div>
        </header>

        <div className={styles.editor}>
          <div className={styles.mobileTabs}>
            {sections.map(([id, label]) => <button key={id} type="button" className={active === id ? styles.activeTab : ""} onClick={() => setActive(id)}><SectionIcon id={id} /><span>{label}</span></button>)}
          </div>

          {active === "hero" ? (
            <SectionPanel title="Hero" description="The first screen people see.">
              <Field label="Name"><TextInput value={hero.name} onChange={(name) => setContent((current) => ({ ...current, hero: { ...current.hero, name } }))} /></Field>
              <Field label="Title"><TextInput value={hero.title} onChange={(title) => setContent((current) => ({ ...current, hero: { ...current.hero, title } }))} /></Field>
              <Field label="Bio" hint="Separate paragraphs with a blank line.">
                <TextInput
                  multiline
                  value={(hero.bio || []).join("\n\n")}
                  onChange={(value) =>
                    setContent((current) => ({
                      ...current,
                      hero: {
                        ...current.hero,
                        bio: value
                          .split(/\n\s*\n/)
                          .map((paragraph) => paragraph.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Contact nudge" hint="Small label above the talk link, e.g. 'Want me on your team?'"><TextInput value={hero.wantLabel} onChange={(wantLabel) => setContent((current) => ({ ...current, hero: { ...current.hero, wantLabel } }))} /></Field>
              <Field label="Talk link label"><TextInput value={hero.ctaLabel} onChange={(ctaLabel) => setContent((current) => ({ ...current, hero: { ...current.hero, ctaLabel } }))} /></Field>
              <ImageList single label="Portrait" images={hero.avatar ? [hero.avatar] : []} onChange={(images) => setContent((current) => ({ ...current, hero: { ...current.hero, avatar: images[0] } }))} />
            </SectionPanel>
          ) : null}

          {active === "navigation" ? (
            <SectionPanel title="Navigation" description="The menu inside the nav pill. Leave a link's URL blank to show it dimmed and unclickable, e.g. for a 'coming soon' item. Use mailto:you@email.com to open the visitor's email app instead of jumping to a section.">
              <LinkEditor title="Menu links" items={navigation.items || []} onChange={(items) => setContent((current) => ({ ...current, navigation: { ...current.navigation, items } }))} />
              <div className={styles.fieldLabel}>Social icons</div>
              {SOCIAL_PLATFORMS.map((platform) => (
                <Field label={platform} key={platform}>
                  <TextInput
                    placeholder="https://…"
                    value={navigation.socials?.find((social) => social.label === platform)?.url}
                    onChange={(url) =>
                      setContent((current) => {
                        const others = (current.navigation?.socials || []).filter(
                          (social) => social.label !== platform,
                        );
                        const socials = url ? [...others, { label: platform, url }] : others;
                        return { ...current, navigation: { ...current.navigation, socials } };
                      })
                    }
                  />
                </Field>
              ))}
            </SectionPanel>
          ) : null}

          {active === "preloader" ? (
            <SectionPanel title="Preloader" description="The loading animation shown before the site appears.">
              <Field label="Left label"><TextInput value={preloader.leftLabel} onChange={(leftLabel) => setContent((current) => ({ ...current, preloader: { ...current.preloader, leftLabel } }))} /></Field>
              <Field label="Right label"><TextInput value={preloader.rightLabel} onChange={(rightLabel) => setContent((current) => ({ ...current, preloader: { ...current.preloader, rightLabel } }))} /></Field>
              <ImageList label="Reel images" images={preloader.images} onChange={(images) => setContent((current) => ({ ...current, preloader: { ...current.preloader, images } }))} />
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
              <div className={styles.speedSlider}>
                <div className={styles.speedSliderHeader}>
                  <div><span>Project carousel speed</span><small>Controls every project carousel.</small></div>
                  <output>{projectCarouselSpeed}%</output>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={projectCarouselSpeed}
                  style={{ "--slider-progress": `${((projectCarouselSpeed - 20) / 80) * 100}%` } as CSSProperties}
                  aria-label="Project carousel speed"
                  onChange={(event) => setContent((current) => ({ ...current, projectsCarouselSpeed: Number(event.target.value) }))}
                />
                <div className={styles.speedSliderScale}><span>Slower</span><span>Faster</span></div>
              </div>
              <SortableList
                ids={(content.projects || []).map((_, index) => `project-${index}`)}
                onMove={(from, to) => {
                  setProjects(arrayMove(content.projects || [], from, to));
                  setExpandedProjects(new Set());
                }}
              >
                {(content.projects || []).map((project, index) => {
                  const expanded = expandedProjects.has(index);
                  return (
                  <SortableItemCard
                    expanded={expanded}
                    id={`project-${index}`}
                    index={index}
                    key={`project-${index}`}
                    label={project.title || "New project"}
                    onToggle={() => toggleProject(index)}
                    onRemove={() => { setProjects((content.projects || []).filter((_, itemIndex) => itemIndex !== index)); setExpandedProjects(new Set()); }}
                  >
                  {expanded ? <>
                  <div className={styles.twoColumns}>
                    <Field label="Title"><TextInput value={project.title} onChange={(title) => { const next = [...(content.projects || [])]; next[index] = { ...project, title }; setProjects(next); }} /></Field>
                    <Field label="Slug"><TextInput value={project.slug} onChange={(slug) => { const next = [...(content.projects || [])]; next[index] = { ...project, slug }; setProjects(next); }} /></Field>
                  </div>
                  <Field label="Description"><TextInput multiline value={project.description} onChange={(description) => { const next = [...(content.projects || [])]; next[index] = { ...project, description }; setProjects(next); }} /></Field>
                  <Field label="Tags" hint="Separate tags with commas."><TagsInput value={project.tags} onChange={(tags) => { const next = [...(content.projects || [])]; next[index] = { ...project, tags }; setProjects(next); }} /></Field>
                  <ImageList images={project.images} onChange={(images) => { const next = [...(content.projects || [])]; next[index] = { ...project, images }; setProjects(next); }} />
                  </> : null}
                  </SortableItemCard>
                );})}
              </SortableList>
              <button className={styles.addButton} type="button" onClick={() => { const nextIndex = (content.projects || []).length; setProjects([...(content.projects || []), { title: "New project", slug: `project-${Date.now()}`, description: "", tags: [], images: [] }]); setExpandedProjects(new Set([nextIndex])); }}>+ Add project</button>
            </SectionPanel>
          ) : null}

          {active === "services" ? (
            <SectionPanel title="Services" description="The accordion items in your services section.">
              <Field label="Heading"><TextInput value={services.heading} onChange={(heading) => setContent((current) => ({ ...current, servicesSection: { ...current.servicesSection, heading } }))} /></Field>
              <Field label="Intro"><TextInput multiline value={services.intro} onChange={(intro) => setContent((current) => ({ ...current, servicesSection: { ...current.servicesSection, intro } }))} /></Field>
              <SortableList ids={(services.items || []).map((_, index) => `service-${index}`)} onMove={(from, to) => setServices(arrayMove(services.items || [], from, to))}>
                {(services.items || []).map((service, index) => (
                <SortableItemCard id={`service-${index}`} index={index} label={service.title || "New service"} onRemove={() => setServices((services.items || []).filter((_, itemIndex) => itemIndex !== index))} key={`service-${index}`}>
                  <div className={styles.twoColumns}>
                    <Field label="Title"><TextInput value={service.title} onChange={(title) => { const next = [...(services.items || [])]; next[index] = { ...service, title }; setServices(next); }} /></Field>
                    <Field label="ID"><TextInput value={service.id} onChange={(id) => { const next = [...(services.items || [])]; next[index] = { ...service, id }; setServices(next); }} /></Field>
                  </div>
                  <Field label="Description"><TextInput multiline value={service.description} onChange={(description) => { const next = [...(services.items || [])]; next[index] = { ...service, description }; setServices(next); }} /></Field>
                  <Field label="Tags"><TagsInput value={service.tags} onChange={(tags) => { const next = [...(services.items || [])]; next[index] = { ...service, tags }; setServices(next); }} /></Field>
                  <ImageList images={service.images} onChange={(images) => { const next = [...(services.items || [])]; next[index] = { ...service, images }; setServices(next); }} />
                </SortableItemCard>
                ))}
              </SortableList>
              <button className={styles.addButton} type="button" onClick={() => setServices([...(services.items || []), { title: "New service", id: `service-${Date.now()}`, description: "", tags: [], images: [] }])}>+ Add service</button>
            </SectionPanel>
          ) : null}

          {active === "testimonials" ? (
            <SectionPanel title="Testimonials" description="Client quotes and people.">
              <Field label="Heading"><TextInput value={testimonials.heading} onChange={(heading) => setContent((current) => ({ ...current, testimonialsSection: { ...current.testimonialsSection, heading } }))} /></Field>
              <SortableList ids={(testimonials.items || []).map((_, index) => `testimonial-${index}`)} onMove={(from, to) => setTestimonials(arrayMove(testimonials.items || [], from, to))}>
                {(testimonials.items || []).map((item, index) => (
                <SortableItemCard id={`testimonial-${index}`} index={index} label={item.author || "New testimonial"} onRemove={() => setTestimonials((testimonials.items || []).filter((_, itemIndex) => itemIndex !== index))} key={`testimonial-${index}`}>
                  <Field label="Quote"><TextInput multiline value={item.quote} onChange={(quote) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, quote }; setTestimonials(next); }} /></Field>
                  <div className={styles.twoColumns}>
                    <Field label="Name"><TextInput value={item.author} onChange={(author) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, author }; setTestimonials(next); }} /></Field>
                    <Field label="Role"><TextInput value={item.role} onChange={(role) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, role }; setTestimonials(next); }} /></Field>
                  </div>
                  <ImageList single label="Avatar" images={item.avatar ? [item.avatar] : []} onChange={(images) => { const next = [...(testimonials.items || [])]; next[index] = { ...item, avatar: images[0] }; setTestimonials(next); }} />
                </SortableItemCard>
                ))}
              </SortableList>
              <button className={styles.addButton} type="button" onClick={() => setTestimonials([...(testimonials.items || []), { quote: "", author: "New testimonial", role: "" }])}>+ Add testimonial</button>
            </SectionPanel>
          ) : null}

          {active === "faq" ? (
            <SectionPanel title="FAQ" description="Questions shown before the footer.">
              <Field label="Heading"><TextInput value={faq.heading} onChange={(heading) => setContent((current) => ({ ...current, faqSection: { ...current.faqSection, heading } }))} /></Field>
              <SortableList ids={(faq.items || []).map((_, index) => `faq-${index}`)} onMove={(from, to) => setContent((current) => ({ ...current, faqSection: { ...current.faqSection, items: arrayMove(current.faqSection?.items || [], from, to) } }))}>
                {(faq.items || []).map((item, index) => (
                <SortableItemCard id={`faq-${index}`} index={index} label={item.question || "New question"} onRemove={() => setContent((current) => ({ ...current, faqSection: { ...current.faqSection, items: (current.faqSection?.items || []).filter((_, itemIndex) => itemIndex !== index) } }))} key={`faq-${index}`}>
                  <Field label="Question"><TextInput value={item.question} onChange={(question) => setContent((current) => { const items = [...(current.faqSection?.items || [])]; items[index] = { ...item, question }; return { ...current, faqSection: { ...current.faqSection, items } }; })} /></Field>
                  <Field label="Answer"><TextInput multiline value={item.answer} onChange={(answer) => setContent((current) => { const items = [...(current.faqSection?.items || [])]; items[index] = { ...item, answer }; return { ...current, faqSection: { ...current.faqSection, items } }; })} /></Field>
                </SortableItemCard>
                ))}
              </SortableList>
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
