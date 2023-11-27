import { Models } from "appwrite";

// import { useToast } from "@/components/ui/use-toast";
import { Loader, PostCard, UserCard } from "@/components/shared";
// import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";
import { useAuth } from "@/context/AuthContextf";
import { postsCollectionRef, usersCollectionRef } from "@/firebase/references";
import { useGetRealtimeData } from "@/hooks/useGetRealtimeData.ts";
import { useGetData } from "@/hooks/useGetData";
import {
  DocumentData,
  QueryDocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { Button, useToast } from "@/components/ui";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const Home = () => {
  const {
    data: posts,
    ref,
    isEndOfData: isEndOfPosts,
  } = useInfiniteScroll(
    query(postsCollectionRef, orderBy("createdAt", "desc"), limit(3))
  );

  const { data: creators } = useGetRealtimeData(usersCollectionRef);

  // const {
  //   data: posts,
  //   isLoading: isPostLoading,
  //   isError: isErrorPosts,
  // } = useGetRecentPosts();
  // const {
  //   data: creators,
  //   isLoading: isUserLoading,
  //   isError: isErrorCreators,
  // } = useGetUsers(10);

  // if (isErrorPosts || isErrorCreators) {
  //   return (
  //     <div className="flex flex-1">
  //       <div className="home-container">
  //         <p className="body-medium text-light-1">Something bad happened</p>
  //       </div>
  //       <div className="home-creators">
  //         <p className="body-medium text-light-1">Something bad happened</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {!posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts.map((post) => (
                <li key={post.id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
          {!isEndOfPosts && posts.length != 0 ? (
            <div ref={ref} className="mt-10">
              <Loader />
            </div>
          ) : (
            <h2></h2>
          )}
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold dark:text-light-1">Top Creators</h3>
        {!creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators.map((creator) => (
              <li key={creator.id}>
                <UserCard otherUser={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
