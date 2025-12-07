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
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import {
  createSpace,
  createFolder,
  createSubFolder,
} from "@/lib/firebase/spaces";

// Check if Firebase is configured
const isFirebaseAvailable = () => {
  return auth !== null && db !== null;
};

interface UserPreferences {
  intendedUse:
    | "work"
    | "personal"
    | "education"
    | "collaboration"
    | "mixed-use"
    | null;
  preferredTheme: "dark" | "light" | null;
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  intendedUse:
    | "work"
    | "personal"
    | "education"
    | "collaboration"
    | "mixed-use"
    | null;
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
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
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
    } catch (error: any) {
      // Handle offline errors gracefully - don't log them as errors
      // Firebase will automatically retry when connection is restored
      if (
        error?.code === "unavailable" ||
        error?.message?.includes("offline")
      ) {
        // Silently handle offline errors - Firebase will retry automatically
        return null;
      }
      // Only log unexpected errors
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
      // Set loading to false immediately - don't wait for user data fetch
      setLoading(false);

      if (user) {
        // Fetch user data from Firestore in the background (non-blocking)
        fetchUserData(user.uid).then((data) => {
          setUserData(data);
        });
      } else {
        setUserData(null);
      }
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
      throw new Error(
        "Firebase is not configured. Please set up your Firebase credentials."
      );
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
    console.log("signUp: db check - db is", db ? "available" : "null");
    if (db) {
      console.log("signUp: Saving user data to Firestore");
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
      console.log("signUp: User data saved successfully");

      // Create default space with "Unnamed folder" and "Unnamed sub-folder"
      console.log(
        "signUp: Starting to create default space structure for user:",
        userCredential.user.uid
      );
      try {
        const spaceId = await createSpace(
          userCredential.user.uid,
          "Your space"
        );
        console.log("signUp: Space created with ID:", spaceId);

              const folderId = await createFolder(
                userCredential.user.uid,
                spaceId,
                "New collection"
              );
              console.log("signUp: Folder created with ID:", folderId);

              await createSubFolder(
                userCredential.user.uid,
                spaceId,
                folderId,
                "New folder"
              );
        console.log("signUp: Sub-folder created successfully");
        console.log("signUp: Default space structure creation completed");
      } catch (error: any) {
        console.error("signUp: Error creating default space structure:", error);
        console.error("signUp: Error details:", {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
        });
        // Don't throw - user account is already created, this is just initialization
      }
    } else {
      console.error(
        "signUp: db is null, cannot create default space structure"
      );
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = true
  ) => {
    if (!isFirebaseAvailable()) {
      throw new Error(
        "Firebase is not configured. Please set up your Firebase credentials."
      );
    }

    // Set persistence based on rememberMe checkbox
    // If rememberMe is true, use local persistence (stays logged in across sessions)
    // If rememberMe is false, use session persistence (only for current session)
    await setPersistence(
      auth!,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

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
        prev
          ? {
              ...prev,
              preferredTheme: theme,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    } catch (error: any) {
      // Handle offline errors gracefully
      if (
        error?.code === "unavailable" ||
        error?.message?.includes("offline")
      ) {
        // Still update local state even if offline - will sync when connection is restored
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                preferredTheme: theme,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        // Firebase will automatically retry when connection is restored
        return;
      }
      // Only log unexpected errors
      console.error("Error updating user theme:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signUp,
        signIn,
        logout,
        updateUserTheme,
      }}
    >
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
