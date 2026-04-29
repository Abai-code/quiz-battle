/**
 * №2 Практикалық жұмыс: 7-9 тапсырмалар (Аутентификация)
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerMessage = document.getElementById('register-message');
    const loginMessage = document.getElementById('login-message');

    // === 7-тапсырма: Тіркелу (Register) ===
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();

            // Тексеру (Validation)
            if (!name || !email || !password) {
                showMessage(registerMessage, "Барлық өрістерді толтырыңыз!", "red");
                return;
            }

            if (password.length < 6) {
                showMessage(registerMessage, "Құпиясөз кемінде 6 символ болуы керек!", "red");
                return;
            }

            // Барлық қолданушыларды алу (немесе бос массив)
            let users = JSON.parse(localStorage.getItem('users')) || [];

            // Поштаның қайталанбауын тексеру
            const userExists = users.some(u => u.email === email);
            if (userExists) {
                showMessage(registerMessage, "Бұл поштамен аккаунт бұрын тіркелген!", "red");
                return;
            }

            // Деректерді сақтау (localStorage)
            const userData = { name, email, password };
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));

            showMessage(registerMessage, "Тіркелу сәтті аяқталды! Кіру бетіне өтіңіз.", "green");
            
            // 2 секундтан кейін login бетіне бағыттау
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // === 8-тапсырма: Кіру (Login) ===
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Базадан (users) іздеу
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const validUser = users.find(u => u.email === email && u.password === password);

            if (validUser) {
                showMessage(loginMessage, "Сәтті кірдіңіз!", "green");
                
                // Сессияны сақтау (login күйі)
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify(validUser)); // Ағымдағы адам
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(loginMessage, "Email немесе пароль қате!", "red");
            }
        });
    }

    // === 9-тапсырма: Қолданушы күйі және Шығу ===
    updateAuthState();
});

/**
 * Хабарлама шығару функциясы
 */
function showMessage(element, text, color) {
    if (element) {
        element.innerText = text;
        element.style.color = color;
    }
}

/**
 * Авторизация күйін тексеру және интерфейсті жаңарту
 */
function updateAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const navProfile = document.getElementById('nav-profile');
    
    // Админ екенін тексеру (email арқылы)
    const isAdmin = isLoggedIn && storedUser && storedUser.email === 'admin@admin.kz';

    const nav = document.querySelector('nav');
    
    // Мәзірдегі (Навигациядағы) сілтемелерді реттеу және тазарту
    if (nav) {
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href) {
                // 1. Ескі "Quiz/Сұрақтар" макетін мәзірден толық жасырамыз
                if (href === 'quiz.html') {
                    link.style.display = 'none';
                }
                
                // 2. Маркетингтік беттерді (Біз туралы, Қызметтер, Блог, Байланыс) тек ЖҮЙЕГЕ КІРМЕГЕН қонақтарға көрсетеміз
                if (['about.html', 'services.html', 'blog.html', 'contact.html'].includes(href)) {
                    link.style.display = !isLoggedIn ? 'inline-block' : 'none';
                }

                // 3. "Админ (CRUD)" бетін тек АДМИНГЕ көрсетеміз
                if (href === 'admin-react.html') {
                    link.style.display = isAdmin ? 'inline-block' : 'none';
                }
                
                // 4. "Ойын (React)" және "Рейтинг" беттерін тек ЖҮЙЕГЕ КІРГЕНДЕРГЕ көрсетеміз
                if (href === 'quiz-react.html' || href === 'ranking.html') {
                    link.style.display = isLoggedIn ? 'inline-block' : 'none';
                }
            }
        });
    }

    if (isLoggedIn && storedUser && nav) {
        // Профиль сілтемесінде атын көрсету
        if (navProfile) {
            navProfile.style.display = 'inline-block';
            navProfile.innerText = `${storedUser.name} (Профиль)`;
            navProfile.href = 'profile.html';
        }

        // Ensure nav exists before adding logout button
        if (nav && !document.getElementById('logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.innerText = 'Шығу';
            logoutBtn.className = 'nav-btn nav-btn-danger';
            logoutBtn.style.marginLeft = '10px';
            
            logoutBtn.onclick = () => {
                try {
                    // Clear authentication flags and user data
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('user');
                } catch (e) {
                    console.error('Logout cleanup error:', e);
                }
                // Redirect to home page after logout
                window.location.href = 'index.html';
            };
            
            nav.appendChild(logoutBtn);
        }
    } else {
        // ЕГЕР ЖҮЙЕГЕ КІРМЕГЕН БОЛСА (ҚОНАҚ)
        if (navProfile) {
            navProfile.innerText = 'Кіру';
            navProfile.href = 'login.html';
            navProfile.style.display = 'inline-block';
            // Кіру батырмасын да әдемілеу
            navProfile.className = 'nav-btn nav-btn-primary';
            navProfile.style.marginLeft = '10px';
        }

        // Тіркелу сілтемесін динамикалық түрде қосу
        if (!document.getElementById('nav-register') && nav) {
            const registerLink = document.createElement('a');
            registerLink.id = 'nav-register';
            registerLink.innerText = 'Тіркелу';
            registerLink.href = 'register.html';
            registerLink.className = 'nav-btn'; // Жай батырма (primary емес)
            registerLink.style.border = '2px solid var(--primary-color)';
            registerLink.style.color = 'var(--text-color)';
            
            // "Кіру" (navProfile) сілтемесінің қасына қосу
            nav.insertBefore(registerLink, navProfile);
        }
    }

    // Егер профиль бетінде болсақ, атын шығару
    const profileName = document.getElementById('user-profile-name');
    if (profileName && isLoggedIn && storedUser) {
        profileName.innerText = storedUser.name;
    }
}
