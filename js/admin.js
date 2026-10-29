import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const postsRef = ref(db, 'posts');
let allPosts = [];

const encodeBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
const decodeBase64 = (str) => decodeURIComponent(escape(atob(str)));

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('admin-login-box').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadLogs();
  } else {
    document.getElementById('admin-login-box').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  }
});

document.getElementById('form-login').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Lỗi đăng nhập: " + err.message));
});

document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

onValue(postsRef, (snapshot) => {
  const data = snapshot.val();
  allPosts = [];
  if (data) {
    Object.keys(data).forEach(key => allPosts.push({ id: key, ...data[key] }));
  }
  renderAdminTable();
});

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';
  allPosts.forEach(item => {
    tbody.innerHTML += `
      <tr class="hover:bg-slate-900/50">
        <td class="p-3"><img src="${item.image}" class="w-10 h-10 object-cover rounded border border-cyan-500/30" /></td>
        <td class="p-3 font-semibold text-white">${item.title}</td>
        <td class="p-3 uppercase text-xs font-bold text-cyan-400">/${item.category}</td>
        <td class="p-3 space-x-2">
          <button onclick="editPost('${item.id}')" class="cyber-btn px-2.5 py-1 rounded text-xs">Sửa</button>
          <button onclick="deletePost('${item.id}')" class="cyber-btn cyber-btn-pink px-2.5 py-1 rounded text-xs">Xóa</button>
        </td>
      </tr>
    `;
  });
}

document.getElementById('form-post').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('post-id').value;
  const title = document.getElementById('post-title').value;
  const category = document.getElementById('post-category').value;
  const image = document.getElementById('post-image').value;
  const rawLink = document.getElementById('post-download-link').value;
  const content = document.getElementById('post-content').value;

  const downloadEnc = rawLink ? encodeBase64(rawLink) : "";

  if (id) {
    set(ref(db, 'posts/' + id), { title, category, image, downloadEnc, content, date: new Date().toLocaleDateString('vi-VN') })
      .then(() => { alert("Cập nhật thành công!"); resetForm(); });
  } else {
    const newRef = push(postsRef);
    set(newRef, { title, category, image, downloadEnc, content, downloads: 0, date: new Date().toLocaleDateString('vi-VN') })
      .then(() => { alert("Đăng bài thành công!"); resetForm(); });
  }
});

window.editPost = function(id) {
  const item = allPosts.find(p => p.id === id);
  if (item) {
    document.getElementById('post-id').value = item.id;
    document.getElementById('post-title').value = item.title;
    document.getElementById('post-category').value = item.category;
    document.getElementById('post-image').value = item.image;
    document.getElementById('post-download-link').value = item.downloadEnc ? decodeBase64(item.downloadEnc) : "";
    document.getElementById('post-content').value = item.content;

    document.getElementById('form-title').innerText = "Chỉnh Sửa Bài Viết / Game";
    document.getElementById('btn-save').innerText = "Lưu Thay Đổi";
    document.getElementById('btn-cancel').classList.remove('hidden');
  }
};

document.getElementById('btn-cancel').addEventListener('click', resetForm);

function resetForm() {
  document.getElementById('post-id').value = '';
  document.getElementById('form-post').reset();
  document.getElementById('form-title').innerText = "Thêm Bài Viết / Game Mới";
  document.getElementById('btn-save').innerText = "Đăng Lên Hệ Thống";
  document.getElementById('btn-cancel').classList.add('hidden');
}

window.deletePost = function(id) {
  if (confirm('Xóa bài viết này khỏi hệ thống?')) remove(ref(db, 'posts/' + id));
};

function loadLogs() {
  onValue(ref(db, 'access_logs'), (snapshot) => {
    const tbody = document.getElementById('logs-table-body');
    tbody.innerHTML = '';
    const data = snapshot.val();
    if (data) {
      Object.values(data).reverse().slice(0, 50).forEach(log => {
        tbody.innerHTML += `
          <tr>
            <td class="p-2.5 text-cyan-400">${log.timestamp}</td>
            <td class="p-2.5 font-bold">${log.device}</td>
            <td class="p-2.5 text-pink-400">${log.path}</td>
            <td class="p-2.5 truncate max-w-xs text-slate-400">${log.userAgent}</td>
          </tr>
        `;
      });
    }
  });
}

document.getElementById('btn-clear-logs').addEventListener('click', () => {
  if(confirm('Xóa sạch nhật ký truy cập?')) remove(ref(db, 'access_logs'));
});
