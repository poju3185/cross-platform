import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { checkIsLiked } from "@/lib/utils";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import { Loader } from ".";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { likesCollectionRef, savesCollectionRef } from "@/firebase/references";
import { useAuth } from "@/context/AuthContextf";
import { db } from "@/firebase/firebase";

type PostStatsProps = {
  post: QueryDocumentSnapshot<DocumentData>;
};

const PostStats = ({ post }: PostStatsProps) => {
  const location = useLocation();
  const { user } = useAuth();
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
    where("postId", "==", post.id),
    where("likedUserId", "==", user.uid)
  );
  const likedNumberQuery = query(
    likesCollectionRef,
    where("postId", "==", post.id)
  );

  // handling save
  const saveRecordQuery = query(
    savesCollectionRef,
    where("postId", "==", post.id),
    where("savedUserId", "==", user.uid)
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
  // const likesList = post.likes.map((user: Models.Document) => user.$id);

  // const [likes, setLikes] = useState<string[]>(likesList);

  // const { mutate: likePost } = useLikePost();
  // const { mutate: savePost, isLoading: isSavingPost } = useSavePost();
  // const { mutate: deleteSavePost, isLoading: isDeleteingSaved } =
  //   useDeleteSavedPost();

  // const { data: currentUser } = useGetCurrentUser();

  // const savedPostRecord = currentUser?.save.find(
  //   (record: Models.Document) => record.post.$id === post.$id
  // );

  // useEffect(() => {
  //   setIsSaved(!!savedPostRecord);
  // }, [currentUser]);

  // const handleLikePost = (
  //   e: React.MouseEvent<HTMLImageElement, MouseEvent>
  // ) => {
  //   e.stopPropagation();

  //   let likesArray = [...likes];

  //   if (likesArray.includes(userId)) {
  //     likesArray = likesArray.filter((Id) => Id !== userId);
  //   } else {
  //     likesArray.push(userId);
  //   }

  //   setLikes(likesArray);
  //   likePost({ postId: post.$id, likesArray });
  // };

  const handleLikePost = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsLikingPost(true);
    try {
      // Like the post
      if (likeRecord.length == 0) {
        await addDoc(likesCollectionRef, {
          postId: post.id,
          likedUserId: user.uid,
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
          postId: post.id,
          savedUserId: user.uid,
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
