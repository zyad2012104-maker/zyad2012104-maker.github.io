// البيانات المخزنة
let apps = [], users = [], comments = [], currentUser = null, selectedRating = 0, currentAppId = null, pendingDownloadApp = null;

// تحميل البيانات
function loadData() {
    apps = JSON.parse(localStorage.getItem('apps') || '[]');
    users = JSON.parse(localStorage.getItem('users') || '[]');
    comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    if (!apps.length) {
        apps = [
            {id:1, name:"تطبيق التواصل الاجتماعي", description:"تطبيق رائع للتواصل", version:"2.0.1", category:"social", deviceType:"both", size:"45 MB", image:"https://via.placeholder.com/300x200/667eea/ffffff?text=AppNova", downloadLink:"#", downloads:1250, rating:4.5, ratings:[5,4,5,4,5]},
            {id:2, name:"لعبة الألغاز", description:"لعبة ألغاز ممتعة", version:"1.5.0", category:"games", deviceType:"android", size:"78 MB", image:"https://via.placeholder.com/300x200/764ba2/ffffff?text=AppNova", downloadLink:"#", downloads:890, rating:4.2, ratings:[4,5,4,4,4]},
            {id:3, name:"تطبيق التعليم", description:"منصة تعليمية متكاملة", version:"3.0.0", category:"education", deviceType:"both", size:"120 MB", image:"https://via.placeholder.com/300x200/48c6ef/ffffff?text=AppNova", downloadLink:"#", downloads:2340, rating:4.8, ratings:[5,5,4,5,5]}
        ];
        saveApps();
    }
    
    if (!users.find(u => u.role === 'admin')) {
        users.push({id:1, username:"المدير", email:"admin", password:"admin2012", role:"admin"});
        saveUsers();
    }
}

function saveApps() { localStorage.setItem('apps', JSON.stringify(apps)); }
function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
function saveComments() { localStorage.setItem('comments', JSON.stringify(comments)); }

// عرض الصفحات
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`${pageName}Page`);
    if (target) target.classList.add('active');
    if (pageName === 'home') displayHomeContent();
    else if (pageName === 'apps') displayAllApps();
    else if (pageName === 'admin') displayAdminPanel();
    updateNavBar();
}

function checkUploadAccess() {
    currentUser ? showPage('upload') : (showAlert('يرجى تسجيل الدخول أولاً', 'error'), showPage('login'));
}

function displayHomeContent() {
    displayAppsGrid([...apps].reverse().slice(0,6), 'latestApps');
    displayAppsGrid([...apps].sort((a,b)=>b.downloads-a.downloads).slice(0,6), 'mostDownloadedApps');
    displayAppsGrid([...apps].sort((a,b)=>b.rating-a.rating).slice(0,6), 'topRatedApps');
}

function displayAppsGrid(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = list.length ? list.map(app => createAppCard(app)).join('') : '<p class="loading-skeleton">لا توجد تطبيقات</p>';
}

function createAppCard(app) {
    const stars = '★'.repeat(Math.floor(app.rating)) + '☆'.repeat(5 - Math.floor(app.rating));
    return `
        <div class="app-card" onclick="showRatingModal(${app.id})">
            <img src="${app.image}" alt="${app.name}" class="app-card-image" onerror="this.src='https://via.placeholder.com/300x200/cccccc/ffffff?text=No+Image'">
            <div class="app-card-content">
                <h3 class="app-card-title">${escapeHtml(app.name)}</h3>
                <p class="app-card-description">${escapeHtml(app.description.substring(0,80))}${app.description.length>80?'...':''}</p>
                <div class="app-card-meta">
                    <span><i class="fas fa-download"></i> ${app.downloads}</span>
                    <span><i class="fas fa-hdd"></i> ${app.size}</span>
                    <span><i class="fas fa-code-branch"></i> ${app.version}</span>
                </div>
                <div class="app-card-meta">
                    <span class="app-card-rating">${stars} (${app.rating.toFixed(1)})</span>
                    <span><i class="fas fa-tag"></i> ${getCategoryName(app.category)}</span>
                </div>
                <a href="#" class="app-card-download" onclick="event.stopPropagation(); requestDownload(${app.id})"><i class="fas fa-download"></i> تحميل</a>
            </div>
        </div>`;
}

function requestDownload(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const hasRated = comments.find(c => c.appId === appId && c.userId === (currentUser ? currentUser.id : null));
    hasRated ? showDownloadConfirm(app) : (pendingDownloadApp = app, showRatingModal(appId), showAlert('يرجى تقييم التطبيق قبل التحميل', 'info'));
}

function showDownloadConfirm(app) {
    document.getElementById('downloadAppInfo').innerHTML = `<h4>${escapeHtml(app.name)}</h4><p>الإصدار: ${app.version} | الحجم: ${app.size}</p>`;
    pendingDownloadApp = app;
    document.getElementById('downloadModal').style.display = 'block';
}

