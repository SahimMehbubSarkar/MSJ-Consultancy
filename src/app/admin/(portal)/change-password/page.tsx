import ChangePasswordClient from "./changePasswordClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Change Password | MSJ Admin",
  description: "Update administrator credentials and rotate session tokens",
};

export default function ChangePasswordPage() {
  return <ChangePasswordClient />;
}
