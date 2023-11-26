import { Button, useToast } from "../ui";
import { useEffect, useState } from "react";
import { Loader } from ".";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { followsCollectionRef } from "@/firebase/references";
import { useAuth } from "@/context/AuthContextf";
import { useGetData } from "@/hooks/useGetData";

type FollowButtonProps = {
  otherUserId: string | undefined;
  onFollowingChange: (followingState: {
    isFollowing: boolean;
    isUnFollowing: boolean;
  }) => void;
};

const FollowButton = ({ otherUserId }: FollowButtonProps) => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);

  const followRecordQuery = query(
    followsCollectionRef,
    where("followee", "==", otherUserId),
    where("follower", "==", userData.uid)
  );
  const { data: followRecord } = useGetData(followRecordQuery);
  if (followRecord.length > 1) {
    console.log("check likes db");
  }

  // const { mutate: followUser, isLoading: isFollowingUser } = useFollowUser();
  // const { mutate: unFollowUser, isLoading: isUnFollowingUser } =
  //   useUnFollowUser();
  // const { user } = useUserContext();
  // const [isFollowed, setIsFollowed] = useState(false);
  // const { data: currentUser } = useGetCurrentUser();
  // let followedRecord = currentUser?.following.find(
  //   (record: Models.Document) => record.followee.$id === otherUserId
  // );

  // useEffect(() => {
  //   setIsFollowed(!!followedRecord);
  // }, [currentUser]);

  // // Pass the information of is following/unfollowing so the parent can disable some button
  // useEffect(() => {
  //   onFollowingChange({
  //     isFollowing: isFollowingUser,
  //     isUnFollowing: isUnFollowingUser,
  //   });
  // }, [isFollowingUser, isUnFollowingUser]);
  // const handleFollow = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.preventDefault();
  //   if (otherUserId !== undefined) {
  //     followedRecord = currentUser?.following.find(
  //       (record: Models.Document) => record.followee.$id === otherUserId
  //     );
  //     if (followedRecord) {
  //       console.log("unfollow");
  //       setIsFollowed(false);
  //       return unFollowUser(followedRecord.$id);
  //     }
  //     console.log("follow");
  //     followUser({ followerId: user.id, followeeId: otherUserId });
  //     setIsFollowed(true);
  //   } else {
  //     console.error("UserId Undefined.");
  //   }
  // };

  const handleFollow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsFollowing(true);
    try {
      // Follow the user
      if (followRecord?.length == 0) {
        await addDoc(followsCollectionRef, {
          followee: otherUserId,
          follower: userData.uid,
          createdAt: serverTimestamp(),
        });
      }
      // Unfollow the user
      else if (followRecord) {
        // In case there are multiple likes for the same user in db
        await Promise.all(followRecord.map((doc) => deleteDoc(doc.ref)));
      }
    } catch (error) {
      toast({ title: "Failed. Can't follow user now." });
      console.log(error);
    }
    setIsFollowing(false);
  };

  if (followRecord) {
    return (
      <Button
        onClick={(e) => handleFollow(e)}
        type="button"
        size="sm"
        disabled={isFollowing}
        className={`${
          followRecord.length == 0
            ? "shad-button_primary"
            : "shad-button_slate_400"
        } px-5`}>
        {followRecord.length == 0 ? "Follow" : "Following"}
      </Button>
    );
  } else {
    return <Loader />;
  }
};

export default FollowButton;
