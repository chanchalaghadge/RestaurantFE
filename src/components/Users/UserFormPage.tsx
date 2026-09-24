import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";
import { useToast } from "../common/Toast";
import { usersApi, type UserCreate } from "../../api/users.api";
import { validateEmail, validatePassword, validateRequired, hasErrors, validateForm, validatePhone } from "../../utils/validation";
import "./Users.css";

const newUser = (): UserCreate => ({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });

function UserFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const { id } = useParams();
  const editing = Boolean(id);
  const signingUp = location.pathname === "/signup";
  const [form, setForm] = useState<UserCreate>(newUser);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!id) return;
    usersApi.get(Number(id)).then((user) => setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber ?? "", password: "" })).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load user."));
  }, [id]);
  const update = <K extends keyof UserCreate>(key: K, value: UserCreate[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    // Clear error for this field when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key as string];
      return newErrors;
    });
  };

  const validateFieldRealTime = (fieldName: string, value: string) => {
    let error = '';
    
    switch (fieldName) {
      case 'firstName':
        const firstNameResult = validateRequired(value, 'First name');
        error = firstNameResult.error;
        break;
      case 'lastName':
        if (signingUp) error = validateRequired(value, 'Last name').error;
        break;
      case 'email':
        const emailResult = validateEmail(value);
        error = emailResult.error;
        break;
      case 'phoneNumber':
        // Optional field, but if provided, validate format
        if (value.trim()) {
          const phoneResult = validatePhone(value);
          error = phoneResult.error;
        }
        break;
      case 'password':
        if (!editing) {
          const passwordResult = validatePassword(value);
          error = passwordResult.error;
        }
        break;
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate all fields
    const validationRules: Record<string, import("../../utils/validation").ValidationRule[]> = {
      firstName: [
        { validate: (v) => v.trim().length > 0, errorMessage: 'First name is required' }
      ],
      email: [
        { validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), errorMessage: 'Please enter a valid email address' }
      ]
    };

    if (signingUp) {
      validationRules.lastName = [
        { validate: (v) => v.trim().length > 0, errorMessage: 'Last name is required' }
      ];
      validationRules.phoneNumber = [
        { validate: (v) => /^[6-9]\d{9}$/.test(v), errorMessage: 'Enter a valid 10-digit phone number' }
      ];
    }

    if (!editing) {
      validationRules.password = [
        { validate: (v) => v.length >= 8, errorMessage: 'Password must be at least 8 characters' }
      ];
    }

    const formErrors = validateForm(form, validationRules);
    
    // Check password match for new users
    if (!editing && form.password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }

    if (hasErrors(formErrors)) {
      setErrors(formErrors);
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (id) {
        await usersApi.update(Number(id), { 
          firstName: form.firstName.trim(), 
          lastName: form.lastName.trim(), 
          email: form.email.trim(), 
          phoneNumber: form.phoneNumber?.trim() || undefined 
        });
        showToast('User updated successfully', 'success');
      } else {
        await usersApi.create({ 
          ...form, 
          firstName: form.firstName.trim(), 
          lastName: form.lastName.trim(), 
          email: form.email.trim(), 
          phoneNumber: form.phoneNumber?.trim() || undefined 
        });
        showToast(signingUp ? 'Account created successfully' : 'User created successfully', 'success');
      }
      navigate(signingUp ? "/" : "/users", { state: signingUp ? { accountCreated: true } : undefined });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save user.");
      showToast('Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };
  const title = editing ? "Edit User" : signingUp ? "Create Account" : "Add New User";
  const breadcrumbItems = signingUp
    ? [{ label: 'Login', path: '/login' }, { label: title }]
    : [{ label: 'Home', path: '/dashboard' }, { label: 'Users', path: '/users' }, { label: title }];

  return (
    <main className={signingUp ? "signup-shell" : "user-form-page"}>
      {signingUp && <aside className="signup-story">
        <Link className="signup-brand" to="/"><span aria-hidden="true">♨</span><span><strong>Food<span>Crave</span></strong><small>Good Food&nbsp; • &nbsp;Great Mood</small></span></Link>
        <div className="signup-story-copy"><small>JOIN OUR FOOD COMMUNITY</small><h2>Good Food<br />Brings People<br /><span>Together</span></h2><p>Create your account and be part of a world of delicious food, exclusive offers and amazing experiences.</p>
          <div className="signup-benefits"><article><span>♜</span><strong>Delicious<br />Food</strong></article><article><span>♧</span><strong>Fast<br />Delivery</strong></article><article><span>★</span><strong>Exclusive<br />Offers</strong></article></div>
        </div>
        <p className="signup-story-tagline">Fresh Ingredients&nbsp; · &nbsp;Better Taste&nbsp; ♡</p>
      </aside>}
      <section className={signingUp ? "signup-panel" : undefined}>
      <div className={signingUp ? "signup-card" : undefined}>
      {!signingUp && <Breadcrumb items={breadcrumbItems} />}
      {signingUp && <p className="signup-kicker">Create Your Account</p>}
      <h1>{signingUp ? "Sign Up" : title}</h1>
      {!signingUp && <p>Create a secure account for a member of your restaurant team.</p>}
      <form className={`user-form${signingUp ? " signup-form" : ""}`} onSubmit={submit}>
        <section>
          <h2>Account details</h2>
          <div className="user-form-grid">
            <label><span className="user-field-label">First Name <b aria-hidden="true">*</b></span>
              <input 
                  required
                  autoComplete="given-name"
                  placeholder={signingUp ? "Enter your first name" : undefined}
                value={form.firstName} 
                onChange={(event) => {
                  update("firstName", event.target.value);
                  validateFieldRealTime("firstName", event.target.value);
                }}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <small className="field-error">{errors.firstName}</small>}
            </label>
            <label><span className="user-field-label">Last Name {signingUp && <b aria-hidden="true">*</b>}</span>
              <input 
                required={signingUp}
                  autoComplete="family-name"
                  placeholder={signingUp ? "Enter your last name" : undefined}
                value={form.lastName} 
                onChange={(event) => update("lastName", event.target.value)} 
              />
            </label>
            <label><span className="user-field-label">Email <b aria-hidden="true">*</b></span>
              <input 
                required 
                  type="email"
                  autoComplete="email"
                  placeholder={signingUp ? "Enter your email address" : undefined}
                value={form.email} 
                onChange={(event) => {
                  update("email", event.target.value);
                  validateFieldRealTime("email", event.target.value);
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>
            <label><span className="user-field-label">Phone Number {signingUp && <b aria-hidden="true">*</b>}</span>
              <div className="india-phone-input">
                <span aria-hidden="true">☎ <b>+91</b>⌄</span>
                <input
                  required={signingUp}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={(event) => {
                    const phoneNumber = event.target.value.replace(/\D/g, "").slice(0, 10);
                    update("phoneNumber", phoneNumber);
                    validateFieldRealTime("phoneNumber", phoneNumber);
                  }}
                  aria-invalid={!!errors.phoneNumber}
                />
              </div>
              {errors.phoneNumber && <small className="field-error">{errors.phoneNumber}</small>}
            </label>
            {!editing && (
              <>
                <label><span className="user-field-label">Password <b aria-hidden="true">*</b></span>
                  <input 
                    required 
                    minLength={8} 
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password" 
                    placeholder={signingUp ? "At least 8 characters" : undefined}
                    value={form.password} 
                    onChange={(event) => {
                      update("password", event.target.value);
                      validateFieldRealTime("password", event.target.value);
                    }}
                    aria-invalid={!!errors.password}
                  />
                  {signingUp && <button type="button" className="signup-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9.1 4.3 10 7a11.7 11.7 0 0 1-3.1 4.7M6.6 6.6C4.7 7.8 3.2 9.7 2 12c.9 2.7 4.8 7 10 7 1.1 0 2.1-.2 3-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>}</button>}
                  <small>At least 8 characters.</small>
                  {errors.password && <small className="field-error">{errors.password}</small>}
                </label>
                <label><span className="user-field-label">Confirm Password <b aria-hidden="true">*</b></span>
                  <input 
                    required 
                    minLength={8} 
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password" 
                    placeholder={signingUp ? "Re-enter your password" : undefined}
                    value={confirmPassword} 
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.confirmPassword;
                          return newErrors;
                        });
                      }
                    }}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {signingUp && <button type="button" className="signup-password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9.1 4.3 10 7a11.7 11.7 0 0 1-3.1 4.7M6.6 6.6C4.7 7.8 3.2 9.7 2 12c.9 2.7 4.8 7 10 7 1.1 0 2.1-.2 3-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>}</button>}
                  {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
                </label>
              </>
            )}
          </div>
        </section>
        {error && <p className="users-error" role="alert">{error}</p>}
        <div className="user-form-actions">
          {!signingUp && <button type="button" onClick={() => navigate(-1)}>Cancel</button>}
          <button className="primary-button" disabled={saving} type="submit">{saving ? "Saving..." : editing ? "Save Changes" : signingUp ? "Sign Up" : "Create User"}<span aria-hidden="true">→</span></button>
        </div>
      </form>
      {signingUp && <>
        <div className="signup-divider"><span>Or sign up with</span></div>
        <div className="signup-social-actions">
          <button type="button" onClick={() => showToast("Google sign up is not configured yet.", "info")}><b className="google-mark">G</b> Continue with Google</button>
          <button type="button" onClick={() => showToast("Apple sign up is not configured yet.", "info")}><b className="apple-mark">●</b> Continue with Apple</button>
        </div>
      </>}
      {signingUp && <p className="signup-login-prompt">Already have an account? <Link to="/login">Sign In</Link></p>}
      </div>
      </section>
    </main>
  );
}

export default UserFormPage;
