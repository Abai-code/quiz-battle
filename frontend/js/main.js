/**
 * №2 Практикалық жұмыс: 1-6 тапсырмалар негізгі жобада
 */

document.addEventListener('DOMContentLoaded', () => {

    // === 1-тапсырма: Батырма арқылы әрекет (about.html) ===
    const readMoreBtn = document.getElementById('read-more-btn');
    const readMoreText = document.getElementById('read-more-text');
    if (readMoreBtn && readMoreText) {
        readMoreBtn.addEventListener('click', () => {
            if (readMoreText.style.display === 'none') {
                readMoreText.style.display = 'block';
                readMoreBtn.innerText = 'Жасыру';
                readMoreBtn.style.background = '#e63946'; // Түсті өзгерту
            } else {
                readMoreText.style.display = 'none';
                readMoreBtn.innerText = 'Толығырақ оқу';
                readMoreBtn.style.background = 'var(--primary-color)';
            }
        });
    }

    // === 2-тапсырма: Формамен жұмыс (contact.html) ===
    const contactForm = document.getElementById('contact-form');
    const contactMessage = document.getElementById('contact-message');
    if (contactForm && contactMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Форманың автоматты жіберілуін тоқтату
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                contactMessage.innerText = "Барлық өрістерді толтыру міндетті!";
                contactMessage.style.color = "red";
            } else {
                contactMessage.innerText = `${name}, хабарламаңыз сәтті жіберілді!`;
                contactMessage.style.color = "green";
                contactForm.reset();
            }
        });
    }

    // === 3-тапсырма: DOM элементтерін динамикалық өзгерту (blog.html) ===
    const addCommentBtn = document.getElementById('add-comment-btn');
    const removeCommentBtn = document.getElementById('remove-comment-btn');
    const commentInput = document.getElementById('comment-input');
    const commentsList = document.getElementById('comments-list');
    
    if (addCommentBtn && removeCommentBtn && commentInput && commentsList) {
        addCommentBtn.addEventListener('click', () => {
            const text = commentInput.value.trim();
            if (text !== "") {
                const li = document.createElement('li');
                li.innerText = text;
                li.style.padding = "10px";
                li.style.borderBottom = "1px solid rgba(150,150,150,0.1)";
                commentsList.appendChild(li);
                commentInput.value = ""; // Тазарту
            }
        });

        removeCommentBtn.addEventListener('click', () => {
            if (commentsList.children.length > 0) {
                commentsList.removeChild(commentsList.lastElementChild);
            }
        });
    }

    // === 4-тапсырма: Көріну/жасыру (services.html) ===
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.icon');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isHidden = answer.style.display === 'none';
                answer.style.display = isHidden ? 'block' : 'none';
                if (icon) icon.innerText = isHidden ? '-' : '+';
            });
        }
    });

    // === 5-тапсырма: Уақыт (Таймер) (index.html) ===
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownTimer) {
        let minutes = 10;
        let seconds = 0;
        
        const interval = setInterval(() => {
            if (minutes === 0 && seconds === 0) {
                clearInterval(interval);
                countdownTimer.innerText = "ТУРНИР БАСТАЛДЫ!";
                countdownTimer.style.color = "#e63946";
                return;
            }

            if (seconds === 0) {
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }

            countdownTimer.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);
    }

    // === 6-тапсырма: Стильді өзгерту (ranking.html) ===
    const leaderboardRows = document.querySelectorAll('.leaderboard tbody tr');
    if (leaderboardRows.length > 0) {
        leaderboardRows.forEach(row => {
            row.style.cursor = 'pointer'; // Басуға болатынын көрсету үшін
            row.addEventListener('click', () => {
                row.classList.toggle('highlight-row');
            });
        });
    }
});
