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
          .select("id, total_amount, currency, paid_date, month, year, status")
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
        <p className="page-subtitle">Successful salary transfers only · amounts in your country currency</p>
      </div>
      <div className="page-body">
        {loading ? (
          <LoadingState label="Loading transfers…" />
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No transfers yet"
            description="When admin successfully transfers your salary, it will appear here with date and time."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
            {transfers.map((transfer) => {
              const paidAt = new Date(transfer.paid_date);
              const monthNum = Number(transfer.month);
              const currency = transfer.currency || displayCurrency;
              return (
                <article
                  key={transfer.id}
                  style={{
                    border: "1px solid #bbf7d0",
                    background: "#f0fdf4",
                    borderRadius: 16,
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={20} color="#15803d" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: "#14532d", fontSize: "0.95rem" }}>
                        Salary successfully transferred from admin
                      </div>
                      <div style={{ marginTop: 6, fontSize: "0.82rem", color: "#166534" }}>
                        Date:{" "}
                        {paidAt.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div style={{ marginTop: 2, fontSize: "0.82rem", color: "#166534" }}>
                        Time:{" "}
                        {paidAt.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {(monthNum || transfer.year) && (
                        <div style={{ marginTop: 2, fontSize: "0.78rem", color: "#64748b" }}>
                          For: {MONTHS[monthNum] || monthNum} {transfer.year}
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: 12,
                          fontWeight: 800,
                          fontSize: "1.35rem",
                          color: "#0f172a",
                          fontFamily: "var(--font-playfair), Georgia, serif",
                        }}
                      >
                        Total: {formatCurrency(transfer.total_amount, currency)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
