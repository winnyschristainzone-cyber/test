/* ============================================
   WINNY'S CHRISTIAN ZONE — app.js
   ============================================ */

'use strict';

const CROSS_SVG_ICON = `<svg class="cross-icon" viewBox="0 0 20 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8.5 1C8.5 0.45 8.95 0 9.5 0H10.5C11.05 0 11.5 0.45 11.5 1V7H17.5C18.05 7 18.5 7.45 18.5 8V9C18.5 9.55 18.05 10 17.5 10H11.5V25C11.5 25.55 11.05 26 10.5 26H9.5C8.95 26 8.5 25.55 8.5 25V10H2.5C1.95 10 1.5 9.55 1.5 9V8C1.5 7.45 1.95 7 2.5 7H8.5V1Z"/></svg>`;

// ============================================
// PRODUCT DATA (Populated via Supabase Database and Admin Dashboard)
// ============================================
const PRODUCTS = [];

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
  loadWishlistFromStorage();
  initHeader();
  initMobileNav();
  initSearch();
  initDropdown();
  initProducts();
  initTabs();
  initCart();
  initCartDrawer();
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

    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    const stockPill = isOutOfStock
      ? `<span class="stock-pill out-of-stock">Sold Out</span>`
      : (product.stock !== undefined && product.stock <= 5 ? `<span class="stock-pill low-stock">Only ${product.stock} left!</span>` : '');

    const needsSize = doesProductNeedSize(product);
    const sizeSelectorHtml = needsSize ? `
      <div class="card-size-selector" onclick="event.stopPropagation();">
        <span class="card-size-label">Size:</span>
        <div class="card-size-btns" data-product-id="${product.id}">
          <button type="button" class="card-size-btn active" data-size="S">S</button>
          <button type="button" class="card-size-btn" data-size="M">M</button>
          <button type="button" class="card-size-btn" data-size="L">L</button>
          <button type="button" class="card-size-btn" data-size="XL">XL</button>
          <button type="button" class="card-size-btn" data-size="XXL">XXL</button>
        </div>
        <button type="button" class="card-size-guide-link" onclick="openSizeGuideModal();" title="View Dimensions">Guide</button>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
        ${badgeHtml}
        ${stockPill}
        <button class="product-wishlist ${product.liked ? 'liked' : ''}" data-id="${product.id}" aria-label="Add to wishlist">
          ${product.liked ? '&#10084;' : '&#9825;'}
        </button>
        <button class="product-quick-add ${isOutOfStock ? 'disabled' : ''}" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
          ${isOutOfStock ? 'Sold Out' : 'Add to Cart &#10022;'}
        </button>
      </div>
      <div class="product-info">
        <p class="product-category">${getCategoryLabel(product.category)}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-rating">
          <span class="product-stars">${stars}</span>
          <span class="product-rating-count">(${product.reviewCount})</span>
        </div>
        ${sizeSelectorHtml}
        <div class="product-price-row">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="product-return-badge" style="background:rgba(201,168,76,0.1); border-color:rgba(201,168,76,0.25); color:var(--gold-dark); font-size:10px;">
            &#10003; Inspected
          </span>
        </div>
      </div>
    `;

    grid.appendChild(card);

    // Trigger animation
    setTimeout(() => card.classList.add('visible'), 40 + (i % 8) * 50);

    // Size button clicks inside card
    if (needsSize) {
      card.querySelectorAll('.card-size-btn').forEach(sBtn => {
        sBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          card.querySelectorAll('.card-size-btn').forEach(b => b.classList.remove('active'));
          sBtn.classList.add('active');
        });
      });
    }

    // Card click -> Open Quick View Modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-wishlist') || e.target.closest('.product-quick-add') || e.target.closest('.card-size-selector')) return;
      openQuickView(product.id);
    });

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
      let chosenSize = null;
      if (needsSize) {
        const activeS = card.querySelector('.card-size-btn.active');
        chosenSize = activeS ? activeS.getAttribute('data-size') : 'M';
      }
      addToCart(product.id, chosenSize);
    });
  });
}

