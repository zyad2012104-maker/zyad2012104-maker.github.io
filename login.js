// login.js - تسجيل الدخول

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    let input = document.getElementById('loginEmail').value.trim();
    let password = document.getElementById('loginPassword').value;
    
    if (!input || !password) {
        showAlert('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
        return;
    }
    
    // انتظار تحميل البيانات
    if (!jsonbinReady) {
        showAlert('جاري تحميل البيانات...', 'info');
        await new Promise(resolve => {
            const checkReady = setInterval(() => {
                if (jsonbinReady) {
                    clearInterval(checkReady);
                    resolve();
                }
            }, 100);
        });
    }
    
    console.log('🔍 محاولة تسجيل الدخول...');
    console.log(`👤 المستخدم: ${input}`);
    console.log(`👥 عدد المستخدمين: ${users ? users.length : 0}`);
    
    // عرض المستخدمين للتأكد
    if (users && users.length > 0) {
        console.log('📋 قائمة المستخدمين:');
        users.forEach(u => {
            console.log(`   - username: "${u.username}", email: "${u.email}", role: ${u.role}`);
        });
    }
    
    // البحث عن المستخدم - يبحث في username و email
    let user = null;
    if (users && users.length > 0) {
        user = users.find(u => 
            (u.username === input || u.email === input) && u.password === password
        );
    }
    
    // إذا كان المدخل admin وكلمة المرور admin2012 ولم يتم العثور على مستخدم
    if (!user && input === 'admin' && password === 'admin2012') {
        console.log('⚠️ محاولة إنشاء مستخدم admin تلقائياً...');
        user = {
            id: Date.now(),
            username: "admin",
            email: "admin",
            password: "admin2012",
            role: "admin",
            date: new Date().toISOString()
        };
        users.push(user);
        await saveUsers();
        console.log('✅ تم إنشاء مستخدم admin بنجاح');
    }
    
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        console.log(`✅ تم تسجيل الدخول بنجاح: ${user.username} (${user.role})`);
        
        showAlert(`مرحباً ${user.username}`, 'success');
        
        if(user.role === 'admin' || user.role === 'moderator') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        console.log('❌ فشل تسجيل الدخول');
        showAlert('بيانات الدخول غير صحيحة. تأكد من اسم المستخدم وكلمة المرور', 'error');
    }
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}