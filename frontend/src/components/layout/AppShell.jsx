import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../lib/auth/authContext';
import { useTheme } from '../../lib/themeContext';
import { ADMIN_STAFF_NAV_GROUPS, USER_NAV_ITEMS } from '../../lib/constants';

export const AppShell = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('simaset_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('simaset_sidebar_collapsed', String(next));
  };

  const handleLogout = () => {
    navigate('/login', { replace: true });
    logout();
  };

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search]);

  const isAdminOrStaff = role === 'SUPER_ADMIN' || role === 'STAFF';

  // Helper to get icon
  const getIcon = (iconName) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.Circle;
    return <IconComponent className="w-5 h-5 shrink-0" />;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-50 transition-colors duration-200">
      {isAdminOrStaff ? (
        /* ========================================================
         * ADMIN / STAFF LAYOUT (Sidebar + TopBar)
         * ======================================================== */
        <div className="flex flex-1 min-h-screen">
          {/* Mobile Backdrop */}
          {isMobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-240 ease-in-out lg:translate-x-0 ${
              isMobileOpen ? 'translate-x-0 w-66' : '-translate-x-full lg:translate-x-0'
            } ${isCollapsed ? 'lg:w-20' : 'lg:w-66'}`}
          >
            {/* Brand Header */}
            <div className="h-18 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                  <LucideIcons.Box className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white select-none whitespace-nowrap">
                    SIMASET
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <LucideIcons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-grow p-4 space-y-6 overflow-y-auto" aria-label="Navigasi utama">
              {ADMIN_STAFF_NAV_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  {!isCollapsed && (
                    <p className="px-3 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                      {group.title}
                    </p>
                  )}
                  {group.items.map((item, idx) => {
                    // Check active state including query params for borrowing status
                    const isActive =
                      location.pathname + location.search === item.path ||
                      (item.path.includes('?') &&
                        location.pathname === item.path.split('?')[0] &&
                        location.search === '?' + item.path.split('?')[1]) ||
                      (!item.path.includes('?') &&
                        location.pathname === item.path &&
                        !location.search.includes('status='));

                    return (
                      <NavLink
                        key={idx}
                        to={item.path}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        {getIcon(item.icon)}
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Collapse Toggle Footer */}
            <div className="hidden lg:flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={toggleCollapse}
                aria-expanded={!isCollapsed}
                title={isCollapsed ? 'Perluas Menu' : 'Sembunyikan Menu'}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full flex items-center justify-center gap-2"
              >
                {isCollapsed ? (
                  <LucideIcons.ChevronRight className="w-5 h-5" />
                ) : (
                  <>
                    <LucideIcons.ChevronLeft className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Tutup Sidebar</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Main Area */}
          <div
            className={`flex-1 flex flex-col min-h-screen transition-all duration-240 ease-in-out ${
              isCollapsed ? 'lg:pl-20' : 'lg:pl-66'
            }`}
          >
            {/* Top Bar */}
            <header className="h-18 px-4 sm:px-6 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(true)}
                  className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                  aria-label="Buka navigasi"
                >
                  <LucideIcons.Menu className="w-6 h-6" />
                </button>
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 capitalize">
                    {role === 'SUPER_ADMIN' ? 'Super Admin Workspace' : 'Staff Workspace'}
                  </h1>
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Ganti tema visual"
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {theme === 'dark' ? (
                    <LucideIcons.Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <LucideIcons.Moon className="w-5 h-5" />
                  )}
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(user?.namaLengkap)}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[150px]">
                        {user?.namaLengkap || 'Pengguna'}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {role}
                      </p>
                    </div>
                    <LucideIcons.ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                  </button>

                  {/* Dropdown panel */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user?.namaLengkap}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                          NIM: {user?.nim}
                        </p>
                      </div>
                      <div className="p-1">
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="w-full px-3 py-2 rounded-xl text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3"
                        >
                          {theme === 'dark' ? (
                            <LucideIcons.Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <LucideIcons.Moon className="w-4 h-4" />
                          )}
                          <span>Ganti ke mode {theme === 'dark' ? 'Terang' : 'Gelap'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full px-3 py-2 rounded-xl text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-3 mt-1 font-semibold"
                        >
                          <LucideIcons.LogOut className="w-4 h-4" />
                          <span>Keluar Akun</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      ) : (
        /* ========================================================
         * USER / STUDENT LAYOUT (Horizontal Navbar + Mobile BottomNav)
         * ======================================================== */
        <div className="flex flex-col flex-1 min-h-screen pb-20 md:pb-0">
          {/* Desktop & Tablet Top Navbar */}
          <header className="h-18 px-4 sm:px-8 sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div
                onClick={() => navigate('/catalog')}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                  <LucideIcons.Box className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  SIMASET
                </span>
              </div>

              {/* Desktop Center Nav */}
              <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
                {USER_NAV_ITEMS.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={idx}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {getIcon(item.icon)}
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right profile action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Ganti tema visual"
              >
                {theme === 'dark' ? (
                  <LucideIcons.Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <LucideIcons.Moon className="w-5 h-5" />
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {getInitials(user?.namaLengkap)}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {user?.namaLengkap || 'Pengguna'}
                  </span>
                  <LucideIcons.ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user?.namaLengkap}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                        NIM: {user?.nim}
                      </p>
                    </div>
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-3 py-2 rounded-xl text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-3 font-semibold"
                      >
                        <LucideIcons.LogOut className="w-4 h-4" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* User Main Content Area */}
          <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>

          {/* Mobile Fixed Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around py-2 px-3">
            {USER_NAV_ITEMS.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {getIcon(item.icon)}
                  <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppShell;
