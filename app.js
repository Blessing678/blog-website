// LOGIN SYSTEM
let ADMIN_USER = 'admin';
let ADMIN_PASS = 'admin123';

function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    localStorage.setItem('isAdmin','true');
  } else {
    document.getElementById('loginMessage').innerText = 'Wrong username or password!';
  }
}

function logout() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('dashboard').classList.add('hidden');
  localStorage.removeItem('isAdmin');
}

// IMAGE PREVIEW
document.getElementById('postImage')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = document.getElementById('imagePreview');
      img.src = ev.target.result;
      img.style.display = 'block';
    }
    reader.readAsDataURL(file);
  }
});

// SAVE BLOG - FIXED
document.getElementById('blogForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  const image = document.getElementById('imagePreview')?.src || '';

  let blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
  blogs.unshift({ title, content, image, date: new Date().toLocaleString() });
  localStorage.setItem('blogs', JSON.stringify(blogs));

  alert('Blog Published!');
  window.location.href = 'index.html';
});

// SHOW BLOGS ON HOMEPAGE
function displayBlogs(){
  const container = document.getElementById('blogContainer');
  if(!container) return;
  const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
  if(blogs.length === 0){
    container.innerHTML = '<p>No blogs yet. Create one in Admin.</p>';
    return;
  }
  container.innerHTML = blogs.map(b => `
    <div style="border:1px solid #ddd; padding:15px; margin:15px 0; border-radius:12px; background:white;">
      <h2>${b.title}</h2>
      <small>${b.date}</small><br><br>
      ${b.image && b.image.startsWith('data:')? `<img src="${b.image}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px;">`:''}
      <p>${b.content}</p>
    </div>
  `).join('');
}
displayBlogs();