function formatPrice(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function doesProductNeedSize(product) {
  if (!product) return false;
  if (product.needsSize === true) return true;
  if (product.category === 'apparel') return true;
  const name = (product.name || '').toLowerCase();
  const desc = (product.desc || '').toLowerCase();
  return (
    name.includes('tee') || name.includes('t-shirt') || name.includes('hoodie') ||
    name.includes('sweatshirt') || name.includes('shirt') || name.includes('apparel') ||
    desc.includes('tee') || desc.includes('hoodie') || desc.includes('sweatshirt')
  );
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

// ------------------------------------------------------------------------------
// WISHLIST WITH LOCALSTORAGE PERSISTENCE
// ------------------------------------------------------------------------------
function loadWishlistFromStorage() {
  try {
    const saved = localStorage.getItem('wcz_wishlist');
    if (saved) {
      const ids = JSON.parse(saved);
      PRODUCTS.forEach(p => {
        p.liked = ids.includes(String(p.id));
      });
    }
  } catch (e) {}
}

function saveWishlistToStorage() {
  try {
    const ids = PRODUCTS.filter(p => p.liked).map(p => String(p.id));
    localStorage.setItem('wcz_wishlist', JSON.stringify(ids));
  } catch (e) {}
}

function toggleWishlist(id, btn) {
  const product = PRODUCTS.find(p => String(p.id) === String(id));
  if (!product) return;
  product.liked = !product.liked;
  saveWishlistToStorage();
  if (btn) {
    btn.innerHTML = product.liked ? '&#10084;' : '&#9825;';
    btn.classList.toggle('liked', product.liked);
  }
  showToast(product.liked ? `Saved "${product.name}" to wishlist &#10084;` : `Removed from wishlist`);
}

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

    // --------------------------------------------------------------------------
    // GIFT BLESSING & WHATSAPP NOTIFICATION CONTROLS
    // --------------------------------------------------------------------------
    const giftCheckbox = document.getElementById('is-gift-order');
    const giftPanel = document.getElementById('gift-fields-panel');
    const giftNameInput = document.getElementById('gift-recipient-name');
    const giftWaInput = document.getElementById('gift-recipient-whatsapp');
    const giftNoteInput = document.getElementById('order-prayer-note');
    const previewName = document.getElementById('wa-preview-name');
    const previewNote = document.getElementById('wa-preview-note-text');

    if (giftCheckbox && giftPanel) {
      giftCheckbox.addEventListener('change', () => {
        giftPanel.style.display = giftCheckbox.checked ? 'block' : 'none';
      });
    }

    function updateGiftPreview() {
      if (previewName && giftNameInput) {
        previewName.textContent = giftNameInput.value.trim() || '[Recipient Name]';
      }
      if (previewNote && giftNoteInput) {
        const note = giftNoteInput.value.trim();
        previewNote.textContent = note ? `“${note}”` : '“May the Lord bless you and keep you!”';
      }
    }

    if (giftNameInput) giftNameInput.addEventListener('input', updateGiftPreview);
    if (giftNoteInput) giftNoteInput.addEventListener('input', updateGiftPreview);

    // Quick blessing chip buttons
    document.querySelectorAll('.gift-chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.blessing;
        if (giftNoteInput) {
          giftNoteInput.value = text;
          updateGiftPreview();
          giftNoteInput.focus();
        }
      });
    });

    // Checkout modal open & close
    const openModalBtn = document.getElementById('open-checkout-modal-btn');
    const checkoutModal = document.getElementById('checkout-modal-overlay');
    const closeModalBtn = document.getElementById('checkout-modal-close');
    const checkoutForm = document.getElementById('checkout-form');

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

    // --------------------------------------------------------------------------
    // CHECKOUT SUBMISSION & POST-PAYMENT PROCESSING FLOW
    // --------------------------------------------------------------------------
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const customerName = document.getElementById('checkout-name')?.value.trim() || '';
        const customerPhone = document.getElementById('checkout-phone')?.value.trim() || '';
        const customerEmail = document.getElementById('checkout-email')?.value.trim() || '';
        const customerAddress = document.getElementById('checkout-address')?.value.trim() || '';
        const customerCity = document.getElementById('checkout-city')?.value.trim() || '';
        const customerPincode = document.getElementById('checkout-pincode')?.value.trim() || '';
        const selectedPayOpt = document.querySelector('input[name="payment"]:checked')?.value || 'razorpay';

        const isGift = document.getElementById('is-gift-order')?.checked || false;
        const giftRecipientName = document.getElementById('gift-recipient-name')?.value.trim() || '';
        const giftRecipientWhatsApp = document.getElementById('gift-recipient-whatsapp')?.value.trim() || '';
        const prayerNote = document.getElementById('order-prayer-note')?.value.trim() || '';

        // Validate gift fields if enabled
        if (isGift && !giftRecipientName) {
          showToast('Please enter the recipient’s name for the gift.');
          document.getElementById('gift-recipient-name')?.focus();
          return;
        }
        if (isGift && (!giftRecipientWhatsApp || giftRecipientWhatsApp.length < 10)) {
          showToast('Please enter a valid 10-digit WhatsApp number for the recipient.');
          document.getElementById('gift-recipient-whatsapp')?.focus();
          return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const isBulk = totalQty >= 5 || subtotal >= 2000;
        const zeroShippingOverride = localStorage.getItem('wcz_zero_shipping') === 'true';
        const shipping = (isBulk || zeroShippingOverride) ? 0 : 199;
        let discount = 0;
        if (appliedDiscount > 0) {
          discount = appliedDiscount < 1 ? Math.round(subtotal * appliedDiscount) : Math.min(subtotal, appliedDiscount);
        }
        const grandTotal = Math.max(0, subtotal - discount + shipping);
        const orderId = 'WCZ-' + Math.floor(10000 + Math.random() * 90000);
        const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        const orderDetails = {
          orderNumber: orderId,
          amount: grandTotal,
          subtotal: subtotal,
          discount: discount,
          shipping: shipping,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: `${customerAddress}, ${customerCity} - ${customerPincode}`,
          paymentMethod: 'Razorpay Secure Online',
          isGift: isGift,
          giftRecipientName: giftRecipientName,
          giftRecipientWhatsApp: giftRecipientWhatsApp,
          prayerNote: prayerNote,
          items: [...cart],
          date: orderDate
        };

        if (window.WCZ_DEBUG) {
          window.WCZ_DEBUG.log('CHECKOUT', 'Submitting order form', orderDetails);
          if (isGift) {
            window.WCZ_DEBUG.log('GIFT', `Gift order for: ${giftRecipientName} (WA: ${giftRecipientWhatsApp})`, {
              recipient: giftRecipientName,
              whatsapp: giftRecipientWhatsApp,
              prayerNote: prayerNote
            });
          }
        }

        // Close checkout form modal
        checkoutModal.classList.remove('open');

        // Trigger button spinner
        const payBtnSpinner = document.getElementById('pay-btn-spinner');
        const payBtnText = document.getElementById('pay-btn-text');
        if (payBtnSpinner) payBtnSpinner.style.display = 'inline-block';
        if (payBtnText) payBtnText.textContent = 'Securing Order...';

        // Check if Razorpay flow is available in supabaseClient.js
        if (typeof initRazorpayPayment === 'function') {
          if (window.WCZ_DEBUG) window.WCZ_DEBUG.log('PAYMENT', 'Handoff to initRazorpayPayment');
          initRazorpayPayment(orderDetails);
          return;
        }

        // Fallback animated processing modal
        const procModal = document.getElementById('order-processing-modal');
        if (procModal) procModal.classList.add('open');

        const step1 = document.getElementById('proc-step-1');
        const step2 = document.getElementById('proc-step-2');
        const step3 = document.getElementById('proc-step-3');
        const procTitle = document.getElementById('processing-status-title');
        const procSub = document.getElementById('processing-status-sub');

        // Simulate secure verification stages
        setTimeout(() => {
          if (step1) step1.className = 'proc-step completed';
          if (step2) step2.className = 'proc-step active';
          if (procTitle) procTitle.textContent = 'Authorizing Blessed Payment';
          if (procSub) procSub.textContent = 'Verifying bank security & encryption...';
        }, 450);

        setTimeout(() => {
          if (step2) step2.className = 'proc-step completed';
          if (step3) step3.className = 'proc-step active';
          if (procTitle) procTitle.textContent = 'Order Confirmed & Blessed!';
          if (procSub) procSub.textContent = 'Preparing your receipt & dispatch details...';
        }, 950);

        setTimeout(() => {
          if (step3) step3.className = 'proc-step completed';
          if (procModal) procModal.classList.remove('open');

          // Reset button state
          if (payBtnSpinner) payBtnSpinner.style.display = 'none';
          if (payBtnText) payBtnText.textContent = 'Place Blessed Order ✦';

          // Launch Grand Order Confirmation View
          displayOrderConfirmation(orderDetails);

          // Save order to Supabase in background
          if (typeof saveOrderToSupabase === 'function') {
            saveOrderToSupabase(orderDetails, { razorpay_payment_id: 'pay_sim_' + Date.now() });
          }

          // Clear cart
          cart = [];
          appliedDiscount = 0;
          appliedDiscountCode = '';
          saveCartToStorage();
          updateCartUI();
        }, 1400);
      });
    }
  }

  // Ensure cart button routes smoothly
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn && cartBtn.tagName === 'BUTTON') {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  }
}

