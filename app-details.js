// app-details.js - صفحة تفاصيل التطبيق مع تقييم وتعليقات

let currentApp = null;
let selectedRating = 0;

// دالة للحصول على معرف التطبيق من الرابط
function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// دالة لانتظار تحميل البيانات
function waitForApps() {
    return new Promise((resolve) => {
        let check = setInterval(() => {
            if (typeof apps !== "undefined" && apps.length > 0) {
                clearInterval(check);
                resolve();
            }
        }, 200);
    });
}

// دالة عرض النجوم
function renderStars(rating = 0) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? "⭐" : "☆";
    }
    return stars;
}

// دالة للحصول على توزيع التقييمات
function getRatingDistribution(ratings) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
        if (r >= 1 && r <= 5) distribution[Math.floor(r)]++;
    });
    return distribution;
}

// دالة لعرض أشرطة التقييمات
function renderRatingBars(ratings) {
    const total = ratings.length;
    const distribution = getRatingDistribution(ratings);
    
    if (total === 0) {
        return '<p style="text-align:center;">لا توجد تقييمات بعد</p>';
    }
    
    let html = '';
    for (let star = 5; star >= 1; star--) {
        const count = distribution[star];
        const percentage = (count / total) * 100;
        html += `
            <div class="rating-bar">
                <div class="rating-bar-label">${'★'.repeat(star)}</div>
                <div class="rating-bar-bg">
                    <div class="rating-bar-fill" style="width: ${percentage}%;"></div>
                </div>
                <div class="rating-bar-count">${count}</div>
            </div>
        `;
    }
    return html;
}

// دوال التعليقات
function loadComments(appId) {
    const saved = localStorage.getItem("comments_" + appId);
    return saved ? JSON.parse(saved) : [];
}

function saveComment(appId, comment) {
    let comments = loadComments(appId);
    comments.unshift(comment); // إضافة التعليق في البداية
    localStorage.setItem("comments_" + appId, JSON.stringify(comments));
}

function displayComments(appId) {
    let comments = loadComments(appId);
    let container = document.getElementById("commentsList");
    
    if (!container) return;
    
    if (!comments.length) {
        container.innerHTML = '<p style="text-align:center; padding:30px;">💬 لا توجد تعليقات بعد. كن أول من يعلق!</p>';
        return;
    }
    
    container.innerHTML = comments.map(c => `
        <div class="comment-card">
            <div class="comment-header">
                <span><strong>${escapeHtml(c.name)}</strong></span>
                <span class="comment-rating">${renderStars(c.rating)}</span>
                <span>${new Date(c.date).toLocaleDateString('ar-EG')}</span>
            </div>
            <div>${escapeHtml(c.text)}</div>
        </div>
    `).join("");
}

// دالة إضافة تعليق
function addComment(appId) {
    const name = document.getElementById("userName")?.value.trim();
    const text = document.getElementById("commentText")?.value.trim();
    const rating = document.getElementById("rating")?.value;
    
    if (!name) {
        showAlert("يرجى إدخال اسمك", "error");
        return;
    }
    
    if (!text) {
        showAlert("يرجى كتابة تعليقك", "error");
        return;
    }
    
    const newComment = {
        name: name,
        text: text,
        rating: parseInt(rating),
        date: new Date().toISOString()
    };
    
    saveComment(appId, newComment);
    displayComments(appId);
    
    // تفريغ الحقول
    if (document.getElementById("userName")) document.getElementById("userName").value = "";
    if (document.getElementById("commentText")) document.getElementById("commentText").value = "";
    if (document.getElementById("rating")) document.getElementById("rating").value = "5";
    
    showAlert("تم إضافة تعليقك بنجاح!", "success");
}

