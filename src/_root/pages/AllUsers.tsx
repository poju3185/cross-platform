import { Loader, UserCard } from "@/components/shared";

import { usersCollectionRef } from "@/firebase/references";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { limit, query } from "firebase/firestore";

const AllUsers = () => {
  const {
    data: creators,
    ref,
    isEndOfData: isEndOfCreators,
    loading,
  } = useInfiniteScroll(query(usersCollectionRef, limit(1)));

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {loading && !creators ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {creators.map((creator) => (
              <li key={creator.id} className="flex-1 min-w-[200px] w-full  ">
                <UserCard otherUser={creator} />
              </li>
            ))}
          </ul>
        )}
        {!isEndOfCreators && creators.length != 0 ? (
          <div ref={ref} className="mt-10">
            <Loader />
          </div>
        ) : (
          <h2></h2>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
