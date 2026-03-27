// apps-page.js - صفحة التطبيقات

let currentCategoryFilter = 'all';

function displayCategoriesBar() {
    const container = document.getElementById('categoriesBar');
    if (!container) {
        console.log('⚠️ عنصر categoriesBar غير موجود');
        return;
    }
    
    if (!categories || categories.length === 0) {
        console.log('⚠️ لا توجد تصنيفات');
        container.innerHTML = '<button class="category-btn active" onclick="filterApps(\'all\')">📱 الكل</button>';
        return;
    }
    
    let html = '<button class="category-btn active" onclick="filterApps(\'all\')">📱 الكل</button>';
    categories.forEach(cat => {
        html += `<button class="category-btn" onclick="filterApps(\'${cat.key}\')">${cat.icon} ${cat.name}</button>`;
    });
    container.innerHTML = html;
    console.log(`✅ تم عرض ${categories.length + 1} تصنيف`);
}

function displayAllApps() {
    let container = document.getElementById('allApps');
    if(!container) {
        console.log('⚠️ عنصر allApps غير موجود');
        return;
    }
    
    console.log(`📱 عرض ${apps.length} تطبيق في صفحة التطبيقات`);
    
    if(!apps || apps.length === 0) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات حالياً</div>';
        return;
    }
    
    container.innerHTML = apps.map(app => createAppCard(app)).join('');
    console.log('✅ تم عرض جميع التطبيقات');
}

function filterApps(category) {
    currentCategoryFilter = category;
    let filtered = category === 'all' ? apps : apps.filter(a => a.category === category);
    let container = document.getElementById('allApps');
    if(!container) return;
    
    console.log(`🔍 تصفية التطبيقات حسب: ${category} - تم العثور على ${filtered.length} تطبيق`);
    
    if(!filtered.length) {
        container.innerHTML = '<div class="loading-skeleton">📱 لا توجد تطبيقات في هذا التصنيف</div>';
        return;
    }
    container.innerHTML = filtered.map(app => createAppCard(app)).join('');
    
    // تحديث حالة الأزرار
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });
}

function searchAppsFromPage() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    let container = document.getElementById('allApps');
    if(!container) return;
    
    if(!term) {
        filterApps(currentCategoryFilter);
        return;
    }
    
    let filtered = apps.filter(a => 
        a.name.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
    );
    
    console.log(`🔍 البحث عن: ${term} - تم العثور على ${filtered.length} تطبيق`);
    
    if(!filtered.length) {
        container.innerHTML = '<div class="loading-skeleton">🔍 لا توجد نتائج مطابقة</div>';
        return;
    }
    container.innerHTML = filtered.map(app => createAppCard(app)).join('');
}

// التحقق من وجود البيانات
let appsCheckInterval = setInterval(function() {
    if (typeof apps !== 'undefined' && apps.length > 0 && typeof categories !== 'undefined' && categories.length > 0) {
        clearInterval(appsCheckInterval);
        console.log('✅ البيانات جاهزة، بدء عرض صفحة التطبيقات');
        displayCategoriesBar();
        displayAllApps();
        
        // البحث من رابط الصفحة
        let urlParams = new URLSearchParams(window.location.search);
        let searchTerm = urlParams.get('search');
        if(searchTerm && document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = searchTerm;
            searchAppsFromPage();
        }
    } else if (typeof apps !== 'undefined' && apps.length === 0) {
        clearInterval(appsCheckInterval);
        console.log('⚠️ لا توجد تطبيقات، عرض رسالة فارغة');
        displayCategoriesBar();
        displayAllApps();
    } else {
        console.log('⏳ انتظار تحميل البيانات لصفحة التطبيقات...');
        // عرض رسالة انتظار
        if(document.getElementById('allApps') && document.getElementById('allApps').innerHTML === '') {
            document.getElementById('allApps').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التطبيقات...</div>';
        }
        if(document.getElementById('categoriesBar') && document.getElementById('categoriesBar').innerHTML === '') {
            document.getElementById('categoriesBar').innerHTML = '<div class="loading-skeleton">🔄 جاري تحميل التصنيفات...</div>';
        }
    }
}, 500);