import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar role="admin" userName="NoorPath Admin" />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
