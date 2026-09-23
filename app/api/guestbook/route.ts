import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { hashPassword, verifyPassword } from "@/lib/password";

const NAME_MAX = 50; // DB check 제약과 동일
const MESSAGE_MAX = 1000; // DB check 제약과 동일
const PASSWORD_PATTERN = /^\d{4}$/;

/** 방명록 작성 — 비밀번호는 여기서만 hash되고, DB에는 password_hash만 저장된다. */
export async function POST(request: Request) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ error: "서버 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  let body: { name?: string; message?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const message = (body.message ?? "").trim();
  const password = (body.password ?? "").trim();

  if (!name || !message) {
    return NextResponse.json({ error: "이름과 메시지를 입력해주세요." }, { status: 400 });
  }
  if (name.length > NAME_MAX) {
    return NextResponse.json({ error: "이름이 너무 깁니다." }, { status: 400 });
  }
  if (message.length > MESSAGE_MAX) {
    return NextResponse.json({ error: "메시지가 너무 깁니다." }, { status: 400 });
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return NextResponse.json({ error: "비밀번호는 숫자 4자리로 입력해주세요." }, { status: 400 });
  }

  const password_hash = await hashPassword(password);

  const { data, error } = await supabaseServer
    .from("guestbook")
    .insert({ name, message, password_hash })
    .select("id, name, message, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  // password_hash는 절대 응답에 포함하지 않는다.
  return NextResponse.json({ data });
}

/** 방명록 삭제 — 입력한 비밀번호를 저장된 password_hash와 서버에서 검증한 뒤에만 삭제한다. */
export async function DELETE(request: Request) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ error: "서버 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  let body: { id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const id = (body.id ?? "").trim();
  const password = (body.password ?? "").trim();
  if (!id || !PASSWORD_PATTERN.test(password)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { data: row, error: fetchError } = await supabaseServer
    .from("guestbook")
    .select("id, password_hash")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  const isValid = await verifyPassword(password, row.password_hash as string);
  if (!isValid) {
    return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  const { error: deleteError } = await supabaseServer.from("guestbook").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: "삭제에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
