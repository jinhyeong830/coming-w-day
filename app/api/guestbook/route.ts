import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { hashPassword, verifyPassword } from "@/lib/password";

const NAME_MAX = 50; // DB check 제약과 동일
const MESSAGE_MAX = 1000; // DB check 제약과 동일
const PASSWORD_PATTERN = /^\d{4}$/;

/**
 * 서버 콘솔에 단계(stage)와 실제 에러 정보만 남긴다.
 * password / password_hash / Supabase key 등 민감한 값은 인자로 넘기지 않는다 — 이 함수는
 * 그런 값을 절대 출력하지 않는다.
 */
function logStageError(stage: string, error: unknown) {
  if (error && typeof error === "object") {
    const e = error as { name?: string; message?: string; code?: string; details?: string; hint?: string };
    console.error(`[guestbook:${stage}]`, {
      name: e.name,
      message: e.message,
      code: e.code,
      details: e.details,
      hint: e.hint,
    });
  } else {
    console.error(`[guestbook:${stage}]`, error);
  }
}

/** 방명록 작성 — 비밀번호는 여기서만 hash되고, DB에는 password_hash만 저장된다. */
export async function POST(request: Request) {
  if (!isSupabaseServerConfigured) {
    // 어떤 변수가 없는지는 lib/supabaseServer.ts 모듈 로드 시 서버 콘솔에 이미 출력된다.
    logStageError("post:config", new Error("isSupabaseServerConfigured=false"));
    return NextResponse.json({ error: "서버 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  let body: { name?: string; message?: string; password?: string };
  try {
    body = await request.json();
  } catch (error) {
    logStageError("post:parse-body", error);
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

  let password_hash: string;
  try {
    password_hash = await hashPassword(password);
  } catch (error) {
    logStageError("post:hash-password", error);
    return NextResponse.json({ error: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  try {
    const { data, error } = await supabaseServer
      .from("guestbook")
      .insert({ name, message, password_hash })
      .select("id, name, message, created_at")
      .single();

    if (error || !data) {
      logStageError("post:insert", error ?? new Error("insert returned no data"));
      return NextResponse.json({ error: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }

    // password_hash는 절대 응답에 포함하지 않는다.
    return NextResponse.json({ data });
  } catch (error) {
    logStageError("post:insert-threw", error);
    return NextResponse.json({ error: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}

/** 방명록 삭제 — 입력한 비밀번호를 저장된 password_hash와 서버에서 검증한 뒤에만 삭제한다. */
export async function DELETE(request: Request) {
  if (!isSupabaseServerConfigured) {
    logStageError("delete:config", new Error("isSupabaseServerConfigured=false"));
    return NextResponse.json({ error: "서버 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  let body: { id?: string; password?: string };
  try {
    body = await request.json();
  } catch (error) {
    logStageError("delete:parse-body", error);
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const id = (body.id ?? "").trim();
  const password = (body.password ?? "").trim();
  if (!id || !PASSWORD_PATTERN.test(password)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  let row: { id: string; password_hash: string };
  try {
    const { data, error: fetchError } = await supabaseServer
      .from("guestbook")
      .select("id, password_hash")
      .eq("id", id)
      .single();

    if (fetchError || !data) {
      logStageError("delete:select", fetchError ?? new Error("select returned no row"));
      return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
    }
    row = data as { id: string; password_hash: string };
  } catch (error) {
    logStageError("delete:select-threw", error);
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  let isValid: boolean;
  try {
    isValid = await verifyPassword(password, row.password_hash);
  } catch (error) {
    logStageError("delete:verify-password", error);
    return NextResponse.json({ error: "삭제에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  try {
    const { error: deleteError } = await supabaseServer.from("guestbook").delete().eq("id", id);
    if (deleteError) {
      logStageError("delete:delete", deleteError);
      return NextResponse.json({ error: "삭제에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }
  } catch (error) {
    logStageError("delete:delete-threw", error);
    return NextResponse.json({ error: "삭제에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
