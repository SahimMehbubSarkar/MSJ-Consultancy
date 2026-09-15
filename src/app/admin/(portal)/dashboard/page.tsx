import DashboardClient from "./dashboardClient";

export const metadata = {
  title: "Admin Dashboard | MSJ Global Education Consultancy",
  description: "Administrative dashboard for MSJ Global Education Consultancy",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClient />;
}
