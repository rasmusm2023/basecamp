"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

// Check if Firebase is configured
const isFirebaseAvailable = () => {
  return auth !== null && db !== null;
};

interface UserPreferences {
  intendedUse: "work" | "personal" | "education" | "collaboration" | "mixed-use" | null;
  preferredTheme: "dark" | "light" | null;
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  intendedUse: "work" | "personal" | "education" | "collaboration" | "mixed-use" | null;
  preferredTheme: "dark" | "light" | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    preferences: UserPreferences
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserTheme: (theme: "dark" | "light") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    if (!db) return null;
    
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return null;
  };

  useEffect(() => {
    if (!isFirebaseAvailable()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user data from Firestore when user signs in
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    preferences: UserPreferences
  ) => {
    if (!isFirebaseAvailable()) {
      throw new Error("Firebase is not configured. Please set up your Firebase credentials.");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth!,
      email,
      password
    );
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Save additional user data to Firestore
    if (db) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        displayName: `${firstName} ${lastName}`,
        intendedUse: preferences.intendedUse,
        preferredTheme: preferences.preferredTheme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseAvailable()) {
      throw new Error("Firebase is not configured. Please set up your Firebase credentials.");
    }

    await signInWithEmailAndPassword(auth!, email, password);
  };

  const logout = async () => {
    if (!isFirebaseAvailable()) {
      return;
    }

    await signOut(auth!);
    setUserData(null);
    router.push("/");
  };

  const updateUserTheme = async (theme: "dark" | "light") => {
    if (!isFirebaseAvailable() || !user || !db) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferredTheme: theme,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local userData state
      setUserData((prev) => 
        prev ? { ...prev, preferredTheme: theme, updatedAt: new Date().toISOString() } : null
      );
    } catch (error) {
      console.error("Error updating user theme:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signUp, signIn, logout, updateUserTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

