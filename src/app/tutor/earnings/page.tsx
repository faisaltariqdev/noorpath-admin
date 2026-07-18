"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { CheckCircle2, DollarSign } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState } from "@/components/ui/PortalUI";
import { currencyForCountry } from "@/lib/currency";
import { formatCurrency } from "@/lib/portal";
import { supabase } from "@/lib/supabase";

interface Transfer {
  id: string;
  total_amount: number;
  currency: string;
  paid_date: string;
  month: number | string;
  year: number;
  notes?: string | null;
}

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TutorEarningsPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: earn }] = await Promise.all([
        supabase.from("profiles").select("country").eq("id", user.id).maybeSingle(),
        supabase
          .from("tutor_earnings")
          .select("id, total_amount, currency, paid_date, month, year, status, notes")
          .eq("tutor_id", user.id)
          .eq("status", "paid")
          .not("paid_date", "is", null)
          .order("paid_date", { ascending: false }),
      ]);

      const countryCurrency = currencyForCountry(profile?.country);
      setDisplayCurrency(countryCurrency);

      setTransfers(
        (earn || []).map((row: any) => ({
          id: row.id,
          total_amount: Number(row.total_amount || 0),
          currency: row.currency || countryCurrency,
          paid_date: row.paid_date,
          month: row.month,
          year: row.year,
          notes: row.notes,
        }))
      );
      setLoading(false);
    }
    void load();
  }, []);

  return (
    <>
      <TopBar title="Payments" subtitle="Salary transfers from admin" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Successful salary transfers · amounts in your country currency</p>
      </div>
      <div className="page-body">
        {loading ? (
          <LoadingState label="Loading transfers…" />
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No transfers yet"
            description="When admin successfully transfers your salary, it will appear here."
          />
        ) : (
          <div className="card">
            <div className="card-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#15803d" />
              <h3 className="card-title" style={{ margin: 0 }}>Transfer history</h3>
            </div>
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & time</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Note from admin</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => {
                    const paidAt = new Date(transfer.paid_date);
                    const monthNum = Number(transfer.month);
                    const currency = transfer.currency || displayCurrency;
                    return (
                      <tr key={transfer.id}>
                        <td data-label="Date & time">
                          <div style={{ fontWeight: 600 }}>
                            {paidAt.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {paidAt.toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td data-label="Period">
                          {MONTHS[monthNum] || monthNum} {transfer.year}
                        </td>
                        <td data-label="Amount" style={{ fontWeight: 800, color: "#0f172a" }}>
                          {formatCurrency(transfer.total_amount, currency)}
                        </td>
                        <td data-label="Note from admin" style={{ color: "#475569", maxWidth: 280 }}>
                          {transfer.notes?.trim() || "—"}
                        </td>
                        <td data-label="Status">
                          <span className="badge badge-green">Transferred</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
