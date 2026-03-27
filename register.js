// register.js - إنشاء حساب جديد

document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
    
    // جلب البيانات من النموذج
    let username = document.getElementById('regUsername').value.trim();
    let email = document.getElementById('regEmail').value.trim();
    let password = document.getElementById('regPassword').value;
    let confirm = document.getElementById('regConfirmPassword').value;
    
    // التحقق من صحة البيانات
    if (username.length < 3) {
        showAlert('اسم المستخدم يجب أن يكون 3 أحرف على الأقل', 'error');
        return;
    }
    
    if (username.length > 30) {
        showAlert('اسم المستخدم لا يمكن أن يتجاوز 30 حرفاً', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    if (password !== confirm) {
        showAlert('كلمة المرور غير متطابقة مع تأكيد كلمة المرور', 'error');
        return;
    }
    
    // التحقق من عدم وجود مستخدم بنفس البريد أو اسم المستخدم
    if (users) {
        const existingUserByEmail = users.find(u => u.email === email);
        if (existingUserByEmail) {
            showAlert('البريد الإلكتروني مستخدم بالفعل', 'error');
            return;
        }
        
        const existingUserByUsername = users.find(u => u.username === username);
        if (existingUserByUsername) {
            showAlert('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر', 'error');
            return;
        }
    }
    
    // إنشاء مستخدم جديد
    let newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: 'user',
        date: new Date().toISOString()
    };
    
    users.push(newUser);
    await saveUsers();
    
    showAlert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن', 'success');
    
    // الانتقال إلى صفحة تسجيل الدخول بعد 2 ثانية
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});

function searchApps() {
    let term = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if(term) window.location.href = `apps.html?search=${encodeURIComponent(term)}`;
}