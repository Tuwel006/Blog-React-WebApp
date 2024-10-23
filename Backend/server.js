// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'blog-site/build')));

const postsFilePath = path.join(__dirname, 'posts.json');

// Initialize posts JSON file if it doesn't exist
if (!fs.existsSync(postsFilePath)) fs.writeFileSync(postsFilePath, JSON.stringify([]));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

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
