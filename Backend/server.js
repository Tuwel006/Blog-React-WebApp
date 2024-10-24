// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'blog-site/build')));

const postsFilePath = path.join(__dirname, 'posts.json');
const adminFilePath = path.join(__dirname, 'admin.json');

// Initialize posts JSON file if it doesn't exist
if (!fs.existsSync(postsFilePath)) fs.writeFileSync(postsFilePath, JSON.stringify([]));
//if (!fs.existsSync(adminPath)) fs.writeFileSync(adminPath, JSON.stringify([]));



const readAdminData = () => {
  const data = fs.readFileSync(adminFilePath, 'utf-8');
  console.log(data);
  return JSON.parse(data);
};

// Helper function to write the admin data
const writeAdminData = (data) => {
  fs.writeFileSync(adminFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Route to get all admin data
app.get('/admin', (req, res) => {
  try {
    const adminData = readAdminData();
    res.status(200).json(adminData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin data', error });
  }
});

// Route for Admin Login
app.post('/admin/login', async(req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const adminData = readAdminData();  // Read from admin.json
    const admin = adminData.find(a => a.email === email);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, admin.password);
    if(!match) {
      return res.status(401).json({ message: 'Invalid email or password' });

    }

    // If the admin exists, send back their status (Approved or Pending)
    res.status(200).json({ message: 'Login successful', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});


// Route to update admin status (approve an admin)
app.patch('/admin/:id/approve', (req, res) => {
  const { id } = req.params;
  try {
    const adminData = readAdminData();
    const user = adminData.find((admin) => admin.id === parseInt(id));

    if (user) {
      user.status = 'Approved';  // Change status to Approved
      writeAdminData(adminData);
      res.status(200).json({ message: 'Admin approved successfully' });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error approving admin', error });
  }
});

// Route to remove an admin
app.delete('/admin/:id', (req, res) => {
  const { id } = req.params;

  try {
    let adminData = readAdminData(); // Assuming this reads the current admin data
    const newAdminData = adminData.filter((admin) => admin.id !== parseInt(id));

    if (adminData.length === newAdminData.length) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Reassign IDs to remaining admins
    const updatedAdminData = newAdminData.map((admin, index) => ({
      ...admin,
      id: index + 1  // Assign new ID starting from 1
    }));

    writeAdminData(updatedAdminData); // Assuming this writes the updated admin data
    res.status(200).json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing admin', error });
  }
});


// Route to submit an admin request (add new admin with Pending status)
app.post('/admin/request', async (req, res) => {
  const { name, password, email } = req.body;  // Extracting name, password, and email from request body

  // Check if the name is provided
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  // Check if the email is provided
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if the password is provided
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const adminData = readAdminData(); // Read the existing admin data
    const existRequest = adminData.filter((admin) => admin.email === email); // Check for existing requests

    console.log("Exist Request: ");
    console.log(existRequest.length); // Log the number of existing requests for debugging

    if (existRequest.length) {
      return res.status(409).json({ message: 'Email Already Exists' }); // Use 409 for conflict
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      // Create a new admin object
      const newAdmin = {
        id: adminData.length + 1,  // Incremental ID
        name,
        email,
        password: hashedPassword,
        status: 'Pending'
      };

      // Push the new admin request to the existing admin data
      adminData.push(newAdmin);
      writeAdminData(adminData); // Save updated admin data

      // Send a success response
      return res.status(201).json({ message: 'Admin request submitted successfully', newAdmin });
    }
  } catch (error) {
    console.error('Error submitting request:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Error submitting request', error: error.message }); // Send a more specific error message
  }
});



// Get all posts
app.get('/posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  res.status(200).json(posts);
});

// Get a single post by ID
app.get('/posts/:title', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const post = posts.find(p => p.title === req.params.title);
  if (!post) return res.status(404).send({ message: 'Post not found' });
  res.status(200).json(post);
});

app.get('/posts/:id', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send({ message: 'Post not found' });
  res.status(200).json(post);
});

// Get recent posts (assuming they're sorted by a date field)
app.get('/recent-posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const recentPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // Adjust the number as needed
  res.json(recentPosts);
});

// Get popular posts (based on likes)
app.get('/popular-posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const popularPosts = posts.sort((a, b) => b.views - a.views).slice(0, 5); // Adjust the number as needed
  res.json(popularPosts);
});


// Create or update a post
app.post('/save-post', (req, res) => {
  const { post } = req.body;
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const existingPostIndex = posts.findIndex(p => p.id === post.id);

  if (existingPostIndex !== -1) {
    // Update existing post
    posts[existingPostIndex] = { ...posts[existingPostIndex], ...post };
  } else {
    // Add new post
    posts.push({ ...post, views: 0, likes: 0, comments: [] });
  }

  fs.writeFileSync(postsFilePath, JSON.stringify(posts));
  res.status(200).send({ message: 'Post saved successfully.' });
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const updatedPosts = posts.filter(p => p.id !== req.params.id);
  fs.writeFileSync(postsFilePath, JSON.stringify(updatedPosts));
  res.status(200).send({ message: 'Post deleted successfully.' });
});

//views post
// Increment view count endpoint
app.post('/viewsCount/:title', async (req, res) => {
  const { title } = req.params;
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const postIndex = posts.findIndex(p => p.title === title);
  if (postIndex === -1) return res.status(404).send({ message: 'Post not found' });

  posts[postIndex].views += 1;
  fs.writeFileSync(postsFilePath, JSON.stringify(posts));
  res.status(200).send({ message: 'Post liked successfully.' });
});


// Like a post
app.post('/like-post/:title', (req, res) => {
  const { title } = req.params;
  try {
    const posts = JSON.parse(fs.readFileSync(postsFilePath, 'utf-8'));
    const postIndex = posts.findIndex(p => p.title === title);

    if (postIndex === -1) {
      return res.status(404).send({ message: 'Post not found' });
    }

    // Increment the likes
    posts[postIndex].likes += 1;

    // Save the updated posts back to the file
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));

    // Send the updated like count as response
    res.status(200).json({ postLike: posts[postIndex].likes });
  } catch (error) {
    console.error('Error updating like count:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Add a comment
app.post('/add-comment/:title', (req, res) => {
  const { title } = req.params;
  const { comment } = req.body;
  const posts = JSON.parse(fs.readFileSync(postsFilePath));
  const postIndex = posts.findIndex(p => p.title === title);
  if (postIndex === -1) return res.status(404).send({ message: 'Post not found' });

  posts[postIndex].comments.push(comment);
  fs.writeFileSync(postsFilePath, JSON.stringify(posts));
  res.status(200).send({ message: 'Comment added successfully.' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
