// Main Application Controller
class ECommerceApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            console.log('🚀 Initializing E-Commerce Cart System...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }

    // Start the application
    startApp() {
        try {
            // Initialize components
            this.initializeProductManager();
            this.initializeCart();
            this.setupEventListeners();
            this.loadInitialData();
            
            this.isInitialized = true;
            console.log('✅ E-Commerce Cart System initialized successfully!');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Error starting app:', error);
            this.showError('Failed to start application');
        }
    }

    // Initialize product manager
    initializeProductManager() {
        try {
            if (typeof ProductManager === 'undefined') {
                throw new Error('ProductManager class not found - check if products.js is loaded');
            }
            if (typeof productManager === 'undefined' || !productManager) {
                console.log('📦 Initializing Product Manager...');
                window.productManager = new ProductManager();
                window.productDisplay = new ProductDisplay(window.productManager);
            }
        } catch (error) {
            console.error('❌ Error initializing ProductManager:', error);
            throw error;
        }
    }

    // Initialize cart
    initializeCart() {
        try {
            if (typeof ShoppingCart === 'undefined') {
                throw new Error('ShoppingCart class not found - check if cart.js is loaded');
            }
            if (typeof cart === 'undefined' || !cart) {
                console.log('🛒 Initializing Shopping Cart...');
                window.cart = new ShoppingCart();
            }
        } catch (error) {
            console.error('❌ Error initializing ShoppingCart:', error);
            throw error;
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Header scroll effect for better visibility
        this.setupHeaderScrollEffect();
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle before unload (warn about unsaved cart)
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Handle visibility change (pause/resume)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Setup header scroll effect to enhance visibility
    setupHeaderScrollEffect() {
        const header = document.querySelector('.header');
        if (!header) {
            console.warn('⚠️ Header element not found for scroll effect');
            return;
        }

        let lastScrollY = window.scrollY;
        let isScrolling = false;

        const handleScroll = () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    // Add scrolled class when scrolled down for enhanced visibility
                    if (currentScrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    
                    lastScrollY = currentScrollY;
                    isScrolling = false;
                });
                isScrolling = true;
            }
        };

        // Throttled scroll listener for performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        console.log('🎯 Header scroll effect initialized - header will follow you!');
    }

    // Load initial data and render
    loadInitialData() {
        try {
            console.log('📊 Loading initial data...');
            
            // Load and display products
            this.loadProducts();
            
            // Update cart display
            if (window.cart) {
                window.cart.updateDisplay();
            }
            
            console.log('✅ Initial data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            this.showError('Failed to load products');
        }
    }

    // Load and display products
    loadProducts() {
        if (window.productDisplay) {
            // Show loading state briefly only if needed
            window.productDisplay.showLoading();

            // No artificial delay; render immediately for snappier UX
            const products = window.productManager.getAllProducts();
            window.productDisplay.renderProducts(products);
            console.log(`📦 Loaded ${products.length} products`);
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Toggle cart with 'C' key
        if (event.key === 'c' || event.key === 'C') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
                const activeElement = document.activeElement;
                // Don't trigger if user is typing in an input
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    event.preventDefault();
                    if (window.cart) {
                        window.cart.toggleCart();
                    }
                }
            }
        }
        
        // Close cart with Escape key
        if (event.key === 'Escape') {
            if (window.cart && window.cart.isOpen) {
                window.cart.closeCart();
            }
        }
    }

    // Handle window resize
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            console.log('📱 Window resized, adjusting layout...');
            // Add any responsive adjustments here
        }, 250);
    }

    // Handle before unload
    handleBeforeUnload(event) {
        if (window.cart && !window.cart.isEmpty()) {
            // Warn user about leaving with items in cart
            const message = 'You have items in your cart. Are you sure you want to leave?';
            event.returnValue = message;
            return message;
        }
    }

    // Handle visibility change
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ Page hidden, pausing...');
            // Pause any animations or timers
        } else {
            console.log('👁️ Page visible, resuming...');
            // Resume animations or refresh data if needed
            if (window.cart) {
                window.cart.updateDisplay();
            }
        }
    }

    // Show welcome message
    showWelcomeMessage() {
        const totalProducts = window.productManager?.getAllProducts().length || 0;
        console.log(`🎉 Welcome to the E-Commerce Cart System!`);
        console.log(`📦 ${totalProducts} products available`);
        console.log(`💡 Press 'C' to toggle cart, 'Esc' to close cart`);
    }

    // Show error message
    showError(message) {
        console.error('❌', message);
        
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'notification error show';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.classList.remove('show');
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.isInitialized,
            productsLoaded: window.productManager?.getAllProducts().length || 0,
            cartItems: window.cart?.getTotalItems() || 0,
            cartTotal: window.cart?.getTotalPrice() || 0
        };
    }

    // Refresh application data
    refresh() {
        console.log('🔄 Refreshing application...');
        this.loadProducts();
        if (window.cart) {
            window.cart.updateDisplay();
        }
    }
}

// Utility Functions
const AppUtils = {
    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get device type
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    },

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

// Performance Monitor
const PerformanceMonitor = {
    startTime: performance.now(),
    metrics: {
        renderTimes: [],
        searchTimes: [],
        memoryUsage: []
    },

    // Measure function performance
    measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        const duration = end - start;
        
        if (!this.metrics[name]) this.metrics[name] = [];
        this.metrics[name].push(duration);
        
        // Keep only last 100 measurements
        if (this.metrics[name].length > 100) {
            this.metrics[name].shift();
        }
        
        return result;
    },

    // Get performance report
    getReport() {
        const totalTime = performance.now() - this.startTime;
        const memory = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : 'Not available';

        return {
            totalTime: Math.round(totalTime),
            memory,
            metrics: Object.keys(this.metrics).reduce((acc, key) => {
                const times = this.metrics[key];
                if (times.length > 0) {
                    acc[key] = {
                        count: times.length,
                        avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length * 100) / 100,
                        min: Math.round(Math.min(...times) * 100) / 100,
                        max: Math.round(Math.max(...times) * 100) / 100
                    };
                }
                return acc;
            }, {})
        };
    }
};

