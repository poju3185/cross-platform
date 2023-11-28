import { Link } from "react-router-dom";

import FollowButton from "./FollowButton";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

type UserCardProps = {
  otherUser: QueryDocumentSnapshot<DocumentData>;
};

const UserCard = ({ otherUser }: UserCardProps) => {
  return (
    <Link to={`/profile/${otherUser.get("uid")}`} className={"user-card"}>
      <img
        src={
          otherUser.get("profileImage") ||
          "/assets/icons/profile-placeholder.svg"
        }
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium dark:text-light-1 text-center line-clamp-1">
          {otherUser.get("name")}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{otherUser.get("username")}
        </p>
      </div>

      <FollowButton otherUserId={otherUser.get("uid")} />
    </Link>
  );
};

export default UserCard;
