import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import {PostStats } from "@/components/shared";

import { multiFormatDateString } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext.tsx";
import { getPostById, getUserById } from "@/firebase/api.ts";
import { useEffect, useState } from "react";
import {
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<
    DocumentSnapshot<DocumentData> | undefined
  >();
  const [creator, setCreator] = useState<DocumentData | undefined>();


  // get post data
  const getPost = async () => {
    const postData = await getPostById(id);
    const creatorData = await getUserById(postData?.get("creatorRef").id);
    setPost(postData);
    setCreator(creatorData);
  };
  
  useEffect(() => {
    getPost();
  }, []);

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {!post || !creator ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post.get("imagesUrl")}
            alt="post image"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post.get("creatorRef").id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    creator.profileImage ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold dark:text-light-1">
                    {creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post.get("createdAt"))}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post.get("location")}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post.id}`}
                  className={`${user.uid !== creator.uid && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                {/* <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button> */}
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post.get("caption")}</p>
              <ul className="flex gap-1 mt-2">
                {post
                  .get("tags")
                  .split(",")
                  .map((tag: string, index: string) => (
                    <li
                      key={`${tag.trim()}${index}`}
                      className="text-light-3 small-regular">
                      #{tag.trim()}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} />
            </div>
          </div>
        </div>
      )}

      {/* <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {!relatedPosts ? <Loader /> : <GridPostList posts={relatedPosts} />}
      </div> */}
    </div>
  );
};

export default PostDetails;
