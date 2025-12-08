import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Briefcase,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Bokningar', href: '/bookings', icon: Calendar },
  { name: 'Kunder', href: '/customers', icon: Users },
  { name: 'Tjänster', href: '/services', icon: Briefcase },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                BookingBase
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-sidebar-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
  {navigation.map((item) => (
    <NavLink
      key={item.name}
      to={item.href}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )
      }
    >
      <item.icon className="h-5 w-5" />
      {item.name}
    </NavLink>
  ))}
</nav>



          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-sidebar-foreground/50">
              © 2024 BookingBase
            </div>
          </div>
          <div className="mt-4 px-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition"
              >
                Logga ut
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              >
                Logga in
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
