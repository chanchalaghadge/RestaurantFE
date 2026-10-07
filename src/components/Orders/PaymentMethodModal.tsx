import { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import type { PaymentDetails, PaymentMethod } from "../../api/orders.api";
import "./PaymentMethodModal.css";

function PaymentMethodModal({ total, orderNumber, saving, onCancel, onConfirm }: {
  total: number;
  orderNumber?: number;
  saving: boolean;
  onCancel: () => void;
  onConfirm: (details: PaymentDetails) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [cashAmount, setCashAmount] = useState(total);
  const upiAmount = method === "Cash" ? 0 : method === "UPI" ? total : Math.max(0, total - cashAmount);

  const chooseMethod = (next: PaymentMethod) => {
    setMethod(next);
    setCashAmount(next === "Cash" ? total : 0);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onConfirm({ paymentMethod: method, cashAmount: method === "UPI" ? 0 : cashAmount, upiAmount });
  };

  return <div className="payment-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onCancel(); }}>
    <form className="payment-method-modal" onSubmit={submit}>
      <header><div><p>Complete payment{orderNumber ? ` · Order #${orderNumber}` : ""}</p><h2>{formatCurrency(total)}</h2></div><button type="button" onClick={onCancel} disabled={saving} aria-label="Close">×</button></header>
      <fieldset>
        <legend>How did the customer pay?</legend>
        {(["Cash", "UPI", "Split"] as PaymentMethod[]).map((option) => <label className={`payment-method-option${method === option ? " selected" : ""}`} key={option}>
          <input type="radio" name="paymentMethod" value={option} checked={method === option} onChange={() => chooseMethod(option)} />
          <span>{option === "UPI" ? "UPI" : option}</span>
          <small>{option === "Split" ? "Cash + UPI" : option === "UPI" ? "Digital payment" : "Cash payment"}</small>
        </label>)}
      </fieldset>
      {method === "Split" && <div className="split-payment-fields">
        <label>Cash amount<input type="number" min="0" max={total} step="0.01" required value={cashAmount} onChange={(event) => setCashAmount(Math.min(total, Math.max(0, Number(event.target.value))))} /></label>
        <label>UPI amount<output>{formatCurrency(upiAmount)}</output></label>
      </div>}
      <footer><button type="button" onClick={onCancel} disabled={saving}>Cancel</button><button className="primary-button" type="submit" disabled={saving || (method === "Split" && (cashAmount <= 0 || upiAmount <= 0))}>{saving ? "Saving..." : "Save Payment"}</button></footer>
    </form>
  </div>;
}

export default PaymentMethodModal;
