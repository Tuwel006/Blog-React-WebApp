import React, { useState } from 'react';
import axios from 'axios';

const AdminLoginForm = ({onAdminApproved}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      // Send POST request to validate admin login
      const response = await axios.post('http://localhost:5000/admin/login', { email, password });
      const admin = response.data.admin;
      if (admin.status === 'Approved') {
        // Redirect to admin dashboard if status is Approved
        onAdminApproved(email);
        //navigate('/dashboard');
      } else {
        // Show status if not Approved
        setStatusMessage(`Your status is: ${admin.status}`);
      }

      setError(''); // Clear errors if any
    } catch (error) {
      setError('Invalid email or password.');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter your password"
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {statusMessage && <p className="text-yellow-500 mb-4">{statusMessage}</p>}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded shadow">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLoginForm;
