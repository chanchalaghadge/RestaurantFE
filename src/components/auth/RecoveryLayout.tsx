import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./RecoveryLayout.css";

export function RecoveryLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return <main className="recovery-layout">
    <section className="recovery-story" aria-label="Foodie welcome">
      <Link className="recovery-brand" to="/"><span className="recovery-chef">♨</span><span><strong>Food<span>ie</span></strong><small>Good Food&nbsp; • &nbsp;Great Mood</small></span></Link>
      <div className="recovery-story-copy"><h1>Welcome Back!</h1><p>Sign in to your account and continue<br /> your delicious journey.</p><div className="recovery-features"><article><i>♜</i><span><b>Delicious Food</b><small>Fresh &amp; Tasty</small></span></article><article><i>♧</i><span><b>Fast Delivery</b><small>At Your Doorstep</small></span></article><article><i>★</i><span><b>Great Experience</b><small>Every Time</small></span></article></div></div>
      <p className="recovery-story-footer">Foodie&nbsp; · &nbsp;Order&nbsp; · &nbsp;Enjoy</p>
    </section>
    <section className="recovery-panel"><div className="recovery-decoration recovery-top" aria-hidden="true">♧</div><div className="recovery-form-wrap"><h2>{title}</h2><p className="recovery-subtitle">{subtitle}</p>{children}<div className="recovery-footer">{footer}</div></div><div className="recovery-decoration recovery-bottom" aria-hidden="true">♜</div></section>
  </main>;
}
