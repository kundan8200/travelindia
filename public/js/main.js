// --- Bus Seat Selection Logic ---
let selectedSeats = [];
let currentBusPrice = 0;
let currentBusName = "";

window.openSeatModal = (name, price) => {
    currentBusName = name;
    currentBusPrice = price;
    selectedSeats = [];
    document.getElementById('modalTitle').innerText = name;
    document.getElementById('totalPriceText').innerText = "₹0";
    document.getElementById('selectedSeatsText').innerText = "None";
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    document.getElementById('seatModal').style.display = 'flex';
};

window.closeSeatModal = () => {
    document.getElementById('seatModal').style.display = 'none';
};

window.toggleSeat = (el, id) => {
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s !== id);
    } else {
        el.classList.add('selected');
        selectedSeats.push(id);
    }
    document.getElementById('selectedSeatsText').innerText = selectedSeats.join(', ') || "None";
    document.getElementById('totalPriceText').innerText = `₹${selectedSeats.length * currentBusPrice}`;
};

window.confirmBusBooking = () => {
    if (selectedSeats.length === 0) {
        alert("Please select at least one seat.");
        return;
    }
    const lastSearch = JSON.parse(localStorage.getItem('lastSearch')) || {};
    localStorage.setItem('bookingCart', JSON.stringify({
        type: 'bus',
        name: currentBusName,
        price: selectedSeats.length * currentBusPrice,
        seats: selectedSeats.join(', '),
        route: `${lastSearch.from || 'Source'} to ${lastSearch.to || 'Destination'}`,
        date: lastSearch.date || "As selected"
    }));
    window.location.href = 'checkout.html';
};

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-icon');
    const navMenu = document.querySelector('.menu-links');
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Tab Switcher for Search Forms
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

    // Hotel Filters
    const priceFilter = document.getElementById('priceFilter');
    const starFilters = document.querySelectorAll('.star-filter');
    const locationFilter = document.getElementById('locationFilter');
    const hotelCards = document.querySelectorAll('.item-box-horizontal');

    function applyFilters() {
        if (!hotelCards.length) return;
        const maxPrice = priceFilter ? parseInt(priceFilter.value) : 10000;
        const selectedStars = Array.from(starFilters)
            .filter(i => i.checked)
            .map(i => i.value);
        const selectedLocation = locationFilter ? locationFilter.value : "";

        hotelCards.forEach(card => {
            const price = parseInt(card.dataset.price);
            const stars = card.dataset.stars;
            const location = card.dataset.location;

            const priceMatch = price <= maxPrice;
            const starMatch = selectedStars.length === 0 || selectedStars.includes(stars);
            const locationMatch = selectedLocation === "" || (location && location.toLowerCase() === selectedLocation.toLowerCase());

            if (priceMatch && starMatch && locationMatch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Initialize filters from last search if on hotels.html
    if (window.location.pathname.includes('hotels.html')) {
        const lastSearch = JSON.parse(localStorage.getItem('lastSearch'));
        if (lastSearch && lastSearch.type === 'hotel' && lastSearch.city) {
            if (locationFilter) {
                locationFilter.value = lastSearch.city;
                applyFilters();
            }
        }
    }

    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            document.getElementById('priceValue').innerText = `₹${e.target.value}`;
            applyFilters();
        });
    }
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
    starFilters.forEach(f => f.addEventListener('change', applyFilters));

    // --- Search Form Submissions ---
    const hotelSearch = document.getElementById('hotel-search');
    if (hotelSearch) {
        hotelSearch.addEventListener('submit', (e) => {
            e.preventDefault();
            const details = {
                city: document.getElementById('hotel-city').value,
                checkin: document.getElementById('hotel-checkin').value,
                checkout: document.getElementById('hotel-checkout').value,
                guests: document.getElementById('hotel-guests').value
            };
            localStorage.setItem('lastSearch', JSON.stringify({ type: 'hotel', ...details }));
            window.location.href = 'hotels.html';
        });
    }

    const busSearch = document.getElementById('bus-search');
    if (busSearch) {
        busSearch.addEventListener('submit', (e) => {
            e.preventDefault();
            const details = {
                from: document.getElementById('bus-from').value,
                to: document.getElementById('bus-to').value,
                date: document.getElementById('bus-date').value
            };
            localStorage.setItem('lastSearch', JSON.stringify({ type: 'bus', ...details }));
            window.location.href = 'transport.html';
        });
    }

    const cabSearch = document.getElementById('cab-search');
    if (cabSearch) {
        cabSearch.addEventListener('submit', (e) => {
            e.preventDefault();
            const details = {
                from: document.getElementById('cab-from').value,
                to: document.getElementById('cab-to').value,
                date: document.getElementById('cab-date').value,
                vehicle: document.getElementById('cab-type').value
            };
            localStorage.setItem('lastSearch', JSON.stringify({ type: 'cab', ...details }));
            window.location.href = 'transport.html';
        });
    }

    // --- Destination Specific Search Buttons ---
    document.querySelectorAll('.location-search-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const loc = btn.dataset.location;
            if (loc) {
                localStorage.setItem('lastSearch', JSON.stringify({ type: 'hotel', city: loc }));
            }
        });
    });

    // --- Universal Booking Logic ---
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.button-blue, .button-book-now');
        if (!btn || btn.id === 'logoutBtn' || btn.id === 'chat-send' || btn.innerText.includes("Select Seats")) return;

        // Ignore buttons that are part of a search form or auth forms
        if (btn.closest('#hotel-search, #bus-search, #cab-search, #signupForm, #loginForm')) return;

        // Try to find a card/item box to get info
        const card = btn.closest('.item-box');
        if (!card) return;

        e.preventDefault(); // Prevent default link or button behavior

        // Extract info from data attributes or falls back to text
        const type = btn.dataset.type || (window.location.pathname.includes('hotel') ? 'hotel' : 'transport');
        const name = btn.dataset.name || card.querySelector('.item-heading, h2')?.innerText || "Selection";
        const priceAttr = btn.dataset.price;
        let price = "0";

        if (priceAttr) {
            price = priceAttr;
        } else {
            const priceText = card.querySelector('.item-cost')?.innerText;
            const priceMatch = priceText ? priceText.match(/₹([0-9,]+)/) : null;
            price = priceMatch ? priceMatch[1].replace(',', '') : "0";
        }

        // Get selection details from last search if available
        const lastSearch = JSON.parse(localStorage.getItem('lastSearch')) || {};
        let route = "";
        if (type === 'hotel') route = lastSearch.city || "Various";
        else route = `${lastSearch.from || 'Source'} to ${lastSearch.to || 'Destination'}`;

        localStorage.setItem('bookingCart', JSON.stringify({
            type: type,
            name: name,
            price: price,
            rate: btn.dataset.rate || "",
            route: route,
            date: lastSearch.date || lastSearch.checkin || "As selected"
        }));

        window.location.href = 'checkout.html';
    });

    // --- Checkout Page Summary ---
    const orderSummary = document.getElementById('orderSummaryBox');
    if (orderSummary) {
        const cart = JSON.parse(localStorage.getItem('bookingCart'));
        if (cart) {
            let rateHtml = cart.rate ? `<div class="summary-row"><span>KM Rate:</span><span>₹${cart.rate}/km</span></div>` : "";
            let seatsHtml = cart.seats ? `<div class="summary-row"><span>Seats:</span><strong>${cart.seats}</strong></div>` : "";
            orderSummary.innerHTML = `
                <div class="summary-row"><span>Type:</span><strong>${cart.type.toUpperCase()}</strong></div>
                <div class="summary-row"><span>Selection:</span><span>${cart.name}</span></div>
                <div class="summary-row"><span>Route/Location:</span><span>${cart.route}</span></div>
                <div class="summary-row"><span>Date:</span><span>${cart.date}</span></div>
                ${seatsHtml}
                ${rateHtml}
                <div class="summary-final-total"><span>Total Payable:</span><span>₹${cart.price}</span></div>
            `;
        } else {
            orderSummary.innerHTML = `<p style="text-align:center; padding:1rem;">Your cart is empty.</p>`;
        }
    }

    // --- Final Booking Execution ---
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('lastBookingId', "BKG" + Math.floor(100000 + Math.random() * 900000));
            // Keep current cart for confirmation details
            window.location.href = 'confirmation.html';
        });
    }

    if (document.getElementById('bkg-id')) {
        document.getElementById('bkg-id').innerText = localStorage.getItem('lastBookingId') || "BKG-123456";

        // Show details on confirmation page
        const cart = JSON.parse(localStorage.getItem('bookingCart'));
        const detailsBox = document.getElementById('booking-details-summary');
        if (cart && detailsBox) {
            detailsBox.innerHTML = `
                <div style="margin-top:2rem; padding:1.5rem; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; text-align:left; max-width:400px; margin-left:auto; margin-right:auto;">
                    <h3 style="margin-bottom:1rem; color:var(--primary); font-size:1.1rem;">Reservation Details</h3>
                    <p style="margin-bottom:0.5rem;"><strong>Service:</strong> ${cart.type.toUpperCase()}</p>
                    <p style="margin-bottom:0.5rem;"><strong>Name:</strong> ${cart.name}</p>
                    <p style="margin-bottom:0.5rem;"><strong>Route:</strong> ${cart.route}</p>
                    <p style="margin-bottom:0.5rem;"><strong>Date:</strong> ${cart.date}</p>
                    ${cart.seats ? `<p style="margin-bottom:0.5rem;"><strong>Seats:</strong> ${cart.seats}</p>` : ""}
                    <p style="font-size:1.2rem; margin-top:1rem; border-top:1px solid #e2e8f0; padding-top:0.5rem;"><strong>Total Paid:</strong> ₹${cart.price}</p>
                </div>
            `;
        }

        // Clear cart after delay/showing
        // localStorage.removeItem('bookingCart'); 
        localStorage.removeItem('lastSearch');
    }

    // --- Auth Logic ---
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            if (res.ok) { window.location.href = 'login.html'; }
            else { alert("Signup failed. Email might exist."); }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else { alert("Invalid credentials."); }
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

    // FAQ Accordion
    const faqs = document.querySelectorAll('.faq-title');
    faqs.forEach(faq => {
        faq.addEventListener('click', () => {
            const ans = faq.nextElementSibling;
            ans.style.display = (ans.style.display === 'block') ? 'none' : 'block';
        });
    });
});
