/**
 * Authentication Context
 * StrokeTraining Platform v2.0
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  type User as FirebaseUser, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../services/firebase";
import type { User, UserRole } from "../types";

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  hospital: string;
  specialization?: string;
  region?: string;
  phoneNumber?: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(firestore, "users", uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch the user profile from Firestore
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser, profileData: RegistrationData): Promise<void> => {
    const userProfile: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      role: profileData.role,
      profile: {
        name: profileData.name,
        hospital: profileData.hospital,
        specialization: profileData.specialization || undefined,
        region: profileData.region || undefined,
        phoneNumber: profileData.phoneNumber || undefined,
      },
      preferences: {
        language: "fr",
        notifications: {
          email: true,
          forum: true,
          documents: true,
          impact: true,
        },
      },
      metadata: {
        createdAt: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
        isActive: true,
      },
    };

    await setDoc(doc(firestore, "users", firebaseUser.uid), userProfile);
  };

  // Authentication methods
  const register = async (data: RegistrationData): Promise<void> => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user, data);
      
      console.log("User registered successfully:", userCredential.user.uid);
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const login = async (email: string, password: string, _rememberMe = false): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      if (userCredential.user) {
        const userRef = doc(firestore, "users", userCredential.user.uid);
        await setDoc(userRef, {
          metadata: {
            lastLogin: serverTimestamp(),
          },
        }, { merge: true });
      }
      
      // Handle remember me (this is handled by Firebase Auth by default)
      console.log("User logged in successfully:", userCredential.user.uid);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error("Failed to log out");
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateProfile = async (profile: Partial<User>): Promise<void> => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    try {
      const userRef = doc(firestore, "users", currentUser.uid);
      await setDoc(userRef, profile, { merge: true });
      
      // Update local state
      const updatedProfile = await fetchUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
      
      console.log("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error("Failed to update profile");
    }
  };

  // Helper function to get user-friendly error messages
  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "Aucun compte trouvé avec cette adresse email.";
      case "auth/wrong-password":
        return "Mot de passe incorrect.";
      case "auth/email-already-in-use":
        return "Cette adresse email est déjà utilisée.";
      case "auth/weak-password":
        return "Le mot de passe doit contenir au moins 6 caractères.";
      case "auth/invalid-email":
        return "Adresse email invalide.";
      case "auth/too-many-requests":
        return "Trop de tentatives. Réessayez plus tard.";
      case "auth/user-disabled":
        return "Ce compte a été désactivé.";
      case "auth/configuration-not-found":
        return "Service d'authentification non configuré. Veuillez activer l'authentification email/mot de passe dans la console Firebase.";
      case "auth/project-not-found":
        return "Projet Firebase introuvable. Vérifiez la configuration.";
      case "auth/api-key-not-valid":
        return "Clé API Firebase invalide. Vérifiez la configuration.";
      default:
        return "Une erreur s'est produite. Veuillez réessayer.";
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};