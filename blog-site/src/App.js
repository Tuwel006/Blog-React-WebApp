import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

import Posts from './pages/Viewer/Posts';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AdminDashboard from './pages/Admin/Dashboard';
import PostManagement from './pages/Admin/PostManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import UserManagement from './pages/Admin/UserManagement';
import CommentModeration from './pages/Admin/CommentModeration';
import Analytics from './pages/Admin/Analytics';
import Settings from './pages/Admin/Settings';
import Profile from './pages/Admin/Profile';
import Search from './pages/Search';
import AuthorProfile from './pages/Author/AuthorProfile';
import PostDetail from './pages/Viewer/PostDetail';
import PostEditor from './components/PostEditor';
import About from './pages/Viewer/About';
import Contact from './pages/Viewer/Contact';
import Service from './pages/Viewer/Service';
import './styles/theme.css';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <Header />
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/viewer/posts" element={<Posts />} />
              <Route path="/viewer/posts/:id" element={<PostDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Service />} />
              <Route path="/search" element={<Search />} />
              <Route path="/author/:id" element={<AuthorProfile />} />

              {/* Protected Routes - Require Authentication */}
              <Route
                path="/author/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/newpost"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <PostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <PostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/posts/new"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <PostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/posts/edit/:id"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <PostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/posts"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <PostManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <CategoryManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/comments"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <CommentModeration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute roles={['admin', 'author']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
