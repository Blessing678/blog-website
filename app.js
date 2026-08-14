// LOGIN SYSTEM
let ADMIN_USER = 'admin';
let ADMIN_PASS = 'admin123';

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(user === ADMIN_USER && pass === ADMIN_PASS) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('dashboard').classList.remove('hidden');
    } else {
        document.getElementById('loginMessage').innerText = "Wrong username or password!";
    }
}

function logout() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('dashboard').classList.add('hidden');
}

// IMAGE PREVIEW
document.getElementById('postImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// SAVE BLOG - we will connect this to jsonbin next
document.getElementById('blogForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert("Blog submitted! Next we connect to jsonbin");
});











/*
CUSTOMER BLOG WEBSITE
Demo Admin Login:
Username: admin
Password: 12345
*/

// JSONBIN SETUP - THIS IS THE DATABASE
const BIN_ID = "6a7eada8da38895dfee2ffc7";
const MASTER_KEY = "PASTE_YOUR_MASTER_KEY_HERE"; // Get this from JSONBin > API KEYS
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

const ADMIN_KEY = "blogAdminLoggedIn";
const ADMIN_USERNAME_KEY = "blogAdminUsername";
const ADMIN_PASSWORD_KEY = "blogAdminPassword";
const ADMIN_USERNAME = "Donavan";
const ADMIN_PASSWORD = "123456";

function getAdminCredentials() {
    const username = localStorage.getItem(ADMIN_USERNAME_KEY) || DEFAULT_ADMIN_USERNAME;
    const password = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;

    if (!localStorage.getItem(ADMIN_USERNAME_KEY)) {
        localStorage.setItem(ADMIN_USERNAME_KEY, username);
    }

    if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
        localStorage.setItem(ADMIN_PASSWORD_KEY, password);
    }

    return { username, password };
}

function saveAdminCredentials(username, password) {
    const cleanUsername = (username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;
    const cleanPassword = (password || DEFAULT_ADMIN_PASSWORD).trim() || DEFAULT_ADMIN_PASSWORD;

    localStorage.setItem(ADMIN_USERNAME_KEY, cleanUsername);
    localStorage.setItem(ADMIN_PASSWORD_KEY, cleanPassword);
}

async function getPosts() {
  try {
    const res = await fetch(API_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const data = await res.json();
    return data.record; // this is your array from JSONBin
  } catch (error) {
    console.log("Error loading posts", error);
    return [];
  }
}


async function savePosts(posts) {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(posts)
    });
  } catch (error) {
    console.log("Error saving posts", error);
  }
}

 async function displayBlogs() {
    const container = document.getElementById("blogContainer");

    if (!container) {
        return;
    }

    const posts = getPosts();
    container.innerHTML = "";

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <h3>No blog posts yet</h3>
                <p>
                    The administrator has not published any blog posts yet.
                </p>
            </div>
        `;
        return;
    }

    posts.forEach((post) => {
        const card = document.createElement("article");
        card.className = "blog-card";

        card.innerHTML = `
            <img src="${post.image}" alt="${escapeHTML(post.title)}">
            <div class="blog-info">
                <span class="category">${escapeHTML(post.category)}</span>
                <h3>${escapeHTML(post.title)}</h3>
                <p>${escapeHTML(post.content.substring(0, 150))}...</p>
                <span class="blog-date">${post.date}</span>
                <span class="read-more" onclick="readPost('${post.id}')">Read More →</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function readPost(id) {
    const posts = getPosts();
    const post = posts.find((item) => String(item.id) === String(id));

    if (!post) {
        return;
    }

    localStorage.setItem(SELECTED_POST_KEY, JSON.stringify(post));
    window.location.href = "post.html";
}

function displaySelectedPost() {
    const postDetail = document.getElementById("postDetail");

    if (!postDetail) {
        return;
    }

    const post = JSON.parse(localStorage.getItem(SELECTED_POST_KEY) || "null");

    if (!post) {
        postDetail.innerHTML = `
            <div class="no-posts">
                <h3>Post not found</h3>
                <p>The article you requested could not be found.</p>
            </div>
        `;
        return;
    }

    postDetail.innerHTML = `
        <article class="single-post">
            <img src="${post.image}" alt="${escapeHTML(post.title)}">
            <div class="single-post-body">
                <span class="category">${escapeHTML(post.category)}</span>
                <h1>${escapeHTML(post.title)}</h1>
                <p class="single-post-meta">${post.date}</p>
                <div class="single-post-content">${escapeHTML(post.content).replace(/\n/g, "<br>")}</div>
            </div>
        </article>
    `;
}

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");

if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", function () {
        const shouldShowPassword = passwordInput.type === "password";
        passwordInput.type = shouldShowPassword ? "text" : "password";
        togglePasswordBtn.textContent = shouldShowPassword ? "Hide" : "Show";
        togglePasswordBtn.setAttribute(
            "aria-label",
            shouldShowPassword ? "Hide password" : "Show password"
        );
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const message = document.getElementById("loginMessage");
        const { username: savedUsername, password: savedPassword } = getAdminCredentials();

        if (username === savedUsername && password === savedPassword) {
            localStorage.setItem(ADMIN_KEY, "true");
            showDashboard();
        } else {
            message.textContent = "Incorrect username or password.";
        }
    });
}

