import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostEditor from '../../components/PostEditor';
import PostList from '../../components/PostList';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostSaved = () => {
    setEditingPost(null);
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/posts/${postId}`);
      alert('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Author Dashboard</h1>
      <button
        className="bg-blue-500 text-white p-2 mb-4 shadow rounded-sm"
        onClick={() => navigate('/newpost')}
      >
        New Post
      </button>
      <button className="bg-slate-500 ml-10 text-white p-2 mb-4 shadow rounded-sm" onClick={()=> navigate('/author/adsetting')}>Ad Settings</button>
      {editingPost && (
        <PostEditor currentPost={editingPost} onPostSaved={handlePostSaved} />
      )}
      <h2 className="text-xl font-bold mt-8 mb-4">All Posts</h2>
      <PostList
        posts={posts}
        onEditClick={(post) => setEditingPost(post)}
        onDeleteClick={handleDeletePost}
      />
    </div>
  );
};

export default Dashboard;
