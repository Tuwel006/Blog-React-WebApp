require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Post.deleteMany({});

        // Create Admin User
        console.log('👤 Creating admin user...');
        // Password will be hashed by the pre-save hook in User model
        const admin = await User.create({
            name: 'Tuwel Shaikh',
            email: 'tuwelshaikh006@gmail.com',
            password: 'Tuwel@123',
            role: 'admin',
            status: 'approved'
        });
        console.log('✅ Admin created');

        // Create Author User
        console.log('👤 Creating author user...');
        const author = await User.create({
            name: 'Sabbir Ali',
            email: 'ali18sabbir@gmail.com',
            password: 'Sabbir@123',
            role: 'author',
            status: 'approved'
        });
        console.log('✅ Author created');

        // Create Categories
        console.log('📁 Creating categories...');

        const tech = await Category.create({
            name: 'Technology',
            description: 'Latest in technology and innovation',
            color: '#1e3a8a',
            order: 1
        });

        const business = await Category.create({
            name: 'Business',
            description: 'Business insights and strategies',
            color: '#0f766e',
            order: 2
        });

        const lifestyle = await Category.create({
            name: 'Lifestyle',
            description: 'Life, culture, and wellness',
            color: '#7c2d12',
            order: 3
        });

        const webDev = await Category.create({
            name: 'Web Development',
            description: 'Frontend and backend development',
            parent: tech._id,
            color: '#2563eb',
            order: 1
        });

        const ai = await Category.create({
            name: 'Artificial Intelligence',
            description: 'AI and machine learning',
            parent: tech._id,
            color: '#4f46e5',
            order: 2
        });

        const startup = await Category.create({
            name: 'Startups',
            description: 'Startup culture and entrepreneurship',
            parent: business._id,
            color: '#059669',
            order: 1
        });

        console.log('✅ Categories created');

        // Create Sample Posts (one by one to trigger slug generation)
        console.log('📝 Creating sample posts...');

        const post1 = await Post.create({
            title: 'Getting Started with React and Modern Web Development',
            featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop&crop=center',
            content: `<p>React has revolutionized the way we build web applications. In this comprehensive guide, we'll explore the fundamentals of React and how to get started with modern web development.</p>
      
      <h2>Why React?</h2>
      <p>React offers a component-based architecture that makes building complex UIs manageable and maintainable. With its virtual DOM and efficient rendering, React provides excellent performance.</p>
      
      <h2>Key Concepts</h2>
      <ul>
        <li>Components and Props</li>
        <li>State Management</li>
        <li>Hooks and Effects</li>
        <li>Routing and Navigation</li>
      </ul>
      
      <p>Start your React journey today and build amazing web applications!</p>`,
            excerpt: 'Learn the fundamentals of React and modern web development in this comprehensive guide.',
            author: author._id,
            category: tech._id,
            categories: [tech._id, webDev._id],
            tags: ['React', 'JavaScript', 'Web Development', 'Frontend'],
            published: true,
            views: 245,
            likes: 18
        });

        const post2 = await Post.create({
            title: 'The Future of Artificial Intelligence in Business',
            featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center',
            content: `<p>Artificial Intelligence is transforming the business landscape. From automation to predictive analytics, AI is reshaping how companies operate and compete.</p>
      
      <h2>AI Applications in Business</h2>
      <p>Businesses are leveraging AI for customer service, data analysis, and decision-making.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li>Improved Efficiency</li>
        <li>Better Customer Insights</li>
        <li>Predictive Analytics</li>
        <li>Cost Reduction</li>
      </ul>`,
            excerpt: 'Discover how AI is revolutionizing business operations.',
            author: admin._id,
            category: tech._id,
            categories: [tech._id, ai._id, business._id],
            tags: ['AI', 'Business', 'Technology'],
            published: true,
            views: 389,
            likes: 32
        });

        const post3 = await Post.create({
            title: 'Building a Successful Startup',
            featuredImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop&crop=center',
            content: `<p>Starting a business is challenging but rewarding.</p>`,
            excerpt: 'Essential lessons for building a successful startup.',
            author: author._id,
            category: business._id,
            categories: [business._id, startup._id],
            tags: ['Startup', 'Entrepreneurship'],
            published: true,
            views: 156,
            likes: 24
        });

        console.log('✅ Created 3 sample posts');

        // Summary
        console.log('\n📊 Seeding Summary:');
        console.log(`   • Users: ${await User.countDocuments()}`);
        console.log(`   • Categories: ${await Category.countDocuments()}`);
        console.log(`   • Posts: ${await Post.countDocuments()}`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin:  tuwelshaikh006@gmail.com / Tuwel@123');
        console.log('   Author: ali18sabbir@gmail.com / Sabbir@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
