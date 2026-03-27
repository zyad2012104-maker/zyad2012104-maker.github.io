// admin.js - لوحة الإدارة الكاملة (المصحح)

let currentAdminPanel = 'users';
let editingModeratorId = null;

function checkAdminAccess() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    const titleEl = document.getElementById('adminPageTitle');
    const descEl = document.getElementById('adminPageDesc');
    
    if (isAdmin(currentUser)) {
        if (titleEl) titleEl.innerHTML = '👑 لوحة التحكم - الإدارة الكاملة';
        if (descEl) descEl.innerHTML = 'إدارة المستخدمين والمشرفين والتطبيقات والتعليقات والتصنيفات والإعلانات';
    } else if (isModerator(currentUser)) {
        if (titleEl) titleEl.innerHTML = '🛡️ لوحة الإشراف';
        if (descEl) descEl.innerHTML = 'إدارة المحتوى حسب الصلاحيات الممنوحة لك';
    } else {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

function filterTabsByPermissions() {
    if (!currentUser) return;
    
    const moderatorsTab = document.getElementById('moderatorsTab');
    if (moderatorsTab && !isAdmin(currentUser)) {
        moderatorsTab.style.display = 'none';
    }
    
    const categoriesTab = document.querySelector('[data-panel="categories"]');
    if (categoriesTab && !hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        categoriesTab.style.display = 'none';
    }
    
    const addModeratorSection = document.getElementById('addModeratorSection');
    if (addModeratorSection && !isAdmin(currentUser)) {
        addModeratorSection.style.display = 'none';
    }
    
    const faviconTab = document.querySelector('[data-panel="favicon"]');
    if (faviconTab && !isAdmin(currentUser)) {
        faviconTab.style.display = 'none';
    }
    
    const adsTab = document.querySelector('[data-panel="ads"]');
    if (adsTab && !isAdmin(currentUser)) {
        adsTab.style.display = 'none';
    }
}

async function displayStats() {
    let statsContainer = document.getElementById('statsCards');
    if(!statsContainer) return;
    
    if (!hasPermission(currentUser, 'viewStats') && !isAdmin(currentUser)) {
        statsContainer.innerHTML = '<div class="stat-card" style="grid-column:span 4;"><p>⚠️ لا تملك صلاحية عرض الإحصائيات</p></div>';
        return;
    }
    
    let usersCount = users.filter(u => u.role === 'user').length;
    let moderatorsCount = users.filter(u => u.role === 'moderator').length;
    let totalDownloads = apps.reduce((sum, a) => sum + a.downloads, 0);
    
    statsContainer.innerHTML = `
        <div class="stat-card"><h3>${usersCount}</h3><p>👥 مستخدمين</p></div>
        <div class="stat-card"><h3>${moderatorsCount}</h3><p>🛡️ مشرفين</p></div>
        <div class="stat-card"><h3>${apps.length}</h3><p>📱 تطبيقات</p></div>
        <div class="stat-card"><h3>${comments.length}</h3><p>💬 تعليقات</p></div>
        <div class="stat-card"><h3>${totalDownloads}</h3><p>📥 إجمالي التحميلات</p></div>
        <div class="stat-card"><h3>${categories.length}</h3><p>🏷️ تصنيفات</p></div>
    `;
}

function showAdminPanel(panel) {
    if (panel === 'moderators' && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة المشرفين', 'error');
        return;
    }
    
    if (panel === 'categories' && !hasPermission(currentUser, 'manageCategories') && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة التصنيفات', 'error');
        return;
    }
    
    if (panel === 'favicon' && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة أيقونة الموقع', 'error');
        return;
    }
    
    if (panel === 'ads' && !isAdmin(currentUser)) {
        showAlert('غير مصرح لك بالوصول إلى إدارة الإعلانات', 'error');
        return;
    }
    
    currentAdminPanel = panel;
    
    // إخفاء جميع اللوحات
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    
    // إظهار اللوحة المحددة
    const targetPanel = document.getElementById(`${panel}Panel`);
    if (targetPanel) targetPanel.classList.add('active');
    
    // تحديث حالة الأزرار
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
        const panelName = tab.getAttribute('data-panel');
        if (panelName === panel) {
            tab.classList.add('active');
        }
    });
    
    // تحميل البيانات حسب اللوحة
    if(panel === 'users') displayUsers();
    else if(panel === 'moderators') displayModerators();
    else if(panel === 'apps') displayApps();
    else if(panel === 'comments') displayComments();
    else if(panel === 'categories') displayCategories();
    else if(panel === 'favicon') loadCurrentFavicon();
    else if(panel === 'ads') displayAdSettings();
}