function showDashboard() {
    const loginBox = document.getElementById("loginBox");
    const dashboard = document.getElementById("dashboard");
    const adminUsernameInput = document.getElementById("adminUsername");
    const adminPasswordInput = document.getElementById("adminPassword");

    if (loginBox) {
        loginBox.classList.add("hidden");
    }

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }

    if (adminUsernameInput || adminPasswordInput) {
        const { username, password } = getAdminCredentials();

        if (adminUsernameInput) {
            adminUsernameInput.value = username;
        }

        if (adminPasswordInput) {
            adminPasswordInput.value = password;
        }
    }

    displayAdminPosts();
}

if (document.getElementById("dashboard")) {
    const loggedIn = localStorage.getItem(ADMIN_KEY);

    if (loggedIn === "true") {
        showDashboard();
    }
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem(ADMIN_KEY);
        location.reload();
    });
}

const imageInput = document.getElementById("blogImage");

if (imageInput) {
    imageInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            selectedImage = event.target.result;
            document.getElementById("imagePreview").innerHTML = `
                <img src="${selectedImage}" alt="Image preview">
            `;
        };

        reader.readAsDataURL(file);
    });
}

const blogForm = document.getElementById("blogForm");

if (blogForm) {
    blogForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("blogTitle").value.trim();
        const category = document.getElementById("blogCategory").value.trim();
        const content = document.getElementById("blogContent").value.trim();
        const editId = document.getElementById("editId").value;

        let posts = getPosts();

        if (editId) {
            const index = posts.findIndex((post) => post.id === editId);

            if (index !== -1) {
                posts[index].title = title;
                posts[index].category = category;
                posts[index].content = content;

                if (selectedImage) {
                    posts[index].image = selectedImage;
                }

                posts[index].date = new Date().toLocaleDateString();
                savePosts(posts);
            }
        } else {
            const newPost = {
                id: Date.now().toString(),
                title,
                category,
                content,
                image: selectedImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80",
                date: new Date().toLocaleDateString()
            };

            posts.unshift(newPost);
            savePosts(posts);
        }

        resetBlogForm();
        displayAdminPosts();

        alert(editId ? "Blog updated successfully!" : "Blog published successfully!");
    });
}

function displayAdminPosts() {
    const container = document.getElementById("adminPosts");

    if (!container) {
        return;
    }

    const posts = getPosts();
    container.innerHTML = "";

    if (posts.length === 0) {
        container.innerHTML = "<p>You have not created any blog posts yet.</p>";
        return;
    }

    posts.forEach((post) => {
        const div = document.createElement("div");
        div.className = "admin-post";

        div.innerHTML = `
            <img src="${post.image}" alt="${escapeHTML(post.title)}">
            <div class="admin-post-info">
                <h3>${escapeHTML(post.title)}</h3>
                <p>${escapeHTML(post.category)} • ${post.date}</p>
            </div>
            <div>
                <button class="edit-btn" onclick="editPost('${post.id}')">Edit</button>
                <button class="delete-btn" onclick="deletePost('${post.id}')">Delete</button>
            </div>
        `;

        container.appendChild(div);
    });
}
async function savePosts(posts) {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(posts)
    });
  } catch (error) {
    console.log("Error saving posts", error);
  }
}

