import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { adminService, superadminService } from "../config/api";
import type { UserListItem, CreateUserRequest } from "../types/auth.types";

export function UserManagement() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateUserRequest>({
    email: "",
    password: "",
    name: "",
    role: "user",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit/Delete state
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await adminService.getAllUsers(token);
      setUsers(response.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      await superadminService.createUser(token, createFormData);

      setSuccessMessage(`User ${createFormData.email} created successfully!`);
      setCreateFormData({ email: "", password: "", name: "", role: "user" });
      setShowCreateForm(false);

      // Refresh user list
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  // Update role handler
  const handleUpdateRole = async (
    firebase_uid: string,
    new_role: "admin" | "user"
  ) => {
    setError("");
    setSuccessMessage("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      await adminService.updateUserRole(token, firebase_uid, new_role);

      setSuccessMessage("Role updated successfully!");
      setEditingUser(null);

      // Refresh user list
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  // Delete user handler
  const handleDeleteUser = async (firebase_uid: string) => {
    setError("");
    setSuccessMessage("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      await adminService.deleteUser(token, firebase_uid);

      setSuccessMessage("User deleted successfully!");
      setDeleteConfirm(null);

      // Refresh user list
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "#dc3545";
      case "admin":
        return "#0d6efd";
      case "user":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>👥 User Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showCreateForm ? "✕ Cancel" : "+ Create User"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "5px",
            color: "#155724",
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
            color: "#721c24",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Email *
              </label>
              <input
                type="email"
                required
                value={createFormData.email}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    email: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
                placeholder="user@example.com"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Name *
              </label>
              <input
                type="text"
                required
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Password *
              </label>
              <input
                type="password"
                required
                value={createFormData.password}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    password: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
                placeholder="Minimum 12 characters"
                minLength={12}
              />
              <small style={{ color: "#6c757d", fontSize: "12px" }}>
                Must be at least 12 characters with uppercase, lowercase,
                number, and special character
              </small>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Role *
              </label>
              <select
                value={createFormData.role}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    role: e.target.value as "admin" | "user",
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              style={{
                padding: "12px 24px",
                backgroundColor: createLoading ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: createLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {createLoading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
          No users found
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <th
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Role
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Provider
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.uid}
                  style={{ borderBottom: "1px solid #dee2e6" }}
                >
                  <td style={{ padding: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {user.photo_url && (
                        <img
                          src={user.photo_url}
                          alt={user.name || "User"}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <span style={{ fontWeight: "500" }}>
                        {user.name || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "15px", color: "#495057" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "15px" }}>
                    {editingUser === user.uid ? (
                      <select
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(e.target.value as "admin" | "user")
                        }
                        style={{
                          padding: "5px 10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: getRoleBadgeColor(user.role) + "20",
                          color: getRoleBadgeColor(user.role),
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6c757d",
                      fontSize: "14px",
                    }}
                  >
                    {user.provider || "password"}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      {user.role !== "superadmin" && (
                        <>
                          {editingUser === user.uid ? (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateRole(user.uid, editRole)
                                }
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                }}
                              >
                                ✓ Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#6c757d",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                }}
                              >
                                ✕ Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(user.uid);
                                  setEditRole(user.role as "admin" | "user");
                                }}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#0d6efd",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                }}
                              >
                                ✏️ Edit Role
                              </button>
                              {deleteConfirm === user.uid ? (
                                <>
                                  <button
                                    onClick={() => handleDeleteUser(user.uid)}
                                    style={{
                                      padding: "6px 12px",
                                      backgroundColor: "#dc3545",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ⚠️ Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    style={{
                                      padding: "6px 12px",
                                      backgroundColor: "#6c757d",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(user.uid)}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                      {user.role === "superadmin" && (
                        <span
                          style={{
                            color: "#6c757d",
                            fontSize: "13px",
                            fontStyle: "italic",
                          }}
                        >
                          Protected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
