import EmailSettingsClient from "./emailSettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Email Settings | MSJ Admin",
};

export default function EmailSettingsPage() {
  return <EmailSettingsClient />;
}
