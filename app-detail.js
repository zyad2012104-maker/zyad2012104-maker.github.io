// app-detail.js - صفحة تفاصيل التطبيق

console.log('🚀 بدء تحميل app-detail.js');

let currentApp = null;
let galleryImages = [];

function getAppIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

مكان الكود صح
const appId = getAppIdFromURL();
   if (!appId) {
       const meta = document.createElement('meta');
       meta.name = 'robots';
       meta.content = 'noindex, nofollow';
       document.head.appendChild(meta);
       console.log('🔒 تم منع فهرسة الصفحة (لا يوجد ID)');
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? '★' : '☆';
    }
    return stars;
}

function renderRatingBars(ratings) {
    const total = ratings.length;
    if (total === 0) return '<p style="text-align:center;">لا توجد تقييمات بعد</p>';
    
    const distribution = {5:0,4:0,3:0,2:0,1:0};
    ratings.forEach(r => {
        let val = typeof r === 'object' ? r.rating : r;
        if (val >= 1 && val <= 5) distribution[Math.floor(val)]++;
    });
    
    let html = '';
    for (let star = 5; star >= 1; star--) {
        const count = distribution[star];
        const percent = total > 0 ? (count / total) * 100 : 0;
        html += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="width: 60px; color: #fbbf24;">${'★'.repeat(star)}</div>
                <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: #fbbf24; border-radius: 4px;"></div>
                </div>
                <div style="width: 40px; color: #64748b;">${count}</div>
            </div>
        `;
    }
    return html;
}

function openImageModal(index) {
    if (!galleryImages || galleryImages.length === 0) return;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        modalImg.src = galleryImages[index];
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// دالة عرض معرض الصور - الآن تظهر تحت زر التحميل وبشكل أفقي مثل جوجل بلاي
function renderGallery(images) {
    if (!images || images.length === 0) {
        return '<div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 16px; text-align: center; color: #64748b;">📸 لا توجد صور مضافة للتطبيق</div>';
    }
    
    galleryImages = images;

    let html = `
        <div style="margin: 20px 0 30px 0;">
            <h3 style="margin-bottom: 15px; color: #2d3748;">📸 صور من التطبيق (${images.length} صور)</h3>
            <div style="display: flex; gap: 10px; justify-content: flex-start; overflow-x: auto; padding-bottom: 5px;">
    `;

    images.forEach((img, idx) => {
        html += `
            <div style="flex: 0 0 200px; height: 380px; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" onclick="openImageModal(${idx})">
                <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://placehold.co/200x380/ef4444/white?text=خطأ'">
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}
// عرض تفاصيل التطبيق
function displayAppDetails() {
    console.log('🎨 عرض تفاصيل التطبيق');
    
    const container = document.getElementById('appContent');
    if (!container) return;
    
    const appId = getAppIdFromURL();
    if (!appId) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><h1>😕</h1><p>معرّف التطبيق غير موجود</p><a href="apps.html" class="submit-btn">📱 استعراض التطبيقات</a></div>`;
        return;
    }
    
    const app = apps.find(a => a.id == appId);
    if (!app) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><h1>😕</h1><p>التطبيق غير موجود</p><a href="apps.html" class="submit-btn">📱 استعراض التطبيقات</a></div>`;
        return;
    }
    
    console.log('✅ التطبيق:', app.name);
    console.log('📸 الصور:', app.gallery);
    
    const totalRatings = app.ratings.length;
    let avgRating = app.rating;
    if (totalRatings > 0) {
        const sum = app.ratings.reduce((s, r) => s + (typeof r === 'object' ? r.rating : r), 0);
        avgRating = (sum / totalRatings).toFixed(1);
    }
    
    const galleryHtml = renderGallery(app.gallery);
    
    const appComments = comments.filter(c => c.appId === app.id);
    let commentsHtml = appComments.length === 0 ? 
        '<p style="text-align:center;padding:30px;background:#f8fafc;border-radius:16px;">💬 لا توجد تعليقات بعد</p>' :
        appComments.map(c => `
            <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px;color:#64748b;">
                    <span><strong>${escapeHtml(c.username)}</strong></span>
                    <span style="color:#fbbf24;">${renderStars(c.rating)}</span>
                    <span>${new Date(c.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div>${escapeHtml(c.comment)}</div>
            </div>
        `).join('');
    
    const appIcon = app.icon || app.image || 'https://placehold.co/120x120/667eea/white?text=' + encodeURIComponent(app.name);
    
    container.innerHTML = `
        <div style="max-width:1200px;margin:0 auto;background:white;border-radius:25px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;color:white;">
                <div style="display:flex;flex-wrap:wrap;gap:30px;align-items:center;">
                    <img src="${appIcon}" style="width:120px;height:120px;border-radius:25px;object-fit:cover;box-shadow:0 10px 30px rgba(0,0,0,0.3);" onerror="this.src='https://placehold.co/120x120/cccccc/white?text=No+Image'">
                    <div>
                        <h1 style="font-size:2rem;margin-bottom:10px;">${escapeHtml(app.name)}</h1>
                        <p style="opacity:0.9;">${escapeHtml(app.developer || app.userName || "مطور")}</p>
                        <div style="color:#fbbf24;font-size:1.2rem;margin:10px 0;">${renderStars(avgRating)}</div>
                        <div style="display:flex;flex-wrap:wrap;gap:12px;">
                            <span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:50px;">⭐ ${avgRating}</span>
                            <span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:50px;">📊 ${totalRatings} تقييم</span>
                            <span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:50px;">📥 ${app.downloads} تحميل</span>
                            <span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:50px;">📱 ${escapeHtml(app.version)}</span>
                            <span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:50px;">💾 ${escapeHtml(app.size)}</span>
                            <span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:50px;">${getCategoryIcon(app.category)} ${getCategoryName(app.category)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding:30px;">
                <button onclick="downloadApp(${app.id})" style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;border:none;padding:15px;border-radius:50px;font-size:1.2rem;font-weight:bold;cursor:pointer;width:100%;margin-bottom:30px;">📥 تحميل التطبيق</button>
                
                ${galleryHtml}
                
                <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:20px 0;">
                    <h2>📄 وصف التطبيق</h2>
                    <p style="line-height:1.8;">${escapeHtml(app.description)}</p>
                </div>
                
                <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:20px 0;">
                    <h3>📊 إحصائيات التقييمات</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:40px;align-items:center;">
                        <div style="text-align:center;">
                            <div style="font-size:4rem;font-weight:800;color:#fbbf24;">${avgRating}</div>
                            <div>${renderStars(avgRating)}</div>
                            <div>${totalRatings} تقييم</div>
                        </div>
                        <div style="flex:1;">${renderRatingBars(app.ratings)}</div>
                    </div>
                </div>
                
                <div>
                    <h2>💬 التعليقات</h2>
                    <div style="background:#f8fafc;border-radius:16px;padding:25px;margin:20px 0;">
                        <input type="text" id="commentName" placeholder="اسمك" style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;">
                        <select id="commentRating" style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;">
                            <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                            <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                            <option value="3">⭐⭐⭐ جيد</option>
                            <option value="2">⭐⭐ مقبول</option>
                            <option value="1">⭐ ضعيف</option>
                        </select>
                        <textarea id="commentText" rows="3" placeholder="اكتب تعليقك..." style="width:100%;padding:12px;margin-bottom:10px;border:2px solid #e2e8f0;border-radius:12px;"></textarea>
                        <button onclick="addComment(${app.id})" class="submit-btn" style="width:auto;padding:10px 25px;">📝 إرسال</button>
                    </div>
                    <div id="commentsList">${commentsHtml}</div>
                </div>
            </div>
        </div>
    `;
}

async function addComment(appId) {
    const name = document.getElementById('commentName')?.value.trim();
    const rating = document.getElementById('commentRating')?.value;
    const text = document.getElementById('commentText')?.value.trim();
    
    if (!name) { showAlert('يرجى إدخال اسمك', 'error'); return; }
    if (!text) { showAlert('يرجى كتابة تعليقك', 'error'); return; }
    
    comments.push({
        id: Date.now(),
        appId: parseInt(appId),
        userId: currentUser?.id || null,
        username: name,
        comment: text,
        rating: parseInt(rating),
        date: new Date().toISOString()
    });
    await saveComments();
    showAlert('تم إضافة تعليقك!', 'success');
    document.getElementById('commentText').value = '';
    displayAppDetails();
}

window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

let checkInterval = setInterval(function() {
    if (typeof apps !== 'undefined' && apps.length > 0) {
        clearInterval(checkInterval);
        displayAppDetails();
    }
}, 500);