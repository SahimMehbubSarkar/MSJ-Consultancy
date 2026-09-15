import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { verifyToken } from "@/lib/jwt";
import { query } from "@/lib/db";
import DashboardLayout from "./DashboardLayout";

export const dynamic = "force-dynamic";

export default async function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("msj_admin_token");

  if (!tokenCookie) {
    redirect("/admin/login");
  }

  const payload = await verifyToken(tokenCookie.value);

  if (!payload) {
    redirect("/admin/login?expired=true");
  }

  let avatarUrl: string | null = null;
  try {
    const adminRes = await query("SELECT avatar_url FROM admin WHERE id = $1 LIMIT 1", [payload.sub]);
    avatarUrl = adminRes.rows[0]?.avatar_url || null;
  } catch (err) {
    console.error("Failed to load admin avatar in layout:", err);
  }

  let siteName: string | null = null;
  let siteIconUrl: string | null = null;
  try {
    const settingsRes = await query("SELECT site_name, site_icon_url FROM site_settings WHERE id = 1 LIMIT 1");
    if (settingsRes.rows[0]) {
      siteName = settingsRes.rows[0].site_name || null;
      siteIconUrl = settingsRes.rows[0].site_icon_url || null;
    }
  } catch (err) {
    console.error("Failed to load site settings in layout:", err);
  }

  return (
    <Suspense fallback={null}>
      <DashboardLayout adminName={payload.name} adminEmail={payload.email} adminAvatar={avatarUrl} siteName={siteName} siteIconUrl={siteIconUrl}>
        {children}
      </DashboardLayout>
    </Suspense>
  );
}
