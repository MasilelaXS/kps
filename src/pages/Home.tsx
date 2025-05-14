import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const Home = () => {
  const [isSelected, setIsSelected] = useState("/home/form");

  const handleSelect = (path: string) => {
    setIsSelected(path);
  };
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-lvw h-dvh overflow-hidden">
      <TopNav isSelected={isSelected} handleSelect={handleSelect} />
      <div className="w-full h-[82%] overflow-hidden ">
        <Outlet />
        <Toaster />
      </div>
      <BottomNav isSelected={isSelected} handleSelect={handleSelect} />
    </div>
  );
};

export default Home;
