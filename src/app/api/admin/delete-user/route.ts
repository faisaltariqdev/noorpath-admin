import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { authorizeAdmin } from "@/lib/server-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const cookieStore = cookies();
    const auth = await authorizeAdmin({
      get: (name) => cookieStore.get(name)?.value,
    });
    if (!auth.authorized) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const id = String(body?.id || "");
    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    if (id === auth.user.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, role, email, full_name")
      .eq("id", id)
      .maybeSingle();

    if (targetError || !target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (target.role === "admin") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("is_active", true);
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "Cannot delete the last active admin." }, { status: 400 });
      }
    }

    // Clean availability first (FK may not cascade from auth delete for this table)
    await admin.from("tutor_availability").delete().eq("tutor_id", id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deleted: { id: target.id, email: target.email, full_name: target.full_name, role: target.role },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete user." },
      { status: 500 },
    );
  }
}
