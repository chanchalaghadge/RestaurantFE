import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { usersApi, type UserCreate } from "../../api/users.api";
import "./Users.css";

const newUser = (): UserCreate => ({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });

function UserFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const editing = Boolean(id);
  const signingUp = location.pathname === "/signup";
  const [form, setForm] = useState<UserCreate>(newUser);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!id) return;
    usersApi.get(Number(id)).then((user) => setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber ?? "", password: "" })).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load user."));
  }, [id]);
  const update = <K extends keyof UserCreate>(key: K, value: UserCreate[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing && form.password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (!editing && form.password !== confirmPassword) { setError("Passwords do not match."); return; }
    try { setSaving(true); setError(""); if (id) await usersApi.update(Number(id), { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber?.trim() || undefined }); else await usersApi.create({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber?.trim() || undefined }); navigate(signingUp ? "/" : "/users", { state: signingUp ? { accountCreated: true } : undefined }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save user."); }
    finally { setSaving(false); }
  };
  const title = editing ? "Edit User" : signingUp ? "Create Account" : "Add New User";
  return <section className="user-form-page"><div className="users-breadcrumb">{signingUp ? <Link to="/login">Login</Link> : <><Link to="/dashboard">Home</Link><span>/</span><Link to="/users">Users</Link></>}<span>/</span><strong>{title}</strong></div><h1>{title}</h1><p>{signingUp ? "Create an account to access the restaurant portal." : "Create a secure account for a member of your restaurant team."}</p><form className="user-form" onSubmit={submit}><section><h2>Account details</h2><div className="user-form-grid"><label>First Name <b>*</b><input required autoComplete="given-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label><label>Last Name<input autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></label><label>Email <b>*</b><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>Phone Number<input type="tel" autoComplete="tel" value={form.phoneNumber} onChange={(event) => update("phoneNumber", event.target.value)} /></label>{!editing && <><label>Password <b>*</b><input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} /><small>At least 8 characters.</small></label><label>Confirm Password <b>*</b><input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label></>}</div></section>{error && <p className="users-error" role="alert">{error}</p>}<div className="user-form-actions"><button type="button" onClick={() => navigate(-1)}>Cancel</button><button className="primary-button" disabled={saving} type="submit">{saving ? "Saving..." : editing ? "Save Changes" : signingUp ? "Create Account" : "Create User"}</button></div></form></section>;
}

export default UserFormPage;
