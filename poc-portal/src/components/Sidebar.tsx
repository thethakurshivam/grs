import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
  currentPath: string;
}

const Sidebar = ({ user, onLogout, currentPath }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'MOUs', href: '/mous', icon: FileText },
    { name: 'Requests', href: '/requests', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-slate-200"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:inset-y-0 lg:transform-none
      `}>
        <div className={`
          flex flex-col h-full bg-white border-r border-slate-200 shadow-lg
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">POC Portal</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className={`h-4 w-4 text-slate-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* User Profile */}
          {!isCollapsed && (
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.organization || 'Organization'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    nav-link ${isActive(item.href) ? 'active' : ''}
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </a>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={onLogout}
              className={`
                w-full nav-link text-red-600 hover:text-red-700 hover:bg-red-50
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
