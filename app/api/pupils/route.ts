import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams?.get("class_id");
  
  const supabase = createRouteHandlerClient({ cookies });
  
  let query = supabase.from("pupils").select("id,name,class_id,avatar,house,paycode").order("name");
  if (classId) {
    query = query.eq("class_id", classId);
  }
  
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pupils: data ?? [] });
}

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

  if (!appUser || appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, class_id, avatar, house, paycode } = body;

  if (!name || !class_id) {
    return NextResponse.json({ error: "Name and class are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pupils")
    .insert({ name, class_id, avatar: avatar || null, house: house || null, paycode: paycode || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
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

  if (!appUser || appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, name, class_id, avatar, house, paycode } = body;

  if (!id) {
    return NextResponse.json({ error: "Pupil ID is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (class_id !== undefined) updates.class_id = class_id;
  if (avatar !== undefined) updates.avatar = avatar;
  if (house !== undefined) updates.house = house;
  if (paycode !== undefined) updates.paycode = paycode;

  const { data, error } = await supabase
    .from("pupils")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
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

  if (!appUser || appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams?.get("id");

  if (!id) {
    return NextResponse.json({ error: "Pupil ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from("pupils").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}