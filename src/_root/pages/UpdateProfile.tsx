import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";
import { ProfileUploader, Loader } from "@/components/shared";

import { ProfileValidation } from "@/lib/validation";
import { useAuth } from "@/context/AuthContext.tsx";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useState } from "react";
import { v4 } from "uuid";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { userData, fetchUserData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: userData.name,
      username: userData.username,
      email: userData.email,
      bio: userData.bio || "",
    },
  });

  // Queries
  // const { data: currentUser } = useGetUserById(id || "");
  // const { mutateAsync: updateUser, isLoading: isLoadingUpdate } =
  // useUpdateUser();

  // if (!currentUser)
  //   return (
  //     <div className="flex-center w-full h-full">
  //       <Loader />
  //     </div>
  //   );

  // Handler
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    setIsUpdating(true);
    try {
      const isImageUpdated = value.file && value.file.length > 0;
      let url;
      // User try to update image
      if (isImageUpdated) {
        // Delete previous image
        if (userData.profileImage) {
          try {
            const imageToDeleteRef = ref(storage, userData.profileImage);
            await deleteObject(imageToDeleteRef);
          } catch (error) {
            if (
              typeof error === "object" &&
              error !== null &&
              "code" in error
            ) {
              if (
                error.code === "storage/object-not-found" ||
                error.code === "storage/invalid-url"
              ) {
                // Handle the error here
                console.log("Object not found in storage");
              }
            } else {
              throw error;
            }
          }
        }
        const snapshot = await uploadBytes(
          ref(storage, `profile_images/${v4()}`),
          value.file[0]
        );
        url = await getDownloadURL(snapshot.ref);
      }
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        name: value.name,
        bio: value.bio,
        ...(isImageUpdated ? { profileImage: url } : {}),
      });
      fetchUserData()
      setIsUpdating(false);
      navigate(`/profile/${id}`);
      return;
    } catch (error) {
      console.log(error);
      toast({
        title: `Update user failed. Please try again.`,
      });
      setIsUpdating(false);
    }
  };

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
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={userData.profileImage}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
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

            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isUpdating}>
                {isUpdating && <Loader />}
                Update Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
