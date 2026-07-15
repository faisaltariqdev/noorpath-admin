import Sidebar from "@/components/Sidebar";
import { authorizeAdmin } from "@/lib/server-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const auth = await authorizeAdmin({
    get: (name) => cookieStore.get(name)?.value,
  });

  if (!auth.authorized) {
    if (auth.reason === "wrong-role" && auth.role) redirect(`/${auth.role}`);
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <Sidebar role="admin" userName={auth.fullName} />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
