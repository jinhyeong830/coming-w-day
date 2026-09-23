"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Reveal from "@/components/ui/Reveal";
import { showToast } from "@/lib/toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { GUESTBOOK_PAGE_SIZE, type GuestbookMessage } from "@/data/guestbook";

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M9 7l1 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}

type PendingAction = { gindex: number; action: "edit" | "delete" } | null;

/**
 * GUESTBOOK — Supabase(guestbook 테이블)와 연동된 목록 + 페이지네이션(5개 초과 시 노출).
 *
 * - 조회(SELECT)와 작성(INSERT)만 실제 DB에 연결되어 있다.
 * - 수정/삭제는 이번 단계에서 UPDATE/DELETE를 공개 RLS로 열지 않기로 했기 때문에
 *   실제 DB에는 반영되지 않는다. 대신 방금 작성한 글에 한해 같은 세션 안에서만
 *   로컬로 수정/삭제해볼 수 있는 기존 UX를 그대로 유지한다(비밀번호는 서버로 전송되지 않음).
 *   DB에서 불러온 기존 글은 password가 없어 비밀번호 확인이 항상 실패한다 — 의도된 동작.
 */
export default function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [justAddedFirst, setJustAddedFirst] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [authValue, setAuthValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMsg, setEditMsg] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const authInputRef = useRef<HTMLInputElement>(null);

  // 최초 진입 시 방명록을 최신순으로 조회한다. 새로고침해도 항상 이 조회가 다시 실행되므로
  // 등록된 글이 그대로 유지된다.
  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("guestbook")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        showToast("방명록을 불러오지 못했습니다.");
        setLoading(false);
        return;
      }
      setMessages(
        (data ?? []).map((row) => ({
          id: row.id as string,
          name: row.name as string,
          msg: row.message as string,
        }))
      );
      setLoading(false);
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(messages.length / GUESTBOOK_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * GUESTBOOK_PAGE_SIZE;
  const pageItems = useMemo(
    () => messages.slice(start, start + GUESTBOOK_PAGE_SIZE).map((m, i) => ({ m, gindex: start + i })),
    [messages, start]
  );

  function resetAuth() {
    setPending(null);
    setAuthValue("");
  }

  function openAuth(gindex: number, action: "edit" | "delete") {
    setPending({ gindex, action });
    setAuthValue("");
    setEditingIndex(null);
    requestAnimationFrame(() => authInputRef.current?.focus());
  }

  function confirmAuth() {
    if (!pending) return;
    const message = messages[pending.gindex];
    if (authValue.trim() !== message.password) {
      showToast("비밀번호가 일치하지 않습니다.");
      setAuthValue("");
      authInputRef.current?.focus();
      return;
    }
    if (pending.action === "delete") {
      setMessages((prev) => prev.filter((_, i) => i !== pending.gindex));
      showToast("메시지가 삭제되었습니다.");
      resetAuth();
    } else {
      setEditingIndex(pending.gindex);
      setEditName(message.name);
      setEditMsg(message.msg);
      resetAuth();
    }
  }

  function saveEdit(gindex: number) {
    const newName = editName.trim();
    const newMsg = editMsg.trim();
    if (!newName || !newMsg) return;
    setMessages((prev) => prev.map((m, i) => (i === gindex ? { ...m, name: newName, msg: newMsg } : m)));
    showToast("메시지가 수정되었습니다.");
    setEditingIndex(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return; // 중복 submit 방지

    const name = nameRef.current?.value.trim() ?? "";
    const msg = msgRef.current?.value.trim() ?? "";
    const password = pwRef.current?.value.trim() ?? "";
    if (!name || !msg) return;
    if (!/^\d{4}$/.test(password)) {
      showToast("비밀번호는 숫자 4자리로 입력해주세요.");
      return;
    }
    if (!isSupabaseConfigured) {
      showToast("방명록 설정이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setSubmitting(true);
    // message 컬럼만 DB에 저장한다 — password는 요구사항상 저장하지 않는 값이라 보내지 않는다.
    const { data, error } = await supabase
      .from("guestbook")
      .insert({ name, message: msg })
      .select("id, name, message, created_at")
      .single();
    setSubmitting(false);

    if (error || !data) {
      showToast("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setMessages((prev) => [{ id: data.id as string, name: data.name as string, msg: data.message as string, password }, ...prev]);
    setPage(1);
    setJustAddedFirst(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setJustAddedFirst(false));
    });

    if (nameRef.current) nameRef.current.value = "";
    if (msgRef.current) msgRef.current.value = "";
    if (pwRef.current) pwRef.current.value = "";
    showToast("축하 메시지가 등록되었습니다.");
  }

  return (
    <section id="guestbook" className="section guestbook section-pad" data-theme="light">
      <div className="col-narrow">
        <Reveal as="p" className="eyebrow">
          07 — Guestbook
        </Reveal>
        <Reveal as="h2">Guestbook</Reveal>

        <Reveal as="form" className="guestbook-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="gbName">이름</label>
            <input id="gbName" required maxLength={12} placeholder="이름을 남겨주세요" ref={nameRef} />
          </div>
          <div className="field">
            <label htmlFor="gbMsg">메시지</label>
            <textarea
              id="gbMsg"
              required
              maxLength={120}
              rows={3}
              placeholder="축하 메시지를 남겨주세요"
              ref={msgRef}
            />
          </div>
          <div className="field">
            <label htmlFor="gbPassword">비밀번호</label>
            <input
              id="gbPassword"
              type="password"
              required
              maxLength={4}
              inputMode="numeric"
              pattern="[0-9]{4}"
              placeholder="수정·삭제 시 필요한 숫자 4자리"
              ref={pwRef}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "등록 중..." : "남기기"}
          </button>
        </Reveal>

        <Reveal as="ul" className="guestbook-list" id="guestbookList">
          {loading && <li className="gb-empty">방명록을 불러오는 중입니다...</li>}
          {!loading && messages.length === 0 && (
            <li className="gb-empty">아직 작성된 방명록이 없습니다. 첫 메시지를 남겨주세요!</li>
          )}
          {!loading &&
            pageItems.map(({ m, gindex }, i) => {
            const isAuthOpen = pending?.gindex === gindex;
            const isEditing = editingIndex === gindex;
            const enterAnim = justAddedFirst && i === 0 && currentPage === 1;
            return (
              <li key={gindex} className={enterAnim ? "gb-enter" : undefined}>
                <div className="gb-head">
                  <p className="gb-name">{m.name}</p>
                  <div className="gb-actions">
                    <button
                      type="button"
                      className="gb-icon-btn"
                      aria-label="메시지 수정"
                      onClick={() => openAuth(gindex, "edit")}
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="gb-icon-btn"
                      aria-label="메시지 삭제"
                      onClick={() => openAuth(gindex, "delete")}
                    >
                      <IconDelete />
                    </button>
                  </div>
                </div>
                <p className="gb-msg">{m.msg}</p>

                {isAuthOpen && (
                  <div className="gb-auth">
                    <p className="gb-auth-hint">본인 확인을 위해 비밀번호를 입력해주세요.</p>
                    <div className="gb-auth-row">
                      <input
                        type="password"
                        className="gb-auth-input"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="••••"
                        ref={authInputRef}
                        value={authValue}
                        onChange={(e) => setAuthValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            confirmAuth();
                          }
                        }}
                      />
                      <button type="button" className="text-link" onClick={confirmAuth}>
                        확인
                      </button>
                      <button type="button" className="text-link" onClick={resetAuth}>
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="gb-edit">
                    <div className="field">
                      <label>이름</label>
                      <input
                        className="gb-edit-name"
                        maxLength={12}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>메시지</label>
                      <textarea
                        className="gb-edit-msg"
                        maxLength={120}
                        rows={3}
                        value={editMsg}
                        onChange={(e) => setEditMsg(e.target.value)}
                      />
                    </div>
                    <div className="gb-edit-actions">
                      <button type="button" className="btn btn-primary" onClick={() => saveEdit(gindex)}>
                        저장
                      </button>
                      <button type="button" className="text-link" onClick={() => setEditingIndex(null)}>
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </Reveal>

        {messages.length > GUESTBOOK_PAGE_SIZE && (
          <div className="guestbook-pagination">
            <button
              className="gb-page-nav"
              type="button"
              aria-label="이전 페이지"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            <div className="gb-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n === currentPage ? "is-active" : undefined}
                  onClick={() => setPage(n)}
                >
                  {String(n).padStart(2, "0")}
                </button>
              ))}
            </div>
            <button
              className="gb-page-nav"
              type="button"
              aria-label="다음 페이지"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
