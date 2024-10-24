// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Author/Dashboard';
import Posts from './pages/Viewer/Posts';
import PostDetail from './pages/Viewer/PostDetail';
import PostEditor from './components/PostEditor';
import RecentPosts from './components/RecentPosts';
import PopularPosts from './components/PopularPosts';
import AdSetting from './pages/Author/AdSetting';
import About from './pages/Viewer/About';
import Contact from './pages/Viewer/Contact';
import Service from './pages/Viewer/Service';
import Code from './components/Code';

function App() {
  return (
    <Router>
      <Header />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/author/dashboard" element={<Dashboard />} />
          <Route path="/newpost" element={<PostEditor />} />
          <Route path="/viewer/posts" element={<Posts />} />
          <Route path="/viewer/posts/:postTitle" element={<PostDetail />} />
          <Route path="/viewer/posts/:postId" element={<PostDetail />} />
          <Route path="/viewer/posts/recent" element={<RecentPosts />} />
          <Route path="/viewer/posts/popular" element={<PopularPosts />} />
          <Route path='author/adsetting' element = {<AdSetting/>} />
          <Route path='/about' element = {<About/>} />
          <Route path='/contact' element = {<Contact/>} />
          <Route path='/services' element = {<Service/>} />
          <Route path='/generate/code' element = {<Code/>} />


        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
