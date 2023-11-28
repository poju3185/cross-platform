import { Link } from "react-router-dom";

import {  PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContextf";
import { useEffect, useState } from "react";
import { getUserById } from "@/lib/appwrite/api";

type PostCardProps = {
  post: QueryDocumentSnapshot<DocumentData>;
};

const PostCard = ({ post }: PostCardProps) => {
  const [creator, setCreator] = useState<DocumentData | undefined>();
  const { user } = useAuth();

  const postId = post.id;
  const caption = post.get("caption");
  const creatorId = post.get("creatorRef").id;
  const imagesUrl = post.get("imagesUrl");
  const location = post.get("location");
  const tags = post.get("tags");
  const createdAt = post.get("createdAt");

  // get creator data
  const getCreator = async () => {
    const data = await getUserById(creatorId);
    setCreator(data);
  };
  useEffect(() => {
    getCreator();
  }, []);

  if (creator) {
    return (
      <div className="post-card">
        <div className="flex-between">
          <Link to={`/profile/${creatorId}`}>
            <div className="flex items-center gap-3">
              <img
                src={
                  creator?.profileImage ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt="creator"
                className="w-12 lg:h-12 rounded-full"
              />

              <div className="flex flex-col">
                <p className="base-medium lg:body-bold dark:text-light-1">
                  {creator?.name}
                </p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular ">
                    {multiFormatDateString(createdAt)}
                  </p>
                  •
                  <p className="subtle-semibold lg:small-regular">{location}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to={`/update-post/${postId}`}
            className={`${user.uid !== creatorId && "hidden"}`}>
            <img
              src={"/assets/icons/edit.svg"}
              alt="edit"
              width={20}
              height={20}
            />
          </Link>
        </div>

        <Link to={`/posts/${postId}`}>
          <div className="small-medium lg:base-medium py-5">
            <p>{caption}</p>
            <ul className="flex gap-1 mt-2">
              {tags.split(",").map((tag: string, index: number) => (
                <li
                  key={`${tag.trim()}${index}`}
                  className="text-light-3 small-regular">
                  #{tag.trim()}
                </li>
              ))}
            </ul>
          </div>

          <img
            src={imagesUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="post-card_img"
          />
        </Link>

        <PostStats post={post} />
      </div>
    );
  }
};

export default PostCard;
