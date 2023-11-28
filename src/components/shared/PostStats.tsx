import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { likesCollectionRef, savesCollectionRef } from "@/firebase/references";
import { useAuth } from "@/context/AuthContext.tsx";
import { db } from "@/firebase/firebase";

type PostStatsProps = {
  post:
    | QueryDocumentSnapshot<DocumentData>
    | DocumentSnapshot<DocumentData>
    | DocumentSnapshot<unknown, DocumentData>;
};

const PostStats = ({ post }: PostStatsProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const userRef = doc(db, "users", user.uid); 
  const [likeRecord, setLikeRecord] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [likedNumber, setLikedNumber] = useState<number>(0);
  const [isLikingPost, setIsLikingPost] = useState(false);
  const [saveRecord, setSaveRecord] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [isSavingPost, setIsSavingPost] = useState(false);

  // handling likes
  const likeRecordQuery = query(
    likesCollectionRef,
    where("postRef", "==", post.ref),
    where("likedUserRef", "==", userRef)
  );
  const likedNumberQuery = query(
    likesCollectionRef,
    where("postRef", "==", post.ref)
  );

  // handling save
  const saveRecordQuery = query(
    savesCollectionRef,
    where("postRef", "==", post.ref),
    where("savedUserRef", "==", userRef)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(likedNumberQuery, (querySnapshot) => {
      setLikedNumber(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(likeRecordQuery, (querySnapshot) => {
      setLikeRecord(querySnapshot.docs);
      if (querySnapshot.docs.length > 1) {
        console.log("check likes db");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(saveRecordQuery, (querySnapshot) => {
      setSaveRecord(querySnapshot.docs);
      if (querySnapshot.docs.length > 1) {
        console.log("check saves db");
      }
    });
    return unsubscribe;
  }, []);
  
  const handleLikePost = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsLikingPost(true);
    try {
      // Like the post
      if (likeRecord.length == 0) {
        await addDoc(likesCollectionRef, {
          postRef: post.ref,
          likedUserRef: userRef,
          createdAt: serverTimestamp(),
        });
      }
      // Unlike the post
      else {
        // In case there are multiple likes for the same user in db
        await Promise.all(likeRecord.map((doc) => deleteDoc(doc.ref)));
      }
    } catch (error) {
      console.log(error);
    }
    setIsLikingPost(false);
  };

  const handleSavePost = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsSavingPost(true);
    try {
      // save the post
      if (saveRecord.length == 0) {
        await addDoc(savesCollectionRef, {
          postRef: post.ref,
          savedUserRef: userRef,
          createdAt: serverTimestamp(),
        });
      }
      // Unsave the post
      else {
        // In case there are multiple saves for the same user in db
        await Promise.all(saveRecord.map((doc) => deleteDoc(doc.ref)));
      }
    } catch (error) {
      console.log(error);
    }
    setIsSavingPost(false);
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={`${
            likeRecord.length > 0
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
          style={{ pointerEvents: isLikingPost ? "none" : "auto" }}
        />
        <p className="text-slate-300 small-medium lg:base-medium">
          {likedNumber}
        </p>
      </div>

      <div className="flex gap-2">
        <img
          src={
            saveRecord.length > 0
              ? "/assets/icons/saved.svg"
              : "/assets/icons/save.svg"
          }
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
          style={{ pointerEvents: isSavingPost ? "none" : "auto" }}
        />
      </div>
    </div>
  );
};

export default PostStats;
