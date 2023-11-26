import { useToast } from "@/components/ui/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useGetUsers } from "@/lib/react-query/queries";
import { useGetData } from "@/hooks/useGetData";
import { usersCollectionRef } from "@/firebase/references";

const AllUsers = () => {
  const { data: creators, loading } = useGetData(usersCollectionRef);
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
      </div>
    </div>
  );
};

export default AllUsers;
