import { Suspense } from "react";
import AdminLogin from "../adminLogin";

export const metadata = {
  title: "MSJ Global Education Consultancy | Admin Login",
  description: "Administrative console access for MSJ Global Education Consultancy",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminLogin />
    </Suspense>
  );
}
