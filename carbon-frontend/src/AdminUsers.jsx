import React, { useEffect, useState } from "react";
import "./AdminUsers.css";

const API_URL = "http://localhost:8080";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ================================
  // LOAD USERS
  // ================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ================================
  // DELETE USER
  // ================================

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setUsers(users.filter((user) => user.id !== id));
      setMessage("User deleted successfully.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to delete user.");
    }
  };

  // ================================
  // EDIT USER
  // ================================

  const openEdit = (user) => {
    setEditingUser({
      ...user,
      password: "",
    });

    setMessage("");
    setError("");
  };

  const closeEdit = () => {
    setEditingUser(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingUser({
      ...editingUser,
      [name]: value,
    });
  };

  const updateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${editingUser.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(editingUser),
        }
      );

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const updatedUser = await response.json();

      setUsers(
        users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );

      setEditingUser(null);
      setMessage("User updated successfully.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to update user.");
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="users-loading">
          <div className="users-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">

      {/* HEADER */}

      <div className="users-header">
        <div>
          <p className="admin-page-label">ADMIN PANEL</p>

          <h1>Manage Users</h1>

          <p className="users-subtitle">
            View and manage all registered CarbonDown users.
          </p>
        </div>

        <button className="users-refresh-btn" onClick={loadUsers}>
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}

      <div className="users-summary">
        <div className="summary-icon">👥</div>

        <div>
          <p>Total Registered Users</p>
          <h2>{users.length}</h2>
        </div>
      </div>

      {/* MESSAGES */}

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {/* USER TABLE */}

      <div className="users-table-card">

        <div className="table-heading">
          <div>
            <h2>Registered Users</h2>
            <p>Manage user accounts and profile details.</p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="empty-users">
            <div>👥</div>
            <h3>No users found</h3>
            <p>There are currently no registered users.</p>
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>

                    <td className="user-id">
                      #{user.id}
                    </td>

                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        <div>
                          <strong>
                            {user.name || "Unnamed User"}
                          </strong>
                        </div>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      {user.gender || "—"}
                    </td>

                    <td>
                      {user.age || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          user.role === "ADMIN"
                            ? "role-badge admin-role"
                            : "role-badge user-role"
                        }
                      >
                        {user.role || "USER"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() => openEdit(user)}
                        >
                          ✏ Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteUser(user.id)}
                        >
                          🗑 Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </div>

      {/* EDIT MODAL */}

      {editingUser && (
        <div className="modal-overlay">

          <div className="edit-modal">

            <div className="modal-header">
              <div>
                <p className="modal-label">ADMIN</p>
                <h2>Edit User</h2>
              </div>

              <button
                className="close-modal"
                onClick={closeEdit}
              >
                ×
              </button>
            </div>

            <form onSubmit={updateUser}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    value={editingUser.name || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={editingUser.email || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>

                  <select
                    name="gender"
                    value={editingUser.gender || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Age</label>

                  <input
                    type="number"
                    name="age"
                    value={editingUser.age || ""}
                    onChange={handleEditChange}
                    min="1"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>

                  <select
                    name="role"
                    value={editingUser.role || "USER"}
                    onChange={handleEditChange}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferred Transport</label>

                  <input
                    type="text"
                    name="preferredTransport"
                    value={editingUser.preferredTransport || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Diet Preference</label>

                  <input
                    type="text"
                    name="dietPreference"
                    value={editingUser.dietPreference || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Energy Source</label>

                  <input
                    type="text"
                    name="energySource"
                    value={editingUser.energySource || ""}
                    onChange={handleEditChange}
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminUsers;