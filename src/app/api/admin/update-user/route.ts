import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase server credentials are missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      id,
      full_name,
      email,
      role,
      phone,
      whatsapp,
      country,
      timezone,
      password,
      availability,
    } = body ?? {};

    if (!id || !full_name || !email || !role) {
      return NextResponse.json(
        { error: "User ID, full name, email, and role are required." },
        { status: 400 }
      );
    }

    if (!["admin", "tutor", "parent"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    if (password && String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const authUpdate: {
      email: string;
      password?: string;
      user_metadata: { full_name: string; role: string };
    } = {
      email,
      user_metadata: { full_name, role },
    };

    if (password) authUpdate.password = password;

    const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdate);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id,
        full_name,
        email,
        phone: phone || null,
        whatsapp: whatsapp || null,
        country: country || null,
        timezone: timezone || "UTC",
        role,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (role === "tutor" && Array.isArray(availability)) {
      const { error: deleteError } = await admin
        .from("tutor_availability")
        .delete()
        .eq("tutor_id", id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 400 });
      }

      const rows = availability
        .filter(slot => slot.start_time && slot.end_time)
        .map(slot => ({
          tutor_id: id,
          day_of_week: Number(slot.day_of_week),
          start_time: slot.start_time,
          end_time: slot.end_time,
          timezone: slot.timezone || timezone || "Asia/Karachi",
        }));

      if (rows.length > 0) {
        const { error: availabilityError } = await admin
          .from("tutor_availability")
          .insert(rows);

        if (availabilityError) {
          return NextResponse.json({ error: availabilityError.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while updating user.",
      },
      { status: 500 }
    );
  }
}
