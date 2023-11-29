import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext.tsx";

const Topbar = () => {
  const navigate = useNavigate();
  const { userData, signout } = useAuth();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signout();
    navigate("/sign-in");
  };

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
            onClick={(e) => handleSignOut(e)}>
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
