// common.js - الملف الرئيسي الكامل والمحدث

// ========== المتغيرات العامة ==========
let apps = [];
let users = [];
let comments = [];
let categories = [];
let currentUser = null;
let selectedRating = 0;
let currentAppId = null;
let pendingDownloadApp = null;
let jsonbinReady = false;

// إعدادات الإعلانات
let adSettings = {
    topBanner: '',
    bottomBanner: '',
    leftSidebar: '',
    rightSidebar: '',
    clickAd: ''
};

// التصنيفات الافتراضية
const defaultCategories = [
    { id: 1, name: 'ألعاب', icon: '🎮', key: 'games' },
    { id: 2, name: 'تواصل اجتماعي', icon: '💬', key: 'social' },
    { id: 3, name: 'تعليم', icon: '📚', key: 'education' },
    { id: 4, name: 'إنتاجية', icon: '💼', key: 'productivity' },
    { id: 5, name: 'ترفيه', icon: '🎬', key: 'entertainment' }
];

// بيانات JSONBin
const BIN_ID = '69c13f81b7ec241ddc956318';
const MASTER_KEY = '$2a$10$5X1fbgOhCiGV23rKGUkLLuhD/a1eIHNuKwvtNzKwu3W7KT8CGpaG.';
const BASE_URL = 'https://api.jsonbin.io/v3/b/';

// التحقق من وضع التشغيل
const isLocalhost = window.location.protocol === 'file:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

console.log(`🔧 وضع التشغيل: ${isLocalhost ? 'محلي (Local)' : 'خادم (Server)'}`);

// ========== إنشاء بيانات افتراضية فورية ==========
function createImmediateDemoData() {
    console.log('🔄 إنشاء بيانات افتراضية فورية...');
    
    // إنشاء تطبيقات تجريبية
    apps = [
        {
            id: 1,
            name: "تطبيق التواصل الاجتماعي - NovaSocial",
            description: "تطبيق رائع للتواصل مع الأصدقاء ومشاركة الصور والفيديوهات.",
            version: "2.0.1",
            category: "social",
            deviceType: "both",
            size: "45 MB",
            image: "https://placehold.co/400x200/667eea/white?text=NovaSocial",
            icon: "https://placehold.co/120x120/667eea/white?text=NS",
            gallery: [
                "https://placehold.co/800x400/667eea/white?text=صورة+1",
                "https://placehold.co/800x400/764ba2/white?text=صورة+2"
            ],
            downloadLink: "#",
            downloads: 1250,
            rating: 4.5,
            ratings: [5, 4, 5, 4, 5],
            userId: 1,
            userName: "admin",
            date: new Date().toISOString(),
            developer: "NovaTech"
        },
        {
            id: 2,
            name: "لعبة الألغاز - Puzzle Master",
            description: "لعبة ألغاز ممتعة مع مستويات متعددة.",
            version: "1.5.0",
            category: "games",
            deviceType: "android",
            size: "78 MB",
            image: "https://placehold.co/400x200/764ba2/white?text=Puzzle+Master",
            icon: "https://placehold.co/120x120/764ba2/white?text=PM",
            gallery: [
                "https://placehold.co/800x400/764ba2/white?text=مستوى+1",
                "https://placehold.co/800x400/667eea/white?text=مستوى+2"
            ],
            downloadLink: "#",
            downloads: 890,
            rating: 4.2,
            ratings: [4, 5, 4, 4, 4],
            userId: 1,
            userName: "admin",
            date: new Date().toISOString(),
            developer: "Puzzle Games"
        },
        {
            id: 3,
            name: "تطبيق التعليم - EduSmart",
            description: "منصة تعليمية متكاملة للطلاب.",
            version: "3.0.0",
            category: "education",
            deviceType: "both",
            size: "120 MB",
            image: "https://placehold.co/400x200/48c6ef/white?text=EduSmart",
            icon: "https://placehold.co/120x120/48c6ef/white?text=ES",
            gallery: [
                "https://placehold.co/800x400/48c6ef/white?text=الرئيسية",
                "https://placehold.co/800x400/667eea/white?text=الدروس"
            ],
            downloadLink: "#",
            downloads: 2340,
            rating: 4.8,
            ratings: [5, 5, 4, 5, 5],
            userId: 1,
            userName: "admin",
            date: new Date().toISOString(),
            developer: "EduTech"
        }
    ];
    
    // إنشاء مستخدم admin - username = "admin" و email = "admin"
    users = [
        {
            id: 1,
            username: "admin",
            email: "admin",
            password: "admin2012",
            role: "admin",
            date: new Date().toISOString()
        }
    ];
    
    // إنشاء تعليقات
    comments = [
        {
            id: 1001,
            appId: 1,
            userId: 1,
            username: "admin",
            comment: "تطبيق رائع جداً!",
            rating: 5,
            date: new Date().toISOString()
        }
    ];
    
    categories = defaultCategories;
    
    saveToLocalStorage();
    console.log('✅ تم إنشاء البيانات الافتراضية بنجاح');
    console.log('👥 بيانات الدخول:');
    console.log('   اسم المستخدم: admin');
    console.log('   كلمة المرور: admin2012');
}

