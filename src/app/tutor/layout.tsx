import Sidebar from "@/components/Sidebar";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar role="tutor" userName="Tutor" />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
