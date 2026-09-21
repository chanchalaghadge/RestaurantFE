import { Link } from "react-router-dom";
import CustomerForm from "../components/CustomerForm";
import Breadcrumb from "../../common/Breadcrumb";
import "../Customers.css";

function CustomerCreatePage() {
  return (
    <section className="customers-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Customers', path: '/customers' }, { label: 'Create Customer' }]} />
      <div className="customer-detail-box">
        <div className="customer-form-heading">
          <div className="customer-profile-text">
          <h2>Customer Information</h2>
          </div>
          <Link className="secondary-button" to="/customers">← Back to Customers</Link>
        </div>
        <CustomerForm mode="create" />
      </div>
    </section>
  );
}

export default CustomerCreatePage;
