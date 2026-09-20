import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
        // Optional field, no validation
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
    <section className="user-form-page">
      <Breadcrumb items={breadcrumbItems} />
      <h1>{title}</h1>
      <p>{signingUp ? "Create an account to access the restaurant portal." : "Create a secure account for a member of your restaurant team."}</p>
      <form className="user-form" onSubmit={submit}>
        <section>
          <h2>Account details</h2>
          <div className="user-form-grid">
            <label>First Name <b>*</b>
              <input 
                required 
                autoComplete="given-name" 
                value={form.firstName} 
                onChange={(event) => {
                  update("firstName", event.target.value);
                  validateFieldRealTime("firstName", event.target.value);
                }}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <small className="field-error">{errors.firstName}</small>}
            </label>
            <label>Last Name
              <input 
                autoComplete="family-name" 
                value={form.lastName} 
                onChange={(event) => update("lastName", event.target.value)} 
              />
            </label>
            <label>Email <b>*</b>
              <input 
                required 
                type="email" 
                autoComplete="email" 
                value={form.email} 
                onChange={(event) => {
                  update("email", event.target.value);
                  validateFieldRealTime("email", event.target.value);
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>
            <label>Phone Number
              <input 
                type="tel" 
                autoComplete="tel" 
                value={form.phoneNumber} 
                onChange={(event) => {
                  update("phoneNumber", event.target.value);
                  validateFieldRealTime("phoneNumber", event.target.value);
                }}
                aria-invalid={!!errors.phoneNumber}
              />
              {errors.phoneNumber && <small className="field-error">{errors.phoneNumber}</small>}
            </label>
            {!editing && (
              <>
                <label>Password <b>*</b>
                  <input 
                    required 
                    minLength={8} 
                    type="password" 
                    autoComplete="new-password" 
                    value={form.password} 
                    onChange={(event) => {
                      update("password", event.target.value);
                      validateFieldRealTime("password", event.target.value);
                    }}
                    aria-invalid={!!errors.password}
                  />
                  <small>At least 8 characters.</small>
                  {errors.password && <small className="field-error">{errors.password}</small>}
                </label>
                <label>Confirm Password <b>*</b>
                  <input 
                    required 
                    minLength={8} 
                    type="password" 
                    autoComplete="new-password" 
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
                  {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
                </label>
              </>
            )}
          </div>
        </section>
        {error && <p className="users-error" role="alert">{error}</p>}
        <div className="user-form-actions">
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
          <button className="primary-button" disabled={saving} type="submit">{saving ? "Saving..." : editing ? "Save Changes" : signingUp ? "Create Account" : "Create User"}</button>
        </div>
      </form>
    </section>
  );
}

export default UserFormPage;
