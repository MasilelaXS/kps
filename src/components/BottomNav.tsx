import { SquarePen, GalleryVerticalEnd, User } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavProps {
  isSelected: string;
  handleSelect: (path: string) => void;
}

const menuItems = [
  { label: "Form", icon: "SquarePen", path: "/home/form" },
  { label: "Reports", icon: "GalleryVerticalEnd", path: "/home/report" },
  { label: "Clients", icon: "user", path: "/home/client" },
];
const BottomNav: React.FC<BottomNavProps> = ({ isSelected, handleSelect }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/home" || location.pathname === "/home/form") {
      handleSelect("/home/form");
    } else {
      handleSelect(location.pathname);
    }
  }, [location.pathname, handleSelect]);
  
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-t border-t-gray-200 h-[10%] w-svw z-10 py-2 flex items-center">
      <ul className="w-full flex justify-around items-stretch overflow-hidden">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              onClick={() => handleSelect(item.path)}
              to={item.path}
              className={`flex flex-col items-center gap-2 ${
                isSelected === item.path
                  ? "text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <span className="text-2xl ">
                {item.icon === "SquarePen" && <SquarePen />}
                {item.icon === "GalleryVerticalEnd" && <GalleryVerticalEnd />}
                {item.icon === "user" && <User />}
              </span>
              <span
                className={`text-[8pt] font-medium ${
                  isSelected === item.path
                    ? "border-b-2 border-black dark:border-white"
                    : "border-none"
                }`}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BottomNav;
