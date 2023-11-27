import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContextf";

const Topbar = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <h1 className="font-bold">Cross Platform</h1>
        </Link>

        <div className="flex gap-4">
          <div className="flex-center">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}>
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          <Link to={`/profile/${userData.uid}`} className="flex-center gap-3">
            <img
              src={
                userData.profileImage || "/assets/icons/profile-placeholder.svg"
              }
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