// ------------------------------------------------------------------------------
// GRAND ORDER CONFIRMATION MODAL DISPLAY & WHATSAPP GREETING ACTION
// ------------------------------------------------------------------------------
function displayOrderConfirmation(order) {
  const modal = document.getElementById('order-success-modal');
  if (!modal) return;

  // 1. Order ID & Ref
  const idEl = document.getElementById('order-confirm-id');
  if (idEl) idEl.textContent = '#' + order.orderNumber;

  // Copy order ID button
  const copyBtn = document.getElementById('btn-copy-order-id');
  if (copyBtn) {
    copyBtn.onclick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(order.orderNumber).then(() => {
          showToast(`Copied Order #${order.orderNumber} to clipboard!`);
        }).catch(() => {
          showToast(`Order ID: #${order.orderNumber}`);
        });
      } else {
        showToast(`Order ID: #${order.orderNumber}`);
      }
    };
  }

  // 2. Payment & Method details
  const methodEl = document.getElementById('order-confirm-method');
  if (methodEl) methodEl.textContent = order.paymentMethod;

  const txnEl = document.getElementById('order-confirm-txnid');
  const simTxn = 'pay_sim_' + Math.floor(100000 + Math.random() * 900000);
  if (txnEl) txnEl.textContent = simTxn;

  const amountEl = document.getElementById('order-confirm-amount');
  if (amountEl) amountEl.textContent = formatPrice(order.amount);

  const addrEl = document.getElementById('order-confirm-address');
  if (addrEl) addrEl.textContent = `${order.name} • ${order.address}`;

  // 3. Render Items summary in confirmation
  const itemsContainer = document.getElementById('order-confirm-items');
  if (itemsContainer && Array.isArray(order.items)) {
    itemsContainer.innerHTML = order.items.map(item => {
      const sizeNote = item.size ? ` &bull; Size: <strong>${item.size}</strong>` : '';
      return `
      <div class="receipt-item-row">
        <div class="receipt-item-info">
          <img src="${item.image}" alt="${item.name}" class="receipt-item-img" />
          <div>
            <div style="font-weight: 500; color: var(--dark);">${item.name}</div>
            <div class="receipt-item-qty">Qty: ${item.qty} &bull; ${formatPrice(item.price)} each${sizeNote}</div>
          </div>
        </div>
        <div class="receipt-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>
    `;
    }).join('');
  }

  // 4. Gift Recipient Strip
  const giftBanner = document.getElementById('order-confirm-gift-banner');
  const giftNameEl = document.getElementById('order-confirm-gift-name');
  const giftNoteEl = document.getElementById('order-confirm-gift-note');
  const giftWaBtn = document.getElementById('order-send-recipient-wa-btn');

  if (order.isGift && order.giftRecipientName) {
    if (giftBanner) giftBanner.style.display = 'block';
    if (giftNameEl) giftNameEl.textContent = `${order.giftRecipientName} (+91 ${order.giftRecipientWhatsApp})`;
    if (giftNoteEl) {
      giftNoteEl.innerHTML = order.prayerNote 
        ? `&ldquo;${order.prayerNote}&rdquo;`
        : `&ldquo;May the Lord bless you and keep you!&rdquo;`;
    }

    if (giftWaBtn) {
      const cleanWa = order.giftRecipientWhatsApp.replace(/\D/g, '');
      const greetingMsg = `✝️ *Winny's Christian Zone — A Special Gift For You!*\n\nDear *${order.giftRecipientName}*,\n\n*${order.name}* has prayerfully ordered a Christian faith gift for you with love!\n\n*Personal Blessing Note:*\n"${order.prayerNote || 'May the Lord bless you and keep you!'}"\n\n📦 *Package Status:* Your gift is being prepared prayerfully and will arrive in 3–5 business days.\n\nMay God bless and keep you!\n_Winny's Christian Zone (winnyschristianzone.com)_`;
      giftWaBtn.href = `https://wa.me/91${cleanWa}?text=${encodeURIComponent(greetingMsg)}`;
      giftWaBtn.onclick = (e) => {
        window.open(giftWaBtn.href, '_blank');
        e.preventDefault();
      };
    }
  } else {
    if (giftBanner) giftBanner.style.display = 'none';
  }

  // 5. Buyer WhatsApp Receipt
  const buyerWaBtn = document.getElementById('order-confirm-buyer-wa-btn');
  if (buyerWaBtn) {
    const cleanBuyerPhone = (order.phone || '').replace(/\D/g, '');
    const buyerMsg = `✝️ *Winny's Christian Zone — Order Receipt*\n\nThank you for your blessed order, *${order.name}*!\n\n*Order Ref:* #${order.orderNumber}\n*Total Paid:* ${formatPrice(order.amount)}\n*Payment Mode:* ${order.paymentMethod}\n*Delivery Address:* ${order.address}\n\nWe are preparing your package prayerfully. Expected delivery in 3–5 business days. God bless you!`;
    const targetWa = cleanBuyerPhone ? '91' + cleanBuyerPhone : (typeof WCZ_WHATSAPP_NUMBER !== 'undefined' ? WCZ_WHATSAPP_NUMBER : '919281234772');
    buyerWaBtn.href = `https://wa.me/${targetWa}?text=${encodeURIComponent(buyerMsg)}`;
    buyerWaBtn.onclick = (e) => {
      window.open(buyerWaBtn.href, '_blank');
      e.preventDefault();
    };
  }

  // 6. Print Receipt
  const printBtn = document.getElementById('btn-print-receipt');
  if (printBtn) {
    printBtn.onclick = () => window.print();
  }

  // 7. Open Success Modal
  modal.classList.add('open');
}

