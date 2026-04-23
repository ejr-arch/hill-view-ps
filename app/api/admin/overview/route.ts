import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser, error: appUserError } = await supabase
    .from("users")
    .select("id, email, name, role, class_id")
    .eq("id", user.id)
    .single();

  if (appUserError || !appUser) {
    return NextResponse.json(
      { error: "User record not found" },
      { status: 404 }
    );
  }

  if (appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [classes, pupils, classPerf, submissions] = await Promise.all([
    supabase.from("classes").select("id,name").order("name"),
    supabase.from("pupils").select("id,name,class_id").order("name"),
    supabase.from("class_performance").select("*").order("class_name"),
    supabase.from("teacher_submission_status").select("*").order("class_name"),
  ]);

  return NextResponse.json({
    classes: classes.data ?? [],
    pupils: pupils.data ?? [],
    classPerf: classPerf.data ?? [],
    submissions: submissions.data ?? [],
  });
}