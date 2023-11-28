import { doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { postsCollectionRef } from "@/firebase/references.ts";
import { db } from "@/firebase/firebase.ts";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP


// ============================== SAVE USER TO DB


// ============================== SIGN IN


// ============================== GET ACCOUNT



// ============================== GET USER



// ============================== SIGN OUT


// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST


// ============================== UPLOAD FILE


// ============================== GET FILE URL


// ============================== DELETE FILE


// ============================== GET POSTS



// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);
    return docSnap;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS BY USERID
// return list of Documents
export async function getPostsByUserId(userId?: string) {
  if (!userId) throw Error;

  try {
    const q = query(postsCollectionRef, where("creatorId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot?.docs;
  } catch (error) {
    console.log(error);
  }
}


// ============================== UPDATE POST


// ============================== DELETE POST


// ============================== LIKE / UNLIKE POST


// ============================== SAVE POST

// ============================== DELETE SAVED POST


// ============================== FOLLOW USER


// ============================== UNFOLLOW USER


// ============================== GET USER'S POST


// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)


// ============================================================
// USER
// ============================================================

// ============================== GET USERS

// ============================== GET USER BY ID
// return fields in db
export async function getUserById(userId: string) {
  try {
    const querySnapshot = await getDoc(doc(db, "users", userId));
    return querySnapshot.data();
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER

