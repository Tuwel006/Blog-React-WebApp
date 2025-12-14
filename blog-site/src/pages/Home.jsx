import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as postService from '../services/postService';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import SEOHead from '../components/SEOHead';

const Home = () => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const [allPosts, popular] = await Promise.all([
        postService.getAllPosts({ limit: 7, published: true }),
        postService.getPopularPosts(5)
      ]);

      if (allPosts.posts && allPosts.posts.length > 0) {
        setFeaturedPost(allPosts.posts[0]);
        setRecentPosts(allPosts.posts.slice(1, 7));
      }
      setPopularPosts(popular.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Techcentry - Technology Blog & Insights"
        description="Discover the latest in technology, web development, AI, and business insights. Expert articles, tutorials, and trends from industry professionals."
        keywords="technology blog, web development, AI, programming, tutorials, tech insights, business technology"
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Technology <span className="text-blue-600">Insights</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Expert articles on web development, AI, and technology trends
            </p>
            
            <Link
              to="/viewer/posts"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              Read Articles
            </Link>
          </div>
        </section>

        {/* Featured Article */}
        {featuredPost && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="bg-white rounded border p-6">
              <div className="mb-4">
                <span className="text-sm text-blue-600 font-medium">Featured</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link to={`/viewer/posts/${featuredPost._id}`} className="hover:text-blue-600">
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                {featuredPost.excerpt || featuredPost.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  By {featuredPost.author?.name || 'Anonymous'} • {new Date(featuredPost.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/viewer/posts/${featuredPost._id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Latest Articles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recentPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/viewer/posts" 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              View All Articles
            </Link>
          </div>
        </section>

        {/* Popular Articles */}
        {popularPosts.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Popular Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularPosts.slice(0, 3).map((post) => (
                  <article key={post._id} className="bg-white rounded border p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <Link to={`/viewer/posts/${post._id}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;
