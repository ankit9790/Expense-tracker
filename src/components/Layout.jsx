import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ context }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar user={context?.user} />

      <div className="flex">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          user={context?.user}
        />

        <main
          className="flex-1 p-4 pt-6 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? "5rem" : "16rem" }}
        >
          {/* Pass everything from App down to page components */}
          <Outlet context={{ ...context, sidebarCollapsed }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
