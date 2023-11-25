import { collection } from "firebase/firestore";
import { ref } from "firebase/storage";
import { db, storage } from "./firebase";
import { v4 } from "uuid";

export const usersCollectionRef = collection(db, "users")
export const postsCollectionRef = collection(db, "posts")
export const likesCollectionRef = collection(db, "likes");
export const savesCollectionRef = collection(db, "saves");
export const imageStorageRef = ref(storage, `images/${v4()}`)