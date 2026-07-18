"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleDollarSign, Clock3, CreditCard, ReceiptText, WalletCards } from "lucide-react";
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

interface FeeRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  student_name: string;
}

interface EarningRow {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
  month: number;
  year: number;
  tutor_name: string;
}

export default function PaymentsPage() {
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: feeRows }, { data: earningRows }] = await Promise.all([
        supabase
          .from("fees")
          .select("id,amount,currency,status,due_date,student:students(full_name)")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("tutor_earnings")
          .select("id,total_amount,currency,status,month,year,tutor:profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      setFees((feeRows || []).map((row: any) => ({ ...row, student_name: row.student?.full_name || "Unknown student" })));
      setEarnings((earningRows || []).map((row: any) => ({ ...row, tutor_name: row.tutor?.full_name || "Unknown teacher" })));
      setLoading(false);
    }
    load();
  }, []);

  const paidRevenue = fees.filter((fee) => fee.status === "paid").reduce((total, fee) => total + Number(fee.amount || 0), 0);
  const pendingInvoices = fees.filter((fee) => fee.status === "pending" || fee.status === "overdue");
  const pendingPayroll = earnings.filter((earning) => earning.status === "pending");
  const payrollTotal = earnings.reduce((total, earning) => total + Number(earning.total_amount || 0), 0);

  return (
    <>
      <TopBar title="Payments" subtitle="Invoices and teacher payroll" />
      <main className="portal-page">
        <PageHeader
          eyebrow="Finance"
          title="Payments"
          description="One operational view for family invoices, payment status, reminders, and teacher payroll."
          actions={(
            <>
              <Link href="/admin/fees" className="btn btn-ghost">Manage invoices</Link>
              <Link href="/admin/earnings" className="btn btn-primary">Manage payroll</Link>
            </>
          )}
        />

        <PortalGrid className="mb-6">
          <MetricCard label="Paid Revenue" value={`$${paidRevenue.toLocaleString()}`} helper="Recent invoice records" icon={CircleDollarSign} />
          <MetricCard label="Pending Invoices" value={pendingInvoices.length} helper="Pending or overdue" icon={ReceiptText} tone="gold" />
          <MetricCard label="Payroll Total" value={`$${payrollTotal.toLocaleString()}`} helper="Recent earning records" icon={WalletCards} tone="blue" />
          <MetricCard label="Pending Payroll" value={pendingPayroll.length} helper="Awaiting payment" icon={Clock3} tone={pendingPayroll.length ? "red" : "green"} />
        </PortalGrid>

        <PortalGrid>
          <SectionCard title="Recent invoices" description="Latest family payment records" action={<Link href="/admin/fees" className="card-link">View all →</Link>}>
            {loading ? <LoadingState /> : fees.length === 0 ? (
              <EmptyState icon={ReceiptText} title="No invoices" description="Invoices will appear after they are created." />
            ) : (
              <div className="list-stack">
                {fees.map((fee) => (
                  <article key={fee.id} className="list-row list-row--compact">
                    <div>
                      <strong className="list-title">{fee.student_name}</strong>
                      <p className="list-meta">
                        Due {new Date(fee.due_date).toLocaleDateString("en-GB")}
                        {" · "}{fee.currency} {Number(fee.amount).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge tone={fee.status === "paid" ? "success" : fee.status === "overdue" ? "danger" : "warning"}>{fee.status}</StatusBadge>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Teacher payroll" description="Latest salary transfers" action={<Link href="/admin/earnings" className="card-link">View all →</Link>}>
            {loading ? <LoadingState /> : earnings.length === 0 ? (
              <EmptyState icon={CreditCard} title="No payroll records" description="Teacher earnings will appear after they are created." />
            ) : (
              <div className="list-stack">
                {earnings.map((earning) => (
                  <article key={earning.id} className="list-row list-row--compact">
                    <div>
                      <strong className="list-title">{earning.tutor_name}</strong>
                      <p className="list-meta">
                        {earning.month}/{earning.year}
                        {" · "}{earning.currency} {Number(earning.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge tone={earning.status === "paid" ? "success" : "warning"}>
                      {earning.status === "paid" ? "Transferred" : "Pending"}
                    </StatusBadge>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </PortalGrid>
      </main>
    </>
  );
}
