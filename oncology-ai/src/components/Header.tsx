"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FaFlask,
  FaLightbulb,
  FaChalkboardTeacher,
  FaGlobe,
  FaUpload,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";

interface Props {
  onToggle: (collapsed: boolean) => void;
  isAdmin?: boolean;
}

const AdminHeader: React.FC<Props> = ({ onToggle, isAdmin = false }) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);
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

  const handleLogout = () => {
    router.push("/Admin");
  };

  const menuItems = [
    { href: "/", label: "Researcher Model", icon: <FaFlask /> },
    { href: "/ThinkingModel", label: "Thinking Model", icon: <FaLightbulb /> },
    { href: "/Canvas", label: "Researcher Canvas", icon: <FaChalkboardTeacher /> },
    { href: "/GlobalChat", label: "Global Researcher", icon: <FaGlobe /> },
    { href: "/UploadResearch", label: "Upload Your Research", icon: <FaUpload /> },
  ];

  return (
    <div
      className={`bg-[#000000] text-white border-r border-[#363636] shadow-lg transition-all duration-500 ease-in-out ${
        collapsed ? "w-20" : "w-[70%]"
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
                    ${
                      pathname === href
                        ? "bg-blue-600 text-white" 
                        : "hover:text-white hover:bg-blue-600"
                    }
                  `}
                >
                  <span className="text-xl">{icon}</span>
                  <span
                    className={`ml-4 transition-all duration-500 ease-in-out ${
                      collapsed ? "hidden" : "block"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            ))}

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center p-3 w-full rounded-lg transition-all duration-300 text-black hover:text-white hover:bg-red-600"
              >
                <span className="text-xl">
                  <FaSignOutAlt />
                </span>
                <span
                  className={`ml-4 transition-all duration-500 ease-in-out ${
                    collapsed ? "hidden" : "block"
                  }`}
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
