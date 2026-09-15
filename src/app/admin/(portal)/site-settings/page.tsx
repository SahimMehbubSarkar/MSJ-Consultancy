import SiteSettingsClient from "./siteSettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site Settings | MSJ Admin",
};

export default function SiteSettingsPage() {
  return <SiteSettingsClient />;
}