function editPost(id) {
    const posts = getPosts();
    const post = posts.find((item) => item.id === id);

    if (!post) {
        return;
    }

    document.getElementById("editId").value = post.id;
    document.getElementById("blogTitle").value = post.title;
    document.getElementById("blogCategory").value = post.category;
    document.getElementById("blogContent").value = post.content;

    selectedImage = post.image;
    document.getElementById("imagePreview").innerHTML = `
        <img src="${post.image}" alt="Current image">
    `;

    document.getElementById("formTitle").textContent = "Edit Blog";
    document.getElementById("saveText").textContent = "Update Blog";
    document.getElementById("cancelEdit").classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function deletePost(id) {
  const answer = confirm("Are you sure you want to delete this post?");

  if (!answer) {
    return;
  }

  let posts = await getPosts(); // <- added await
  posts = posts.filter((post) => post.id !== id);

  await savePosts(posts); // <- this is fine now
  displayAdminPosts();
}

function resetBlogForm() {
    if (!blogForm) {
        return;
    }

    blogForm.reset();
    document.getElementById("editId").value = "";
    document.getElementById("imagePreview").innerHTML = "";
    document.getElementById("formTitle").textContent = "Create New Blog";
    document.getElementById("saveText").textContent = "Publish Blog";
    document.getElementById("cancelEdit").classList.add("hidden");
    selectedImage = "";
}

const cancelEdit = document.getElementById("cancelEdit");

if (cancelEdit) {
    cancelEdit.addEventListener("click", resetBlogForm);
}

const adminSettingsForm = document.getElementById("adminSettingsForm");

if (adminSettingsForm) {
    const adminUsernameInput = document.getElementById("adminUsername");
    const adminPasswordInput = document.getElementById("adminPassword");
    const settingsMessage = document.getElementById("settingsMessage");

    const { username, password } = getAdminCredentials();

    if (adminUsernameInput) {
        adminUsernameInput.value = username;
    }

    if (adminPasswordInput) {
        adminPasswordInput.value = password;
    }

    adminSettingsForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newUsername = (adminUsernameInput ? adminUsernameInput.value : "").trim();
        const newPassword = (adminPasswordInput ? adminPasswordInput.value : "").trim();

        if (!newUsername || !newPassword) {
            if (settingsMessage) {
                settingsMessage.textContent = "Username and password are required.";
            }
            return;
        }

        saveAdminCredentials(newUsername, newPassword);

        if (settingsMessage) {
            settingsMessage.textContent = "Admin credentials updated successfully.";
        }
    });
}

displayBlogs();
displaySelectedPost();
// Load and display blog posts FROM JSONBIN
async function displayPosts() {
  const blogContainer = document.getElementById('blogContainer'); // or 'blog-container' check your html
  if (!blogContainer) return;

  blogContainer.innerHTML = '<p>Loading blogs...</p>';

  try {
    const posts = await getPosts(); // <-- THIS IS THE KEY. GET FROM JSONBIN

    if (posts.length === 0) {
      blogContainer.innerHTML = '<p>No blog posts yet</p>';
      return;
    }

    blogContainer.innerHTML = posts.map(post => `
      <div class="post-card">
        <img src="${post.image}" alt="${post.title}" />
        <h3>${post.title}</h3>
        <p>${post.content.substring(0, 100)}...</p>
        <a href="post.html?id=${post.id}">Read More</a>
      </div>
    `).join('');

  } catch (error) {
    console.error("Error loading posts:", error);
    blogContainer.innerHTML = '<p>Error loading blogs</p>';
  }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', displayPosts);












  if (posts.length === 0) {
    blogContainer.innerHTML = '<p>No blog posts yet</p>';
    return;
  }

  blogContainer.innerHTML = posts.map(post => `
    <div class="post-card">
      <img src="${post.image}" alt="${post.title}" />
      <h3>${post.title}</h3>
      <p>${post.content.substring(0, 100)}...</p>
      <a href="post.html?id=${post.id}">Read More</a>
    </div>
  `).join('');


// Run when page loads
document.addEventListener('DOMContentLoaded', displayPosts);

