import type { User } from "../types";

/**
 * UserCard Component Props
 * Demonstrates using TypeScript interfaces for component props
 */
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

/**
 * UserCard Component
 *
 * Displays user information in a card format.
 * Uses the User interface for type-safe props.
 *
 * @example
 * <UserCard user={userData} onSelect={(user) => console.log(user)} />
 */
export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        margin: "10px 0",
        backgroundColor: "#f9f9f9",
        cursor: onSelect ? "pointer" : "default",
      }}
      onClick={() => onSelect?.(user)}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>{user.name}</h4>
      <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
        <strong>Username:</strong> {user.username}
      </p>
      <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
        <strong>Email:</strong> {user.email}
      </p>
      {user.phone && (
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
          <strong>Phone:</strong> {user.phone}
        </p>
      )}
      {user.website && (
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
          <strong>Website:</strong> {user.website}
        </p>
      )}
    </div>
  );
}