// دالة عرض تفاصيل التطبيق الرئيسية
async function displayAppDetails() {
    await waitForApps();
    
    const appId = getAppIdFromURL();
    const app = apps.find(a => a.id == appId);
    const container = document.getElementById("appDetails");
    
    if (!app) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 25px;">
                <h1 style="font-size: 3rem;">😕</h1>
                <p style="color: #64748b; margin: 15px 0;">التطبيق غير موجود</p>
                <a href="apps.html" class="submit-btn" style="display: inline-block; width: auto; padding: 12px 25px;">📱 استعراض التطبيقات</a>
            </div>
        `;
        return;
    }
    
    currentApp = app;
    
    const totalRatings = app.ratings.length;
    const avgRating = totalRatings > 0 ? (app.ratings.reduce((a,b) => a + b, 0) / totalRatings).toFixed(1) : app.rating.toFixed(1);
    
    // معرض الصور
    let galleryHtml = '';
    if (app.gallery && app.gallery.length > 0) {
        galleryHtml = `
            <div class="app-gallery">
                <h3>📸 صور من التطبيق</h3>
                <div class="gallery-grid">
                    ${app.gallery.map(img => `<img src="${img}" onclick="openImageModal('${img}')" onerror="this.style.display='none'">`).join('')}
                </div>
            </div>
        `;
    }
    
    // الصورة الرئيسية
    const appImage = app.image && app.image.startsWith('http') ? app.image : 'https://placehold.co/300x300/667eea/white?text=' + encodeURIComponent(app.name);
    
    // التحقق من أن المستخدم قد قيم بالفعل
    const hasUserRated = currentUser ? app.ratings.some(r => r.userId === currentUser.id) : false;
    
    // قسم إضافة تقييم
    let ratingSectionHtml = '';
    if (currentUser && !hasUserRated) {
        ratingSectionHtml = `
            <div class="rating-section">
                <h3>⭐ قيم هذا التطبيق</h3>
                <div style="display: flex; gap: 10px; margin: 15px 0;">
                    ${[1,2,3,4,5].map(star => `
                        <span onclick="setRating(${star})" style="font-size: 2rem; cursor: pointer; color: ${selectedRating >= star ? '#fbbf24' : '#cbd5e1'};">★</span>
                    `).join('')}
                </div>
                <button onclick="submitRating(${app.id})" class="submit-btn" style="width: auto; padding: 10px 25px;">إرسال التقييم</button>
            </div>
        `;
    } else if (currentUser && hasUserRated) {
        ratingSectionHtml = `
            <div class="rating-section">
                <p style="color: #10b981; text-align: center;">✅ لقد قمت بتقييم هذا التطبيق بالفعل. شكراً لك!</p>
            </div>
        `;
    } else if (!currentUser) {
        ratingSectionHtml = `
            <div class="rating-section">
                <p style="text-align: center;">🔐 <a href="login.html" style="color: #667eea;">سجل الدخول</a> لتقييم هذا التطبيق</p>
            </div>
        `;
    }
    
    // تطبيقات مشابهة
    let similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    let similarAppsHtml = '';
    if (similarApps.length > 0) {
        similarAppsHtml = `
            <div class="similar-apps">
                <h3>📱 تطبيقات مشابهة</h3>
                <div class="similar-grid">
                    ${similarApps.map(similar => `
                        <div class="similar-card" onclick="openAppDetails(${similar.id})">
                            <img src="${similar.image}" onerror="this.src='https://placehold.co/200x100/cccccc/white?text=No+Image'">
                            <div style="font-weight: bold; margin-top: 8px;">${escapeHtml(similar.name)}</div>
                            <div style="color: #fbbf24;">⭐ ${similar.rating.toFixed(1)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // عرض الصفحة
    container.innerHTML = `
        <div class="app-header">
            <div class="app-header-content">
                <img src="${appImage}" class="app-icon-large" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                <div class="app-info">
                    <h1>${escapeHtml(app.name)}</h1>
                    <p>${escapeHtml(app.userName || "مطور غير معروف")}</p>
                    <div class="stars">${renderStars(avgRating)}</div>
                    <div class="app-meta">
                        <span>⭐ ${avgRating}</span>
                        <span>📊 ${totalRatings} تقييم</span>
                        <span>📥 ${app.downloads} تحميل</span>
                        <span>📱 ${escapeHtml(app.version)}</span>
                        <span>💾 ${escapeHtml(app.size)}</span>
                        <span>${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="app-body">
            <div class="app-actions">
                <button onclick="downloadApp(${app.id})" class="download-btn">📥 تحميل التطبيق</button>
            </div>
            
            ${galleryHtml}
            
            <div class="app-description">
                <h2>📄 وصف التطبيق</h2>
                <p>${escapeHtml(app.description)}</p>
            </div>
            
            <div class="rating-section">
                <h3>📊 إحصائيات التقييمات</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; font-weight: 800; color: #fbbf24;">${avgRating}</div>
                        <div style="color: #fbbf24;">${renderStars(avgRating)}</div>
                        <div style="color: #64748b;">${totalRatings} تقييم</div>
                    </div>
                    <div style="flex: 1;" class="rating-stats">
                        ${renderRatingBars(app.ratings)}
                    </div>
                </div>
            </div>
            
            ${ratingSectionHtml}
            
            <div class="comments-section">
                <h2>💬 التعليقات</h2>
                
                <div class="add-comment">
                    <input type="text" id="userName" placeholder="اسمك" ${currentUser ? `value="${escapeHtml(currentUser.username)}"` : ''}>
                    <select id="rating">
                        <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                        <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                        <option value="3">⭐⭐⭐ جيد</option>
                        <option value="2">⭐⭐ مقبول</option>
                        <option value="1">⭐ ضعيف</option>
                    </select>
                    <textarea id="commentText" rows="3" placeholder="اكتب تعليقك..."></textarea>
                    <button onclick="addComment('${app.id}')">📝 إرسال التعليق</button>
                </div>
                
                <div id="commentsList"></div>
            </div>
            
            ${similarAppsHtml}
        </div>
    `;
    
    displayComments(app.id);
}

// دالة تعيين التقييم
function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.rating-section span');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#fbbf24' : '#cbd5e1';
    });
}

// دالة إرسال التقييم
async function submitRating(appId) {
    if (!currentUser) {
        showAlert('يرجى تسجيل الدخول أولاً', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    if (!selectedRating) {
        showAlert('يرجى اختيار التقييم بالنجوم', 'error');
        return;
    }
    
    const app = apps.find(a => a.id == appId);
    if (!app) return;
    
    // التحقق من أن المستخدم لم يقيم مسبقاً
    if (app.ratings.some(r => r.userId === currentUser.id)) {
        showAlert('لقد قمت بتقييم هذا التطبيق بالفعل', 'error');
        return;
    }
    
    // إضافة التقييم
    app.ratings.push({
        userId: currentUser.id,
        rating: selectedRating,
        date: new Date().toISOString()
    });
    
    // تحديث متوسط التقييم
    const total = app.ratings.reduce((sum, r) => sum + r.rating, 0);
    app.rating = total / app.ratings.length;
    
    await saveApps();
    showAlert('تم إضافة تقييمك بنجاح!', 'success');
    
    // إعادة تحميل الصفحة
    displayAppDetails();
}

// دالة فتح الصورة في نافذة منبثقة
function openImageModal(imgSrc) {
    const modal = document.getElementById('adModal');
    const content = document.getElementById('modalAdContent');
    if (modal && content) {
        content.innerHTML = `<img src="${imgSrc}" style="max-width:100%; border-radius:12px;">`;
        modal.style.display = 'flex';
    }
}

// بدء تحميل الصفحة
displayAppDetails();