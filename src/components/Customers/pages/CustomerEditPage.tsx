import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CustomerForm from "../components/CustomerForm";
import { customersApi, type CustomerApi } from "../../../api/customers.api";
import "../Customers.css";

function CustomerEditPage() { const { id } = useParams(); const [customer, setCustomer] = useState<CustomerApi | null>(null); const [error, setError] = useState(""); useEffect(() => { if (id) customersApi.get(Number(id)).then(setCustomer).catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load customer.")); }, [id]); if (error) return <p>{error}</p>; if (!customer) return <p>Loading customer...</p>; return <section className="customers-page"><div className="customer-page-header"><div><h1>Edit Customer</h1><p>Update customer details.</p></div><Link className="secondary-button" to={`/customers/${customer.id}`}>← View Customer</Link></div><div className="customer-detail-box"><CustomerForm customer={customer} mode="edit" /></div></section>; }
export default CustomerEditPage;
