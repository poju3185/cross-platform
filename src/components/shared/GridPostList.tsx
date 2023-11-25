import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContextf";
import { useEffect, useState } from "react";
import { getUserById } from "@/lib/appwrite/api";
import GridPostUserInfo from "./GridPostUserInfo";

type GridPostListProps = {
  posts: QueryDocumentSnapshot<DocumentData>[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li key={post.id} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.id}`} className="grid-post_link">
            <img
              src={post.get("imagesUrl")}
              alt="post"
              className="h-full w-full object-cover"
            />
          </Link>
          <div className="grid-post_user">
            <GridPostUserInfo
              creatorId={post.get("creatorId")}
              showUser={showUser}
            />
            {showStats && <PostStats post={post} />}
          </div>
        </li>
      ))}
    </ul>
  );
};





export default GridPostList;
