import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import FollowButton from "@/components/shared/FollowButton";
import { useAuth } from "@/context/AuthContextf";
import { getPostsByUserId, getUserById } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import {
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  followsCollectionRef,
  postsCollectionRef,
} from "@/firebase/references";

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

  const [currentUser, setCurrentUser] = useState<DocumentData | undefined>();
  const [followingNumber, setFollowingNumber] = useState(0);
  const [followerNumber, setFollowerNumber] = useState(0);
  const [posts, setPosts] = useState<
    QueryDocumentSnapshot<DocumentData>[] | undefined
  >();

  const getUser = async () => {
    const data = await getUserById(id || "");
    setCurrentUser(data);
  };
  useEffect(() => {
    // Login user's profile
    if (id === user.uid) {
      setCurrentUser(userData);
    }
    // Other user's profile
    else {
      getUser();
    }
  }, []);

  // Get following stats
  const followingNumberQuery = query(
    followsCollectionRef,
    where("follower", "==", id)
  );
  const followerNumberQuery = query(
    followsCollectionRef,
    where("followee", "==", id)
  );
  const postsQuery = query(postsCollectionRef, where("creatorId", "==", id));
  useEffect(() => {
    const unsubscribe = onSnapshot(followingNumberQuery, (querySnapshot) => {
      setFollowingNumber(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(followerNumberQuery, (querySnapshot) => {
      setFollowerNumber(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      setPosts(querySnapshot.docs);
    });
    return unsubscribe;
  }, []);

  const handleFollowingChange = () => {};

  if (!currentUser)
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
              currentUser.profileImage ||
              "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-2">
              <StatBlock value={posts?.length || 0} label="Posts" />
              <StatBlock value={followerNumber} label="Followers" />
              <StatBlock value={followingNumber} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.uid !== currentUser.uid && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.uid}`}
                className={`h-12 bg-slate-200 dark:bg-dark-4 px-5 dark:text-light-1 flex-center gap-2 rounded-lg ${
                  user.uid !== currentUser.uid && "hidden"
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

      {currentUser.uid === user.uid && (
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
