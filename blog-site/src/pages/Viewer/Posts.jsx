// src/pages/Viewer/Posts.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ViewerPostList from '../../components/ViewerPostList';

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      <ViewerPostList posts={posts}/>
    </div>
  );
};

export default Posts;
