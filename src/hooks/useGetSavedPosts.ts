import { useAuth } from "@/context/AuthContextf";
import { postsCollectionRef, savesCollectionRef } from "@/firebase/references";
import {
  DocumentData,
  QueryDocumentSnapshot,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useGetSavedPosts = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >();

  const getSavedPosts = async () => {
    const postIdQuery = query(
      savesCollectionRef,
      where("savedUserId", "==", userData.uid),
      orderBy("createdAt"),
      limit(20)
    );
    const data = await getDocs(postIdQuery);
    const postIds = data.docs.map((saveRecord) => saveRecord.get("postId"));
    const postQuery = query(
      postsCollectionRef,
      where(documentId(), "in", postIds)
    );
    const posts = await getDocs(postQuery);
    setSavedPosts(posts.docs);
    setLoading(false);
  };

  useEffect(() => {
    getSavedPosts();
  }, []);

  return { loading, savedPosts };
};
