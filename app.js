/* ============================================
   WINNY'S CHRISTIAN ZONE — app.js
   ============================================ */

'use strict';

const CROSS_SVG_ICON = `<svg class="cross-icon" viewBox="0 0 20 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8.5 1C8.5 0.45 8.95 0 9.5 0H10.5C11.05 0 11.5 0.45 11.5 1V7H17.5C18.05 7 18.5 7.45 18.5 8V9C18.5 9.55 18.05 10 17.5 10H11.5V25C11.5 25.55 11.05 26 10.5 26H9.5C8.95 26 8.5 25.55 8.5 25V10H2.5C1.95 10 1.5 9.55 1.5 9V8C1.5 7.45 1.95 7 2.5 7H8.5V1Z"/></svg>`;

// ============================================
// PRODUCT DATA (prices in INR, no false discounts)
// ============================================
const PRODUCTS = [
  {
    id: 1,
    name: 'Grace Graphic Tee',
    category: 'apparel',
    price: 2699,
    badge: 'Best Seller',
    badgeType: '',
    rating: 5,
    reviewCount: 148,
    image: 'images/category_apparel.jpg',
    desc: '100% premium combed cotton tee printed with faith-inspired scripture typography. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 2,
    name: 'Faith Over Fear Hoodie',
    category: 'apparel',
    price: 4899,
    badge: 'Popular',
    badgeType: '',
    rating: 5,
    reviewCount: 89,
    image: 'images/category_apparel.jpg',
    desc: 'Cozy fleece-lined heavyweight hoodie with bold embroidered scripture artwork. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 3,
    name: 'Gold Cross Necklace',
    category: 'jewelry',
    price: 3799,
    badge: 'New',
    badgeType: 'new',
    rating: 5,
    reviewCount: 62,
    image: 'images/category_jewelry.jpg',
    desc: '18K gold-plated stainless steel crucifix on an adjustable artisan chain. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 4,
    name: 'Scripture Faith Bracelet',
    category: 'jewelry',
    price: 2299,
    badge: 'Handcrafted',
    badgeType: '',
    rating: 4,
    reviewCount: 44,
    image: 'images/category_jewelry.jpg',
    desc: 'Handcrafted natural stone beads featuring an engraved silver verse charm. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 5,
    name: 'John 3:16 Ceramic Mug',
    category: 'home',
    price: 1849,
    badge: 'Best Seller',
    badgeType: '',
    rating: 5,
    reviewCount: 201,
    image: 'images/product_mug.jpg',
    desc: '12oz microwave & dishwasher safe ceramic mug with gold-foiled scripture. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 6,
    name: 'Blessed Faith Journal',
    category: 'gifts',
    price: 2849,
    badge: 'New',
    badgeType: 'new',
    rating: 5,
    reviewCount: 77,
    image: 'images/product_journal.jpg',
    desc: 'Hardcover devotional journal with 192 lined pages, ribbon marker & scripture. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 7,
    name: 'Angel Wings Earrings',
    category: 'jewelry',
    price: 2999,
    badge: '',
    badgeType: '',
    rating: 4,
    reviewCount: 33,
    image: 'images/category_jewelry.jpg',
    desc: 'Hypoallergenic 925 sterling silver drop earrings with delicate feather detailing. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 8,
    name: 'Christian Gift Set Deluxe',
    category: 'gifts',
    price: 6499,
    badge: 'Best Seller',
    badgeType: '',
    rating: 5,
    reviewCount: 55,
    image: 'images/product_giftset.jpg',
    desc: 'Luxurious gift box with devotional journal, scripture mug & scented candle. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 9,
    name: 'Walk by Faith Canvas Tote',
    category: 'apparel',
    price: 1999,
    badge: 'New',
    badgeType: 'new',
    rating: 5,
    reviewCount: 41,
    image: 'images/category_apparel.jpg',
    desc: 'Heavy-duty organic canvas tote with reinforced shoulder straps and biblical print. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 10,
    name: 'Sterling Silver Rosary',
    category: 'jewelry',
    price: 4299,
    badge: 'Blessed',
    badgeType: '',
    rating: 5,
    reviewCount: 73,
    image: 'images/category_jewelry.jpg',
    desc: 'Solid 925 sterling silver prayer rosary with detailed corpus & Marian medal. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 11,
    name: 'Psalm 23 Olive Wood Wall Cross',
    category: 'home',
    price: 3499,
    badge: 'Handcrafted',
    badgeType: '',
    rating: 5,
    reviewCount: 96,
    image: 'images/product_mug.jpg',
    desc: 'Hand-carved natural olive wood wall cross engraved with beloved Psalm 23. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 12,
    name: 'Promises of God Scripture Cards',
    category: 'gifts',
    price: 1699,
    badge: '',
    badgeType: '',
    rating: 5,
    reviewCount: 68,
    image: 'images/product_journal.jpg',
    desc: 'Deck of 52 gold-edged devotional verse reflection cards in a luxury keepsake box. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 13,
    name: 'Be Still & Know Sweatshirt',
    category: 'apparel',
    price: 3999,
    badge: 'Best Seller',
    badgeType: '',
    rating: 5,
    reviewCount: 112,
    image: 'images/social_faith_tee.jpg',
    desc: 'Soft crewneck fleece sweatshirt with comforting Psalm 46:10 graphic. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 14,
    name: 'Mustard Seed Faith Pendant',
    category: 'jewelry',
    price: 3199,
    badge: 'New',
    badgeType: 'new',
    rating: 5,
    reviewCount: 51,
    image: 'images/category_jewelry.jpg',
    desc: 'Genuine mustard seed encapsulated in clear resin sphere on a delicate gold chain. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 15,
    name: 'Lavender & Amber Prayer Candle',
    category: 'home',
    price: 1499,
    badge: '',
    badgeType: '',
    rating: 4,
    reviewCount: 39,
    image: 'images/product_mug.jpg',
    desc: 'Hand-poured 100% natural soy wax aromatherapy candle with 45-hour burn time. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  },
  {
    id: 16,
    name: 'Leather Bound Devotional Journal',
    category: 'gifts',
    price: 4599,
    badge: 'Premium',
    badgeType: '',
    rating: 5,
    reviewCount: 84,
    image: 'images/product_journal.jpg',
    desc: 'Full-grain genuine leather bound journal with vintage wrap tie & archival paper. Includes easy 3-day returns.',
    returnPolicy: '3-Day Returns',
    liked: false
  }
];

// ============================================
// CART STATE
// ============================================
let cart = [];
let activeTab = 'all';
let currentSlide = 0;
const totalSlides = 5;

// ============================================
// DEVICE DETECTION & ADAPTIVE RUNTIME ENGINE
// ============================================
const DeviceManager = {
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isTouch: false,
  orientation: 'portrait',

  init() {
    this.detect();
    window.addEventListener('resize', () => this.detect(), { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.detect(), 120);
    }, { passive: true });
  },

  detect() {
    const width = window.innerWidth;
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
    this.isMobile = width <= 768;
    this.isTablet = width > 768 && width <= 1024;
    this.isDesktop = width > 1024;
    this.orientation = window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';

    const root = document.documentElement;
    root.classList.toggle('is-mobile', this.isMobile);
    root.classList.toggle('is-tablet', this.isTablet);
    root.classList.toggle('is-desktop', this.isDesktop);
    root.classList.toggle('has-touch', this.isTouch);
    root.classList.toggle('no-touch', !this.isTouch);
    root.setAttribute('data-device', this.isMobile ? 'mobile' : (this.isTablet ? 'tablet' : 'desktop'));
    root.setAttribute('data-orientation', this.orientation);

    // Auto-close mobile navigation if viewport expands to desktop
    if (this.isDesktop) {
      const nav = document.getElementById('mobile-nav');
      const overlay = document.getElementById('mobile-nav-overlay');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        overlay && overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  }
};

// Immediate invocation so <html> reflects device capabilities before DOM render
DeviceManager.init();

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  DeviceManager.detect();
  initSplashScreen();
  initHeader();
  initMobileNav();
  initSearch();
  initDropdown();
  initProducts();
  initTabs();
  initCart();
  initTestimonials();
  initNewsletter();
  initScrollAnimations();
  initSmoothScroll();
  loadCartFromStorage();
});

