import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import Breadcrumb from "../common/Breadcrumb";
import { usersApi, type UserApi } from "../../api/users.api";
import { useTableSort } from "../../hooks/useTableSort";
import { exportToCsv, generateTimestamp } from "../../utils/csvExport";
import "./Users.css";

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserApi[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await usersApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = users.filter((user) => `${user.firstName} ${user.lastName} ${user.email} ${user.phoneNumber ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const { sortedData } = useTableSort(filtered);

  const deactivate = async (user: UserApi) => {
    if (!window.confirm(`Deactivate ${user.firstName} ${user.lastName}?`)) return;
    try {
      await usersApi.remove(user.id);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to deactivate user.");
    }
  };

  const handleExport = () => {
    const columns = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Phone', formatter: (val: string | undefined) => val || 'N/A' },
      { key: 'isActive', label: 'Status', formatter: (val: boolean) => val ? 'Active' : 'Inactive' },
      { key: 'createdDate', label: 'Created', formatter: (val: string) => new Date(val).toLocaleDateString() }
    ];
    exportToCsv(sortedData, columns, `users-export-${generateTimestamp()}.csv`);
  };

  if (loading) {
    return (
      <section className="users-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Users' }]} />
        <header className="users-header">
          <div>
            <h1>Users</h1>
            <p>Create and manage access for restaurant staff.</p>
          </div>
          <button className="primary-button" onClick={() => navigate("/users/new")}>＋ Add New User</button>
        </header>
        <LoadingSpinner text="Loading users..." fullScreen />
      </section>
    );
  }

  return (
    <section className="users-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Users' }]} />
      <header className="users-header">
        <div>
          <h1>Users</h1>
          <p>Create and manage access for restaurant staff.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-button" onClick={handleExport} disabled={sortedData.length === 0}>
            📥 Export CSV
          </button>
          <button className="primary-button" onClick={() => navigate("/users/new")}>＋ Add New User</button>
        </div>
      </header>
      {error && <p className="users-error" role="alert">{error}</p>}
      <section className="users-panel">
        <div className="users-toolbar">
          <label>⌕ <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users by name, email, or phone..." /></label>
          <span>{sortedData.length} user{sortedData.length === 1 ? "" : "s"}</span>
        </div>
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length ? sortedData.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name">
                      <span>{`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}</span>
                      <strong>{user.firstName} {user.lastName}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "—"}</td>
                  <td><i className={user.isActive ? "user-active" : "user-inactive"}>{user.isActive ? "Active" : "Inactive"}</i></td>
                  <td>{new Date(user.createdDate).toLocaleDateString()}</td>
                  <td>
                    <div className="user-actions">
                      <button type="button" onClick={() => navigate(`/users/${user.id}/edit`)}>Edit</button>
                      {user.isActive && <button type="button" className="deactivate" onClick={() => void deactivate(user)}>Deactivate</button>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>
                    <div className="users-empty">
                      <span>♟</span>
                      <strong>No users yet</strong>
                      <p>Create your first staff account to get started.</p>
                      <button className="primary-button" onClick={() => navigate("/users/new")}>Add New User</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default UsersPage;
