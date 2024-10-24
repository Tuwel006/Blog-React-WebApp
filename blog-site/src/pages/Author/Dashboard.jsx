import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostEditor from '../../components/PostEditor';
import PostList from '../../components/PostList';
import { useNavigate } from 'react-router-dom';
import AdminRequestForm from '../../components/AdminRequestForm';
import AdminLoginForm from '../../components/AdminLoginForm';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [showAdmins, setShowAdmins] = useState(false);
  const [showAdminRequests, setShowAdminRequests] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchAdminData();
    checkIfAdmin();
  }, []);

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);  // Switch between login and request form
  };

  const handleAdminApproved = (email) => {
    localStorage.setItem('adminEmail',email);
    checkIfAdmin();
  }

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };


  const fetchAdminData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/admin`); // Update with correct admin.json file path
      setAdminData(response.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const checkIfAdmin = async () => {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/admin`);
 // Assuming we get the current user from admin.json
    const currentUser = response.data.find(user => user.email === localStorage.getItem('adminEmail')); // Replace with your logic for user ID
    setAdmin(currentUser?.status === 'Approved' ? 1 : null); // Set admin to 1 if approved, else null
    setCurrentAdmin(currentUser);
  };

  // Remove Admin using DELETE method
  const handleRemoveAdmin = async (adminId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/admin/${adminId}`);
      alert('Admin removed successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  // Approve Admin Request using PATCH method
  const handleApproveRequest = async (requestId) => {
    try {
      await axios.patch(`${process.env.REACT_APP_SERVER_URL}/admin/${requestId}/approve`);
      alert('Request approved successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handlePostSaved = () => {
    setEditingPost(null);
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/posts/${postId}`);
      alert('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Filter approved admins and pending requests
  const approvedAdmins = adminData.filter(admin => admin.status === 'Approved');
  const pendingRequests = adminData.filter(admin => admin.status === 'Pending');

  return (
    admin ? (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{currentAdmin.name}</h1>
        <div className='flex justify-around'>
          <button
            className="scale-75 md:scale-100 bg-blue-500 text-white p-2 mb-4 shadow rounded-sm"
            onClick={() => navigate('/newpost')}
          >
            New Post
          </button>
          <button
            className="scale-75 md:scale-100 bg-slate-500 text-white p-2 mb-4 shadow rounded-sm"
            onClick={() => navigate('/author/adsetting')}
          >
            Ad Settings
          </button>
          <button
            className="scale-75 md:scale-100 bg-slate-500 text-white p-2 mb-4 shadow rounded-sm"
            onClick={() => setShowAdmins(!showAdmins)}
          >
            Admins
          </button>
          <button
            className="scale-75 md:scale-100 bg-slate-500 text-white p-2 mb-4 shadow rounded-sm"
            onClick={() => setShowAdminRequests(!showAdminRequests)}
          >
            Admin Request
          </button>
        </div>

        {/* Admin List */}
        {showAdmins && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">Admin List</h2>
            <ul>
              {approvedAdmins.map(admin => (
                <li key={admin.id} className="flex justify-between">
                  {admin.name}
                  <button
                    className="bg-red-500 text-white p-1 m-1 shadow rounded-sm"
                    onClick={() => handleRemoveAdmin(admin.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Admin Requests List */}
        {showAdminRequests && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">Admin Requests</h2>
            <ul>
              {pendingRequests.map(request => (
                <li key={request.id} className="flex justify-between">
                  {request.name} - Status: {request.status}
                  {request.status === 'Pending' && (
                    <button
                      className="bg-green-500 text-white p-1 m-1 shadow rounded-sm"
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      Approve
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Post Editor and List */}
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
    ) : (
      <div className="container mx-auto p-4">
        {showLoginForm ? (
        <>
          <AdminLoginForm onAdminApproved={handleAdminApproved} />  {/* Show the Admin Login Form */}
          <p className="mt-4 text-center">
            Don’t have an account?{' '}
            <button
              className="text-blue-500 underline"
              onClick={toggleForm}
            >
              Request Admin Access
            </button>
          </p>
        </>
      ) : (
        <>
          <AdminRequestForm />  {/* Show the Admin Request Form */}
          <p className="mt-4 text-center">
            Already have an account?{' '}
            <button
              className="text-blue-500 underline"
              onClick={toggleForm}
            >
              Login
            </button>
          </p>
        </>
      )}
        {/* Your admin request form goes here */}
      </div>
    )
  );
};

export default Dashboard;
