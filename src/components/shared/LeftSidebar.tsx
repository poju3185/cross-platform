import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContextf";

const LeftSidebar = () => {
  const { signout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userData} = useAuth()


  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    // signOut();
    // setIsAuthenticated(false);
    // setUser(INITIAL_USER);
    signout();
    navigate("/sign-in");
  };

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <h1 className="font-bold text-2xl">Cross Platform</h1>
        </Link>

        { !userData.uid ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/profile/${userData.uid}`} className="flex gap-3 items-center">
            <img
              src={userData.profileImage || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-14 w-14 rounded-full"
            />
            <div className="flex flex-col">
              <p className="body-bold">{userData.name}</p>
              <p className="small-regular text-light-3">@{userData.username}</p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${
                  isActive && "bg-primary-500"
                }`}>
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4">
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <div className="p-4">
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          className="shad-button_ghost"
          onClick={(e) => handleSignOut(e)}>
          <img src="/assets/icons/logout.svg" alt="logout" />
          <p className="small-medium lg:base-medium">Logout</p>
        </Button>
      </div>
    </nav>
  );
};

export default LeftSidebar;
