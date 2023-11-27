import { GridPostList } from "@/components/shared";
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
  startAfter,
  where,
} from "firebase/firestore";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const Saved = () => {
  const { userData } = useAuth();
  const { ref, inView } = useInView();
  const [lastPostId, setLastPostId] =
    useState<QueryDocumentSnapshot<DocumentData, DocumentData>>();
  const [isEndOfSavedPosts, setIsEndOfSavedPosts] = useState(false);
  const [savedPosts, setSavedPosts] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);

  const postIdQuery = query(
    savesCollectionRef,
    where("savedUserId", "==", userData.uid),
    orderBy("createdAt", "desc"),
    limit(6)
  );
  const fetchIds = async () => {
    try {
      const q = lastPostId
        ? query(postIdQuery, startAfter(lastPostId))
        : postIdQuery;
      const res = await getDocs(q);
      if (res.empty) {
        setIsEndOfSavedPosts(true);
      } else {
        const postIds = res.docs.map((saveRecord) => saveRecord.get("postId"));

        // Fectch Posts
        const posts = await getDocs(
          query(postsCollectionRef, where(documentId(), "in", postIds))
        );
        const sortedPosts = posts.docs.sort(
          (a, b) => b.get("createdAt") - a.get("createdAt")
        );
        setSavedPosts((prevPosts) => [...prevPosts, ...sortedPosts]);

        setLastPostId(res.docs[res.docs.length - 1]);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchIds();
  }, [inView]);

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!savedPosts ? (
        <div></div>
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savedPosts.length === 0 ? (
            <p className="text-light-4">No available posts</p>
          ) : (
            <GridPostList
              posts={savedPosts}
              showStats={false}
              showUser={false}
            />
          )}
        </ul>
      )}
      {!isEndOfSavedPosts && savedPosts.length != 0 ? (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      ) : (
        <h2></h2>
      )}
    </div>
  );
};

export default Saved;
