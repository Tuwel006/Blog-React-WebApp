import React, { useState } from 'react';
import axios from 'axios';

const AdminRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    
    const { name, email, password } = formData;

    // Basic validation
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      // Send POST request to submit admin request
      await axios.post('http://localhost:5000/admin/request', { name, email, password });
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      setSuccessMessage('Admin request submitted successfully. Waiting for approval.');
      setError(''); // Clear errors if any
    } catch (error) {
        if(error.response) {
            setError(error.response.data.message);
        }
        else {
            setError('An Unexpected Error to Admin Request');
        }
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Request Form</h1>
      <p>Please fill out the form below to request admin access. Approval is required.</p>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
          />
        </div>

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
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded shadow">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default AdminRequestForm;
