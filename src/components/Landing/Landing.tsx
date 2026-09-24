import { Link, useLocation } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const location = useLocation();

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <nav className="landing-nav" aria-label="Main navigation">
          <Link className="landing-brand" to="/"><span aria-hidden="true">♨</span><strong>Food<span>ie</span></strong></Link>
          <div className="landing-links"><a href="#home" className="active">Home</a><Link to="/public-menu">Menu</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
          <div className="landing-auth-actions">
            <Link className="landing-sign-in" to="/login">Sign In</Link>
            <Link className="landing-sign-up" to="/signup">Sign Up</Link>
          </div>
        </nav>
        <div className="landing-hero-content" id="home">
          <div className="landing-copy">
            <em>GOOD FOOD&nbsp; · &nbsp;GREAT MOOD</em>
            <h1>Your Next<br /><span>Favorite Meal</span><br />is Just a Tap Away</h1>
            <p>Discover amazing dishes, explore delicious menus, and enjoy exclusive deals — all in one place.</p>
            <div className="landing-actions"><Link className="explore-button" to="/public-menu">Order Now <span>→</span></Link><Link className="story-button" to="/about"><span>▶</span> Our Story</Link></div>
          </div>
          <div className="landing-showcase" aria-label="Preview of the Foodie mobile menu">
            <div className="showcase-glow" />
            <div className="showcase-food showcase-burger"><img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=460&fit=crop" alt="Juicy burger" /></div>
            <div className="showcase-food showcase-bowl"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop" alt="Fresh salad bowl" /></div>
            <div className="showcase-note">Good Food<br />Good Mood <span>↗</span></div>
            <div className="phone-frame"><div className="phone-speaker" /><div className="phone-screen">
              <div className="phone-brand"><span>♨</span><strong>Foodie</strong><b>⌕</b></div>
              <div className="phone-location">📍 Discover great food near you</div>
              <div className="phone-search">⌕ &nbsp; Search restaurants, dishes...</div>
              <div className="phone-categories"><span className="chosen">🍽</span><span>🍕</span><span>🍔</span><span>🥗</span></div>
              <div className="phone-promo"><small>FOODIE PICKS</small><strong>Delicious food.<br />Delivered fresh.</strong><span>Explore today's menu →</span></div>
              <div className="phone-list-title"><strong>Popular today</strong><span>See all</span></div>
              <div className="phone-meals"><article><img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=260&h=170&fit=crop" alt="Margherita pizza" /><strong>Margherita Pizza</strong><small>Fresh · ⭐ 4.9</small></article><article><img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=260&h=170&fit=crop" alt="Classic burger" /><strong>Classic Burger</strong><small>Popular · ⭐ 4.8</small></article></div>
              <div className="phone-tabs"><span>⌂<small>Home</small></span><span>▤<small>Orders</small></span><span>♡<small>Saved</small></span><span>♙<small>Profile</small></span></div>
            </div></div>
            <span className="showcase-spark spark-one">✳</span><span className="showcase-spark spark-two">✦</span>
          </div>
        </div>
      </section>
      <section className="landing-features" aria-label="Why choose Foodie">
        <article><span className="feature-icon feature-orange">♨</span><div><strong>Top Restaurants</strong><p>Handpicked from the best<br />in your city.</p></div></article>
        <article><span className="feature-icon feature-blue">ϟ</span><div><strong>Fast &amp; Easy Ordering</strong><p>Get your food, your way<br />in just a few taps.</p></div></article>
        <article><span className="feature-icon feature-purple">◇</span><div><strong>Exclusive Deals</strong><p>Enjoy special offers<br />and discounts.</p></div></article>
        <article><span className="feature-icon feature-green">⬟</span><div><strong>Safe &amp; Secure</strong><p>Your data and payments<br />are always protected.</p></div></article>
      </section>
      {location.state && typeof location.state === "object" && "accountCreated" in location.state && (
        <p className="landing-account-created" role="status">Account created successfully. You can sign in now.</p>
      )}
    </main>
  );
}

export default Landing;
