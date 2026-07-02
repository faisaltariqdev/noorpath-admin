import Sidebar from "@/components/Sidebar";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar role="parent" userName="Parent" />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