function addToCart(productId, selectedSize) {
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  const needsSize = doesProductNeedSize(product);
  const itemSize = selectedSize || (needsSize ? 'M' : null);
  const cartItemKey = itemSize ? `${product.id}_${itemSize}` : String(product.id);

  const existing = cart.find(item => (item.cartKey || String(item.id)) === cartItemKey);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1, size: itemSize, cartKey: cartItemKey });
  }

  saveCartToStorage();
  updateCartUI();
  bumpCartCount();

  const sizeNote = itemSize ? ` (Size: ${itemSize})` : '';
  if (!window.location.pathname.includes('cart.html')) {
    openCartDrawer();
  } else {
    showToast(`${product.name}${sizeNote} added! <a href="cart.html" style="color:var(--gold);text-decoration:underline;margin-left:8px;font-weight:600;">View Cart &rarr;</a>`);
  }
}

function removeFromCart(keyOrId) {
  cart = cart.filter(item => (item.cartKey || String(item.id)) !== String(keyOrId) && String(item.id) !== String(keyOrId));
  saveCartToStorage();
  updateCartUI();
}

function changeQty(keyOrId, delta) {
  const item = cart.find(i => (i.cartKey || String(i.id)) === String(keyOrId) || String(i.id) === String(keyOrId));
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(keyOrId);
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

  // Render on slide drawer if present
  if (typeof renderCartDrawer === 'function') {
    renderCartDrawer();
  }
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

  // Delivery calculation (Free on bulk orders: 5+ items or ₹2,000+, or Test Override)
  const isBulkOrder = totalQty >= 5 || subtotal >= 2000;
  const isZeroShippingMode = localStorage.getItem('wcz_zero_shipping') === 'true';
  const shippingCost = (isBulkOrder || isZeroShippingMode) ? 0 : 199;
  const shippingText = document.getElementById('free-shipping-text');
  if (shippingText) {
    if (isZeroShippingMode) {
      shippingText.innerHTML = `<span class="shipping-success-pill" style="color: #D4AF37;">⚡ Zero Delivery Fee Active (Test Mode)</span>`;
    } else if (isBulkOrder) {
      shippingText.innerHTML = `<span class="shipping-success-pill"><svg class="cross-icon inline-cross" viewBox="0 0 20 26" fill="currentColor" style="width:11px; height:14px; margin-right:4px;"><path d="M8.5 1C8.5 0.45 8.95 0 9.5 0H10.5C11.05 0 11.5 0.45 11.5 1V7H17.5C18.05 7 18.5 7.45 18.5 8V9C18.5 9.55 18.05 10 17.5 10H11.5V25C11.5 25.55 11.05 26 10.5 26H9.5C8.95 26 8.5 25.55 8.5 25V10H2.5C1.95 10 1.5 9.55 1.5 9V8C1.5 7.45 1.95 7 2.5 7H8.5V1Z"/></svg>Free delivery applied on your bulk order!</span>`;
    } else {
      const remainingForBulk = Math.max(0, 2000 - subtotal);
      shippingText.innerHTML = `Add <strong>₹${remainingForBulk}</strong> more for <strong>Free Delivery</strong> (Bulk Goal: ₹2,000)`;
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

  // Sync test delivery toggle button on cart page
  const testDeliveryBtn = document.getElementById('cart-toggle-delivery-btn');
  if (testDeliveryBtn) {
    testDeliveryBtn.textContent = isZeroShippingMode ? 'Reset to ₹199' : 'Set Free (₹0)';
    testDeliveryBtn.style.background = isZeroShippingMode ? '#2E7D32' : '#2C1810';
    testDeliveryBtn.style.color = '#FFF';
    testDeliveryBtn.onclick = () => {
      if (isZeroShippingMode) {
        localStorage.removeItem('wcz_zero_shipping');
        if (typeof showToast === 'function') showToast('Standard ₹199 delivery restored');
      } else {
        localStorage.setItem('wcz_zero_shipping', 'true');
        if (typeof showToast === 'function') showToast('⚡ Delivery set to FREE (₹0 Test Mode)');
      }
      updateCartUI();
    };
  }

  // Render items list
  itemsContainer.innerHTML = cart.map(item => {
    const itemKey = item.cartKey || String(item.id);
    const sizeBadge = item.size ? `<span class="cart-item-size-badge">Size: ${item.size}</span>` : '';
    return `
    <div class="cart-item-row">
      <div class="cart-product-cell">
        <img src="${item.image}" alt="${item.name}" class="cart-product-img" />
        <div class="cart-product-details">
          <a href="collections.html" class="cart-product-title">${item.name}</a>
          <span class="cart-product-cat">${getCategoryLabel(item.category)}${sizeBadge}</span>
        </div>
      </div>
      <div class="cart-unit-price">${formatPrice(item.price)}</div>
      <div class="cart-qty-stepper">
        <button class="cart-qty-btn" data-action="dec" data-id="${itemKey}" aria-label="Decrease quantity">&#8722;</button>
        <span class="cart-qty-val">${item.qty}</span>
        <button class="cart-qty-btn" data-action="inc" data-id="${itemKey}" aria-label="Increase quantity">&#43;</button>
      </div>
      <div class="cart-line-total">${formatPrice(item.price * item.qty)}</div>
      <button class="cart-remove-btn" data-id="${itemKey}" aria-label="Remove item">&times;</button>
    </div>
  `;
  }).join('');

  // Bind qty buttons
  itemsContainer.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const delta = btn.dataset.action === 'inc' ? 1 : -1;
      changeQty(id, delta);
    });
  });

  // Bind remove buttons
  itemsContainer.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
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

