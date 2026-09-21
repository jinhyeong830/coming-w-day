"use client";

import { useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { copyText } from "@/lib/copyText";
import { showToast } from "@/lib/toast";
import { accountGroups } from "@/data/account";

const GROUPS = [accountGroups.groom, accountGroups.bride];

export default function Account() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const detailRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function toggle(key: string) {
    const nextOpen = openKey === key ? null : key;
    if (openKey && detailRefs.current[openKey]) {
      detailRefs.current[openKey]!.style.maxHeight = "";
    }
    if (nextOpen && detailRefs.current[nextOpen]) {
      const detail = detailRefs.current[nextOpen]!;
      detail.style.maxHeight = `${detail.scrollHeight}px`;
    }
    setOpenKey(nextOpen);
  }

  async function handleCopy(number: string) {
    await copyText(number);
    showToast("계좌번호가 복사되었습니다.");
  }

  return (
    <section id="account" className="section account section-pad" data-theme="light">
      <div className="col-narrow">
        <Reveal as="p" className="eyebrow">
          06 — Account
        </Reveal>
        <Reveal as="h2">Account</Reveal>
        <Reveal as="p" className="account-desc">
          마음을 전해주시는 분들을 위해
          <br />
          계좌번호를 안내드립니다.
        </Reveal>
        <Reveal as="div" className="account-list">
          {GROUPS.map((group) => {
            const isOpen = openKey === group.role;
            return (
              <div className="account-entry" key={group.role}>
                <p className="account-role">{group.role}</p>
                <p className="account-name">{group.name}</p>
                <button
                  className="btn-copy account-toggle"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(group.role)}
                >
                  {isOpen ? "닫기" : "확인하기"}
                </button>
                <div
                  className="account-detail"
                  ref={(el) => {
                    detailRefs.current[group.role] = el;
                  }}
                >
                  {group.accounts.map((account) => (
                    <div className="account-row" key={account.number}>
                      <p className="account-row-label">{account.label}</p>
                      <p className="account-row-bank">
                        {account.bank} {account.number}
                      </p>
                      <button
                        className="text-link account-row-copy"
                        type="button"
                        onClick={() => handleCopy(account.number)}
                      >
                        복사
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
