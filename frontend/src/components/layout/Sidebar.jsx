import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Exams', path: '/admin/exams', icon: '📝' },
    { name: 'Questions', path: '/admin/questions', icon: '❓' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
    { name: 'Profile', path: '/profile', icon: '👤' }
  ];

  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'My Exams', path: '/my-exams', icon: '📚' },
    { name: 'Results', path: '/dashboard/results', icon: '🏆' },
    { name: 'Profile', path: '/profile', icon: '👤' }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <div className="w-64 sidebar-gradient h-full">
      <nav className="p-6 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:transform hover:scale-105'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;