// ============================================
// PRODUCT QUICK-VIEW MODAL
// ============================================
function openQuickView(productId) {
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  let modal = document.getElementById('quick-view-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quick-view-overlay';
    modal.className = 'quick-view-overlay';
    document.body.appendChild(modal);
  }

  const isApparel = product.category === 'apparel';
  const stars = '★'.repeat(product.rating) + '☆'.repeat(Math.max(0, 5 - product.rating));

  modal.innerHTML = `
    <div class="quick-view-dialog">
      <button class="quick-view-close" id="quick-view-close" aria-label="Close dialog">&times;</button>
      <div class="quick-view-media">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="quick-view-content">
        <span class="quick-view-cat">${getCategoryLabel(product.category)}</span>
        <h2 class="quick-view-name">${product.name}</h2>
        
        <div class="quick-view-price-row">
          <span class="quick-view-price">${formatPrice(product.price)}</span>
          <span class="product-return-badge" style="font-size: 11px; color: var(--gold-dark); background: rgba(201, 168, 76, 0.1); border-color: rgba(201, 168, 76, 0.3);">
            &#10003; Inspected &bull; All Sales Final
          </span>
        </div>

        <p class="quick-view-desc">${product.desc}</p>

        ${isApparel ? `
          <div class="quick-view-sizes" style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="quick-view-size-label" style="font-weight: 600; font-size: 13px;">Select Size:</span>
              <button type="button" id="btn-open-size-chart" style="font-size: 11.5px; color: var(--gold-dark); text-decoration: underline; background: none; border: none; cursor: pointer;">
                📏 Size Guide
              </button>
            </div>
            <div class="quick-view-size-btns" style="display: flex; gap: 8px;">
              <button type="button" class="size-pill-btn active" data-size="S">S</button>
              <button type="button" class="size-pill-btn" data-size="M">M</button>
              <button type="button" class="size-pill-btn" data-size="L">L</button>
              <button type="button" class="size-pill-btn" data-size="XL">XL</button>
              <button type="button" class="size-pill-btn" data-size="XXL">XXL</button>
            </div>
          </div>
        ` : ''}

        <!-- Embedded Scripture Context Box -->
        <div class="quick-view-scripture" style="background: rgba(201, 168, 76, 0.08); border-left: 3px solid var(--gold); padding: 10px 14px; border-radius: 6px; margin: 16px 0; font-size: 12.5px; color: var(--text-light); font-style: italic;">
          &ldquo;Clothed with strength and dignity, she laughs without fear of the future.&rdquo; &mdash; Proverbs 31:25
        </div>

        <div class="quick-view-actions">
          <button type="button" class="btn btn-primary" id="quick-view-add-btn" style="flex: 1; justify-content: center; padding: 12px 20px;">
            Add to Blessed Bag &#10022;
          </button>
          <a href="product.html?id=${product.id}" class="btn btn-secondary" style="padding: 12px 14px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
            Full Details ↗
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');

  // Close handlers
  modal.querySelector('#quick-view-close').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Size pill toggling
  modal.querySelectorAll('.size-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.size-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Size Guide Modal Trigger
  const sizeChartBtn = modal.querySelector('#btn-open-size-chart');
  if (sizeChartBtn) {
    sizeChartBtn.addEventListener('click', () => {
      openSizeGuideModal();
    });
  }

  // Add to cart inside modal with selected size
  modal.querySelector('#quick-view-add-btn').addEventListener('click', () => {
    const activeSizeBtn = modal.querySelector('.size-pill-btn.active');
    const selectedSize = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : null;
    addToCart(product.id, selectedSize);
    modal.classList.remove('open');
  });
}

// ============================================
// SIZE GUIDE MODAL
// ============================================
function openSizeGuideModal() {
  let guideModal = document.getElementById('size-guide-modal-overlay');
  if (!guideModal) {
    guideModal = document.createElement('div');
    guideModal.id = 'size-guide-modal-overlay';
    guideModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(26, 18, 8, 0.7); backdrop-filter: blur(6px);
      z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    document.body.appendChild(guideModal);
  }

  guideModal.innerHTML = `
    <div style="background: #FFFDF8; border: 1px solid var(--border-strong); border-radius: 14px; max-width: 500px; width: 100%; padding: 28px; box-shadow: var(--shadow-lg); position: relative; animation: fadeIn 0.3s ease;">
      <button id="size-guide-close" style="position: absolute; top: 16px; right: 18px; background: none; border: none; font-size: 22px; cursor: pointer; color: var(--dark);">&times;</button>
      <h3 style="font-family: var(--font-display); font-size: 24px; color: var(--dark); margin-bottom: 4px;">Apparel Size Guide</h3>
      <p style="font-size: 13px; color: var(--text-light); margin-bottom: 18px;">All measurements in inches (Chest &times; Length). Premium unisex fit.</p>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left; margin-bottom: 20px;">
        <thead>
          <tr style="background: #FAF7F2; border-bottom: 1px solid var(--border);">
            <th style="padding: 10px 14px;">Size</th>
            <th style="padding: 10px 14px;">Chest (in)</th>
            <th style="padding: 10px 14px;">Length (in)</th>
            <th style="padding: 10px 14px;">Fit Advice</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #EFE8DE;"><td style="padding: 8px 14px; font-weight: 600;">S</td><td style="padding: 8px 14px;">38"</td><td style="padding: 8px 14px;">27"</td><td style="padding: 8px 14px; color: var(--text-muted);">Standard</td></tr>
          <tr style="border-bottom: 1px solid #EFE8DE;"><td style="padding: 8px 14px; font-weight: 600;">M</td><td style="padding: 8px 14px;">40"</td><td style="padding: 8px 14px;">28"</td><td style="padding: 8px 14px; color: var(--text-muted);">Regular</td></tr>
          <tr style="border-bottom: 1px solid #EFE8DE;"><td style="padding: 8px 14px; font-weight: 600;">L</td><td style="padding: 8px 14px;">42"</td><td style="padding: 8px 14px;">29"</td><td style="padding: 8px 14px; color: var(--text-muted);">Comfort</td></tr>
          <tr style="border-bottom: 1px solid #EFE8DE;"><td style="padding: 8px 14px; font-weight: 600;">XL</td><td style="padding: 8px 14px;">44"</td><td style="padding: 8px 14px;">30"</td><td style="padding: 8px 14px; color: var(--text-muted);">Relaxed</td></tr>
          <tr><td style="padding: 8px 14px; font-weight: 600;">XXL</td><td style="padding: 8px 14px;">46"</td><td style="padding: 8px 14px;">31"</td><td style="padding: 8px 14px; color: var(--text-muted);">Oversized</td></tr>
        </tbody>
      </table>

      <button id="size-guide-ok-btn" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 10px;">Got It</button>
    </div>
  `;

  guideModal.style.display = 'flex';
  const closeBtn = guideModal.querySelector('#size-guide-close');
  const okBtn = guideModal.querySelector('#size-guide-ok-btn');
  [closeBtn, okBtn].forEach(b => b.addEventListener('click', () => { guideModal.style.display = 'none'; }));
  guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) guideModal.style.display = 'none';
  });
}

// ============================================
// SLIDE-OUT MINI-CART DRAWER
// ============================================
function initCartDrawer() {
  if (window.location.pathname.includes('cart.html')) return; // Cart page has dedicated full table

  let drawerOverlay = document.getElementById('cart-drawer-overlay');
  if (!drawerOverlay) {
    drawerOverlay = document.createElement('div');
    drawerOverlay.id = 'cart-drawer-overlay';
    drawerOverlay.className = 'cart-drawer-overlay';
    drawerOverlay.innerHTML = `
      <div class="cart-drawer" id="cart-drawer">
        <div class="drawer-header">
          <div class="drawer-header-left">
            <h3 class="drawer-title">Your Blessed Bag</h3>
            <span class="drawer-count" id="drawer-item-count">0 items</span>
          </div>
          <button type="button" class="drawer-close" id="drawer-close-btn" aria-label="Close bag">&times;</button>
        </div>

        <div class="drawer-shipping-bar">
          <div class="drawer-shipping-text">
            <span id="drawer-shipping-msg">Add items for free delivery</span>
            <span id="drawer-shipping-status" style="font-weight: 600; color: var(--gold-dark);">₹2,000 Bulk Goal</span>
          </div>
          <div class="drawer-shipping-progress">
            <div class="drawer-shipping-fill" id="drawer-shipping-fill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="drawer-items-list" id="drawer-items-list">
          <!-- Items injected dynamically -->
        </div>

        <div class="drawer-footer">
          <div class="drawer-subtotal-row">
            <span>Estimated Subtotal:</span>
            <strong id="drawer-subtotal">₹0</strong>
          </div>
          <div class="drawer-actions">
            <a href="cart.html" class="btn btn-primary btn-drawer-checkout">
              Proceed to Blessed Checkout &#10022;
            </a>
            <a href="cart.html#cart-gift-card" class="btn-drawer-viewcart">
              🎁 Add Gift Blessing &amp; WhatsApp Alert Options
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(drawerOverlay);

    // Close handlers
    drawerOverlay.querySelector('#drawer-close-btn').addEventListener('click', closeCartDrawer);
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) closeCartDrawer();
    });
  }

  // Intercept header cart buttons
  const headerCartBtns = document.querySelectorAll('.cart-btn, #cart-btn');
  headerCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });
}

