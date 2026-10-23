import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/sidebar/sidebar.jsx";
import Navbar from "../components/navbar/navbar.jsx";

function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className={`app ${isCollapsed ? "app-sidebar-collapsed" : ""}`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((value) => !value)} />

      <div className="main-content">
        <Navbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