// ============================================
// HEADER — scroll behaviour
// ============================================
function initHeader() {
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ============================================
// MOBILE NAV
// ============================================
function initMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-nav-overlay');
  const close = document.getElementById('mobile-nav-close');

  function openNav() {
    nav.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn && btn.addEventListener('click', openNav);
  close && close.addEventListener('click', closeNav);
  overlay && overlay.addEventListener('click', closeNav);

  // Close on nav link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Touch swipe to close drawer on mobile
  let navTouchStartX = 0;
  if (nav) {
    nav.addEventListener('touchstart', e => {
      navTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    nav.addEventListener('touchend', e => {
      const diffX = navTouchStartX - e.changedTouches[0].clientX;
      if (diffX > 50) { // swiped left
        closeNav();
      }
    }, { passive: true });
  }
}

// ============================================
// DROPDOWN
// ============================================
function initDropdown() {
  const shopLink = document.getElementById('nav-shop');
  const dropdown = document.getElementById('dropdown-shop');
  let timeout;

  if (!shopLink || !dropdown) return;

  shopLink.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.classList.add('open');
  });

  shopLink.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => dropdown.classList.remove('open'), 120);
  });

  dropdown.addEventListener('mouseenter', () => clearTimeout(timeout));
  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => dropdown.classList.remove('open'), 120);
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdown.classList.remove('open');
  });
}

