import React, { useState,useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PopupAd from './PopupAd';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostsMenuOpen, setIsPostsMenuOpen] = useState(false);
  const location = useLocation();


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const togglePostsMenu = () => {
    setIsPostsMenuOpen(!isPostsMenuOpen);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsPostsMenuOpen(false); // Optionally close posts menu as well
  }, [location]);

  return (
    <header className="bg-gray-900 text-white p-4 z-100000">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">Tech Centry</h1>
        <button 
          className="md:hidden focus:outline-none" 
          onClick={toggleMobileMenu}
        >
          {/* Mobile Menu Button (Hamburger Icon) */}
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 6h16M4 12h16m-7 6h7" 
            />
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="mr-4">Home</Link>
          <Link to="/author/dashboard" className="mr-4">Dashboard</Link>
          <div className="relative">
            <button 
              onClick={togglePostsMenu} 
              className="focus:outline-none"
            >
              Posts
            </button>
            {isPostsMenuOpen && (
              <div className="absolute bg-white text-black mt-2 rounded shadow-lg z-1000">
                <Link to="/viewer/posts" className="block px-4 py-2 hover:bg-gray-200">
                  All Posts
                </Link>
                <Link to="/viewer/posts/recent" className="block px-4 py-2 hover:bg-gray-200">
                  Recent Posts
                </Link>
                <Link to="/viewer/posts/popular" className="block px-4 py-2 hover:bg-gray-200">
                  Popular Posts
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-slate-900 text-white md:hidden shadow z-1000">
            <Link to="/" className="block px-4 py-2">Home</Link>
            <Link to="/author/dashboard" className="block px-4 py-2">Dashboard</Link>
            <button 
              onClick={togglePostsMenu} 
              className="block w-full text-left px-4 py-2"
            >
              Posts
            </button>
            {isPostsMenuOpen && (
              <div className="bg-slate-600">
                <Link to="/viewer/posts" className="block px-4 py-2">
                  All Posts
                </Link>
                <Link to="/viewer/posts/recent" className="block px-4 py-2">
                  Recent Posts
                </Link>
                <Link to="/viewer/posts/popular" className="block px-4 py-2">
                  Popular Posts
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
      <PopupAd/>
    </header>
  );
};

export default Header;
