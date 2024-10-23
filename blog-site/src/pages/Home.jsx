import React, { useState, useEffect} from 'react';
import { Helmet } from 'react-helmet';
import RecentPosts from '../components/RecentPosts';
import PopularPosts from '../components/PopularPosts';
import Hero from '../components/Hero';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {

    const fetchPopularPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/popular-posts');
        setPopularPosts(response.data);
      } catch (error) {
        console.error('Error fetching popular posts:', error);
      }
    };

    fetchPopularPosts();

    const fetchRecentPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/recent-posts');
        setRecentPosts(response.data);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <>
    
<Helmet>
        <title>Tech Centry</title>
        <meta name="description" content="Explore the latest blog posts and articles" />
        <meta name="keywords" content="blog, latest posts, articles" />
      </Helmet>
      <Hero />
    <div className="container mx-auto p-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        {/* Popular Posts */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-100 via-blue-200 to-green-200 shadow-lg">
      <Link to={`/viewer/posts/popular`} className="text-3xl font-semibold mb-6 shadow">Popular Posts{'>'}</Link>
      <div className="space-y-4">
        {popularPosts.slice(0,3).map((post, index) => (
          <Link key={post.id} to={`/viewer/posts/${post.title}`}>
          <div  className="my-4 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
            <p className="text-sm text-gray-600">{(post.content).replace(/<\/?[^>]+(>|$)/g, '').slice(0, 100)}...</p>
            <span className="text-xs text-gray-400">{post.date}</span>
          </div>
          </Link>
        ))}
      </div>
    </div> 


        {/* <RecentPosts /> */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-100 via-orange-200 to-purple-200 shadow-lg">
      <Link to={'viewer/posts/recent'} className="shadow text-3xl font-semibold mb-6">Recent Posts{'>'}</Link>
      <div className="">
        {recentPosts.slice(0,3).map((post, index) => (
          <Link key={post.id} to={`/viewer/posts/${post.title}`}>
          <div  className="my-4 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
            <p className="text-sm text-gray-600">{(post.content).replace(/<\/?[^>]+(>|$)/g, '').slice(0, 100)}...</p>
            <span className="text-xs text-gray-400">{post.date}</span>
          </div>
          </Link>
        ))}
      </div>
    </div>
      </div>
    </div>
    </>
  );
};

export default Home;