// ========== تحميل البيانات ==========
async function loadData() {
    console.log('🔄 جاري تحميل البيانات...');
    
    // أولاً: محاولة تحميل من localStorage
    loadFromLocalStorage();
    
    // إذا كانت البيانات موجودة في localStorage، استخدمها
    if (apps.length > 0 && users.length > 0) {
        console.log('✅ تم تحميل البيانات من localStorage');
        jsonbinReady = true;
        return;
    }
    
    // إذا لم تكن هناك بيانات، حاول جلبها من JSONBin
    if (!isLocalhost) {
        try {
            console.log('📡 محاولة جلب البيانات من JSONBin...');
            const response = await fetch(`${BASE_URL}${BIN_ID}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': MASTER_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.record && data.record.apps && data.record.apps.length > 0) {
                    apps = data.record.apps;
                    users = data.record.users || [];
                    comments = data.record.comments || [];
                    categories = data.record.categories || defaultCategories;
                    adSettings = data.record.adSettings || adSettings;
                    console.log('✅ تم تحميل البيانات من JSONBin');
                    saveToLocalStorage();
                    jsonbinReady = true;
                    return;
                }
            }
        } catch (error) {
            console.log('⚠️ فشل تحميل من JSONBin:', error);
        }
    }
    
    // إذا لم تنجح أي محاولة، أنشئ بيانات افتراضية
    console.log('⚠️ لا توجد بيانات، إنشاء بيانات افتراضية');
    createImmediateDemoData();
    jsonbinReady = true;
}

function saveToLocalStorage() {
    localStorage.setItem('apps_data', JSON.stringify(apps));
    localStorage.setItem('users_data', JSON.stringify(users));
    localStorage.setItem('comments_data', JSON.stringify(comments));
    localStorage.setItem('categories_data', JSON.stringify(categories));
    localStorage.setItem('adSettings', JSON.stringify(adSettings));
    console.log('💾 تم حفظ البيانات في localStorage');
}

function loadFromLocalStorage() {
    console.log('📦 تحميل البيانات من localStorage...');
    
    const savedApps = localStorage.getItem('apps_data');
    const savedUsers = localStorage.getItem('users_data');
    const savedComments = localStorage.getItem('comments_data');
    const savedCategories = localStorage.getItem('categories_data');
    const savedAdSettings = localStorage.getItem('adSettings');
    
    if (savedApps) {
        apps = JSON.parse(savedApps);
        console.log(`📱 تم تحميل ${apps.length} تطبيق من localStorage`);
    }
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        console.log(`👥 تم تحميل ${users.length} مستخدم`);
    }
    if (savedComments) {
        comments = JSON.parse(savedComments);
        console.log(`💬 تم تحميل ${comments.length} تعليق`);
    }
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
        console.log(`🏷️ تم تحميل ${categories.length} تصنيف`);
    }
    if (savedAdSettings) {
        adSettings = JSON.parse(savedAdSettings);
        console.log(`📢 تم تحميل إعدادات الإعلانات`);
    }
}

// ========== دوال التحقق ==========
function isAdmin(user) {
    return user && user.role === 'admin';
}

function isModerator(user) {
    return user && user.role === 'moderator';
}

function hasPermission(user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'moderator' && user.permissions && user.permissions[permission]) return true;
    return false;
}

// ========== دوال التصنيفات ==========
function getCategoryIcon(key) {
    const cat = categories.find(c => c.key === key);
    return cat ? cat.icon : '📱';
}

function getCategoryName(key) {
    const cat = categories.find(c => c.key === key);
    return cat ? cat.name : key;
}

// ========== دوال حفظ البيانات ==========
async function saveApps() { saveToLocalStorage(); }
async function saveUsers() { saveToLocalStorage(); }
async function saveComments() { saveToLocalStorage(); }
async function saveCategories() { saveToLocalStorage(); }
async function saveAdSettings() { saveToLocalStorage(); }

// ========== دوال مساعدة ==========
function showAlert(message, type) {
    let div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.innerHTML = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.animation = 'slideOut 0.3s';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

function updateNavBar() {
    let loginNav = document.getElementById('loginNav');
    let adminNav = document.getElementById('adminNav');
    let moderatorNav = document.getElementById('moderatorNav');
    let userInfo = document.getElementById('userInfo');
    let uploadNav = document.getElementById('uploadNav');
    
    let storedUser = localStorage.getItem('currentUser');
    if(storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch(e) {
            currentUser = null;
        }
    }
    
    if(currentUser) {
        if(loginNav) loginNav.style.display = 'none';
        if(userInfo) {
            userInfo.style.display = 'block';
            let roleIcon = currentUser.role === 'admin' ? '👑' : (currentUser.role === 'moderator' ? '🛡️' : '👤');
            let roleName = currentUser.role === 'admin' ? 'مدير' : (currentUser.role === 'moderator' ? 'مشرف' : 'مستخدم');
            userInfo.innerHTML = `<span style="display:flex; align-items:center; gap:12px; background:#f0f4ff; padding:8px 16px; border-radius:50px;">${roleIcon} ${escapeHtml(currentUser.username)} (${roleName}) <a href="#" onclick="logout()" style="color:#f44336; text-decoration:none;">🚪 خروج</a></span>`;
        }
        if(adminNav) adminNav.style.display = (currentUser.role === 'admin') ? 'block' : 'none';
        if(moderatorNav) moderatorNav.style.display = (currentUser.role === 'moderator') ? 'block' : 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    } else {
        if(loginNav) loginNav.style.display = 'block';
        if(userInfo) userInfo.style.display = 'none';
        if(adminNav) adminNav.style.display = 'none';
        if(moderatorNav) moderatorNav.style.display = 'none';
        if(uploadNav) uploadNav.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAlert('تم تسجيل الخروج بنجاح', 'info');
    window.location.href = 'index.html';
}

function escapeHtml(text) {
    if(!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

// ========== دوال التطبيقات الأساسية ==========
function openAppDetail(appId) {
    window.location.href = `app-detail.html?id=${appId}`;
}

async function downloadApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) {
        showAlert('التطبيق غير موجود', 'error');
        return;
    }
    
    showClickAd(async () => {
        app.downloads++;
        await saveApps();
        
        if (app.downloadLink && app.downloadLink !== '#') {
            window.open(app.downloadLink, '_blank');
            showAlert('📥 جاري التحميل...', 'success');
        } else {
            showAlert('❌ رابط التحميل غير متوفر', 'error');
        }
    });
}

function createAppCard(app) {
    let fullStars = Math.floor(app.rating);
    let emptyStars = 5 - fullStars;
    let stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
    
    const appImage = app.image && app.image.startsWith('http') ? app.image : 'https://placehold.co/300x180/667eea/white?text=' + encodeURIComponent(app.name);
    
    return `<div class="app-card">
        <div onclick="openAppDetail(${app.id})" style="cursor: pointer;">
            <img src="${appImage}" class="app-card-image" onerror="this.src='https://placehold.co/300x180/cccccc/white?text=No+Image'">
            <div class="app-card-content">
                <div class="app-card-title">${escapeHtml(app.name)}</div>
                <div class="app-card-description">${escapeHtml(app.description.substring(0,80))}${app.description.length>80?'...':''}</div>
                <div class="app-card-meta">
                    <span>📥 ${app.downloads}</span>
                    <span>💾 ${app.size}</span>
                    <span>📱 ${app.version}</span>
                </div>
                <div class="app-card-meta">
                    <span class="app-card-rating">${stars} (${app.rating.toFixed(1)})</span>
                    <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                </div>
            </div>
        </div>
        <div class="app-card-download" onclick="event.stopPropagation(); openAppDetail(${app.id})">📱 تفاصيل التطبيق</div>
    </div>`;
}

function subscribeNewsletter() {
    let email = document.querySelector('#newsletterEmail')?.value;
    if(email && email.includes('@')) {
        showAlert('تم الاشتراك في النشرة البريدية بنجاح', 'success');
        document.querySelector('#newsletterEmail').value = '';
    } else {
        showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
    }
}

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}

// ========== دوال الإعلانات ==========
function renderAds() {
    const topAd = document.getElementById('topAdContainer');
    const bottomAd = document.getElementById('bottomAdContainer');
    const leftAd = document.getElementById('leftAdContainer');
    const rightAd = document.getElementById('rightAdContainer');
    
    if (topAd && adSettings.topBanner) topAd.innerHTML = adSettings.topBanner;
    if (bottomAd && adSettings.bottomBanner) bottomAd.innerHTML = adSettings.bottomBanner;
    if (leftAd && adSettings.leftSidebar) leftAd.innerHTML = adSettings.leftSidebar;
    if (rightAd && adSettings.rightSidebar) rightAd.innerHTML = adSettings.rightSidebar;
}

function executeAdScripts(container) {
    if (!container) return;
    const scripts = container.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        const script = document.createElement('script');
        const oldScript = scripts[i];
        for (let j = 0; j < oldScript.attributes.length; j++) {
            script.setAttribute(oldScript.attributes[j].name, oldScript.attributes[j].value);
        }
        script.text = oldScript.text;
        oldScript.parentNode.replaceChild(script, oldScript);
    }
}

function showClickAd(callback) {
    const modal = document.getElementById('adModal');
    const modalContent = document.getElementById('modalAdContent');
    
    if (modal && adSettings.clickAd && adSettings.clickAd.trim()) {
        modalContent.innerHTML = adSettings.clickAd;
        executeAdScripts(modalContent);
        modal.style.display = 'flex';
        
        if (!modalContent.querySelector('.close-ad-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✓ متابعة التحميل';
            closeBtn.className = 'submit-btn close-ad-btn';
            closeBtn.style.marginTop = '20px';
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                if (callback) callback();
            };
            modalContent.appendChild(closeBtn);
        }
        window.pendingCallback = callback;
    } else {
        if (callback) callback();
    }
}

function closeAdModal() {
    const modal = document.getElementById('adModal');
    if (modal) {
        modal.style.display = 'none';
        if (window.pendingCallback) {
            window.pendingCallback();
            window.pendingCallback = null;
        }
    }
}

// ========== تهيئة الصفحة ==========
let storedUser = localStorage.getItem('currentUser');
if(storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch(e) {
        currentUser = null;
    }
}

(async function init() {
    console.log('🚀 بدء تهيئة AppNova...');
    await loadData();
    updateNavBar();
    renderAds();
    console.log('✅ AppNova جاهز للعمل');
    console.log(`📊 عدد التطبيقات: ${apps.length}`);
    console.log(`👥 عدد المستخدمين: ${users.length}`);
})();