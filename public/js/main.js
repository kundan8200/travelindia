document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.mobile-icon');
    const navMenu = document.querySelector('.menu-links');
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const tabBtns = document.querySelectorAll('.tab-button');
    const searchForms = document.querySelectorAll('.search-input-form');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                searchForms.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
                const targetForm = document.getElementById(btn.dataset.target);
                if (targetForm) targetForm.classList.add('active');
            });
        });
    }

    const priceFilter = document.getElementById('priceFilter');
    const starFilters = document.querySelectorAll('.star-filter');
    const hotelCards = document.querySelectorAll('.item-box-horizontal');

    function applyFilters() {
        if (!hotelCards.length) return;
        const maxPrice = priceFilter ? parseInt(priceFilter.value) : 10000;
        const selectedStars = Array.from(starFilters)
            .filter(i => i.checked)
            .map(i => i.value);

        hotelCards.forEach(card => {
            const price = parseInt(card.dataset.price);
            const stars = card.dataset.stars;
            const priceMatch = price <= maxPrice;
            const starMatch = selectedStars.length === 0 || selectedStars.includes(stars);

            if (priceMatch && starMatch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            document.getElementById('priceValue').innerText = `₹${e.target.value}`;
            applyFilters();
        });
    }
    starFilters.forEach(f => f.addEventListener('change', applyFilters));

    const bookBtns = document.querySelectorAll('.button-blue');
    bookBtns.forEach(btn => {
        if (btn.innerText.includes("Book Now")) {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.item-box');
                if (!card) return;
                const name = card.querySelector('.item-heading').innerText;
                const priceMatch = card.querySelector('.item-cost').innerText.match(/₹([0-9,]+)/);
                const price = priceMatch ? priceMatch[1].replace(',', '') : "0";
                
                localStorage.setItem('bookingCart', JSON.stringify({
                    type: 'hotel',
                    name: name,
                    price: price
                }));
                window.location.href = 'checkout.html';
            });
        }
    });

    const checkoutForm = document.getElementById('checkoutForm');
    const orderSummary = document.getElementById('orderSummaryBox');
    if (orderSummary) {
        const cart = JSON.parse(localStorage.getItem('bookingCart'));
        if (cart) {
            orderSummary.innerHTML = `
                <div class="summary-row"><span>Item:</span><strong>${cart.name}</strong></div>
                <div class="summary-row"><span>Type:</span><span>${cart.type.toUpperCase()}</span></div>
                <div class="summary-final-total"><span>Total:</span><span>₹${cart.price}</span></div>
            `;
        }
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('lastBookingId', "BKG" + Math.floor(100000 + Math.random() * 900000));
            window.location.href = 'confirmation.html';
        });
    }

    if (document.getElementById('bkg-id')) {
        document.getElementById('bkg-id').innerText = localStorage.getItem('lastBookingId') || "BKG-123456";
        localStorage.removeItem('bookingCart');
    }

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    if(signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            if(res.ok) { window.location.href = 'login.html'; }
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            if(res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            }
        });
    }

    const authLinks = document.getElementById('authLinks');
    const authUser = JSON.parse(localStorage.getItem('user'));
    if (authLinks && authUser) {
        authLinks.innerHTML = `<span style="margin-right:1rem;">Hi, ${authUser.name}</span><a href="#" id="logoutBtn" class="button button-border">Logout</a>`;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });
    }

    const faqs = document.querySelectorAll('.faq-title');
    faqs.forEach(faq => {
        faq.addEventListener('click', () => {
            const ans = faq.nextElementSibling;
            ans.style.display = (ans.style.display === 'block') ? 'none' : 'block';
        });
    });
});
