const postButton = document.getElementById('post-button');
const postInput = document.getElementById('post-input');
const postsContainer = document.getElementById('posts-container');

postButton.addEventListener('click', async () => {
    const postContent = postInput.value;
    if (postContent.trim() !== '') {
        // Create a new post element
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Add post content
        const postText = document.createElement('p');
        postText.textContent = postContent;
        postElement.appendChild(postText);

        // Add a like button
        const likeButton = document.createElement('button');
        likeButton.textContent = 'Like';
        postElement.appendChild(likeButton);

        // Add to the posts container
        postsContainer.appendChild(postElement);

        // Clear the input
        postInput.value = '';

        // Send the post content to Node.js server
        const response = await fetch('/addPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: postContent }),
        });

        if (response.status === 200) {
            likeButton.addEventListener('click', async () => {
                const likeResponse = await fetch('/likePost', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: postContent }),
                });

                if (likeResponse.status === 200) {
                    const likes = await likeResponse.json();
                    likeButton.textContent = `Like (${likes} likes)`;
                }
            });
        }
    }
});
// Add this code to fetch and display a single post on post.html
const singlePostContainer = document.getElementById('single-post-container');

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        try {
            const response = await fetch(`/getPost?id=${postId}`);
            if (response.status === 200) {
                const post = await response.json();
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <p>${post.content}</p>
                    <p>Likes: ${post.likes}</p>
                `;
                singlePostContainer.appendChild(postElement);
            }
        } catch (error) {
            console.error('Error fetching single post:', error);
        }
    }
});
          
