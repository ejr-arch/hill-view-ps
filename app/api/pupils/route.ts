import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams?.get("class_id");
  
  const supabase = createRouteHandlerClient({ cookies });
  
  let query = supabase.from("pupils").select("id,name,class_id").order("name");
  if (classId) {
    query = query.eq("class_id", classId);
  }
  
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pupils: data ?? [] });
}