function confirmDownload() {
    if (pendingDownloadApp) {
        pendingDownloadApp.downloads++;
        saveApps();
        window.open(pendingDownloadApp.downloadLink, '_blank');
        closeDownloadModal();
        showAlert('جاري التحميل...', 'success');
        displayHomeContent();
        displayAllApps();
    }
}

function closeDownloadModal() { document.getElementById('downloadModal').style.display = 'none'; pendingDownloadApp = null; }

function searchApps() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    const container = document.getElementById('allApps');
    if (!container) return;
    if (!term) return displayAllApps();
    const filtered = apps.filter(a => a.name.toLowerCase().includes(term) || a.description.toLowerCase().includes(term));
    container.innerHTML = filtered.length ? filtered.map(a => createAppCard(a)).join('') : '<p class="loading-skeleton">لا توجد نتائج</p>';
}

function displayAllApps() {
    const container = document.getElementById('allApps');
    if (container) container.innerHTML = apps.map(a => createAppCard(a)).join('');
}

function filterApps(category) {
    const container = document.getElementById('allApps');
    if (!container) return;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (event?.target) event.target.classList.add('active');
    const filtered = category === 'all' ? apps : apps.filter(a => a.category === category);
    container.innerHTML = filtered.length ? filtered.map(a => createAppCard(a)).join('') : '<p class="loading-skeleton">لا توجد تطبيقات</p>';
}

function showRatingModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    currentAppId = appId;
    selectedRating = 0;
    document.getElementById('modalAppInfo').innerHTML = `<h4>${escapeHtml(app.name)}</h4><p>${escapeHtml(app.description.substring(0,100))}</p>`;
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    document.getElementById('commentText').value = '';
    document.getElementById('ratingModal').style.display = 'block';
}

function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.star').forEach((s, i) => i < rating ? s.classList.add('active') : s.classList.remove('active'));
}

function submitRating() {
    if (!selectedRating) return showAlert('يرجى اختيار التقييم', 'error');
    const comment = document.getElementById('commentText').value.trim();
    if (!comment) return showAlert('يرجى إضافة تعليق', 'error');
    const app = apps.find(a => a.id === currentAppId);
    if (app) {
        app.ratings.push(selectedRating);
        app.rating = app.ratings.reduce((s, r) => s + r, 0) / app.ratings.length;
        comments.push({id:Date.now(), appId:currentAppId, userId:currentUser?.id || null, username:currentUser?.username || 'زائر', comment, rating:selectedRating, date:new Date().toISOString()});
        saveApps();
        saveComments();
        showAlert('تم إضافة التقييم', 'success');
        closeModal();
        displayHomeContent();
        if (document.getElementById('appsPage').classList.contains('active')) displayAllApps();
        if (pendingDownloadApp?.id === currentAppId) showDownloadConfirm(pendingDownloadApp);
    }
}

function closeModal() {
    document.getElementById('ratingModal').style.display = 'none';
    document.getElementById('commentText').value = '';
    selectedRating = 0;
}

function uploadApp(e) {
    e.preventDefault();
    if (!currentUser) return showAlert('يرجى تسجيل الدخول', 'error'), showPage('login'), false;
    apps.push({id:Date.now(), name:document.getElementById('appName').value.trim(), description:document.getElementById('appDescription').value.trim(), version:document.getElementById('appVersion').value.trim(), category:document.getElementById('appCategory').value, deviceType:document.getElementById('appDeviceType').value, size:document.getElementById('appSize').value.trim(), image:document.getElementById('appImage').value || 'https://via.placeholder.com/300x200/cccccc/ffffff?text=No+Image', downloadLink:document.getElementById('appDownloadLink').value, downloads:0, rating:0, ratings:[], userId:currentUser.id, userName:currentUser.username, date:new Date().toISOString()});
    saveApps();
    showAlert('تم رفع التطبيق', 'success');
    document.getElementById('uploadForm').reset();
    showPage('apps');
    return false;
}

function login(e) {
    e.preventDefault();
    const input = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    if (input === "admin" && pass === "admin2012") {
        currentUser = {id:1, username:"المدير", email:"admin", password:"admin2012", role:"admin"};
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showAlert('مرحباً المدير', 'success');
        updateNavBar();
        showPage('admin');
        return false;
    }
    const user = users.find(u => (u.email === input || u.username === input) && u.password === pass);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAlert(`مرحباً ${user.username}`, 'success');
        updateNavBar();
        showPage(user.role === 'admin' ? 'admin' : 'home');
    } else showAlert('بيانات غير صحيحة', 'error');
    return false;
}

function register(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    if (username.length < 3) return showAlert('اسم المستخدم 3 أحرف على الأقل', 'error');
    if (email === "admin") return showAlert('لا يمكن استخدام هذا الاسم', 'error');
    if (pass.length < 6) return showAlert('كلمة المرور 6 أحرف على الأقل', 'error');
    if (pass !== confirm) return showAlert('كلمة المرور غير متطابقة', 'error');
    if (users.find(u => u.email === email)) return showAlert('البريد مستخدم', 'error');
    users.push({id:Date.now(), username, email, password:pass, role:'user', date:new Date().toISOString()});
    saveUsers();
    showAlert('تم إنشاء الحساب', 'success');
    showPage('login');
    return false;
}