// ============================================
// SEARCH
// ============================================
function initSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput && searchInput.focus(), 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  searchBtn && searchBtn.addEventListener('click', openSearch);
  searchClose && searchClose.addEventListener('click', closeSearch);

  searchOverlay && searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  const searchSubmit = document.getElementById('search-submit-btn');
  function executeSearch() {
    const query = searchInput ? searchInput.value.trim() : '';
    if (query) {
      window.location.href = `collections.html?search=${encodeURIComponent(query)}`;
    }
  }

  searchSubmit && searchSubmit.addEventListener('click', executeSearch);
  searchInput && searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  });

  // Search tags autofill & search
  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.textContent.trim();
      window.location.href = `collections.html?search=${encodeURIComponent(query)}`;
    });
  });
}

let currentSort = 'featured';
let currentSearch = '';

function initProducts() {
  // Check URL query parameters (for collections.html navigation)
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category');
  const sortParam = params.get('sort');
  const searchParam = params.get('search');

  if (catParam) {
    activeTab = catParam;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === catParam);
    });
  }

  if (sortParam) {
    currentSort = sortParam;
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = sortParam;
  }

  if (searchParam) {
    currentSearch = searchParam.toLowerCase();
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) searchInput.value = searchParam;
  }

  // Bind catalog-specific controls if on collections.html
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts(activeTab);
    });
  }

  const catalogSearch = document.getElementById('catalog-search');
  if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderProducts(activeTab);
    });
  }

  // Check if Supabase has live products available
  if (typeof fetchProductsFromDatabase === 'function') {
    fetchProductsFromDatabase().then(dbProducts => {
      if (dbProducts && dbProducts.length > 0) {
        PRODUCTS.length = 0;
        PRODUCTS.push(...dbProducts);
        renderProducts(activeTab);
      }
    });
  }

  renderProducts(activeTab);
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      renderProducts(activeTab);
    });
  });
}

function renderProducts(tab) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const isCollectionsPage = window.location.pathname.includes('collections.html') || document.body.classList.contains('collections-page');

  let filtered = tab === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === tab);

  // Search filter
  if (currentSearch) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.category.toLowerCase().includes(currentSearch) ||
      getCategoryLabel(p.category).toLowerCase().includes(currentSearch)
    );
  }

  // Sort
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  } else if (currentSort === 'new') {
    filtered.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
  } else if (currentSort === 'best') {
    filtered.sort((a, b) => (b.badge === 'Best Seller' ? 1 : 0) - (a.badge === 'Best Seller' ? 1 : 0));
  }

  // Update product count label if present
  const countEl = document.getElementById('products-count');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
  }

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="collections-empty" style="grid-column: 1 / -1;">
        <div class="collections-empty-icon">${CROSS_SVG_ICON}</div>
        <h3>No products found</h3>
        <p>Try clearing your search or switching to another category.</p>
      </div>
    `;
    return;
  }

  // On index.html when "all" is selected, show top 8 featured
  const itemsToRender = (!isCollectionsPage && tab === 'all')
    ? filtered.slice(0, 8)
    : filtered;

  itemsToRender.forEach((product, i) => {
    const stars = '&#9733;'.repeat(product.rating) + (product.rating < 5 ? '&#9734;'.repeat(5 - product.rating) : '');
    const badgeHtml = product.badge
      ? `<div class="product-badge ${product.badgeType}">${product.badge}</div>`
      : '';

    const card = document.createElement('div');
    card.className = 'product-card fade-in-up';
    card.style.transitionDelay = `${(i % 8) * 0.06}s`;
    card.dataset.productId = product.id;

    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
        ${badgeHtml}
        <button class="product-wishlist ${product.liked ? 'liked' : ''}" data-id="${product.id}" aria-label="Add to wishlist">
          ${product.liked ? '&#10084;' : '&#9825;'}
        </button>
        <button class="product-quick-add" data-id="${product.id}">Add to Cart &#10022;</button>
      </div>
      <div class="product-info">
        <p class="product-category">${getCategoryLabel(product.category)}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-rating">
          <span class="product-stars">${stars}</span>
          <span class="product-rating-count">(${product.reviewCount})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="product-return-badge" title="3-Day Return Policy">
            <svg class="return-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
            3-Day Returns
          </span>
        </div>
      </div>
    `;

    grid.appendChild(card);

    // Trigger animation
    setTimeout(() => card.classList.add('visible'), 40 + (i % 8) * 50);

    // Wishlist toggle
    const wishBtn = card.querySelector('.product-wishlist');
    wishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(product.id, wishBtn);
    });

    // Quick add
    const addBtn = card.querySelector('.product-quick-add');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });
  });
}

