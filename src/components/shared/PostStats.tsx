import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { likesCollectionRef, savesCollectionRef } from "@/firebase/references";
import { useAuth } from "@/context/AuthContext.tsx";
import { db } from "@/firebase/firebase";
import { useGetRealtimeDataSingle } from "@/hooks/useGetRealtimeDataSingle";

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
  const [likeRecord, setLikeRecord] = useState<DocumentReference>();
  const [likedNumber, setLikedNumber] = useState<number>(0);
  const [isLikingPost, setIsLikingPost] = useState(false);

  // const [saveRecord, setSaveRecord] = useState<DocumentReference>();
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Handling save
  const { data: saveRecord } = useGetRealtimeDataSingle(
    doc(savesCollectionRef, post.id + "_" + user.uid)
  );

  const getLikeRecord = async () => {
    const docRef = doc(likesCollectionRef, post.id + "_" + user.uid);
    const likeRes = await getDoc(docRef);
    if (likeRes.exists()) {
      setLikeRecord(likeRes.ref);
    }
  };

  useEffect(() => {
    getLikeRecord();
    setLikedNumber(post.get("likes"));
  }, []);

  const handleLikePost = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsLikingPost(true);
    try {
      // Like the post
      if (!likeRecord) {
        setLikedNumber(likedNumber + 1);
        setLikeRecord(userRef); // set dummy
        const ref = doc(likesCollectionRef, post.id + "_" + user.uid);
        await setDoc(ref, {
          postRef: post.ref,
          likedUserRef: userRef,
          createdAt: serverTimestamp(),
        });
        await updateDoc(post.ref, {
          likes: increment(1),
        });
        setLikeRecord(ref);
      }
      // Unlike the post
      else {
        setLikedNumber(likedNumber - 1);
        const ref = likeRecord;
        setLikeRecord(undefined);
        // In case there are multiple likes for the same user in db
        deleteDoc(ref);
        await updateDoc(post.ref, {
          likes: increment(-1),
        });
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
      const ref = doc(savesCollectionRef, post.id + "_" + user.uid);
      if (!saveRecord?.exists()) {
        await setDoc(ref, {
          postRef: post.ref,
          savedUserRef: userRef,
          createdAt: serverTimestamp(),
        });
      }
      // Unsave the post
      else {
        await deleteDoc(ref);
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
            likeRecord ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"
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
            saveRecord?.exists() ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"
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