function updateNavBar() {
    const loginNav = document.getElementById('loginNav');
    const adminNav = document.getElementById('adminNav');
    const userInfo = document.getElementById('userInfo');
    const uploadNav = document.getElementById('uploadNav');
    if (currentUser) {
        loginNav.style.display = 'none';
        userInfo.style.display = 'block';
        uploadNav.style.display = 'block';
        userInfo.innerHTML = `<span style="color:#667eea"><i class="fas ${currentUser.role === 'admin' ? 'fa-user-shield' : 'fa-user'}"></i> ${escapeHtml(currentUser.username)} <a href="#" onclick="logout()" style="color:#f44336;margin-right:10px"><i class="fas fa-sign-out-alt"></i> خروج</a></span>`;
        adminNav.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    } else {
        loginNav.style.display = 'block';
        userInfo.style.display = 'none';
        adminNav.style.display = 'none';
        uploadNav.style.display = 'block';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAlert('تم تسجيل الخروج', 'info');
    updateNavBar();
    showPage('home');
}

function displayAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') return showAlert('غير مصرح', 'error'), showPage('home');
    document.getElementById('usersList').innerHTML = users.filter(u => u.role !== 'admin').map(u => `<div class="admin-item"><div><strong>${escapeHtml(u.username)}</strong><br><small>${escapeHtml(u.email)}</small></div><div class="admin-actions"><button class="delete-btn" onclick="deleteUser(${u.id})">حذف</button></div></div>`).join('');
    document.getElementById('appsList').innerHTML = apps.map(a => `<div class="admin-item"><div><strong>${escapeHtml(a.name)}</strong><br><small>${escapeHtml(a.description.substring(0,50))}...</small></div><div class="admin-actions"><button class="edit-btn" onclick="editApp(${a.id})">تعديل</button><button class="delete-btn" onclick="deleteApp(${a.id})">حذف</button></div></div>`).join('');
    document.getElementById('commentsList').innerHTML = comments.map(c => `<div class="admin-item"><div><strong>${escapeHtml(c.username)}</strong><br><small>${escapeHtml(c.comment)}</small></div><div class="admin-actions"><button class="delete-btn" onclick="deleteComment(${c.id})">حذف</button></div></div>`).join('');
}

function deleteUser(id) { if(confirm('تأكيد؟')){ users = users.filter(u=>u.id!==id); saveUsers(); displayAdminPanel(); showAlert('تم الحذف','success'); } }
function deleteApp(id) { if(confirm('تأكيد؟')){ apps = apps.filter(a=>a.id!==id); saveApps(); displayAdminPanel(); displayHomeContent(); showAlert('تم الحذف','success'); } }
function deleteComment(id) { if(confirm('تأكيد؟')){ comments = comments.filter(c=>c.id!==id); saveComments(); displayAdminPanel(); showAlert('تم الحذف','success'); } }
function editApp(id) { const app = apps.find(a=>a.id===id); if(!app) return; const newName=prompt('الاسم الجديد:',app.name); if(newName?.trim()) app.name=newName.trim(); const newDesc=prompt('الوصف الجديد:',app.description); if(newDesc?.trim()) app.description=newDesc.trim(); saveApps(); displayAdminPanel(); displayHomeContent(); showAlert('تم التعديل','success'); }
function saveAdminChanges() { saveApps(); saveUsers(); saveComments(); showAlert('تم الحفظ','success'); }
function sendContactMessage(e) { e.preventDefault(); showAlert('تم الإرسال','success'); document.getElementById('contactForm').reset(); return false; }
function subscribeNewsletter() { const email=document.querySelector('#newsletterEmailFooter').value; email?.includes('@')? (showAlert('تم الاشتراك','success'), document.querySelector('#newsletterEmailFooter').value='') : showAlert('بريد صحيح','error'); }
function escapeHtml(t) { return t; }
function getCategoryName(c) { const n={games:'ألعاب',social:'تواصل',education:'تعليم',productivity:'إنتاجية',entertainment:'ترفيه'}; return n[c]||c; }
function showAlert(m,t) { const d=document.createElement('div'); d.className=`alert alert-${t}`; d.innerHTML=`<i class="fas ${t==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i> ${m}`; document.body.appendChild(d); setTimeout(()=>{ d.style.animation='slideOut 0.3s'; setTimeout(()=>d.remove(),300); },3000); }
function loadCurrentUser() { const u=localStorage.getItem('currentUser'); if(u){ currentUser=JSON.parse(u); if(currentUser.role==='admin' && currentUser.email!=="admin") logout(); else updateNavBar(); } }
function init() { loadData(); loadCurrentUser(); displayHomeContent(); updateNavBar(); window.onclick=e=>{ if(e.target===document.getElementById('ratingModal')) closeModal(); if(e.target===document.getElementById('downloadModal')) closeDownloadModal(); }; }
init();