import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { usersCollectionRef } from "@/firebase/references";
import { useToast } from "@/components/ui";
import { CopySlash } from "lucide-react";

const INITIAL_STATE = {
  user: null,
  userData: null,
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
  user: User | null;
  userData: DocumentData | null;
  signup: (email: string, password: string) => Promise<UserCredential>;
  signin: (email: string, password: string) => Promise<UserCredential>;
  signout: () => Promise<void>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export const useAuth = () => useContext(AuthContext);

export function AuthProviderf({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);

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
        const q = query(usersCollectionRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setUserData(querySnapshot?.docs[0]?.data());
        setLoadingUser(false);
      } else {
        navigate("/sign-in");
        setLoadingUser(false);
      }
    });
    return unsubscribe;
  }, []);

  // if (userData != null) {
  //   unsub()
  //   console.log('yo')
  //   // setLoadingUserData(false);
  // }
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
