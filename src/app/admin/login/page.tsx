import { redirect } from "next/navigation";
import { isAuthenticated } from "@/cms/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  return <LoginForm />;
}
