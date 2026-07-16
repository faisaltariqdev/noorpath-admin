"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Mail, Search, UserRoundCheck, Users } from "lucide-react";
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

type DirectoryRole = "tutor" | "parent";

interface Person {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
  is_active: boolean;
  created_at: string;
}

export default function PeopleDirectory({ role }: { role: DirectoryRole }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({});
  const [availabilityCounts, setAvailabilityCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const personColumn = role === "tutor" ? "tutor_id" : "parent_id";
      const requests = [
        supabase
          .from("profiles")
          .select("id,full_name,email,phone,country,timezone,is_active,created_at")
          .eq("role", role)
          .order("full_name"),
        supabase.from("students").select(`id,${personColumn}`).not(personColumn, "is", null),
      ] as const;

      const [{ data: profileRows }, { data: studentRows }] = await Promise.all(requests);
      const counts = (studentRows || []).reduce<Record<string, number>>((total, row) => {
        const ownerId = (row as Record<string, string | null>)[personColumn];
        if (ownerId) total[ownerId] = (total[ownerId] || 0) + 1;
        return total;
      }, {});

      if (role === "tutor") {
        const { data: slots } = await supabase
          .from("tutor_availability")
          .select("tutor_id")
          .not("tutor_id", "is", null);
        setAvailabilityCounts((slots || []).reduce<Record<string, number>>((total, slot) => {
          if (slot.tutor_id) total[slot.tutor_id] = (total[slot.tutor_id] || 0) + 1;
          return total;
        }, {}));
      }

      setPeople((profileRows || []) as Person[]);
      setAssignmentCounts(counts);
      setLoading(false);
    }

    load();
  }, [role]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return people;
    return people.filter((person) =>
      [person.full_name, person.email, person.phone, person.country]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [people, search]);

  const activeCount = people.filter((person) => person.is_active).length;
  const linkedStudents = Object.values(assignmentCounts).reduce((total, count) => total + count, 0);
  const title = role === "tutor" ? "Teachers" : "Parents";
  const personLabel = role === "tutor" ? "teacher" : "parent";

  return (
    <>
      <PageHeader
        eyebrow="People"
        title={title}
        description={
          role === "tutor"
            ? "Teacher accounts, assigned students, availability, and contact information."
            : "Guardian accounts, linked children, and family contact information."
        }
        actions={<Link className="btn btn-primary" href={`/admin/users?role=${role}`}>Manage accounts</Link>}
      />

      <PortalGrid className="mb-6">
        <MetricCard label={`Total ${title}`} value={people.length} helper={`${activeCount} active`} icon={Users} />
        <MetricCard label="Active Accounts" value={activeCount} helper={`${people.length - activeCount} inactive`} icon={UserRoundCheck} tone="blue" />
        <MetricCard
          label={role === "tutor" ? "Assigned Students" : "Linked Children"}
          value={linkedStudents}
          helper="Based on current student records"
          icon={CalendarDays}
          tone="violet"
        />
        <MetricCard
          label="Unlinked Accounts"
          value={people.filter((person) => !assignmentCounts[person.id]).length}
          helper={`No ${role === "tutor" ? "student assignment" : "child link"}`}
          icon={Mail}
          tone="gold"
        />
      </PortalGrid>

      <SectionCard
        title={`${title} directory`}
        description={`${filtered.length} ${personLabel}${filtered.length === 1 ? "" : "s"} shown`}
        className="portal-section-card--full"
        action={(
          <label className="search-field" aria-label={`Search ${title.toLowerCase()}`}>
            <Search size={15} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} />
          </label>
        )}
      >
        {loading ? (
          <LoadingState label={`Loading ${title.toLowerCase()}…`} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title={`No ${title.toLowerCase()} found`} description="Try another search or create an account from Manage accounts." />
        ) : (
          <div className="portal-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>{role === "tutor" ? "Students" : "Children"}</th>
                  {role === "tutor" && <th>Availability</th>}
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="avatar">{person.full_name.charAt(0).toUpperCase()}</span>
                        <div>
                          <strong className="block text-sm">{person.full_name}</strong>
                          <span className="text-xs text-slate-400">{person.timezone || "Timezone not set"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${person.email}`} className="text-sm font-semibold text-emerald-800">{person.email}</a>
                      {person.phone && <span className="block text-xs text-slate-400">{person.phone}</span>}
                    </td>
                    <td>{assignmentCounts[person.id] || 0}</td>
                    {role === "tutor" && <td>{availabilityCounts[person.id] || 0} weekly slots</td>}
                    <td>{person.country || "—"}</td>
                    <td><StatusBadge tone={person.is_active ? "success" : "neutral"}>{person.is_active ? "Active" : "Inactive"}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
