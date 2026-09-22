import { Link } from "react-router-dom";
import { formatCurrency } from "../../../utils/currency";
import "../LandingPages.css";

const menuItems = [
  { name: "Margherita Pizza", type: "Classic Italian", price: 12, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=350&fit=crop" },
  { name: "Chicken Biryani", type: "Chef's Special", price: 16, image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=350&fit=crop" },
  { name: "Grilled Chicken Burger", type: "Fresh & Juicy", price: 14, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop" },
  { name: "Pasta Alfredo", type: "Creamy Favorite", price: 13, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&h=350&fit=crop" },
  { name: "Caesar Salad", type: "Fresh & Healthy", price: 10, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=350&fit=crop" },
  { name: "Chocolate Lava Cake", type: "Sweet Ending", price: 8, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=350&fit=crop" },
];

function LandingMenu() {
  return <main className="landing-page-content"><nav className="public-page-nav"><Link className="landing-brand" to="/"><span>♨</span><strong>Foodie</strong><small>Good Food · Happy People</small></Link><div><Link to="/">Home</Link><Link className="active" to="/public-menu">Menu</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div><Link className="public-sign-in" to="/login">Sign In</Link></nav><header className="public-page-hero"><em>Fresh from our kitchen</em><h1>Our Menu</h1><p>Delicious food made with fresh ingredients and served with care.</p></header><section className="menu-grid">{menuItems.map((item) => <article className="public-menu-card" key={item.name}><img src={item.image} alt={item.name} /><div><span>{item.type}</span><h2>{item.name}</h2><p>Prepared fresh by our chefs for a memorable meal.</p><strong>{formatCurrency(item.price, "$")}</strong></div></article>)}</section></main>;
}

export default LandingMenu;
