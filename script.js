(function () {
  'use strict';

  // Sticky header on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Rotate through coffee, food, and drinks while keeping the transition smooth.
  const heroImage = document.querySelector('.hero-bg-img');
  const heroSlides = [
    {
      src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=90',
      alt: 'Freshly brewed coffee in a warm Ethiopian coffee house',
    },
    {
      src: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1800&q=90',
      alt: 'A colorful plate of freshly prepared food',
    },
    {
      src: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1800&q=90',
      alt: 'Refreshing drinks served at Buna Bet',
    },
  ];
  let heroSlideIndex = 0;

  const showNextHeroSlide = () => {
    const nextSlide = heroSlides[(heroSlideIndex + 1) % heroSlides.length];
    const preloadedImage = new Image();
    preloadedImage.src = nextSlide.src;
    preloadedImage.onload = () => {
      heroImage.classList.add('is-changing');
      window.setTimeout(() => {
        heroImage.src = nextSlide.src;
        heroImage.alt = nextSlide.alt;
        heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
        heroImage.classList.remove('is-changing');
      }, 650);
    };
  };

  window.setInterval(showNextHeroSlide, 6000);

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  const closeMobileNav = () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mobileNavClose.addEventListener('click', closeMobileNav);

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // Menu tabs
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = {
    coffee: document.getElementById('menu-coffee'),
    breakfast: document.getElementById('menu-breakfast'),
    lunch: document.getElementById('menu-lunch'),
    drinks: document.getElementById('menu-drinks'),
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      tabs.forEach((t) => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));

      Object.values(panels).forEach((panel) => panel.classList.add('hidden'));
      panels[target].classList.remove('hidden');
    });
  });

  document.querySelectorAll('[data-menu-tab]').forEach((link) => {
    link.addEventListener('click', () => {
      const matchingTab = document.querySelector(`.menu-tab[data-tab="${link.dataset.menuTab}"]`);
      if (matchingTab) matchingTab.click();
    });
  });

  // Add-to-order basket
  const cartTrigger = document.getElementById('cart-trigger');
  const cartClose = document.getElementById('cart-close');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const orderForm = document.getElementById('order-form');
  const orderMessage = document.getElementById('order-message');
  const cart = new Map();

  const formatPrice = (price) => `${price.toLocaleString()} ETB`;

  const renderCart = () => {
    const items = [...cart.values()];
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = itemCount;
    cartTotal.textContent = formatPrice(total);

    if (!items.length) {
      cartItems.innerHTML = '<p class="cart-empty">Your basket is waiting for something delicious.</p>';
      return;
    }

    cartItems.innerHTML = items.map((item) => `
      <div class="cart-item" data-cart-item="${item.id}">
        <img src="${item.image}" alt="" width="64" height="64" />
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${formatPrice(item.price)}</span>
          <div class="quantity-controls">
            <button type="button" data-cart-action="decrease" aria-label="Decrease ${item.name}">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" aria-label="Increase ${item.name}">+</button>
          </div>
        </div>
        <button class="cart-remove" type="button" data-cart-action="remove" aria-label="Remove ${item.name}">&times;</button>
      </div>
    `).join('');
  };

  const setCartOpen = (isOpen) => {
    cartDrawer.classList.toggle('open', isOpen);
    cartBackdrop.hidden = !isOpen;
    cartTrigger.setAttribute('aria-expanded', String(isOpen));
    cartDrawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('cart-is-open', isOpen);
  };

  document.querySelectorAll('.menu-card').forEach((card, index) => {
    const name = card.querySelector('h3').textContent.trim();
    const price = Number.parseInt(card.querySelector('.price').textContent, 10);
    const image = card.querySelector('img').src;
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
    const button = document.createElement('button');
    button.className = 'add-to-cart';
    button.type = 'button';
    button.textContent = 'Add to order';
    button.addEventListener('click', () => {
      const existing = cart.get(id);
      cart.set(id, { id, name, price, image, quantity: existing ? existing.quantity + 1 : 1 });
      renderCart();
      setCartOpen(true);
    });
    card.querySelector('.menu-card-body').appendChild(button);
  });

  cartItems.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-cart-action]');
    if (!actionButton) return;
    const itemElement = actionButton.closest('[data-cart-item]');
    const item = cart.get(itemElement.dataset.cartItem);
    if (!item) return;

    if (actionButton.dataset.cartAction === 'increase') item.quantity += 1;
    if (actionButton.dataset.cartAction === 'decrease') item.quantity -= 1;
    if (actionButton.dataset.cartAction === 'remove' || item.quantity < 1) cart.delete(item.id);
    renderCart();
  });

  cartTrigger.addEventListener('click', () => setCartOpen(true));
  cartClose.addEventListener('click', () => setCartOpen(false));
  cartBackdrop.addEventListener('click', () => setCartOpen(false));

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.size) {
      orderMessage.textContent = 'Add at least one item before placing your order.';
      orderMessage.className = 'form-note error';
      return;
    }

    orderMessage.textContent = `Thanks, ${orderForm.orderName.value.trim()}! We received your order and will call to confirm it.`;
    orderMessage.className = 'form-note success';
    cart.clear();
    renderCart();
    orderForm.reset();
  });

  // Reservation form
  const form = document.getElementById('reservation-form');
  const formMessage = document.getElementById('form-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const date = form.date.value;
    const time = form.time.value;
    const requestType = form.requestType.value;

    if (!name || !phone || !date || !time) {
      formMessage.textContent = 'Please fill in all required fields.';
      formMessage.className = 'form-note error';
      return;
    }

    const requestLabels = {
      reservation: `Your table for ${form.guests.value} on ${date} at ${time} is confirmed.`,
      pickup: `Your pickup request for ${date} at ${time} is confirmed.`,
      contact: 'We received your message and will contact you soon.',
    };
    formMessage.textContent = `Thank you, ${name}! ${requestLabels[requestType]}`;
    formMessage.className = 'form-note success';
    form.reset();
  });

  // Set minimum date to today
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  // Smooth reveal on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.menu-card, .testimonial, .step, .about-text, .about-image').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
})();
