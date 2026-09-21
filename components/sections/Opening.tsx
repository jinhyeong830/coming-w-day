import Reveal from "@/components/ui/Reveal";
import { weddingInfo } from "@/data/wedding";

export default function Opening() {
  return (
    <section id="opening" className="section opening" data-theme="dark">
      <div className="opening-media" aria-hidden="true"></div>
      <p className="opening-caption">Photograph — Placeholder, 2026</p>
      <div className="opening-content">
        <Reveal as="p" className="eyebrow">
          Wedding Invitation
        </Reveal>
        <Reveal as="h1" className="opening-names">
          <span>{weddingInfo.groomNameEn}</span>
          <span className="amp">&amp;</span>
          <span>{weddingInfo.brideNameEn}</span>
        </Reveal>
        <Reveal as="div" className="opening-meta">
          <span className="opening-date">{weddingInfo.dateLabelSpaced}</span>
          <span className="opening-sub">Wedding Day</span>
        </Reveal>
      </div>
      <div className="scroll-cue">
        <span className="line"></span>Scroll
      </div>
    </section>
  );
}