function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    renderCartDrawer();
    overlay.classList.add('open');
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) overlay.classList.remove('open');
}

function renderCartDrawer() {
  const list = document.getElementById('drawer-items-list');
  const countEl = document.getElementById('drawer-item-count');
  const subtotalEl = document.getElementById('drawer-subtotal');
  const shipMsg = document.getElementById('drawer-shipping-msg');
  const shipFill = document.getElementById('drawer-shipping-fill');

  if (!list) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (countEl) countEl.textContent = `${totalQty} item${totalQty === 1 ? '' : 's'}`;
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  // Free shipping progress (Bulk orders: ₹2,000 or 5+ items)
  const isBulk = totalQty >= 5 || subtotal >= 2000;
  if (shipMsg && shipFill) {
    if (isBulk) {
      shipMsg.innerHTML = '<strong style="color: #2E7D32;">✝ Free Bulk Delivery Unlocked!</strong>';
      shipFill.style.width = '100%';
      shipFill.style.background = '#2E7D32';
    } else {
      const needed = Math.max(0, 2000 - subtotal);
      shipMsg.textContent = `Add ${formatPrice(needed)} more for Free Delivery!`;
      const pct = Math.min(100, Math.round((subtotal / 2000) * 100));
      shipFill.style.width = `${pct}%`;
      shipFill.style.background = 'var(--gold)';
    }
  }

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 48px 10px; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 8px;">✝️</div>
        <p style="font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 4px;">Your Blessed Bag is Empty</p>
        <p style="font-size: 13px;">Explore faith-inspired apparel, jewelry &amp; gifts.</p>
        <a href="collections.html" class="btn btn-outline" style="margin-top: 16px; font-size: 12px; padding: 9px 18px;">Shop Collections &rarr;</a>
      </div>
    `;
    return;
  }

  list.innerHTML = cart.map(item => {
    const itemKey = item.cartKey || String(item.id);
    const sizeBadge = item.size ? `<span class="cart-item-size-badge">Size: ${item.size}</span>` : '';
    return `
    <div class="drawer-item-row">
      <img src="${item.image}" alt="${item.name}" class="drawer-item-img" />
      <div class="drawer-item-details">
        <span class="drawer-item-title">${item.name}</span>
        <span class="drawer-item-cat">${getCategoryLabel(item.category)}${sizeBadge}</span>
        <div class="drawer-item-bottom">
          <div class="drawer-stepper">
            <button type="button" class="drawer-step-btn" data-action="dec" data-id="${itemKey}">−</button>
            <span class="drawer-step-val">${item.qty}</span>
            <button type="button" class="drawer-step-btn" data-action="inc" data-id="${itemKey}">+</button>
          </div>
          <span class="drawer-item-price">${formatPrice(item.price * item.qty)}</span>
          <button type="button" class="drawer-remove-btn" data-id="${itemKey}" aria-label="Remove">&times;</button>
        </div>
      </div>
    </div>
  `;
  }).join('');

  // Bind drawer steppers & remove
  list.querySelectorAll('.drawer-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = btn.dataset.action === 'inc' ? 1 : -1;
      changeQty(btn.dataset.id, delta);
      renderCartDrawer();
    });
  });

  list.querySelectorAll('.drawer-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
      renderCartDrawer();
    });
  });
}

// ============================================
// PRAYER WALL INTERACTIVE HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const prayerForm = document.getElementById('prayer-form');
  const feed = document.getElementById('prayer-wall-feed');

  if (prayerForm && feed) {
    prayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('prayer-name');
      const textInput = document.getElementById('prayer-text');
      const name = nameInput.value.trim() || 'Anonymous';
      const text = textInput.value.trim();

      if (!text) return;

      const card = document.createElement('div');
      card.className = 'prayer-card';
      card.style.cssText = 'background: #FFFDF8; border: 1px solid var(--gold); border-radius: 12px; padding: 18px 20px; box-shadow: var(--shadow-sm); animation: fadeIn 0.4s ease;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="color: var(--dark); font-size: 14px;">${name}</strong>
          <span style="font-size: 11px; color: var(--gold-dark); font-weight: 600;">Just now</span>
        </div>
        <p style="font-size: 13.5px; color: var(--text); line-height: 1.5; font-style: italic;">&ldquo;${text}&rdquo;</p>
        <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
          <button type="button" class="pray-btn" style="background: rgba(201, 168, 76, 0.12); color: var(--gold-dark); border: 1px solid rgba(201, 168, 76, 0.3); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; cursor: pointer;">
            &#128591; Prayed (1)
          </button>
        </div>
      `;

      feed.insertBefore(card, feed.firstChild);
      prayerForm.reset();
      showToast('Your prayer intention has been shared with the family. God bless you! 🙏');
    });

    // Prayer count increment click
    feed.addEventListener('click', (e) => {
      const btn = e.target.closest('.pray-btn');
      if (btn && !btn.classList.contains('prayed')) {
        btn.classList.add('prayed');
        btn.style.background = '#2E7D32';
        btn.style.color = '#FFF';
        btn.style.borderColor = '#2E7D32';
        const match = btn.innerText.match(/\d+/);
        const count = match ? parseInt(match[0]) + 1 : 1;
        btn.innerHTML = `&#10003; Prayed Together (${count})`;
        showToast('Amen! Praying together in unity.');
      }
    });
  }
});

