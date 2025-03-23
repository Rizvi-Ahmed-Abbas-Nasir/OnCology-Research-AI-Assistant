"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FaFlask,
  FaLightbulb,
  FaChalkboardTeacher,
  FaGlobe,
  FaBars,
  FaSignOutAlt,
  FaHistory,
} from "react-icons/fa";

interface Props {
  onToggle: (collapsed: boolean) => void;
  isAdmin?: boolean;
}

const AdminHeader: React.FC<Props> = ({ onToggle, isAdmin = false }) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedState = localStorage.getItem("menuCollapsed");
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("menuCollapsed", JSON.stringify(collapsed));
    onToggle(collapsed);
  }, [collapsed, onToggle]);

  const toggleMenu = () => {
    setCollapsed((prevState) => !prevState);
    onToggle(!collapsed);
  };

  const toggleHistory = () => {
    setHistoryExpanded((prev) => !prev);
  };

  const handleLogout = () => {
    router.push("/Admin");
  };

  const menuItems = [
    { href: "/", label: "Researcher Model", icon: <FaFlask /> },
    { href: "/ThinkingModel", label: "Thinking Model", icon: <FaLightbulb /> },
    { href: "/Canvas", label: "Researcher Canvas", icon: <FaChalkboardTeacher /> },
    { href: "http://localhost:3001/", label: "Global Researcher", icon: <FaGlobe /> },
  ];

  const historyItems = [
    "Chat 1", "Chat 2", "Chat 3", "Chat 4", "Chat 5"
  ];

  return (
    <div
      className={`bg-[#000000] text-white border-r border-[#363636] shadow-lg transition-all duration-500 ease-in-out ${
        collapsed ? "w-20" : "w-[20%]"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-center">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none flex items-center space-x-2"
          >
            <FaBars size={24} />
            {!collapsed && <span className="text-lg font-semibold">Menu</span>}
          </button>
        </div>

        <nav className="flex-grow pl-4 pr-4 flex flex-col justify-start w-full items-start">
          <ul className="space-y-4 mt-4 w-full">
            {menuItems.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex items-center p-3 rounded-lg transition-all duration-300
                    ${pathname === href ? "bg-blue-600 text-white" : "hover:text-white hover:bg-blue-600"}
                  `}
                >
                  <span className="text-xl">{icon}</span>
                  <span
                    className={`ml-4 transition-all duration-500 ease-in-out ${collapsed ? "hidden" : "block"}`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            ))}

            {/* History Section */}
            <li>
              <button
                onClick={toggleHistory}
                className="flex items-center p-3 w-full rounded-lg transition-all duration-300 text-white hover:bg-gray-700"
              >
                <span className="text-xl">
                  <FaHistory />
                </span>
                <span
                  className={`ml-4 transition-all duration-500 ease-in-out ${collapsed ? "hidden" : "block"}`}
                >
                  History
                </span>
              </button>
              {historyExpanded && !collapsed && (
                <ul className="ml-8 mt-2 space-y-2 transition-all duration-500 ease-in-out">
                  {historyItems.map((chat, index) => (
                    <li
                      key={index}
                      className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg cursor-pointer"
                    >
                      {chat}
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center p-3 w-full rounded-lg transition-all duration-300 text-black hover:text-white hover:bg-red-600"
              >
                <span className="text-xl text-white">
                  <FaSignOutAlt />
                </span>
                <span
                  className={`ml-4 transition-all duration-500 ease-in-out ${collapsed ? "hidden" : "block"}`}
                >
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminHeader;
