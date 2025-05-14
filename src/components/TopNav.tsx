import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlignJustify,
  GalleryVerticalEnd,
  SquarePen,
  User,
} from "lucide-react";

interface TopNavProps {
  isSelected: string;
  handleSelect: (path: string) => void;
}

const menuItems = [
  { label: "Form", icon: "SquarePen", path: "/home/form" },
  { label: "Reports", icon: "GalleryVerticalEnd", path: "/home/report" },
  { label: "Clients", icon: "user", path: "/home/client" },
];

const TopNav: React.FC<TopNavProps> = ({ isSelected, handleSelect }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <div className="border-b border-b-gray-200 dark:border-b-gray-700 h-[8%] px-4 w-svw z-10 py-2 flex items-center justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
      {isDarkMode ? (
        <img src="/logo2.png" className="h-[80%]" />
      ) : (
        <img src="/logo.png" className="h-[80%]" />
      )}

      <Sheet>
        <SheetTrigger>
          <span className="w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out cursor-pointer">
            <AlignJustify />
          </span>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>KPS</SheetTitle>
            <SheetDescription>
              <ul className="w-full overflow-hidden mt-20">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => handleSelect(item.path)}
                      className={`flex gap-2 py-2 px-4 items-center transition ${
                        isSelected === item.path
                          ? "text-black border-r-2 dark:text-white border-black dark:border-white"
                          : "text-gray-500 border-r-2 border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      {item.icon === "SquarePen" && <SquarePen />}
                      {item.icon === "GalleryVerticalEnd" && (
                        <GalleryVerticalEnd />
                      )}
                      {item.icon === "user" && <User />}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={toggleDarkMode}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                >
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              <span className="absolute bottom-10 left-0 right-0 text-center text-gray-500">
                <Link
                  to="https://dannel.co.za"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Powered by Dannel Web Design
                </Link>
              </span>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TopNav;
