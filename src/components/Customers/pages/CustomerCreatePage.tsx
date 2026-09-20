import { Link } from "react-router-dom";
import CustomerForm from "../components/CustomerForm";
import Breadcrumb from "../../common/Breadcrumb";
import "../Customers.css";

function CustomerCreatePage() {
  return (
    <section className="customers-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Customers', path: '/customers' }, { label: 'Create Customer' }]} />
      <div className="customer-page-header">
        <div>
          <h1>Create Customer</h1>
          <p>Add a new customer to your restaurant system.</p>
        </div>
        <Link className="secondary-button" to="/customers">← Back to Customers</Link>
      </div>

      <div className="customer-detail-box">
        <div className="customer-profile-text" style={{ marginBottom: 18 }}>
          <h2>Customer Information</h2>
        </div>
        <CustomerForm mode="create" />
      </div>
    </section>
  );
}

export default CustomerCreatePage;
