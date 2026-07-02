import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, Search, GitCompare, Sparkles, ShoppingBag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-xl z-[999] font-bold"
      >
        Skip to main content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              ApnaKart
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/search"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              to="/compare"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </Link>
            <Link
              to="/ai-chat"
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Chat
            </Link>
            <Link
              to="/cart"
              className="flex items-center gap-1 hover:text-primary transition-colors font-semibold"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              Cart
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border hover:bg-opacity-80 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.name || 'Profile'}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card/85 backdrop-blur z-50 flex justify-around py-2.5 px-4 pb-safe shadow-lg">
        <Link
          to="/search"
          className="flex flex-col items-center text-[10px] font-bold text-muted-foreground hover:text-primary transition"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </Link>
        <Link
          to="/compare"
          className="flex flex-col items-center text-[10px] font-bold text-muted-foreground hover:text-primary transition"
        >
          <GitCompare className="w-5 h-5 mb-0.5" />
          <span>Compare</span>
        </Link>
        <Link
          to="/ai-chat"
          className="flex flex-col items-center text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition"
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>AI Chat</span>
        </Link>
        <Link
          to="/cart"
          className="flex flex-col items-center text-[10px] font-bold text-muted-foreground hover:text-primary transition"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Cart</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="border-t py-8 bg-secondary/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ApnaKart. Built with React 19, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
};
export default MainLayout;
