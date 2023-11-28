import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { GridPostList, Loader } from "@/components/shared";
import { useAuth } from "@/context/AuthContext.tsx";
import { getUserById } from "@/firebase/api.ts";
import { useEffect, useState } from "react";
import {
  DocumentData,
  QueryDocumentSnapshot,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  followsCollectionRef,
  postsCollectionRef,
} from "@/firebase/references";
import { db } from "@/firebase/firebase";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium dark:text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const { pathname } = useLocation();

  const [creator, setCreator] = useState<DocumentData | undefined>();
  const creatorRef = doc(db, "users", id || "");
  const [followingNumber, setFollowingNumber] = useState(0);
  const [followerNumber, setFollowerNumber] = useState(0);
  const [posts, setPosts] = useState<
    QueryDocumentSnapshot<DocumentData>[] | undefined
  >();

  const getCreator = async () => {
    const data = await getUserById(id || "");
    setCreator(data);
  };
  useEffect(() => {
    // Login user's profile
    if (id === user.uid) {
      setCreator(userData);
    }
    // Other user's profile
    else {
      getCreator();
    }
  }, [id]);

  // Get following stats
  const followingNumberQuery = query(
    followsCollectionRef,
    where("followerRef", "==", creatorRef)
  );
  const followerNumberQuery = query(
    followsCollectionRef,
    where("followeeRef", "==", creatorRef)
  );
  const postsQuery = query(
    postsCollectionRef,
    where("creatorRef", "==", creatorRef)
  );
  useEffect(() => {
    const unsubscribe = onSnapshot(followingNumberQuery, (querySnapshot) => {
      setFollowingNumber(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, [id]);
  useEffect(() => {
    const unsubscribe = onSnapshot(followerNumberQuery, (querySnapshot) => {
      setFollowerNumber(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, [id]);
  useEffect(() => {
    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      setPosts(querySnapshot.docs);
    });
    return unsubscribe;
  }, [id]);

  if (!creator)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              creator.profileImage || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {creator.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{creator.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-2">
              <StatBlock value={posts?.length || 0} label="Posts" />
              <StatBlock value={followerNumber} label="Followers" />
              <StatBlock value={followingNumber} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {creator.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.uid !== creator.uid && "hidden"}`}>
              <Link
                to={`/update-profile/${creator.uid}`}
                className={`h-12 bg-slate-200 dark:bg-dark-4 px-5 dark:text-light-1 flex-center gap-2 rounded-lg ${
                  user.uid !== creator.uid && "hidden"
                }`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.uid === id && "hidden"}`}>
              {/* <FollowButton
                otherUserId={id}
                onFollowingChange={handleFollowingChange}
              /> */}
            </div>
          </div>
        </div>
      </div>

      {creator.uid === user.uid && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-primary-500"
            }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
              className={` ${pathname === `/profile/${id}` && "invert-white"}`}
            />
            Posts
          </Link>
          {/* <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-primary-500"
            }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
              className={` ${
                pathname === `/profile/${id}/liked-posts` && "invert-white"
              }`}
            />
            Liked Posts
          </Link> */}
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={posts || []} showUser={false} />}
        />
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
