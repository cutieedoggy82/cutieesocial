const postButton = document.getElementById('post-button');
const postInput = document.getElementById('post-input');
const postsContainer = document.getElementById('posts-container');

postButton.addEventListener('click', async () => {
    const postContent = postInput.value;
    if (postContent.trim() !== '') {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const postText = document.createElement('p');
        postText.textContent = postContent;
        postElement.appendChild(postText);

        const likeButton = document.createElement('button');
        likeButton.textContent = 'Like';
        postElement.appendChild(likeButton);

        postsContainer.appendChild(postElement);

        postInput.value = '';

        const response = await fetch('https://cutieesocialback.onrender.com/addPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: postContent }),
        });

        if (response.status === 200) {
            likeButton.addEventListener('click', async () => {
                const likeResponse = await fetch('https://cutieesocialback.onrender.com/likePost', {
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

const singlePostContainer = document.getElementById('single-post-container');

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        try {
            const response = await fetch(`https://cutieesocialback.onrender.com/getPost?id=${postId}`);
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
