import { collection } from "firebase/firestore";
import { db } from "./firebase";

export const usersCollectionRef = collection(db, "users");
export const postsCollectionRef = collection(db, "posts");
export const likesCollectionRef = collection(db, "likes");
export const savesCollectionRef = collection(db, "saves");
export const followsCollectionRef = collection(db, "follows");
