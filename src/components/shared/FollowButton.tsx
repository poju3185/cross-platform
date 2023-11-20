import {
  useFollowUser,
  useGetCurrentUser,
  useUnFollowUser,
} from "@/lib/react-query/queries";
import { Button } from "../ui";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Models } from "appwrite";

type FollowButtonProps = {
  otherUserId: string | undefined;
  onFollowingChange: (followingState: {
    isFollowing: boolean;
    isUnFollowing: boolean;
  }) => void;
};

const FollowButton = ({
  otherUserId,
  onFollowingChange,
}: FollowButtonProps) => {
  const { mutate: followUser, isLoading: isFollowingUser } = useFollowUser();
  const { mutate: unFollowUser, isLoading: isUnFollowingUser } =
    useUnFollowUser();
  const { user } = useUserContext();
  const [isFollowed, setIsFollowed] = useState(false);
  const { data: currentUser } = useGetCurrentUser();
  let followedRecord = currentUser?.following.find(
    (record: Models.Document) => record.followee.$id === otherUserId
  );

  useEffect(() => {
    setIsFollowed(!!followedRecord);
  }, [currentUser]);

  // Pass the information of is following/unfollowing so the parent can disable some button
  useEffect(() => {
    onFollowingChange({
      isFollowing: isFollowingUser,
      isUnFollowing: isUnFollowingUser,
    });
  }, [isFollowingUser, isUnFollowingUser]);

  const handleFollow = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (otherUserId !== undefined) {
      followedRecord = currentUser?.following.find(
        (record: Models.Document) => record.followee.$id === otherUserId
      );
      if (followedRecord) {
        console.log("unfollow");
        setIsFollowed(false);
        return unFollowUser(followedRecord.$id);
      }
      console.log("follow");

      followUser({ followerId: user.id, followeeId: otherUserId });
      setIsFollowed(true);
    } else {
      console.error("UserId Undefined.");
    }
  };
  return (
    <Button
      onClick={(e) => handleFollow(e)}
      type="button"
      size="sm"
      className={`${
        isFollowed ? "shad-button_slate_400" : "shad-button_primary"
      } px-5`}>
      {isFollowed ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
