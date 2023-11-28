import { getUserById } from "@/firebase/api.ts";
import { DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react";

type GridPostUserInfoProps = {
  creatorId: string;
  showUser: boolean;
};
const GridPostUserInfo = ({
  creatorId,
  showUser,
}: GridPostUserInfoProps) => {
  // get creator data
  const [creator, setCreator] = useState<DocumentData | undefined>();
  const getCreator = async () => {
    const data = await getUserById(creatorId);
    setCreator(data);
  };

  useEffect(() => {
    getCreator();
  }, []);

  if (creator) {
    return (
      <>
        {showUser && (
          <div className="flex items-center justify-start gap-2 flex-1">
            <img
              src={
                creator.profileImage || "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-8 h-8 rounded-full"
            />
            <p className="text-slate-300 line-clamp-1">{creator.name}</p>
          </div>
        )}
      </>
    );
  }
};

export default GridPostUserInfo;
