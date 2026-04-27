import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type MarkInput = {
  pupil_id: string;
  subject_id: string;
  score: number;
  teacher_comment?: string | null;
};

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!appUser || appUser.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { marks?: MarkInput[] };
  const marks = body.marks ?? [];

  if (!marks.length) {
    return NextResponse.json({ error: "No marks provided" }, { status: 400 });
  }

  const payload = marks.map((mark) => ({
    ...mark,
    teacher_id: user.id,
    teacher_comment: mark.teacher_comment || null
  }));

  const { error } = await supabase.from("marks").upsert(payload, {
    onConflict: "pupil_id,subject_id"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