function formatPrice(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function getCategoryLabel(cat) {
  const labels = {
    apparel: 'Apparel & Clothing',
    jewelry: 'Jewelry & Accessories',
    home: 'Home Décor',
    gifts: 'Devotionals & Gifts'
  };
  return labels[cat] || cat;
}

function toggleWishlist(id, btn) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  product.liked = !product.liked;
  btn.innerHTML = product.liked ? '&#10084;' : '&#9825;';
  btn.classList.toggle('liked', product.liked);
  showToast(product.liked ? `Added to wishlist &#10084;` : `Removed from wishlist`);
}

// ============================================
// CART
// ============================================
// ============================================
// CART — FULL PAGE & PERSISTENCE
// ============================================
let appliedDiscount = 0;
let appliedDiscountCode = '';

function initCart() {
  const isCartPage = window.location.pathname.includes('cart.html') || document.body.classList.contains('cart-page');

  if (isCartPage) {
    // Clear cart button
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          cart = [];
          appliedDiscount = 0;
          appliedDiscountCode = '';
          saveCartToStorage();
          updateCartUI();
        }
      });
    }

    // Promo code apply
    const promoBtn = document.getElementById('promo-btn');
    const promoInput = document.getElementById('promo-input');
    const promoMsg = document.getElementById('promo-msg');

    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'BLESS10') {
          appliedDiscount = 0.10; // 10% off
          appliedDiscountCode = 'BLESS10';
          if (promoMsg) {
            promoMsg.textContent = '✓ 10% Blessing discount applied!';
            promoMsg.style.color = '#2e7d32';
          }
          showToast('10% discount applied! ✦');
          updateCartUI();
        } else if (code === 'GRACE') {
          appliedDiscount = 500; // Flat ₹500 off
          appliedDiscountCode = 'GRACE';
          if (promoMsg) {
            promoMsg.textContent = '✓ ₹500 Grace discount applied!';
            promoMsg.style.color = '#2e7d32';
          }
          showToast('₹500 discount applied! ✦');
          updateCartUI();
        } else if (!code) {
          if (promoMsg) {
            promoMsg.textContent = 'Please enter a promo code.';
            promoMsg.style.color = '#c94a4a';
          }
        } else {
          if (promoMsg) {
            promoMsg.textContent = 'Invalid promo code. Try BLESS10';
            promoMsg.style.color = '#c94a4a';
          }
        }
      });
    }

    // Checkout modal open & close
    const openModalBtn = document.getElementById('open-checkout-modal-btn');
    const checkoutModal = document.getElementById('checkout-modal-overlay');
    const closeModalBtn = document.getElementById('checkout-modal-close');
    const checkoutForm = document.getElementById('checkout-form');
    const successModal = document.getElementById('order-success-modal');

    if (openModalBtn && checkoutModal) {
      openModalBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          showToast('Your cart is empty');
          return;
        }
        checkoutModal.classList.add('open');
      });
    }

    if (closeModalBtn && checkoutModal) {
      closeModalBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
      });
    }

    if (checkoutModal) {
      checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
          checkoutModal.classList.remove('open');
        }
      });
    }

    // Payment radio styling
    document.querySelectorAll('.checkout-pay-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.checkout-pay-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Form submit / Place Order with Razorpay or COD
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const customerName = document.getElementById('checkout-name')?.value || '';
        const customerPhone = document.getElementById('checkout-phone')?.value || '';
        const customerEmail = document.getElementById('checkout-email')?.value || '';
        const customerAddress = document.getElementById('checkout-address')?.value || '';
        const selectedPayOpt = document.querySelector('input[name="payment"]:checked')?.value || 'razorpay';

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const orderId = 'WCZ-' + Math.floor(10000 + Math.random() * 90000);

        const orderDetails = {
          amount: subtotal,
          orderNumber: orderId,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress,
          items: [...cart]
        };

        if (selectedPayOpt === 'razorpay') {
          checkoutModal.classList.remove('open');
          if (typeof initRazorpayPayment === 'function') {
            initRazorpayPayment(orderDetails);
          }
          return;
        }

        // Cash on Delivery
        checkoutModal.classList.remove('open');
        const confirmIdEl = document.getElementById('order-confirm-id');
        if (confirmIdEl) confirmIdEl.textContent = '#' + orderId;

        // Log order to Supabase
        if (typeof saveOrderToSupabase === 'function') {
          saveOrderToSupabase(orderDetails, null);
        }

        cart = [];
        appliedDiscount = 0;
        appliedDiscountCode = '';
        saveCartToStorage();
        updateCartUI();

        if (successModal) {
          successModal.classList.add('open');
        }
      });
    }
  }

  // Ensure cart button always routes to cart.html
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn && cartBtn.tagName === 'BUTTON') {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  }
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`${product.name} added! <a href="cart.html" style="color:var(--gold);text-decoration:underline;margin-left:8px;font-weight:600;">View Cart &rarr;</a>`);
  bumpCartCount();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }
  item.qty = newQty;
  saveCartToStorage();
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const rawSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Update header badges
  if (countEl) countEl.textContent = totalQty;

  // Render on cart.html if present
  renderCartPage(rawSubtotal, totalQty);
}

