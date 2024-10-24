import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const PostEditor = ({ currentPost = null, onPostSaved }) => {
  const [title, setTitle] = useState(currentPost?.title || '');
  const [content, setContent] = useState(currentPost?.content || '');
  const [tags, setTags] = useState(currentPost?.tags || '');
  const navigate = useNavigate();

  const handleSavePost = async () => {
    const post = {
      id: currentPost?.id || uuidv4(),
      title,
      content,
      tags,
      views: currentPost?.views || 0,
      likes: currentPost?.likes || 0,
      comments: currentPost?.comments || [],
      date: currentPost?.date || new Date().toISOString(), 
    };

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/save-post`, { post });
      alert('Post saved successfully');
      navigate('/author/dashboard');
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div className="p-4">
      <Helmet>
        <title>{title ? `${title} - Tech Centry` : 'Create New Post - My Blog'}</title>
        <meta name="description" content={title ? `Editing: ${title}` : 'Create a new post'} />
        <meta name="keywords" content={tags || 'blog, post, editor, new post'} />
      </Helmet>
      <input
        type="text"
        placeholder="Title"
        className="block w-full p-2 mb-4 border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <ReactQuill
      style={{height: '400px', overflow: 'hidden'}}
        value={content}
        onChange={setContent}
        className="mb-4"
        theme="snow"
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
          ],
        }}
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        className="block w-full p-2 mb-4 border"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2" onClick={handleSavePost}>
        Save Post
      </button>
    </div>
  );
};

export default PostEditor;
