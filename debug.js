/**
 * ==============================================================================
 * WINNY'S CHRISTIAN ZONE — UNIVERSAL DEBUG CONTROLLER (debug.js)
 * Activates when:
 * 1. URL contains ?debug=true or ?debug=1
 * 2. localStorage.getItem('wcz_debug') === 'true'
 * 3. User presses Ctrl + Shift + D (or Cmd + Shift + D on Mac)
 * ==============================================================================
 */

(function () {
  'use strict';

  // Check activation state
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');
  if (debugParam === 'true' || debugParam === '1') {
    localStorage.setItem('wcz_debug', 'true');
  } else if (debugParam === 'false' || debugParam === '0') {
    localStorage.removeItem('wcz_debug');
  }

  const isDebugActive = localStorage.getItem('wcz_debug') === 'true';

  // Global Debug Object
  window.WCZ_DEBUG = {
    enabled: isDebugActive,
    logs: [],
    
    // Core Logger
    log: function (module, message, data = null) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = { timestamp, module, message, data, type: 'info' };
      this.logs.push(entry);

      if (this.enabled) {
        const style = 'background: #2C1810; color: #D4AF37; font-weight: bold; padding: 2px 6px; border-radius: 4px;';
        if (data !== null) {
          console.log(`%c[WCZ-DEBUG:${module}]`, style, message, data);
        } else {
          console.log(`%c[WCZ-DEBUG:${module}]`, style, message);
        }
        this._updateDrawerUI(entry);
      }
    },

    warn: function (module, message, data = null) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = { timestamp, module, message, data, type: 'warn' };
      this.logs.push(entry);

      if (this.enabled) {
        console.warn(`[WCZ-DEBUG:${module}] ${message}`, data || '');
        this._updateDrawerUI(entry);
      }
    },

    error: function (module, message, error = null) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = { timestamp, module, message, error, type: 'error' };
      this.logs.push(entry);

      if (this.enabled) {
        console.error(`[WCZ-DEBUG:${module}] ${message}`, error || '');
        this._updateDrawerUI(entry);
      }
    },

    // Toggle Debug Mode On/Off
    toggle: function () {
      this.enabled = !this.enabled;
      if (this.enabled) {
        localStorage.setItem('wcz_debug', 'true');
        this.renderDrawer();
        this.log('SYSTEM', 'Debug mode ENABLED (Saved to localStorage)');
        if (typeof showToast === 'function') showToast('🛠️ Debug Mode ENABLED');
      } else {
        localStorage.removeItem('wcz_debug');
        const drawer = document.getElementById('wcz-debug-drawer');
        if (drawer) drawer.remove();
        console.log('[WCZ-DEBUG] Debug mode DISABLED');
        if (typeof showToast === 'function') showToast('🛠️ Debug Mode DISABLED');
      }
    },

    _updateDrawerUI: function (entry) {
      const logContainer = document.getElementById('wcz-debug-log-list');
      if (!logContainer) return;

      const item = document.createElement('div');
      item.className = `wcz-debug-log-row ${entry.type}`;
      item.innerHTML = `
        <span class="wcz-debug-time">${entry.timestamp}</span>
        <span class="wcz-debug-badge">${entry.module}</span>
        <span class="wcz-debug-msg">${entry.message}</span>
        ${entry.data ? `<pre class="wcz-debug-payload">${JSON.stringify(entry.data, null, 2)}</pre>` : ''}
      `;
      logContainer.prepend(item);
    },

    renderDrawer: function () {
      if (!this.enabled) return;
      if (document.getElementById('wcz-debug-drawer')) return;

      const drawer = document.createElement('div');
      drawer.id = 'wcz-debug-drawer';
      drawer.innerHTML = `
        <div class="wcz-debug-header">
          <div class="wcz-debug-title">
            <span>🛠️ WCZ Debugger</span>
            <span class="wcz-debug-live-tag">ACTIVE</span>
          </div>
          <div class="wcz-debug-actions">
            <button id="wcz-debug-clear-btn" class="wcz-debug-btn-sm" title="Clear Logs">Clear</button>
            <button id="wcz-debug-minimize-btn" class="wcz-debug-btn-sm" title="Minimize">−</button>
            <button id="wcz-debug-close-btn" class="wcz-debug-btn-sm" title="Turn Off Debug">✕</button>
          </div>
        </div>
        <div class="wcz-debug-inspect-strip">
          <button class="wcz-inspect-chip" onclick="WCZ_DEBUG.addTestItem()">+ Add ₹1 Test Item</button>
          <button class="wcz-inspect-chip" onclick="WCZ_DEBUG.inspectCart()">Cart State</button>
          <button class="wcz-inspect-chip" onclick="WCZ_DEBUG.inspectAuth()">User Auth</button>
          <button class="wcz-inspect-chip" onclick="WCZ_DEBUG.inspectPayment()">Payment RPC</button>
          <button class="wcz-inspect-chip" onclick="WCZ_DEBUG.inspectBulkGoal()">Bulk Goal</button>
        </div>
        <div id="wcz-debug-log-list" class="wcz-debug-log-list">
          <div class="wcz-debug-empty-hint">Debug mode active. Press Ctrl+Shift+D to toggle, or append ?debug=false to disable.</div>
        </div>
      `;

      document.body.appendChild(drawer);

      // Event listeners
      document.getElementById('wcz-debug-clear-btn')?.addEventListener('click', () => {
        const list = document.getElementById('wcz-debug-log-list');
        if (list) list.innerHTML = '';
        this.logs = [];
      });

      document.getElementById('wcz-debug-minimize-btn')?.addEventListener('click', () => {
        drawer.classList.toggle('minimized');
      });

      document.getElementById('wcz-debug-close-btn')?.addEventListener('click', () => {
        this.toggle();
      });

      // Populate existing logs
      this.logs.forEach(l => this._updateDrawerUI(l));
    },

    // Inspection Helper Functions
    addTestItem: function () {
      if (typeof window.addToCart === 'function') {
        window.addToCart(99);
        this.log('TEST-ITEM', 'Added ₹1 Faith Seed Prayer Token to Cart!');
        if (typeof showToast === 'function') showToast('Added ₹1 Test Item to cart!');
      } else {
        const cart = JSON.parse(localStorage.getItem('wcz_cart') || '[]');
        const existing = cart.find(i => i.id == 99);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({
            id: 99,
            name: 'Faith Seed Prayer Token (Test Item)',
            price: 1,
            qty: 1,
            image: 'images/category_jewelry.jpg'
          });
        }
        localStorage.setItem('wcz_cart', JSON.stringify(cart));
        window.location.reload();
      }
    },

    inspectCart: function () {
      const cart = JSON.parse(localStorage.getItem('wcz_cart') || '[]');
      this.log('CART-INSPECT', `Items in cart: ${cart.length}`, cart);
    },

    inspectAuth: function () {
      const user = window.currentUser || JSON.parse(localStorage.getItem('wcz_local_user') || 'null');
      this.log('AUTH-INSPECT', user ? `Logged in as: ${user.email}` : 'No active session', user);
    },

    inspectPayment: function () {
      const config = {
        rpcKeyAvailable: typeof window.getRazorpayKey === 'function',
        supabaseAvailable: typeof window.supabaseClient !== 'undefined' && window.supabaseClient !== null
      };
      this.log('PAYMENT-INSPECT', 'Gateway status', config);
    },

    inspectBulkGoal: function () {
      const cart = JSON.parse(localStorage.getItem('wcz_cart') || '[]');
      const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
      const goal = 2000;
      this.log('BULK-GOAL', `Subtotal: ₹${subtotal} / Goal: ₹${goal} (Eligible: ${subtotal >= goal})`, {
        subtotal,
        goal,
        diff: Math.max(0, goal - subtotal)
      });
    }
  };

  // Keyboard Shortcut: Ctrl + Shift + D or Cmd + Shift + D
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      window.WCZ_DEBUG.toggle();
    }
  });

  // Render on ready if enabled
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.WCZ_DEBUG.renderDrawer());
  } else {
    window.WCZ_DEBUG.renderDrawer();
  }
})();

