"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import Reveal from "@/components/ui/Reveal";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { copyText } from "@/lib/copyText";
import { showToast } from "@/lib/toast";
import { weddingInfo } from "@/data/wedding";

type SelectedPhoto = { file: File; url: string };
type Step = "upload" | "uploading" | "done";

/**
 * 사이트 내부 업로드 UX (Google Drive는 사용자에게 절대 노출되지 않는다).
 *
 * 실제 연동 시 데이터 흐름:
 *   사용자 → 이 업로드 UI → POST /api/photos (site backend)
 *          → backend가 서비스 계정으로 Google Drive API 호출
 *          → 지정된 wedding photo 폴더에 저장
 *
 * - 사용자는 Google 로그인/권한 승인 화면을 절대 보지 않는다.
 * - Drive API credentials(서비스 계정 키 등)는 backend 환경변수로만 보관하고
 *   frontend 코드/네트워크 응답 어디에도 노출하지 않는다.
 * - 아래 uploadPhotos()의 내부 구현만 실제 fetch(...) 호출로 교체하면 된다.
 */
// TODO(Next.js backend 연동): 아래 mock 구현을 실제 API 호출로 교체한다.
//   const formData = new FormData();
//   files.forEach((f) => formData.append("photos", f));
//   const res = await fetch("/api/photos", { method: "POST", body: formData });
//   if (!res.ok) throw new Error("upload failed");
//   return res.json(); // { success: true, uploadedCount }
async function uploadPhotos(files: File[]): Promise<{ success: boolean; uploadedCount: number }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, uploadedCount: files.length }), 1400);
  });
}

export default function PhotoShare() {
  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
    lockBodyScroll();
  }
  function closeModal() {
    setIsOpen(false);
    unlockBodyScroll();
  }

  return (
    <section id="share" className="section share" data-theme="dark">
      <div className="share-inner section-pad">
        <Reveal as="p" className="eyebrow">
          Share
        </Reveal>
        <Reveal as="button" className="photo-cta" id="btnPhotoShare" type="button" onClick={openModal}>
          <span className="photo-cta-label">Photo</span>
          <span className="photo-cta-text">사진 공유하기</span>
          <span className="photo-cta-arrow" aria-hidden="true">
            →
          </span>
        </Reveal>
        <Reveal
          as="button"
          className="text-link"
          id="btnCopyLink"
          type="button"
          onClick={async () => {
            await copyText(window.location.href);
            showToast("링크가 복사되었습니다.");
          }}
        >
          링크 복사
        </Reveal>
      </div>
      <footer className="site-footer">
        <p className="footer-names">
          <span>{weddingInfo.groomNameEn}</span>
          <span className="amp">&amp;</span>
          <span>{weddingInfo.brideNameEn}</span>
        </p>
        <p className="footer-date">{weddingInfo.dateLabel}</p>
        <p className="footer-thanks">Thank you for being part of our story.</p>
      </footer>

      {isOpen && <PhotoModal onClose={closeModal} />}
    </section>
  );
}

function PhotoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [selected, setSelected] = useState<SelectedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelected((prev) => [...prev, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setSelected((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (selected.length === 0) return;
    setStep("uploading");
    try {
      await uploadPhotos(selected.map((p) => p.file));
      setStep("done");
    } catch {
      setStep("upload");
      showToast("업로드에 실패했습니다. 다시 시도해주세요.");
    }
  }

  function handleClose() {
    selected.forEach((p) => URL.revokeObjectURL(p.url));
    onClose();
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="photo-modal is-open" aria-hidden="false">
      <div className="photo-modal-backdrop" onClick={handleClose} />
      <div className="photo-sheet" role="dialog" aria-modal="true" aria-labelledby="photoModalTitle">
        {step === "upload" && (
          <div>
            <div className="photo-sheet-head">
              <p className="eyebrow" style={{ marginBottom: 0 }}>
                Photo
              </p>
              <button className="photo-close" type="button" aria-label="닫기" onClick={handleClose}>
                CLOSE ✕
              </button>
            </div>
            <h3 id="photoModalTitle" className="photo-sheet-title">
              사진 공유하기
            </h3>
            <p className="photo-sheet-desc">
              우리의 특별한 순간을
              <br />
              사진으로 남겨주세요.
            </p>

            <button className="photo-add-btn" type="button" onClick={() => fileInputRef.current?.click()}>
              + 사진 추가하기
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {selected.length > 0 && (
              <div className="photo-preview-grid">
                {selected.map((p, i) => (
                  <div className="photo-thumb" key={p.url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`선택한 사진 ${i + 1}`} />
                    <button
                      type="button"
                      className="photo-thumb-remove"
                      aria-label="사진 삭제"
                      onClick={() => removePhoto(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn btn-primary photo-upload-btn"
              type="button"
              disabled={selected.length === 0}
              onClick={handleUpload}
            >
              사진 올리기
            </button>
          </div>
        )}

        {step === "uploading" && (
          <div className="photo-sheet-status">
            <span className="photo-spinner" aria-hidden="true" />
            <p className="photo-status-text">사진을 보내는 중입니다…</p>
          </div>
        )}

        {step === "done" && (
          <div className="photo-sheet-status">
            <p className="photo-sheet-title">사진이 공유되었습니다.</p>
            <p className="photo-sheet-desc">
              소중한 사진을 보내주셔서
              <br />
              감사합니다.
            </p>
            <button className="btn btn-primary" type="button" onClick={handleClose}>
              닫기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
