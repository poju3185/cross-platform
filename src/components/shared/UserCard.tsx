import { Models } from "appwrite";
import { Link } from "react-router-dom";

import FollowButton from "./FollowButton";
import { useState } from "react";

type UserCardProps = {
  otherUser: Models.Document;
};

const UserCard = ({ otherUser }: UserCardProps) => {
  const [isFollowingOrUnFollowing, setIsFollowingOrUnFollowing] =
    useState(false);

  // If is following/unfollowing, disable th Link
  const handleFollowingChange = (followingState: {
    isFollowing: boolean;
    isUnFollowing: boolean;
  }) => {
    setIsFollowingOrUnFollowing(
      followingState.isFollowing || followingState.isUnFollowing
    );
  };

  return (
    <Link
      to={`/profile/${otherUser.$id}`}
      className={`${
        isFollowingOrUnFollowing && "pointer-events-none"
      } user-card`}>
      <img
        src={otherUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium dark:text-light-1 text-center line-clamp-1">
          {otherUser.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{otherUser.username}
        </p>
      </div>

      <FollowButton
        otherUserId={otherUser.$id}
        onFollowingChange={handleFollowingChange}
      />
    </Link>
  );
};

export default UserCard;
