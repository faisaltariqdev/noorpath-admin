"use client";

interface ParentStudentSwitcherProps {
  students: Array<{
    id: string;
    full_name: string;
    level?: string | null;
    course?: string | null;
  }>;
  selectedId: string;
  onChange: (id: string) => void;
}

function toTitleCase(value?: string | null) {
  if (!value) return "Student";
  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ParentStudentSwitcher({
  students,
  selectedId,
  onChange,
}: ParentStudentSwitcherProps) {
  if (students.length <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
        marginBottom: 20,
      }}
    >
      {students.map((student) => {
        const active = student.id === selectedId;
        return (
          <button
            key={student.id}
            type="button"
            onClick={() => onChange(student.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
              minWidth: 180,
              padding: "12px 14px",
              borderRadius: 12,
              border: active ? "1px solid #1b5e42" : "1px solid #e2e8f0",
              background: active ? "#f0fdf4" : "#fff",
              color: active ? "#1b5e42" : "#0f172a",
              cursor: "pointer",
              textAlign: "left",
              flexShrink: 0,
              boxShadow: active ? "0 6px 18px rgba(27,94,66,0.08)" : "none",
              transition: "all 0.15s ease",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.84rem" }}>
              {student.full_name}
            </span>
            <span style={{ fontSize: "0.72rem", color: active ? "#2f6d52" : "#64748b" }}>
              {toTitleCase(student.level)}
              {student.course ? ` · ${student.course}` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
