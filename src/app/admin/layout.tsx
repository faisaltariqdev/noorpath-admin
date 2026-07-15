import AdminChrome from "@/components/AdminChrome";
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

  return <AdminChrome userName={auth.fullName}>{children}</AdminChrome>;
}
