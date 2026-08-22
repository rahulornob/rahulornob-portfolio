import { redirect } from "next/navigation";
import { isAuthenticated } from "@/cms/auth";
import { getSiteContent } from "@/cms/storage";
import { AdminEditor } from "./admin-editor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return <AdminEditor initialContent={await getSiteContent()} />;
}
