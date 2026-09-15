import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";
import "./LandingAuth.css";

function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("rohit@rohit.com");
  const [password, setPassword] = useState("123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    if (email.trim().toLowerCase() === "rohit@rohit.com" && password === "123") {
      navigate("/dashboard");
      return;
    }
    setLoginError("Invalid credentials. Use rohit@rohit.com / 123 for testing.");
  };

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <nav className="landing-nav" aria-label="Main navigation">
          <Link className="landing-brand" to="/"><span>♨</span><strong>Foodie</strong><small>Good Food&nbsp; • &nbsp;Happy People</small></Link>
          <div className="landing-links"><a href="#home" className="active">Home</a><Link to="/public-menu">Menu</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
          <Link className="mobile-sign-in" to="/login">Sign In</Link>
        </nav>
        <div className="landing-copy" id="home"><em>Welcome to Foodie</em><h1>Great Food<br />Brings People<br /><span>Together</span></h1><p>Discover delicious dishes, fresh ingredients, and unforgettable dining experiences. Whether you&apos;re craving a quick bite or a special meal, we&apos;ve got you covered.</p><div className="landing-actions"><a className="explore-button" href="#menu">Explore Menu <span>→</span></a><a className="story-button" href="#about"><span>▶</span> Watch Our Story</a></div></div>
        <div className="landing-dish" aria-hidden="true"><div className="dish-glow" /><div className="floating-food tomato-one">●</div><div className="floating-food tomato-two">●</div><div className="floating-food leaf-one">⌁</div><div className="floating-food leaf-two">⌁</div></div>
        <div className="landing-features"><article><span>♜</span><div><strong>Delicious Food</strong><p>Freshly prepared with<br />premium ingredients</p></div></article><article><span>♧</span><div><strong>Fast Delivery</strong><p>Your favorite food,<br />right at your door</p></div></article><article><span>♡</span><div><strong>Safe &amp; Hygienic</strong><p>Clean kitchen,<br />healthy meals</p></div></article><article><span>♙</span><div><strong>Happy Customers</strong><p>Thousands of food lovers<br />trust us</p></div></article></div>
      </section>
      <aside className="landing-auth-prompt"><div className="auth-prompt-decoration top" /><div className="landing-prompt-brand"><span>♨</span><strong>Foodie</strong><small>Good Food&nbsp; • &nbsp;Happy People</small></div><h2>Welcome Back!</h2><p>Log in to your account or create a new one<br />to continue your food journey.</p><div className="prompt-switch"><Link className="selected" to="/login">Sign In</Link><Link to="/signup">Sign Up</Link></div><form className="landing-sign-in-form" onSubmit={handleSignIn}><label className="landing-input"><span>✉</span><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setLoginError(""); }} placeholder="Email address" autoComplete="email" /></label><label className="landing-input"><span>♙</span><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setLoginError(""); }} placeholder="Password" autoComplete="current-password" /><button type="button" className="landing-eye" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "◉" : "⊘"}</button></label><label className="remember"><input type="checkbox" defaultChecked /> Remember me <Link to="/forgot-password">Forgot password?</Link></label>{loginError && <p className="landing-login-error" role="alert">{loginError}</p>}<button className="prompt-submit" type="submit">Sign In <span>→</span></button></form><div className="prompt-divider"><span>Or continue with</span></div><button className="social-button" type="button"><b>G</b> Continue with Google</button><button className="social-button apple" type="button">● &nbsp; Continue with Apple</button><p className="prompt-footer">Don&apos;t have an account? <Link to="/signup">Sign Up</Link></p><div className="auth-prompt-decoration bottom" /></aside>
    </main>
  );
}

export default Landing;