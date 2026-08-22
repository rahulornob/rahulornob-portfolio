import type { Metadata } from "next";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Portfolio CMS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.adminRoot}>{children}</div>;
}