function displayUsers() {
    let usersTable = document.getElementById('usersTable');
    if(!usersTable) return;
    
    let regularUsers = users.filter(u => u.role === 'user');
    
    if(regularUsers.length === 0) {
        usersTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد مستخدمين</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>';
    regularUsers.forEach((user, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${new Date(user.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'deleteUser') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteUser(${user.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    usersTable.innerHTML = html;
}

function displayModerators() {
    let moderatorsTable = document.getElementById('moderatorsTable');
    if(!moderatorsTable) return;
    
    if(!isAdmin(currentUser)) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">⚠️ فقط المدير يمكنه إدارة المشرفين</p>';
        return;
    }
    
    let moderatorsList = users.filter(u => u.role === 'moderator');
    
    if(moderatorsList.length === 0) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا يوجد مشرفين</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المشرف</th><th>البريد الإلكتروني</th><th>الصلاحيات</th><th>تاريخ التعيين</th><th>الإجراءات</th></tr></thead><tbody>';
    moderatorsList.forEach((mod, index) => {
        let perms = [];
        if(mod.permissions?.deleteUser) perms.push('حذف مستخدم');
        if(mod.permissions?.deleteApp) perms.push('حذف تطبيق');
        if(mod.permissions?.editApp) perms.push('تعديل تطبيق');
        if(mod.permissions?.deleteComment) perms.push('حذف تعليق');
        if(mod.permissions?.editComment) perms.push('تعديل تعليق');
        if(mod.permissions?.viewStats) perms.push('عرض إحصائيات');
        if(mod.permissions?.manageCategories) perms.push('إدارة تصنيفات');
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(mod.username)}</strong></td>
            <td>${escapeHtml(mod.email)}</td>
            <td><small>${perms.join(', ') || 'لا توجد'}</small></td>
            <td>${new Date(mod.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                <button class="btn-permissions" onclick="openPermissionsModal(${mod.id})">🔧 صلاحيات</button>
                <button class="btn-edit" onclick="editModerator(${mod.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteModerator(${mod.id})">🗑️ حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    moderatorsTable.innerHTML = html;
}

function displayApps() {
    let appsTable = document.getElementById('appsTable');
    if(!appsTable) return;
    
    if(apps.length === 0) {
        appsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد تطبيقات</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم التطبيق</th><th>المطور</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr></thead><tbody>';
    apps.forEach((app, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.name)}</strong></td>
            <td>${escapeHtml(app.developer || app.userName || 'غير معروف')}</td>
            <td>${app.downloads}</td>
            <td>⭐ ${app.rating.toFixed(1)}</td>
            <td class="action-buttons">
                <button class="btn-view" onclick="window.location.href='app-detail.html?id=${app.id}'">👁️ عرض</button>
                ${hasPermission(currentUser, 'editApp') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editApp(${app.id})">✏️ تعديل</button>` : ''}
                ${hasPermission(currentUser, 'deleteApp') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteApp(${app.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    appsTable.innerHTML = html;
}

function displayComments() {
    let commentsTable = document.getElementById('commentsTable');
    if(!commentsTable) return;
    
    if(comments.length === 0) {
        commentsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد تعليقات</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>المستخدم</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>';
    comments.forEach((comment, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(comment.username)}</strong></td>
            <td style="max-width:300px;">${escapeHtml(comment.comment.substring(0, 100))}${comment.comment.length > 100 ? '...' : ''}</td>
            <td>${'⭐'.repeat(comment.rating)}</td>
            <td>${new Date(comment.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'deleteComment') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteComment(${comment.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    commentsTable.innerHTML = html;
}

function displayCategories() {
    let categoriesList = document.getElementById('categoriesList');
    if(!categoriesList) return;
    
    if(categories.length === 0) {
        categoriesList.innerHTML = '<p>لا توجد تصنيفات</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>الأيقونة</th><th>اسم التصنيف</th><th>المفتاح</th><th>الإجراءات</th></tr></thead><tbody>';
    categories.forEach((cat, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td style="font-size:1.5rem;">${cat.icon}</td>
            <td><strong>${escapeHtml(cat.name)}</strong></td>
            <td>${escapeHtml(cat.key)}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'manageCategories') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editCategory('${cat.key}')">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteCategory('${cat.key}')">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    categoriesList.innerHTML = html;
}

// دوال التصنيفات
function addCategory() {
    let name = document.getElementById('newCategoryName')?.value.trim();
    let icon = document.getElementById('newCategoryIcon')?.value.trim();
    let key = document.getElementById('newCategoryKey')?.value.trim();
    
    if(!name || !key) {
        showAlert('يرجى إدخال اسم التصنيف والمفتاح', 'error');
        return;
    }
    
    if(categories.find(c => c.key === key)) {
        showAlert('المفتاح موجود بالفعل', 'error');
        return;
    }
    
    categories.push({
        id: Date.now(),
        name: name,
        icon: icon || '📱',
        key: key
    });
    
    saveCategories();
    displayCategories();
    showAlert('تم إضافة التصنيف بنجاح', 'success');
    
    // تفريغ الحقول
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryIcon').value = '';
    document.getElementById('newCategoryKey').value = '';
}

function editCategory(key) {
    let cat = categories.find(c => c.key === key);
    if(!cat) return;
    
    let newName = prompt('اسم التصنيف الجديد:', cat.name);
    if(newName && newName.trim()) cat.name = newName.trim();
    
    let newIcon = prompt('الأيقونة الجديدة:', cat.icon);
    if(newIcon && newIcon.trim()) cat.icon = newIcon.trim();
    
    saveCategories();
    displayCategories();
    showAlert('تم تعديل التصنيف بنجاح', 'success');
}

function deleteCategory(key) {
    if(!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    
    categories = categories.filter(c => c.key !== key);
    saveCategories();
    displayCategories();
    showAlert('تم حذف التصنيف بنجاح', 'success');
}

// دوال الأيقونة (Favicon)
function loadCurrentFavicon() {
    let faviconLink = document.querySelector("link[rel*='icon']");
    let currentFavicon = faviconLink ? faviconLink.href : null;
    let previewImg = document.getElementById('faviconPreviewImg');
    let noFaviconText = document.getElementById('noFaviconText');
    
    if(currentFavicon && currentFavicon !== '' && !currentFavicon.includes('data:')) {
        if(previewImg) {
            previewImg.src = currentFavicon;
            previewImg.style.display = 'block';
        }
        if(noFaviconText) noFaviconText.style.display = 'none';
    } else {
        if(previewImg) previewImg.style.display = 'none';
        if(noFaviconText) noFaviconText.style.display = 'inline';
    }
}

function uploadFavicon() {
    let fileInput = document.getElementById('faviconFile');
    let file = fileInput.files[0];
    
    if(!file) {
        showAlert('يرجى اختيار صورة أولاً', 'error');
        return;
    }
    
    let reader = new FileReader();
    reader.onload = function(e) {
        let imgData = e.target.result;
        
        // إنشاء رابط الأيقونة
        let existingLink = document.querySelector("link[rel*='icon']");
        if(existingLink) {
            existingLink.href = imgData;
        } else {
            let link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = imgData;
            document.head.appendChild(link);
        }
        
        // حفظ في localStorage
        localStorage.setItem('faviconData', imgData);
        
        // تحديث المعاينة
        let previewImg = document.getElementById('faviconPreviewImg');
        let noFaviconText = document.getElementById('noFaviconText');
        if(previewImg) {
            previewImg.src = imgData;
            previewImg.style.display = 'block';
        }
        if(noFaviconText) noFaviconText.style.display = 'none';
        
        showAlert('تم رفع أيقونة الموقع بنجاح', 'success');
        fileInput.value = '';
    };
    reader.readAsDataURL(file);
}

function removeFavicon() {
    if(!confirm('هل أنت متأكد من إزالة أيقونة الموقع؟')) return;
    
    let existingLink = document.querySelector("link[rel*='icon']");
    if(existingLink) {
        existingLink.href = '';
    }
    
    localStorage.removeItem('faviconData');
    
    let previewImg = document.getElementById('faviconPreviewImg');
    let noFaviconText = document.getElementById('noFaviconText');
    if(previewImg) {
        previewImg.style.display = 'none';
        previewImg.src = '';
    }
    if(noFaviconText) noFaviconText.style.display = 'inline';
    
    showAlert('تم إزالة أيقونة الموقع', 'success');
}

// دوال الإعلانات
function displayAdSettings() {
    document.getElementById('topBannerCode').value = adSettings.topBanner || '';
    document.getElementById('bottomBannerCode').value = adSettings.bottomBanner || '';
    document.getElementById('leftSidebarCode').value = adSettings.leftSidebar || '';
    document.getElementById('rightSidebarCode').value = adSettings.rightSidebar || '';
    document.getElementById('clickAdCode').value = adSettings.clickAd || '';
}

function saveAdCode(position) {
    let code = '';
    if(position === 'topBanner') code = document.getElementById('topBannerCode').value;
    else if(position === 'bottomBanner') code = document.getElementById('bottomBannerCode').value;
    else if(position === 'leftSidebar') code = document.getElementById('leftSidebarCode').value;
    else if(position === 'rightSidebar') code = document.getElementById('rightSidebarCode').value;
    else if(position === 'clickAd') code = document.getElementById('clickAdCode').value;
    
    if(position === 'topBanner') adSettings.topBanner = code;
    else if(position === 'bottomBanner') adSettings.bottomBanner = code;
    else if(position === 'leftSidebar') adSettings.leftSidebar = code;
    else if(position === 'rightSidebar') adSettings.rightSidebar = code;
    else if(position === 'clickAd') adSettings.clickAd = code;
    
    saveAdSettings();
    renderAds();
    showAlert('تم حفظ الإعلان بنجاح', 'success');
}

function testAdCode(position) {
    let code = '';
    if(position === 'topBanner') code = document.getElementById('topBannerCode').value;
    else if(position === 'bottomBanner') code = document.getElementById('bottomBannerCode').value;
    else if(position === 'leftSidebar') code = document.getElementById('leftSidebarCode').value;
    else if(position === 'rightSidebar') code = document.getElementById('rightSidebarCode').value;
    else if(position === 'clickAd') code = document.getElementById('clickAdCode').value;
    
    if(!code.trim()) {
        showAlert('لا يوجد كود إعلان لمعاينته', 'error');
        return;
    }
    
    let modal = document.getElementById('adModal');
    let modalContent = document.getElementById('modalAdContent');
    if(modal && modalContent) {
        modalContent.innerHTML = code;
        executeAdScripts(modalContent);
        modal.style.display = 'flex';
    }
}

function clearAdCode(position) {
    if(position === 'topBanner') document.getElementById('topBannerCode').value = '';
    else if(position === 'bottomBanner') document.getElementById('bottomBannerCode').value = '';
    else if(position === 'leftSidebar') document.getElementById('leftSidebarCode').value = '';
    else if(position === 'rightSidebar') document.getElementById('rightSidebarCode').value = '';
    else if(position === 'clickAd') document.getElementById('clickAdCode').value = '';
    
    saveAdCode(position);
}

// دوال إدارة المستخدمين والمشرفين
async function deleteUser(id) {
    if(!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    users = users.filter(u => u.id !== id);
    await saveUsers();
    displayUsers();
    displayStats();
    showAlert('تم حذف المستخدم بنجاح', 'success');
}

async function deleteModerator(id) {
    if(!confirm('هل أنت متأكد من حذف هذا المشرف؟')) return;
    
    users = users.filter(u => u.id !== id);
    await saveUsers();
    displayModerators();
    displayStats();
    showAlert('تم حذف المشرف بنجاح', 'success');
}

async function editModerator(id) {
    let mod = users.find(u => u.id === id && u.role === 'moderator');
    if(!mod) return;
    
    let newUsername = prompt('اسم المشرف الجديد:', mod.username);
    if(newUsername && newUsername.trim()) mod.username = newUsername.trim();
    
    let newEmail = prompt('البريد الإلكتروني الجديد:', mod.email);
    if(newEmail && newEmail.trim()) mod.email = newEmail.trim();
    
    await saveUsers();
    displayModerators();
    showAlert('تم تعديل بيانات المشرف', 'success');
}

function openPermissionsModal(id) {
    let mod = users.find(u => u.id === id && u.role === 'moderator');
    if(!mod) return;
    
    editingModeratorId = id;
    let content = document.getElementById('permissionsModalContent');
    
    content.innerHTML = `
        <div class="permissions-list">
            <label class="permission-item">
                <input type="checkbox" id="permDeleteUser" ${mod.permissions?.deleteUser ? 'checked' : ''}>
                <span>🗑️ حذف المستخدمين</span>
            </label>
            <label class="permission-item">
                <input type="checkbox" id="permDeleteApp" ${mod.permissions?.deleteApp ? 'checked' : ''}>
                <span>📱 حذف التطبيقات</span>
            </label>
            <label class="permission-item">
                <input type="checkbox" id="permEditApp" ${mod.permissions?.editApp ? 'checked' : ''}>
                <span>✏️ تعديل التطبيقات</span>
            </label>
            <label class="permission-item">
                <input type="checkbox" id="permDeleteComment" ${mod.permissions?.deleteComment ? 'checked' : ''}>
                <span>💬 حذف التعليقات</span>
            </label>
            <label class="permission-item">
                <input type="checkbox" id="permEditComment" ${mod.permissions?.editComment ? 'checked' : ''}>
                <span>✏️ تعديل التعليقات</span>
            </label>
            <label class="permission-item">
                <input type="checkbox" id="permViewStats" ${mod.permissions?.viewStats ? 'checked' : ''}>
                <span>📊 عرض الإحصائيات</span>
            </label>
            <label class="permission-item">
                <input type="checkbox" id="permManageCategories" ${mod.permissions?.manageCategories ? 'checked' : ''}>
                <span>🏷️ إدارة التصنيفات</span>
            </label>
        </div>
    `;
    
    document.getElementById('permissionsModal').style.display = 'flex';
}

async function savePermissionsChanges() {
    let mod = users.find(u => u.id === editingModeratorId);
    if(!mod) return;
    
    mod.permissions = {
        deleteUser: document.getElementById('permDeleteUser')?.checked || false,
        deleteApp: document.getElementById('permDeleteApp')?.checked || false,
        editApp: document.getElementById('permEditApp')?.checked || false,
        deleteComment: document.getElementById('permDeleteComment')?.checked || false,
        editComment: document.getElementById('permEditComment')?.checked || false,
        viewStats: document.getElementById('permViewStats')?.checked || false,
        manageCategories: document.getElementById('permManageCategories')?.checked || false
    };
    
    await saveUsers();
    closePermissionsModal();
    displayModerators();
    showAlert('تم حفظ الصلاحيات بنجاح', 'success');
}

function closePermissionsModal() {
    document.getElementById('permissionsModal').style.display = 'none';
    editingModeratorId = null;
}

// دوال التطبيقات
async function deleteApp(id) {
    if(!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    apps = apps.filter(a => a.id !== id);
    await saveApps();
    displayApps();
    displayStats();
    showAlert('تم حذف التطبيق بنجاح', 'success');
}

function editApp(id) {
    window.location.href = `upload.html?edit=${id}`;
}

async function deleteComment(id) {
    if(!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    
    comments = comments.filter(c => c.id !== id);
    await saveComments();
    displayComments();
    showAlert('تم حذف التعليق بنجاح', 'success');
}

// إضافة مشرف جديد
document.getElementById('addModeratorForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if(!isAdmin(currentUser)) {
        showAlert('غير مصرح بإضافة مشرفين', 'error');
        return;
    }
    
    let username = document.getElementById('modUsername').value.trim();
    let email = document.getElementById('modEmail').value.trim();
    let password = document.getElementById('modPassword').value;
    
    if(!username || !email || !password) {
        showAlert('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if(users.find(u => u.email === email)) {
        showAlert('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    let newMod = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: 'moderator',
        permissions: {
            deleteUser: document.getElementById('permDeleteUser')?.checked || false,
            deleteApp: document.getElementById('permDeleteApp')?.checked || false,
            editApp: document.getElementById('permEditApp')?.checked || false,
            deleteComment: document.getElementById('permDeleteComment')?.checked || false,
            editComment: document.getElementById('permEditComment')?.checked || false,
            viewStats: document.getElementById('permViewStats')?.checked || false,
            manageCategories: document.getElementById('permManageCategories')?.checked || false
        },
        date: new Date().toISOString()
    };
    
    users.push(newMod);
    await saveUsers();
    
    showAlert('تم إضافة المشرف بنجاح', 'success');
    document.getElementById('addModeratorForm').reset();
    displayModerators();
    displayStats();
});

// دوال البحث
function searchUsers() {
    let term = document.getElementById('searchUsers')?.value.toLowerCase().trim();
    let usersTable = document.getElementById('usersTable');
    if(!usersTable) return;
    
    let regularUsers = users.filter(u => u.role === 'user');
    let filtered = term ? regularUsers.filter(u => u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) : regularUsers;
    
    if(filtered.length === 0) {
        usersTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((user, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${new Date(user.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                ${hasPermission(currentUser, 'deleteUser') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteUser(${user.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    usersTable.innerHTML = html;
}

function searchModerators() {
    let term = document.getElementById('searchModerators')?.value.toLowerCase().trim();
    let moderatorsTable = document.getElementById('moderatorsTable');
    if(!moderatorsTable) return;
    
    let moderatorsList = users.filter(u => u.role === 'moderator');
    let filtered = term ? moderatorsList.filter(m => m.username.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)) : moderatorsList;
    
    if(filtered.length === 0) {
        moderatorsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المشرف</th><th>البريد الإلكتروني</th><th>الصلاحيات</th><th>تاريخ التعيين</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((mod, index) => {
        let perms = [];
        if(mod.permissions?.deleteUser) perms.push('حذف مستخدم');
        if(mod.permissions?.deleteApp) perms.push('حذف تطبيق');
        if(mod.permissions?.editApp) perms.push('تعديل تطبيق');
        if(mod.permissions?.deleteComment) perms.push('حذف تعليق');
        if(mod.permissions?.editComment) perms.push('تعديل تعليق');
        if(mod.permissions?.viewStats) perms.push('عرض إحصائيات');
        if(mod.permissions?.manageCategories) perms.push('إدارة تصنيفات');
        
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(mod.username)}</strong></td>
            <td>${escapeHtml(mod.email)}</td>
            <td><small>${perms.join(', ') || 'لا توجد'}</small></td>
            <td>${new Date(mod.date).toLocaleDateString('ar-EG')}</td>
            <td class="action-buttons">
                <button class="btn-permissions" onclick="openPermissionsModal(${mod.id})">🔧 صلاحيات</button>
                <button class="btn-edit" onclick="editModerator(${mod.id})">✏️ تعديل</button>
                <button class="btn-delete" onclick="deleteModerator(${mod.id})">🗑️ حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    moderatorsTable.innerHTML = html;
}

function searchAdminApps() {
    let term = document.getElementById('searchApps')?.value.toLowerCase().trim();
    let appsTable = document.getElementById('appsTable');
    if(!appsTable) return;
    
    let filtered = term ? apps.filter(a => a.name.toLowerCase().includes(term) || a.description.toLowerCase().includes(term)) : apps;
    
    if(filtered.length === 0) {
        appsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم التطبيق</th><th>المطور</th><th>التحميلات</th><th>التقييم</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((app, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.name)}</strong></td>
            <td>${escapeHtml(app.developer || app.userName || 'غير معروف')}</td>
            <td>${app.downloads}</td>
            <td>⭐ ${app.rating.toFixed(1)}</td>
            <td class="action-buttons">
                <button class="btn-view" onclick="window.location.href='app-detail.html?id=${app.id}'">👁️ عرض</button>
                ${hasPermission(currentUser, 'editApp') || isAdmin(currentUser) ? `<button class="btn-edit" onclick="editApp(${app.id})">✏️ تعديل</button>` : ''}
                ${hasPermission(currentUser, 'deleteApp') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteApp(${app.id})">🗑️ حذف</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    appsTable.innerHTML = html;
}

function searchComments() {
    let term = document.getElementById('searchComments')?.value.toLowerCase().trim();
    let commentsTable = document.getElementById('commentsTable');
    if(!commentsTable) return;
    
    let filtered = term ? comments.filter(c => c.comment.toLowerCase().includes(term) || c.username.toLowerCase().includes(term)) : comments;
    
    if(filtered.length === 0) {
        commentsTable.innerHTML = '<p style="text-align:center; padding:40px;">لا توجد نتائج</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>المستخدم</th><th>التعليق</th><th>التقييم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>';
    filtered.forEach((comment, index) => {
        html += `<tr>
            <td>${index + 1} \d+
            <td><strong>${escapeHtml(comment.username)}</strong> \d+
            <td style="max-width:300px;">${escapeHtml(comment.comment.substring(0, 100))}${comment.comment.length > 100 ? '...' : ''} \d+
            <td>${'⭐'.repeat(comment.rating)} \d+
            <td>${new Date(comment.date).toLocaleDateString('ar-EG')} \d+
            <td class="action-buttons">
                ${hasPermission(currentUser, 'deleteComment') || isAdmin(currentUser) ? `<button class="btn-delete" onclick="deleteComment(${comment.id})">🗑️ حذف</button>` : ''}
             \d+
        `;
    });
    html += '</tbody> </table>';
    commentsTable.innerHTML = html;
}

// ========== تهيئة الصفحة ==========
(async function initAdminPage() {
    // انتظار تحميل البيانات
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
    
    if (!checkAdminAccess()) return;
    
    filterTabsByPermissions();
    await displayStats();
    
    // تحميل الأيقونة المحفوظة
    let savedFavicon = localStorage.getItem('faviconData');
    if(savedFavicon) {
        let existingLink = document.querySelector("link[rel*='icon']");
        if(existingLink) {
            existingLink.href = savedFavicon;
        } else {
            let link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = savedFavicon;
            document.head.appendChild(link);
        }
    }
    
    loadCurrentFavicon();
    displayUsers();
})();