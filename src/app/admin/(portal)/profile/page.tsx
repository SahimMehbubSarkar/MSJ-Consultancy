import ProfileClient from "./profileClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Profile | MSJ Admin",
  description: "Administrator identity, contact credentials, and PostgreSQL database telemetry",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
