import { Button, useToast } from "../ui";
import { useState } from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { followsCollectionRef } from "@/firebase/references";
import { useAuth } from "@/context/AuthContext.tsx";
import { useGetRealtimeData } from "@/hooks/useGetRealtimeData.ts";
import { db } from "@/firebase/firebase";

type FollowButtonProps = {
  otherUserId: string | undefined;
};

const FollowButton = ({ otherUserId }: FollowButtonProps) => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const otherUserRef = doc(db, "users", otherUserId || "");
  const userRef = doc(db, "users", userData.uid);

  const followRecordQuery = query(
    followsCollectionRef,
    where("followeeRef", "==", otherUserRef),
    where("followerRef", "==", userRef)
  );
  const { data: followRecord, loading } = useGetRealtimeData(followRecordQuery);
  if (followRecord.length > 1) {
    console.log("check likes db");
  }

  const handleFollow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsFollowing(true);
    try {
      // Follow the user
      if (followRecord?.length == 0) {
        await addDoc(followsCollectionRef, {
          followeeRef: otherUserRef,
          followerRef: userRef,
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

  if (followRecord && !loading) {
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
  }
};

export default FollowButton;
