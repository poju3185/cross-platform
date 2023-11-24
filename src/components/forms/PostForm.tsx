import * as z from "zod";
import { Models } from "appwrite";
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
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { imageStorageRef, postsCollectionRef } from "@/firebase/references";
import { addDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContextf";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
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
    try {
      const snapshot = await uploadBytes(imageStorageRef, value.file[0]);
      const url = await getDownloadURL(snapshot.ref);
      await addDoc(postsCollectionRef, {
        creatorId: user?.uid,
        caption: value.caption,
        location: value.location,
        imagesUrl: url,
        tags: value.tags,
      });
    } catch (error) {
      console.log(error);
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
                  mediaUrl={post?.imageUrl}
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
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
