const express = require('express');
const bodyParser = require('body-parser');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const fs = require('fs').promises;
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

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
        const databasePath = 'src/database.json';
        const currentPosts = JSON.parse(await fs.readFile(databasePath, 'utf-8'));

        currentPosts.push({ content: postHTML, likes: 0 });
        await fs.writeFile(databasePath, JSON.stringify(currentPosts, null, 2));

        res.status(200).send('Post added successfully');
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).send('Error adding post');
    }
});

app.post('/likePost', async (req, res) => {
    const postContent = req.body.content;

    try {
        const databasePath = 'src/database.json';
        const currentPosts = JSON.parse(await fs.readFile(databasePath, 'utf-8'));

        const post = currentPosts.find(item => item.content === postContent);
        if (post) {
            post.likes++;
            await fs.writeFile(databasePath, JSON.stringify(currentPosts, null, 2));

            res.status(200).json(post.likes);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).send('Error liking post');
    }
});

// Add this route to fetch a single post by ID
app.get('/getPost', (req, res) => {
    const postId = req.query.id;
    try {
        const databasePath = 'src/database.json';
        const currentPosts = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));

        const post = currentPosts.find(item => item.id === postId);
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


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
