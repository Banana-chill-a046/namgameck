import { db } from "./firebase-config.js";
import { ref, push, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const postsRef = ref(db, 'posts');
let allPosts = [];

const decodeBase64 = (str) => decodeURIComponent(escape(atob(str)));

// Tự động log lượt truy cập
function logVisitorHistory() {
  const logsRef = ref(db, 'access_logs');
  const newLogRef = push(logsRef);
  set(newLogRef, {
    path: window.location.hash || '#/index',
    userAgent: navigator.userAgent,
    timestamp: new Date().toLocaleString('vi-VN'),
    device: /Mobile|Android|iP(hone|od)|Ipad/i.test(navigator.userAgent) ? 'Mobile' : 'PC'
  });
}
logVisitorHistory();

// Tải file bảo mật chống Google Bot quét link trực tiếp
window.safeDownload = function(postId, encodedLink) {
  if(!encodedLink) return alert("Không tìm thấy link tải!");
  const viewsRef = ref(db, `posts/${postId}/downloads`);
  runTransaction(viewsRef, (count) => (count || 0) + 1);
  window.open(decodeBase64(encodedLink), '_blank');
};

function handleRouting() {
  const hash = window.location.hash || '#/index';
  document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active-tab'));

  const targetId = hash.replace('#/', 'view-');
  const navId = hash.replace('#/', 'nav-');

  if (document.getElementById(targetId)) document.getElementById(targetId).classList.remove('hidden');
  else document.getElementById('view-index').classList.remove('hidden');

  if (document.getElementById(navId)) document.getElementById(navId).classList.add('active-tab');
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);

onValue(postsRef, (snapshot) => {
  const data = snapshot.val();
  allPosts = [];
  if (data) {
    Object.keys(data).forEach(key => allPosts.push({ id: key, ...data[key] }));
  }
  renderAllViews();
});

function renderCard(item) {
  return `
    <div class="cyber-glass rounded-xl overflow-hidden flex flex-col justify-between group">
      <div>
        <div class="relative overflow-hidden h-44">
          <img src="${item.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onError="this.src='https://via.placeholder.com/400x200?text=No+Image'"/>
          <div class="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-cyan-500/40 text-[10px] uppercase font-bold text-cyan-400">
            /${item.category}
          </div>
        </div>
        <div class="p-4 space-y-2">
          <div class="flex justify-between items-center text-xs text-slate-400">
            <span><i class="fa-solid fa-calendar mr-1"></i>${item.date || 'N/A'}</span>
            <span><i class="fa-solid fa-download mr-1"></i>${item.downloads || 0} lượt</span>
          </div>
          <h3 class="font-bold text-lg text-white line-clamp-1 group-hover:text-cyan-400 transition">${item.title}</h3>
          <p class="text-slate-400 text-sm line-clamp-3">${item.content}</p>
        </div>
      </div>
      <div class="p-4 pt-0">
        ${item.downloadEnc ? `
          <button onclick="safeDownload('${item.id}', '${item.downloadEnc}')" class="cyber-btn w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
            <i class="fa-solid fa-cloud-arrow-down"></i> Tải Xuống Ngay
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderAllViews() {
  ['index-latest-list', 'list-post', 'list-game', 'list-blog', 'list-support'].forEach(id => {
    if(document.getElementById(id)) document.getElementById(id).innerHTML = '';
  });

  [...allPosts].reverse().slice(0, 6).forEach(item => {
    document.getElementById('index-latest-list').innerHTML += renderCard(item);
  });

  allPosts.forEach(item => {
    if (document.getElementById(`list-${item.category}`)) {
      document.getElementById(`list-${item.category}`).innerHTML += renderCard(item);
    }
  });
}
