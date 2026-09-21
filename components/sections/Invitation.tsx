import { Fragment } from "react";
import Reveal from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { placeholderImage } from "@/lib/placeholder";
import { invitation, invitationQuote } from "@/data/invitation";

export default function Invitation() {
  const profiles = [invitation.groom, invitation.bride];

  return (
    <section id="invitation" className="section invitation section-pad" data-theme="light">
      <div className="col-narrow">
        <Reveal as="p" className="eyebrow">
          02 — Invitation
        </Reveal>
        <Reveal as="blockquote" className="invitation-quote">
          &ldquo;
          {invitationQuote.split("\n").map((line, i, arr) => (
            <Fragment key={line}>
              {line}
              {i < arr.length - 1 && <br />}
            </Fragment>
          ))}
          &rdquo;
        </Reveal>
        <div className="family-grid" id="familyGrid">
          {profiles.map((p, i) => {
            const fallbackSrc = placeholderImage(i, "");
            return (
              <Reveal as="div" className="family-profile" key={p.name}>
                <div className="family-photo">
                  <FallbackImage
                    src={p.parentPhoto}
                    fallbackSrc={fallbackSrc}
                    alt={`${p.role} ${p.name}의 가족 사진`}
                    sizes="(min-width: 768px) 240px, 64vw"
                  />
                </div>
                <p className="family-lineage">{p.lineage}</p>
                <p className="family-story">{p.story}</p>
                <div className="family-name">
                  <span className="family-role">{p.role}</span>
                  <span className="family-name-text">{p.name}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
