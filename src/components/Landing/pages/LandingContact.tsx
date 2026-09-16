import { useState } from "react";
import { Link } from "react-router-dom";
import "../LandingPages.css";

function LandingContact() {
  const [sent, setSent] = useState(false);

  return <main className="landing-page-content"><nav className="public-page-nav"><Link className="landing-brand" to="/"><span>♨</span><strong>Foodie</strong><small>Good Food · Happy People</small></Link><div><Link to="/">Home</Link><Link to="/public-menu">Menu</Link><Link to="/about">About</Link><Link className="active" to="/contact">Contact</Link></div><Link className="public-sign-in" to="/login">Sign In</Link></nav><header className="public-page-hero contact-hero"><em>We would love to hear from you</em><h1>Contact Foodie</h1><p>Have a question, a special request, or just want to say hello?</p></header><section className="contact-layout"><div className="contact-details"><article><span>⌖</span><div><strong>Visit us</strong><p>12 Flavor Street<br />Downtown, Your City</p></div></article><article><span>✉</span><div><strong>Email us</strong><p>hello@foodie.com<br />support@foodie.com</p></div></article><article><span>◷</span><div><strong>Opening hours</strong><p>Monday - Sunday<br />11:00 AM - 11:00 PM</p></div></article></div><form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><h2>Send us a message</h2><p>Our team will get back to you shortly.</p><div className="contact-form-grid"><label>Name<input required placeholder="Your name" /></label><label>Email<input required type="email" placeholder="you@example.com" /></label></div><label>Subject<input required placeholder="How can we help?" /></label><label>Message<textarea required placeholder="Write your message..." /></label>{sent && <div className="contact-success" role="status">Thanks. Your message has been received.</div>}<button className="public-cta" type="submit">Send Message →</button></form></section></main>;
}

export default LandingContact;
