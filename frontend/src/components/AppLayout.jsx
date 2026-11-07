import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, CalendarDays, ChartNoAxesCombined, Settings, LogOut, Sun, Moon, Menu, X, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
const links = [
  ["/dashboard","Overview",LayoutDashboard],["/tasks","My Tasks",CheckSquare],
  ["/calendar","Calendar",CalendarDays],["/analytics","Analytics",ChartNoAxesCombined],["/settings","Settings",Settings]
];
export default function AppLayout() {
  const { user, logout } = useAuth(); const { darkMode, toggleTheme } = useTheme();
  const [open,setOpen] = useState(false); const navigate = useNavigate();
  const leave = () => { logout(); navigate("/"); };
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "show" : ""}`}>
      <div className="brand"><span className="brand-icon"><Zap size={20}/></span><span>TASKORA</span><button className="mobile-close" onClick={()=>setOpen(false)}><X/></button></div>
      <p className="side-label">WORKSPACE</p>
      <nav>{links.map(([to,label,Icon])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?"nav-link active":"nav-link"}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="mini-profile"><div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div><div><b>{user?.name}</b><small>Personal workspace</small></div></div><button className="nav-link logout" onClick={leave}><LogOut size={18}/>Sign out</button></div>
    </aside>
    {open && <div className="scrim" onClick={()=>setOpen(false)} />}
    <main className="main-area"><header className="topbar"><button className="menu-button" onClick={()=>setOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>Productivity</b></div><div className="top-actions"><button className="icon-button" onClick={toggleTheme} title="Toggle theme">{darkMode?<Sun size={18}/>:<Moon size={18}/>}</button><div className="top-user"><div className="avatar small">{user?.name?.[0]?.toUpperCase()}</div><span>{user?.name}</span></div></div></header><div className="page-content"><Outlet/></div></main>
  </div>;
}