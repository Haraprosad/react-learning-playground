import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthContextType } from "../types/auth.types";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSendPasswordResetEmail,
  firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "../config/firebase";
import { authService } from "../config/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase token
          const token = await firebaseUser.getIdToken();

          // Fetch user data from backend (includes role)
          const userData = await authService.getCurrentUser(token);

          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Firebase Google Sign-In
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get Firebase token
      const token = await firebaseUser.getIdToken(true);

      // Register user in backend (creates if doesn't exist)
      // Ignore errors - user might already exist, onAuthStateChanged will fetch the data
      try {
        await authService.register({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || undefined,
          photo_url: firebaseUser.photoURL || undefined,
          provider: "google",
        });
      } catch (error) {
        // User already exists - that's fine, onAuthStateChanged will fetch their data
        console.log("User already registered, fetching existing data...");
      }

      // User data will be set by onAuthStateChanged listener
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
      throw error;
    }
    // Don't set isLoading to false here - let onAuthStateChanged do it
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Firebase Email/Password Sign-In
      // Note: onAuthStateChanged will automatically fetch user data
      await signInWithEmailAndPassword(auth, email, password);
      // User data will be set by onAuthStateChanged listener
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
      throw error;
    }
    // Don't set isLoading to false here - let onAuthStateChanged do it
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string
  ) => {
    setIsLoading(true);
    try {
      // Firebase Email/Password Sign-Up
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = result.user;

      // Get Firebase token
      const token = await firebaseUser.getIdToken();

      // Register user with backend
      await authService.register({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: name || undefined,
        photo_url: firebaseUser.photoURL || undefined,
        provider: "email",
      });

      // User data will be set by onAuthStateChanged listener
    } catch (error) {
      console.error("Sign-up error:", error);
      setIsLoading(false);
      throw error;
    }
    // Don't set isLoading to false here - let onAuthStateChanged do it
  };

  const resetPassword = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: window.location.origin + "/auth/reset-password",
        handleCodeInApp: true,
      };
      await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("No user is currently logged in");
      }

      // Reauthenticate user before changing password (required by Firebase)
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await firebaseUpdatePassword(currentUser, newPassword);
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
