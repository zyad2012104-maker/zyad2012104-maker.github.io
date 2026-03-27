// upload.js - رفع وتعديل التطبيقات

// ========== التصنيفات ==========
let categories = [
    { key: 'games', name: 'ألعاب', icon: '🎮' },
    { key: 'social', name: 'تواصل اجتماعي', icon: '💬' },
    { key: 'education', name: 'تعليم', icon: '📚' },
    { key: 'productivity', name: 'إنتاجية', icon: '💼' },
    { key: 'entertainment', name: 'ترفيه', icon: '🎬' }
];

function loadCategoriesForSelect() {
    let select = document.getElementById('appCategory');
    if (!select) return;
    select.innerHTML = '<option value="">اختر التصنيف</option>';
    categories.forEach(cat => {
        let option = document.createElement('option');
        option.value = cat.key;
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
    });
    console.log('✅ تم تحميل التصنيفات');
}

// ========== المعرض ==========
function getGalleryImages() {
    let images = [];
    for (let i = 1; i <= 3; i++) {
        let el = document.getElementById('galleryImage' + i);
        if (el && el.value.trim() !== '') images.push(el.value.trim());
    }
    return images;
}

function setGalleryImages(gallery) {
    if (!Array.isArray(gallery)) return;
    gallery.forEach((img, i) => {
        let input = document.getElementById(`galleryImage${i+1}`);
        if (input) input.value = img;
    });
}

// ========== معاينة الصور ==========
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            preview.innerHTML = `
                <div class="preview-item">
                    <img src="${url}" onerror="this.src='https://placehold.co/100x100/ef4444/white?text=خطأ'">
                    <button class="remove-image" onclick="clearImage('${inputId}', '${previewId}')">×</button>
                </div>
            `;
        } else if (url) {
            preview.innerHTML = `<div class="preview-item" style="background:#fee2e2; display:flex; align-items:center; justify-content:center; color:#ef4444;">رابط غير صالح</div>`;
        } else {
            preview.innerHTML = '';
        }
    });
}

function clearImage(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
}

// ========== فتح الصفحة ==========
async function initPage() {
    // انتظار تحميل البيانات من common.js
    if (!jsonbinReady) {
        await new Promise(resolve => {
            const checkReady = setInterval(() => {
                if (jsonbinReady) {
                    clearInterval(checkReady);
                    resolve();
                }
            }, 100);
        });
    }
    
    loadCategoriesForSelect();
    
    // تفعيل معاينة الصور
    previewImage('appImage', 'mainImagePreview');
    previewImage('galleryImage1', 'preview1');
    previewImage('galleryImage2', 'preview2');
    previewImage('galleryImage3', 'preview3');

    let urlParams = new URLSearchParams(window.location.search);
    let editId = urlParams.get('edit');
    if (editId) {
        let app = apps.find(a => a.id == editId);
        if (app) {
            document.getElementById('appId').value = app.id;
            document.getElementById('appName').value = app.name;
            document.getElementById('appDescription').value = app.description;
            document.getElementById('appVersion').value = app.version;
            document.getElementById('appDeviceType').value = app.deviceType;
            document.getElementById('appSize').value = app.size;
            document.getElementById('appImage').value = app.image;
            document.getElementById('appDownloadLink').value = app.downloadLink;
            document.getElementById('appDeveloper').value = app.developer || '';
            
            setGalleryImages(app.gallery);

            setTimeout(() => {
                document.getElementById('appCategory').value = app.category;
            }, 100);

            document.getElementById('submitBtn').innerText = '💾 حفظ التغييرات';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            document.getElementById('pageTitle').innerHTML = '✏️ تعديل تطبيق';
            document.getElementById('pageDesc').innerHTML = 'قم بتعديل بيانات التطبيق';
        }
    }
}

// ========== حفظ/رفع التطبيق ==========
async function saveApp() {
    let appId = document.getElementById('appId').value;
    let isEdit = appId && appId !== '';

    let appData = {
        id: isEdit ? parseInt(appId) : Date.now(),
        name: document.getElementById('appName').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
        version: document.getElementById('appVersion').value.trim(),
        category: document.getElementById('appCategory').value,
        deviceType: document.getElementById('appDeviceType').value,
        size: document.getElementById('appSize').value.trim(),
        image: document.getElementById('appImage').value.trim(),
        gallery: getGalleryImages(),
        downloadLink: document.getElementById('appDownloadLink').value.trim(),
        developer: document.getElementById('appDeveloper').value.trim(),
        date: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        ratings: [],
        comments: []
    };

    if (!appData.name || !appData.description || !appData.version || !appData.category || !appData.deviceType || !appData.size || !appData.image || !appData.downloadLink) {
        showAlert('يرجى ملء جميع الحقول المطلوبة!', 'error');
        return;
    }

    if (isEdit) {
        let oldApp = apps.find(a => a.id === appData.id);
        if (oldApp) {
            appData.downloads = oldApp.downloads;
            appData.rating = oldApp.rating;
            appData.ratings = oldApp.ratings;
            appData.comments = oldApp.comments;
        }

        apps = apps.filter(a => a.id !== appData.id);
        apps.push(appData);

        await saveApps();
        showAlert('تم تعديل التطبيق بنجاح', 'success');
        window.location.href = 'admin.html';
    } else {
        apps.push(appData);
        await saveApps();
        showAlert('تم رفع التطبيق بنجاح', 'success');
        window.location.href = 'admin.html';
    }
}

// ========== أحداث ==========
document.getElementById('submitBtn')?.addEventListener('click', e => {
    e.preventDefault();
    saveApp();
});

document.getElementById('uploadForm')?.addEventListener('submit', e => {
    e.preventDefault();
    saveApp();
});

function cancelEdit() {
    if (confirm('هل تريد إلغاء التعديل؟')) window.location.href = 'admin.html';
}

// ========== تشغيل الصفحة ==========
initPage();