function renderCartPage(subtotal, totalQty) {
  const itemsContainer = document.getElementById('cart-page-items');
  const emptyView = document.getElementById('cart-empty-view');
  const activeView = document.getElementById('cart-active-view');
  const shippingWrap = document.getElementById('cart-shipping-bar-wrap');

  if (!itemsContainer) return; // Not on cart.html

  const titleCountEl = document.getElementById('cart-item-count-title');
  if (titleCountEl) {
    titleCountEl.textContent = `(${totalQty} item${totalQty === 1 ? '' : 's'})`;
  }

  if (cart.length === 0) {
    if (emptyView) emptyView.style.display = 'block';
    if (activeView) activeView.style.display = 'none';
    if (shippingWrap) shippingWrap.style.display = 'none';
    return;
  }

  if (emptyView) emptyView.style.display = 'none';
  if (activeView) activeView.style.display = 'grid';
  if (shippingWrap) shippingWrap.style.display = 'block';

  // Delivery calculation (Free on bulk orders: 5+ items or ₹5,000+)
  const isBulkOrder = totalQty >= 5 || subtotal >= 5000;
  const shippingCost = isBulkOrder ? 0 : 199;
  const shippingText = document.getElementById('free-shipping-text');
  if (shippingText) {
    if (isBulkOrder) {
      shippingText.innerHTML = `<strong>${CROSS_SVG_ICON} Free delivery applied on your bulk order!</strong>`;
    } else {
      shippingText.textContent = 'Free delivery on bulk orders';
    }
  }

  // Discount calculation
  let discountAmount = 0;
  if (appliedDiscount > 0) {
    if (appliedDiscount < 1) {
      discountAmount = Math.round(subtotal * appliedDiscount);
    } else {
      discountAmount = Math.min(subtotal, appliedDiscount);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Update summary numbers
  const subtotalEl = document.getElementById('cart-page-subtotal');
  const shippingEl = document.getElementById('cart-page-shipping');
  const discountRow = document.getElementById('cart-discount-row');
  const discountEl = document.getElementById('cart-page-discount');
  const discountCodeEl = document.getElementById('cart-discount-code');
  const totalEl = document.getElementById('cart-page-total');
  const modalTotalEl = document.getElementById('modal-total-amount');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'FREE' : formatPrice(shippingCost);
  if (shippingEl && shippingCost === 0) shippingEl.style.color = 'var(--gold-dark)';

  if (discountRow) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = `-${formatPrice(discountAmount)}`;
      if (discountCodeEl) discountCodeEl.textContent = appliedDiscountCode;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (totalEl) totalEl.textContent = formatPrice(grandTotal);
  if (modalTotalEl) modalTotalEl.textContent = formatPrice(grandTotal);

  // Render items list
  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-product-cell">
        <img src="${item.image}" alt="${item.name}" class="cart-product-img" />
        <div class="cart-product-details">
          <a href="collections.html" class="cart-product-title">${item.name}</a>
          <span class="cart-product-cat">${getCategoryLabel(item.category)} &bull; <span class="cart-return-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1px;margin-right:3px;" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>3-Day Returns</span></span>
        </div>
      </div>
      <div class="cart-unit-price">${formatPrice(item.price)}</div>
      <div class="cart-qty-stepper">
        <button class="cart-qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">&#8722;</button>
        <span class="cart-qty-val">${item.qty}</span>
        <button class="cart-qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">&#43;</button>
      </div>
      <div class="cart-line-total">${formatPrice(item.price * item.qty)}</div>
      <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove item">&times;</button>
    </div>
  `).join('');

  // Bind qty buttons
  itemsContainer.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const delta = btn.dataset.action === 'inc' ? 1 : -1;
      changeQty(id, delta);
    });
  });

  // Bind remove buttons
  itemsContainer.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(parseInt(btn.dataset.id));
    });
  });
}

function bumpCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function saveCartToStorage() {
  try {
    localStorage.setItem('wcz_cart', JSON.stringify(cart));
  } catch (e) {}
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('wcz_cart');
    if (saved) {
      cart = JSON.parse(saved);
      updateCartUI();
    }
  } catch (e) {}
}

// ============================================
// TESTIMONIALS SLIDER — card-deck coverflow
// ============================================
function goToSlide(index) {
  // Wrap index circularly
  currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;

  const cards = document.querySelectorAll('.testimonial-card');
  cards.forEach((card, i) => {
    card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

    // Circular distance from current slide
    let diff = i - currentSlide;
    if (diff >  Math.floor(totalSlides / 2)) diff -= totalSlides;
    if (diff < -Math.floor(totalSlides / 2)) diff += totalSlides;

    if (diff === 0)       card.classList.add('is-active');
    else if (diff ===  1) card.classList.add('is-next');
    else if (diff === -1) card.classList.add('is-prev');
    else                  card.classList.add('is-hidden');
  });

  // Update dots
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function initTestimonials() {
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (!track) return;

  // Build dots
  if (dotsContainer) {
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Set initial state
  goToSlide(0);

  prevBtn && prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn && nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Click side cards to navigate
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.testimonial-card');
    if (!card) return;
    if (card.classList.contains('is-next')) goToSlide(currentSlide + 1);
    if (card.classList.contains('is-prev')) goToSlide(currentSlide - 1);
  });

  // Auto-slide
  let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);

  const slider = document.getElementById('testimonials-slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
    slider.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
    });
  }

  // Touch / swipe support with direction locking
  let touchStartX = 0;
  let touchStartY = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    clearInterval(autoSlide);
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diffX = touchStartX - e.changedTouches[0].clientX;
    const diffY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 36 && Math.abs(diffX) > Math.abs(diffY)) {
      goToSlide(diffX > 0 ? currentSlide + 1 : currentSlide - 1);
    }
    clearInterval(autoSlide);
    autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5500);
  }, { passive: true });
}


// ============================================
// NEWSLETTER
// ============================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const success = document.getElementById('newsletter-success');
  const emailInput = document.getElementById('newsletter-email');

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput?.value?.trim();
    if (!email) return;

    // Simulate submission
    form.style.display = 'none';
    if (success) success.classList.add('show');
    showToast('Welcome to Winny\'s family! &#128591;');
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  // Add fade-in-up to sections
  const targets = document.querySelectorAll(
    '.feature-card, .collection-card, .about-image-side, .about-content-side, .social-item'
  );

  targets.forEach(el => {
    if (!el.classList.contains('fade-in-up')) {
      el.classList.add('fade-in-up');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}

// ============================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.getElementById('header')?.offsetHeight || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;

  msgEl.innerHTML = message;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ============================================
// SPLASH SCREEN
// ============================================
function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  // Display logo on white backdrop for 1.5 seconds, then slowly fade out to reveal site
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.remove();
    }, 850);
  }, 1500);
}
