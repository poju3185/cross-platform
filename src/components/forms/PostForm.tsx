import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
} from "@/components/ui";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { FileUploader, Loader } from "@/components/shared";
import { useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  likesCollectionRef,
  postsCollectionRef,
  savesCollectionRef,
} from "@/firebase/references";
import {
  DocumentData,
  DocumentSnapshot,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext.tsx";
import { db, storage } from "@/firebase/firebase";
import { v4 } from "uuid";
import shortUUID from "short-uuid"

type PostFormProps = {
  post?: DocumentSnapshot<DocumentData>;
  action: Action;
};

export enum Action {
  Create = "Create",
  Update = "Update",
}
const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const userRef = doc(db, "users", user.uid);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post.get("caption") : "",
      file: [],
      location: post ? post.get("location") : "",
      tags: post ? post.get("tags").join(",") : "",
    },
  });

  // Query
  // const { mutateAsync: createPost, isLoading: isLoadingCreate } =
  //   useCreatePost();
  // const { mutateAsync: updatePost, isLoading: isLoadingUpdate } =
  //   useUpdatePost();

  // Handler
  // const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
  //   // ACTION = UPDATE
  //   if (post && action === "Update") {
  //     const updatedPost = await updatePost({
  //       ...value,
  //       postId: post.$id,
  //       imageId: post.imageId,
  //       imageUrl: post.imageUrl,
  //       search_term:
  //         value.caption +
  //         " " +
  //         value.location +
  //         " " +
  //         value.tags +
  //         " " +
  //         user.name +
  //         " " +
  //         user.username,
  //     });

  //     if (!updatedPost) {
  //       toast({
  //         title: `${action} post failed. Please try again.`,
  //       });
  //       return;
  //     }
  //     return navigate(`/posts/${post.$id}`);
  //   }

  //   // ACTION = CREATE
  //   const newPost = await createPost({
  //     ...value,
  //     userId: user.id,
  //     search_term:
  //       value.caption +
  //       " " +
  //       value.location +
  //       " " +
  //       value.tags +
  //       " " +
  //       user.name +
  //       " " +
  //       user.username,
  //   });

  //   if (!newPost) {
  //     toast({
  //       title: `${action} post failed. Please try again.`,
  //     });
  //     return;
  //   }
  //   navigate("/");
  // };

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    // ACTION = UPDATE
    if (post && action === "Update") {
      try {
        setIsLoadingUpdate(true);
        const isImageUpdated = value.file && value.file.length > 0;
        let url;
        // User try to update image
        if (isImageUpdated) {
          // Delete previous image
          const imageToDeleteRef = ref(storage, post.get("imagesUrl"));
          await deleteObject(imageToDeleteRef);
          const snapshot = await uploadBytes(
            ref(storage, `images/${post?.id}/${v4()}`),
            value.file[0]
          );
          url = await getDownloadURL(snapshot.ref);
        }
        const postRef = doc(db, "posts", post.id);
        await updateDoc(postRef, {
          caption: value.caption,
          location: value.location,
          ...(isImageUpdated ? { imagesUrl: url } : {}),
          tags: value.tags.split(",").map((tag) => tag.trim()),
        });
        setIsLoadingUpdate(false);
        navigate("/");
      } catch (error) {
        console.log(error);
        toast({
          title: `${action} post failed. Please try again.`,
        });
      }
      return;
    }

    // ACTION = CREATE
    setIsLoadingCreate(true);
    try {
      const postId = shortUUID.generate();
      const snapshot = await uploadBytes(
        ref(storage, `images/${postId}/${v4()}`),
        value.file[0]
      );
      const url = await getDownloadURL(snapshot.ref);
      await setDoc(doc(postsCollectionRef, postId), {
        creatorRef: userRef,
        caption: value.caption,
        location: value.location,
        imagesUrl: url,
        tags: value.tags.split(",").map((tag) => tag.trim()),
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setIsLoadingCreate(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast({
        title: `${action} post failed. Please try again.`,
      });
      setIsLoadingCreate(false);
    }
  };

  const handleDelete = async () => {
    setIsLoadingDelete(true);
    try {
      if (post) {
        const imageToDeleteRef = ref(storage, post.get("imagesUrl"));
        await deleteObject(imageToDeleteRef);
        // Delete likes
        const likeRecords = await getDocs(
          query(likesCollectionRef, where("postRef", "==", post.ref))
        );
        likeRecords.docs.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        // Delete saves
        const saveRecords = await getDocs(
          query(savesCollectionRef, where("postRef", "==", post.ref))
        );
        saveRecords.docs.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        const postRef = doc(db, "posts", post.id);
        await deleteDoc(postRef);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Delete post failed. Please try again.",
      });
      setIsLoadingDelete(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full  max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Images</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.get("imagesUrl")}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Literature, Manga, Illustration"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_slate_400 dark:shad-button_dark_4"
            disabled={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          {action !== Action.Create && (
            <Button
              type="button"
              className="shad-button_red whitespace-nowrap"
              onClick={handleDelete}
              disabled={isLoadingCreate || isLoadingUpdate || isLoadingDelete}>
              {(isLoadingCreate || isLoadingUpdate || isLoadingDelete) && (
                <Loader />
              )}
              Delete Post
            </Button>
          )}
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate || isLoadingDelete}>
            {(isLoadingCreate || isLoadingUpdate || isLoadingDelete) && (
              <Loader />
            )}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
