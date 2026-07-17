import RoleChrome from "@/components/RoleChrome";
import { authorizeRole } from "@/lib/server-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const auth = await authorizeRole(
    { get: (name) => cookieStore.get(name)?.value },
    "parent",
  );

  if (!auth.authorized) {
    if (auth.reason === "wrong-role" && auth.role) redirect(`/${auth.role}`);
    redirect("/login");
  }

  return (
    <RoleChrome role="parent" userName={auth.fullName}>
      {children}
    </RoleChrome>
  );
}
