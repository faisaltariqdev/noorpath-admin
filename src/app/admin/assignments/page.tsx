"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock3, Search, UserRoundCheck } from "lucide-react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabase";
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageHeader,
  PortalGrid,
  SectionCard,
  StatusBadge,
} from "@/components/ui/PortalUI";

export const dynamic = "force-dynamic";

interface Assignment {
  id: string;
  title?: string;
  homework_text: string;
  due_date?: string;
  status?: string;
  is_completed: boolean;
  created_at: string;
  student_name: string;
  tutor_name: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("homework_logs")
        .select("id,title,homework_text,due_date,status,is_completed,created_at,student:students(full_name),tutor:profiles(full_name)")
        .order("created_at", { ascending: false });
      setAssignments((data || []).map((row: any) => ({
        ...row,
        student_name: row.student?.full_name || "Unknown student",
        tutor_name: row.tutor?.full_name || "Unassigned",
      })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const complete = assignment.is_completed || assignment.status === "completed";
      const matchesStatus = status === "all"
        || (status === "completed" && complete)
        || (status === "pending" && !complete);
      const matchesSearch = !query
        || [assignment.title, assignment.homework_text, assignment.student_name, assignment.tutor_name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [assignments, search, status]);

  const completed = assignments.filter((assignment) => assignment.is_completed || assignment.status === "completed").length;
  const pending = assignments.length - completed;
  const overdue = assignments.filter((assignment) =>
    !assignment.is_completed && assignment.due_date && new Date(assignment.due_date) < new Date(),
  ).length;

  return (
    <>
      <TopBar title="Assignments" subtitle="Homework and teacher review" />
      <main className="portal-page">
        <PageHeader
          eyebrow="Learning operations"
          title="Assignments"
          description="Monitor homework assigned by teachers, pending student work, and completed submissions."
        />

        <PortalGrid className="mb-6">
          <MetricCard label="All Assignments" value={assignments.length} helper="Across active students" icon={ClipboardList} />
          <MetricCard label="Pending" value={pending} helper="Awaiting completion" icon={Clock3} tone="gold" />
          <MetricCard label="Completed" value={completed} helper="Marked complete" icon={CheckCircle2} tone="blue" />
          <MetricCard label="Overdue" value={overdue} helper="Past the due date" icon={UserRoundCheck} tone={overdue ? "red" : "green"} />
        </PortalGrid>

        <SectionCard
          title="Assignment register"
          description={`${filtered.length} records shown`}
          className="portal-section-card--full"
          action={(
            <div className="flex flex-wrap gap-2">
              <label className="search-field" aria-label="Search assignments">
                <Search size={15} aria-hidden="true" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assignments…" />
              </label>
              <select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter assignment status">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        >
          {loading ? <LoadingState label="Loading assignments…" /> : filtered.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No assignments found" description="Assignments created by teachers will appear here." />
          ) : (
            <div className="portal-table-scroll">
              <table className="data-table">
                <thead><tr><th>Assignment</th><th>Student</th><th>Teacher</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map((assignment) => {
                    const isComplete = assignment.is_completed || assignment.status === "completed";
                    return (
                      <tr key={assignment.id}>
                        <td>
                          <strong>{assignment.title || "Practice assignment"}</strong>
                          <span className="block max-w-md truncate text-xs text-slate-400">{assignment.homework_text}</span>
                        </td>
                        <td>{assignment.student_name}</td>
                        <td>{assignment.tutor_name}</td>
                        <td>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString("en-GB") : "—"}</td>
                        <td><StatusBadge tone={isComplete ? "success" : "warning"}>{isComplete ? "Completed" : "Pending"}</StatusBadge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </main>
    </>
  );
}