// ============================================
// BLESSING BOX BUNDLE BUILDER LOGIC
// ============================================
function goToBBoxStep(stepNum) {
  [1, 2, 3].forEach(n => {
    const stepEl = document.getElementById(`bbox-step-${n}`);
    const tabEl = document.getElementById(`bbox-step-tab-${n}`);
    if (stepEl) stepEl.style.display = n === stepNum ? 'block' : 'none';
    if (tabEl) {
      if (n === stepNum) {
        tabEl.style.color = 'var(--gold-dark)';
        tabEl.querySelector('span:first-child').style.background = 'var(--gold)';
      } else {
        tabEl.style.color = 'var(--text-muted)';
        tabEl.querySelector('span:first-child').style.background = '#E0D3C1';
      }
    }
  });

  if (stepNum === 3) {
    updateBBoxPrice();
  }
}

function updateBBoxPrice() {
  const item1Radio = document.querySelector('input[name="bbox_item1"]:checked');
  const item2Radio = document.querySelector('input[name="bbox_item2"]:checked');
  const p1 = item1Radio ? Number(item1Radio.dataset.price || 0) : 0;
  const p2 = item2Radio ? Number(item2Radio.dataset.price || 0) : 0;
  const total = p1 + p2;
  const totalEl = document.getElementById('bbox-total-price');
  if (totalEl) totalEl.innerHTML = formatPrice(total);
}