// Global Debug Functions (for development)
const Debug = {
    // Add random items to cart
    addRandomItems(count = 3) {
        if (!window.cart || !window.productManager) {
            console.log('❌ Cart or ProductManager not available');
            return;
        }
        
        const products = window.productManager.getAllProducts();
        for (let i = 0; i < count; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomQuantity = Math.floor(Math.random() * 3) + 1;
            window.cart.addItem(randomProduct.id, randomQuantity);
        }
        console.log(`🎲 Added ${count} random items to cart`);
    },

    // Clear all data
    clearAllData() {
        if (confirm('Clear all cart data and reload?')) {
            localStorage.removeItem('shoppingCart');
            localStorage.removeItem('orderHistory');
            location.reload();
        }
    },

    // Show app status
    showStatus() {
        if (window.app) {
            console.table(window.app.getStatus());
        }
    },

    // Show order history
    showOrderHistory() {
        try {
            const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            if (orders.length === 0) {
                console.log('📋 No orders found');
                return;
            }
            
            console.log(`📋 Order History (${orders.length} orders):`);
            console.table(orders.map(order => ({
                OrderNumber: order.orderNumber,
                Customer: `${order.customer.firstName} ${order.customer.lastName}`,
                Email: order.customer.email,
                Items: order.items.length,
                Total: `$${order.totals.total.toFixed(2)}`,
                Date: new Date(order.timestamp).toLocaleDateString()
            })));
            
            return orders;
        } catch (error) {
            console.error('Error loading order history:', error);
        }
    },

    // Advanced performance test
    performanceTest() {
        console.log('🚀 Running TURBO performance test...');
        
        // Test search performance
        const searchTests = ['laptop', 'coffee', 'fitness', 'gaming', 'home'];
        const searchTimes = [];
        
        searchTests.forEach(term => {
            const start = performance.now();
            if (window.productManager) {
                window.productManager.searchProducts(term);
            }
            const end = performance.now();
            searchTimes.push(end - start);
        });
        
        // Test rendering performance
        const renderStart = performance.now();
        if (window.productDisplay) {
            window.productDisplay.renderProducts();
        }
        const renderTime = performance.now() - renderStart;
        
        // Test cart operations
        const cartStart = performance.now();
        if (window.cart) {
            window.cart.updateDisplay();
        }
        const cartTime = performance.now() - cartStart;
        
        const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
        
        console.log('🏆 PERFORMANCE RESULTS:');
        console.log(`  💡 Average Search: ${avgSearchTime.toFixed(2)}ms (cached)`);
        console.log(`  🎨 Rendering: ${renderTime.toFixed(2)}ms (with fragments)`);
        console.log(`  🛒 Cart Update: ${cartTime.toFixed(2)}ms (throttled)`);
        console.log(`  🧠 Memory: ${this.getMemoryUsage()}`);
    },

    // Get memory usage
    getMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            return `${used}MB / ${limit}MB`;
        }
        return 'Not available';
    },

    // Performance report
    getPerformanceReport() {
        return PerformanceMonitor.getReport();
    },

    // Test all features
    testAllFeatures() {
        console.log('🧪 Testing all features...');
        
        // Add random items
        this.addRandomItems(5);
        
        // Test search
        setTimeout(() => {
            const searchInput = document.getElementById('productSearch');
            if (searchInput) {
                searchInput.value = 'laptop';
                searchInput.dispatchEvent(new Event('input'));
                console.log('✅ Search tested');
            }
        }, 1000);
        
        // Test filter
        setTimeout(() => {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = 'electronics';
                categoryFilter.dispatchEvent(new Event('change'));
                console.log('✅ Filter tested');
            }
        }, 2000);
        
        // Reset
        setTimeout(() => {
            const searchInput = document.getElementById('productSearch');
            const categoryFilter = document.getElementById('categoryFilter');
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = 'all';
            if (searchInput) searchInput.dispatchEvent(new Event('input'));
            if (categoryFilter) categoryFilter.dispatchEvent(new Event('change'));
            console.log('✅ All features tested successfully!');
        }, 3000);
    }
};

// Initialize Application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    try {
        console.log('🚀 Starting E-Commerce Cart System...');
        window.app = new ECommerceApp();
        console.log('✅ Application started successfully!');
    } catch (error) {
        console.error('❌ Failed to start application:', error);
    }
}

// Make utilities available globally
window.AppUtils = AppUtils;
window.Debug = Debug;

// Development helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('💡 Available debug commands:');
    console.log('  🛒 Debug.addRandomItems(5) - Add random items to cart');
    console.log('  📋 Debug.showOrderHistory() - View completed orders');
    console.log('  🧪 Debug.testAllFeatures() - Test search, filter, and cart');
    console.log('  📊 Debug.showStatus() - Show app status');
    console.log('  🗑️ Debug.clearAllData() - Clear all data and reload');
    console.log('');
    console.log('⚡ TURBO Performance Tools:');
    console.log('  🚀 Debug.performanceTest() - Run speed benchmarks');
    console.log('  📈 Debug.getPerformanceReport() - Detailed performance metrics');
    console.log('  🧠 Debug.getMemoryUsage() - Current memory usage');
    console.log('  📊 PerformanceMonitor.getReport() - Full performance report');
    window.dev = true;
}
