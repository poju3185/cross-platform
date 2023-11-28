import { useParams } from "react-router-dom";

import { Loader } from "@/components/shared";
import PostForm, { Action } from "@/components/forms/PostForm";
import { getPostById } from "@/firebase/api.ts";
import { useEffect, useState } from "react";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";

const EditPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<
    DocumentSnapshot<DocumentData> | undefined
  >();

  // get post data
  const getPost = async () => {
    const data = await getPostById(id);
    setPost(data);
  };
  useEffect(() => {
    getPost();
  }, []);

  if (!post)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        <PostForm action={Action.Update} post={post} />
      </div>
    </div>
  );
};

export default EditPost;
