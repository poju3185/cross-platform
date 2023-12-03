import { Button, useToast } from "../ui";
import { useState } from "react";
import {
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { followsCollectionRef } from "@/firebase/references";
import { useAuth } from "@/context/AuthContext.tsx";
import { db } from "@/firebase/firebase";
import { useGetRealtimeDataSingle } from "@/hooks/useGetRealtimeDataSingle";

type FollowButtonProps = {
  otherUserId: string | undefined;
};

const FollowButton = ({ otherUserId }: FollowButtonProps) => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const otherUserRef = doc(db, "users", otherUserId || "");
  const userRef = doc(db, "users", userData.uid);

  const { data: followRecord, loading } = useGetRealtimeDataSingle(
    doc(followsCollectionRef, userData.uid + "_" + otherUserId)
  );

  const handleFollow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsFollowing(true);
    try {
      // Follow the user
      if (!followRecord?.exists()) {
        await setDoc(
          doc(followsCollectionRef, userData.uid + "_" + otherUserId),
          {
            followeeRef: otherUserRef,
            followerRef: userRef,
            createdAt: serverTimestamp(),
          }
        );
        await updateDoc(otherUserRef, {
          follower: increment(1),
        });
        await updateDoc(userRef, {
          following: increment(1),
        });
      }
      // Unfollow the user
      else if (followRecord) {
        // In case there are multiple likes for the same user in db
        await deleteDoc(followRecord.ref);
        await updateDoc(otherUserRef, {
          follower: increment(-1),
        });
        await updateDoc(userRef, {
          following: increment(-1),
        });
      }
    } catch (error) {
      toast({ title: "Failed. Can't follow user now." });
      console.log(error);
    }
    setIsFollowing(false);
  };

  if (followRecord && !loading) {
    return (
      <Button
        onClick={(e) => handleFollow(e)}
        type="button"
        size="sm"
        disabled={isFollowing}
        className={`${
          !followRecord.exists()
            ? "shad-button_primary"
            : "shad-button_slate_400"
        } px-5`}>
        {!followRecord.exists() ? "Follow" : "Following"}
      </Button>
    );
  }
};

export default FollowButton;
