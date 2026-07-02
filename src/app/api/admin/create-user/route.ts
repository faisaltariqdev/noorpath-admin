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
      full_name,
      email,
      password,
      role,
      phone,
      whatsapp,
      country,
      timezone,
      availability,
    } = body ?? {};

    if (!full_name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Full name, email, password, and role are required." },
        { status: 400 }
      );
    }

    if (!["admin", "tutor", "parent"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user?.id) {
      const { error: profileError } = await admin
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name,
          email,
          phone: phone || null,
          whatsapp: whatsapp || null,
          country: country || null,
          timezone: timezone || "UTC",
          role,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }

      if (role === "tutor" && Array.isArray(availability) && availability.length > 0) {
        const rows = availability
          .filter(slot => slot.start_time && slot.end_time)
          .map(slot => ({
            tutor_id: data.user!.id,
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
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email, role },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while creating user.",
      },
      { status: 500 }
    );
  }
}
