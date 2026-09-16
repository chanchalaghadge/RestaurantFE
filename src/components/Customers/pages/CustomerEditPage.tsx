import { Link, useParams } from "react-router-dom";
import CustomerForm from "../components/CustomerForm";
import { customers } from "../data/customer.data";
import "../Customers.css";

function CustomerEditPage() {
  const { id } = useParams();
  const customer = customers.find((item) => item.id === id) ?? customers[0];

  return (
    <section className="customers-page">
      <div className="customer-page-header">
        <div>
          <div className="customer-breadcrumb">
            <Link to="/dashboard">Home</Link>
            <span>/</span>
            <Link to="/customers">Customers</Link>
            <span>/</span>
            <strong>Edit Customer</strong>
          </div>
          <h1>Edit Customer</h1>
          <p>Update customer details and order information.</p>
        </div>
        <Link className="secondary-button" to={`/customers/${customer.id}`}>← View Customer</Link>
      </div>

      <div className="customer-detail-box">
        <CustomerForm customer={customer} mode="edit" />
      </div>
    </section>
  );
}

export default CustomerEditPage;
