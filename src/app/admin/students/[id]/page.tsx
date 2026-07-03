"use client";
export const dynamic = "force-dynamic";
import { useParams } from "next/navigation";
import StudentProgressHub from "@/components/StudentProgressHub";

export default function AdminStudentDetailPage() {
  const params = useParams();
  const studentId = String(params?.id || "");

  return <StudentProgressHub studentId={studentId} role="admin" backHref="/admin/students" />;
}
