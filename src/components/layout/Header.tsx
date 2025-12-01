import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, CalendarCheck } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
}

export default function Header({ theme }: HeaderProps) {
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="px-4 sm:px-6 py-4">
      <div 
        className={`flex items-center justify-between rounded-full px-6 py-3
          ${isDark ? 'bg-white/5 border' : 'bg-white border border-gray-200 shadow-sm'}`}
        style={isDark ? { borderColor: 'var(--color-border-dark)' } : undefined}
      >
        
        {/* Logo */}
        <NavLink to="/" className={`flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <div className="size-8 text-primary">
            <CalendarCheck size={28} />
          </div>
          <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block ${isDark ? 'text-white' : 'text-gray-800'}`}>Habity</h2>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Kontrol Paneli
          </NavLink>
          <NavLink
            to="/habits"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Alışkanlıklarım
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Ayarlar
          </NavLink>
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Notlar
          </NavLink>
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-full transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'}`}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav 
          className={`md:hidden mt-2 rounded-2xl p-2 flex flex-col gap-1
            ${isDark ? 'bg-white/5 border' : 'bg-white border border-gray-200 shadow-sm'}`}
          style={isDark ? { borderColor: 'var(--color-border-dark)' } : undefined}
        >
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Kontrol Paneli
          </NavLink>
          <NavLink
            to="/habits"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Alışkanlıklarım
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Ayarlar
          </NavLink>
          <NavLink
            to="/notes"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : (isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100')
              }`
            }
          >
            Notlar
          </NavLink>
        </nav>
      )}
    </header>
  );
}
