import type { TabKey } from "@/types/tapKey";
import type { Dispatch, SetStateAction } from "react";

import { NAVIGATION } from "@/constants/navigation";

interface NavigationProps {
  activeTab: TabKey;
  setActiveTab: Dispatch<SetStateAction<TabKey>>;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  return (
    <nav className="w-full flex">
      {NAVIGATION.map(({ key, label }, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === NAVIGATION.length - 1;

        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-4 py-2 transition-colors cursor-pointer text-xs md:text-base
            ${
              activeTab === key ?
                "bg-gray-800 border-gray-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300 border-transparent"
            }
            ${isFirst && "rounded-l-md"}
            ${isLast && "rounded-r-md"}
          `}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
