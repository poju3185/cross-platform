import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import {
  IdTokenResult,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { getUserById } from "@/lib/appwrite/api";

const INITIAL_USER: User = {
  emailVerified: false,
  isAnonymous: false,
  metadata: {
    creationTime: "", // Replace with actual creation time
    lastSignInTime: "", // Replace with actual last sign in time
  },
  providerData: [],
  refreshToken: "",
  tenantId: null,
  delete: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  getIdToken: function (forceRefresh?: boolean | undefined): Promise<string> {
    throw new Error("Function not implemented.");
  },
  getIdTokenResult: function (
    forceRefresh?: boolean | undefined
  ): Promise<IdTokenResult> {
    throw new Error("Function not implemented.");
  },
  reload: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  toJSON: function (): object {
    throw new Error("Function not implemented.");
  },
  displayName: null,
  email: null,
  phoneNumber: null,
  photoURL: null,
  providerId: "",
  uid: "",
};
const INITIAL_USER_DATA: DocumentData = {};
const INITIAL_STATE = {
  user: INITIAL_USER,
  userData: INITIAL_USER_DATA,
  signup: async () => {
    throw new Error("signup function not implemented");
  },
  signin: async () => {
    throw new Error("signin function not implemented");
  },
  signout: async () => {
    throw new Error("signout function not implemented");
  },
};

type IContextType = {
  user: User;
  userData: DocumentData;
  signup: (email: string, password: string) => Promise<UserCredential>;
  signin: (email: string, password: string) => Promise<UserCredential>;
  signout: () => Promise<void>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export const useAuth = () => useContext(AuthContext);

export function AuthProviderf({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [userData, setUserData] = useState<DocumentData>(INITIAL_USER_DATA);

  const [loadingUser, setLoadingUser] = useState(true);

  const signup = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const signin = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signout = async () => {
    return await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user !== null) {
        setUser(user);
        const data = await getUserById(user.uid);
        if (data === undefined) {
          throw Error;
        }
        setUserData(data);
        setLoadingUser(false);
      } else {
        navigate("/sign-in");
        setLoadingUser(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    signup,
    signin,
    signout,
  };

  //   console.log(user);
  return (
    <AuthContext.Provider value={value}>
      {!loadingUser && children}
    </AuthContext.Provider>
  );
}
