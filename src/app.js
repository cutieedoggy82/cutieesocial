const express = require('express');
const bodyParser = require('body-parser');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cutieesocial', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema for posts
const postSchema = new mongoose.Schema({
    content: String,
    likes: Number,
});

// Create a model based on the schema
const Post = mongoose.model('Post', postSchema);

// Handle requests for different routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/post', (req, res) => {
    res.sendFile(__dirname + '/public/post.html');
});

app.post('/addPost', async (req, res) => {
    const postContent = req.body.content;
    const sanitizedContent = sanitizeHtml(postContent, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
        allowedAttributes: {
            'a': ['href'],
        },
    });
    const postHTML = marked(sanitizedContent);

    try {
        const newPost = new Post({ content: postHTML, likes: 0 });
        await newPost.save();

        res.status(200).send(newPost);
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).send('Error adding post');
    }
});

app.post('/likePost', async (req, res) => {
    const postId = req.body.id;

    try {
        const post = await Post.findById(postId);
        if (post) {
            post.likes++;
            await post.save();

            res.status(200).json(post.likes);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).send('Error liking post');
    }
});

app.get('/getPost', async (req, res) => {
    const postId = req.query.id;

    try {
        const post = await Post.findById(postId);
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Error fetching post');
    }
});

// This should be the last route to handle any other routes
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/404.html');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
