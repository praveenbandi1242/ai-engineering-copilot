import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>

          <div>
            <strong>Engineering</strong>
            <span>Knowledge Copilot</span>
          </div>
        </div>

        <nav className="navigation">
          <NavLink to="/copilot">
            <span>◈</span>
            Copilot
          </NavLink>

          <NavLink to="/documents">
            <span>▣</span>
            Documents
          </NavLink>

          <NavLink to="/evaluation">
            <span>◇</span>
            Evaluation
          </NavLink>

          <NavLink to="/telemetry">
            <span>⌁</span>
            Telemetry
          </NavLink>

          <NavLink to="/settings">
            <span>⚙</span>
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span className="online-dot" />
          System operational
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <span>AI Engineering Platform</span>

          <div className="environment-badge">
            <span className="online-dot" />
            Local
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;