function addBlessingBoxToCart() {
  const item1Radio = document.querySelector('input[name="bbox_item1"]:checked');
  const item2Radio = document.querySelector('input[name="bbox_item2"]:checked');
  const recipient = document.getElementById('bbox-recipient')?.value.trim() || 'A Special Believer';
  const note = document.getElementById('bbox-note')?.value.trim() || 'May the Lord bless you and keep you!';

  const name1 = item1Radio ? item1Radio.value : 'Blessing Token';
  const name2 = item2Radio ? item2Radio.value : 'Scripture Mug';
  const p1 = item1Radio ? Number(item1Radio.dataset.price || 0) : 0;
  const p2 = item2Radio ? Number(item2Radio.dataset.price || 0) : 0;
  const bundlePrice = p1 + p2;

  const bundleProduct = {
    id: 'bbox-' + Date.now(),
    name: `Custom Blessing Box (${name1} + ${name2})`,
    category: 'gifts',
    price: bundlePrice,
    image: 'images/church_sanctuary.jpg',
    desc: `Personalized Gift Box for ${recipient}. Note: "${note}"`,
    isGift: true,
    giftRecipientName: recipient,
    prayerNote: note
  };

  addToCart(bundleProduct.id);
  // Replace dummy cart lookup if added
  const lastItem = cart[cart.length - 1];
  if (lastItem) {
    Object.assign(lastItem, bundleProduct);
    saveCartToStorage();
    updateCartUI();
  }

  showToast(`Blessing Box for ${recipient} added to your bag! 🎁`);
}


