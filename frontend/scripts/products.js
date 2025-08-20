// Mock Product Data
const MOCK_PRODUCTS = [
    // Electronics
    {
        id: 1,
        name: "Wireless Headphones",
        price: 99.99,
        description: "High-quality wireless headphones with noise cancellation",
        image: "🎧",
        category: "electronics"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 249.99,
        description: "Feature-rich smartwatch with health tracking",
        image: "⌚",
        category: "electronics"
    },
    {
        id: 6,
        name: "Bluetooth Speaker",
        price: 69.99,
        description: "Portable Bluetooth speaker with premium sound quality",
        image: "🔊",
        category: "electronics"
    },
    {
        id: 9,
        name: "Gaming Mouse",
        price: 89.99,
        description: "High-precision gaming mouse with RGB lighting",
        image: "🖱️",
        category: "electronics"
    },
    {
        id: 10,
        name: "Mechanical Keyboard",
        price: 129.99,
        description: "Mechanical keyboard with blue switches",
        image: "⌨️",
        category: "electronics"
    },
    {
        id: 11,
        name: "Webcam HD",
        price: 79.99,
        description: "4K webcam for streaming and video calls",
        image: "📹",
        category: "electronics"
    },
    
    // Home & Kitchen
    {
        id: 3,
        name: "Coffee Mug",
        price: 15.99,
        description: "Ceramic coffee mug with thermal insulation",
        image: "☕",
        category: "home"
    },
    {
        id: 5,
        name: "Desk Lamp",
        price: 45.99,
        description: "Modern LED desk lamp with adjustable brightness",
        image: "💡",
        category: "home"
    },
    {
        id: 12,
        name: "Candle Set",
        price: 34.99,
        description: "Aromatherapy candle set with lavender scent",
        image: "🕯️",
        category: "home"
    },
    {
        id: 13,
        name: "Plant Pot",
        price: 28.99,
        description: "Ceramic plant pot with drainage system",
        image: "🪴",
        category: "home"
    },
    {
        id: 14,
        name: "Kitchen Scale",
        price: 39.99,
        description: "Digital kitchen scale with precise measurements",
        image: "⚖️",
        category: "home"
    },
    
    // Accessories
    {
        id: 4,
        name: "Laptop Backpack",
        price: 79.99,
        description: "Durable laptop backpack with multiple compartments",
        image: "🎒",
        category: "accessories"
    },
    {
        id: 8,
        name: "Phone Case",
        price: 19.99,
        description: "Protective phone case with shock absorption",
        image: "📱",
        category: "accessories"
    },
    {
        id: 15,
        name: "Sunglasses",
        price: 149.99,
        description: "UV protection sunglasses with polarized lenses",
        image: "🕶️",
        category: "accessories"
    },
    {
        id: 16,
        name: "Leather Wallet",
        price: 59.99,
        description: "Genuine leather wallet with RFID protection",
        image: "👛",
        category: "accessories"
    },
    {
        id: 17,
        name: "Travel Umbrella",
        price: 29.99,
        description: "Compact travel umbrella with wind resistance",
        image: "☂️",
        category: "accessories"
    },
    
    // Office
    {
        id: 7,
        name: "Notebook Set",
        price: 24.99,
        description: "Set of 3 premium notebooks for work and study",
        image: "📔",
        category: "office"
    },
    {
        id: 18,
        name: "Pen Set",
        price: 18.99,
        description: "Professional pen set with gel ink",
        image: "🖊️",
        category: "office"
    },
    {
        id: 19,
        name: "Desk Organizer",
        price: 42.99,
        description: "Wooden desk organizer with multiple compartments",
        image: "🗂️",
        category: "office"
    },
    {
        id: 20,
        name: "Sticky Notes",
        price: 12.99,
        description: "Colorful sticky notes pack for organization",
        image: "📋",
        category: "office"
    },
    
    // Sports & Fitness
    {
        id: 21,
        name: "Yoga Mat",
        price: 49.99,
        description: "Non-slip yoga mat with carrying strap",
        image: "🧘",
        category: "fitness"
    },
    {
        id: 22,
        name: "Water Bottle",
        price: 22.99,
        description: "Insulated water bottle keeps drinks cold 24hrs",
        image: "💧",
        category: "fitness"
    },
    {
        id: 23,
        name: "Resistance Bands",
        price: 29.99,
        description: "Set of resistance bands for home workouts",
        image: "💪",
        category: "fitness"
    },
    {
        id: 24,
        name: "Fitness Tracker",
        price: 89.99,
        description: "Activity tracker with heart rate monitor",
        image: "⏱️",
        category: "fitness"
    }
];

// Product Management Class
class ProductManager {
    constructor() {
        this.products = [...MOCK_PRODUCTS];
        this.filteredProducts = [...MOCK_PRODUCTS];
        
        // Performance optimizations
        this.searchCache = new Map();
        this.filterCache = new Map();
        this.sortCache = new Map();
        this.lastQuery = '';
        
        // Pre-build search index for lightning-fast search
        this.buildSearchIndex();
    }

    // Build search index for ultra-fast searching
    buildSearchIndex() {
        this.searchIndex = new Map();
        this.products.forEach(product => {
            const searchTerms = [
                product.name.toLowerCase(),
                product.description.toLowerCase(),
                product.category.toLowerCase()
            ].join(' ');
            
            this.searchIndex.set(product.id, searchTerms);
        });
    }

    // Get all products
    getAllProducts() {
        return this.filteredProducts;
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    // Filter products by category
    filterByCategory(category) {
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === category
            );
        }
        return this.filteredProducts;
    }

    // Search products by name
    searchProducts(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredProducts = [...this.products];
            return this.filteredProducts;
        }

        const cleanTerm = searchTerm.toLowerCase().trim();
        
        // Check cache first for lightning-fast repeat searches
        if (this.searchCache.has(cleanTerm)) {
            this.filteredProducts = this.searchCache.get(cleanTerm);
            return this.filteredProducts;
        }

        // Use pre-built search index for ultra-fast search
        this.filteredProducts = this.products.filter(product => {
            const indexedTerms = this.searchIndex.get(product.id);
            return indexedTerms && indexedTerms.includes(cleanTerm);
        });

        // Cache the results (limit cache size for memory management)
        if (this.searchCache.size >= 50) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        this.searchCache.set(cleanTerm, [...this.filteredProducts]);

        return this.filteredProducts;
    }

    // Sort products
    sortProducts(sortBy) {
        switch (sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep original order
                break;
        }
        return this.filteredProducts;
    }

    // Get unique categories
    getCategories() {
        const categories = [...new Set(this.products.map(product => product.category))];
        return ['all', ...categories];
    }
}

// Product Display Manager
class ProductDisplay {
    constructor(productManager) {
        this.productManager = productManager;
        this.container = document.getElementById('productsGrid');
        this.setupEventListeners();
        this.populateCategories();
        // Ensure initial render shows all products
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = 'all';
        }
        // Render immediately on first load to avoid empty state on refresh
        this.renderProducts(this.productManager.getAllProducts());

        // Build AliExpress-like categories bar
        this.buildCategoriesBar();
    }

    // Setup search and filter event listeners
    setupEventListeners() {
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }
    }

    // Populate category dropdown
    populateCategories() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            const categories = this.productManager.getCategories();
            
            // Clear existing options except "All Categories"
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            
            // Add category options
            categories.forEach(category => {
                if (category !== 'all') {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                    categoryFilter.appendChild(option);
                }
            });
        }
    }

    // Build top categories navigation and dropdown
    buildCategoriesBar() {
        const categories = this.productManager.getCategories().filter(c => c !== 'all');
        const nav = document.getElementById('categoriesNav');
        const dropdown = document.getElementById('categoriesDropdown');
        const toggle = document.getElementById('categoriesToggle');
        if (!nav || !dropdown || !toggle) {
            console.warn('Categories bar elements not found');
            return;
        }

        // Populate horizontal nav (up to 6) and push the rest to dropdown
        const primary = categories.slice(0, 6);
        const more = categories.slice(6);

        nav.innerHTML = '';
        primary.forEach(cat => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'categories-link';
            a.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCategoryFilter(cat);
                this.highlightActiveCategory(cat);
            });
            li.appendChild(a);
            nav.appendChild(li);
        });

        // Dropdown content
        dropdown.innerHTML = '';
        if (more.length > 0) {
            const list = document.createElement('ul');
            list.style.listStyle = 'none';
            list.style.margin = '0';
            list.style.padding = '0.5rem 0';
            more.forEach(cat => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'categories-link';
                a.style.display = 'block';
                a.style.margin = '0.25rem 0';
                a.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleCategoryFilter(cat);
                    this.highlightActiveCategory(cat);
                    dropdown.style.display = 'none';
                });
                li.appendChild(a);
                list.appendChild(li);
            });
            dropdown.appendChild(list);
        }

        // Toggle dropdown behavior
        toggle.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== toggle) {
                dropdown.style.display = 'none';
            }
        });
    }

    highlightActiveCategory(cat) {
        const links = document.querySelectorAll('.categories-link');
        links.forEach(l => l.classList.toggle('active', l.textContent.toLowerCase() === cat.toLowerCase()));
        const select = document.getElementById('categoryFilter');
        if (select) select.value = cat;
    }

    // Handle search with debouncing for performance
    handleSearch(searchTerm) {
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Debounce search for performance
        this.searchTimeout = setTimeout(() => {
            this.showLoading();
            
            // Use requestAnimationFrame for smooth rendering
            requestAnimationFrame(() => {
                const results = this.productManager.searchProducts(searchTerm);
                this.renderProducts(results);
                this.updateResultsCount(results.length, searchTerm);
            });
        }, 120); // Slightly tighter debounce for snappier UX
    }

    // Handle category filtering with instant response
    handleCategoryFilter(category) {
        // Use requestAnimationFrame for smooth filtering
        requestAnimationFrame(() => {
            this.showLoading();
            
            // Immediate execution for instant response
            const results = this.productManager.filterByCategory(category);
            this.renderProducts(results);
            this.updateResultsCount(results.length, null, category);
        });
    }

    // Handle sorting with instant response
    handleSort(sortBy) {
        if (sortBy === 'default') return;
        
        // Use requestAnimationFrame for smooth sorting
        requestAnimationFrame(() => {
            this.showLoading();
            
            // Immediate execution for instant response
            const results = this.productManager.sortProducts(sortBy);
            this.renderProducts(results);
        });
    }

    // Update results count display
    updateResultsCount(count, searchTerm = null, category = null) {
        const existingCount = document.querySelector('.results-count');
        if (existingCount) {
            existingCount.remove();
        }

        if (searchTerm || (category && category !== 'all')) {
            const countElement = document.createElement('div');
            countElement.className = 'results-count';
            
            let message = `Found ${count} product${count !== 1 ? 's' : ''}`;
            if (searchTerm) {
                message += ` for "${searchTerm}"`;
            }
            if (category && category !== 'all') {
                message += ` in ${category}`;
            }
            
            countElement.textContent = message;
            
            const container = this.container.parentNode;
            container.insertBefore(countElement, this.container);
        }
    }

    // Render all products
    renderProducts(products = null) {
        const productsToRender = products || this.productManager.getAllProducts();
        
        if (!this.container) {
            console.error('Products container not found');
            return;
        }

        // Use document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        // Handle empty state
        if (productsToRender.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Create all elements in memory first (much faster)
        const maxDelay = 0.3; // clamp animation delay to avoid long chains which can stutter
        productsToRender.forEach((product, index) => {
            const productCard = this.createProductCard(product);
            const delay = Math.min(index * 0.03, maxDelay);
            productCard.style.animationDelay = `${delay}s`;
            fragment.appendChild(productCard);
        });

        // Single DOM operation for maximum performance
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        
        this.hideLoading();
    }

    // Create product card element
    createProductCard(product) {
        // Basic sanitization to prevent XSS
        const sanitize = (str) => String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);

        const img = document.createElement('div');
        img.className = 'product-image';
        img.textContent = product.image; // emoji/text only

        const name = document.createElement('h3');
        name.className = 'product-name';
        name.textContent = sanitize(product.name);

        const desc = document.createElement('p');
        desc.className = 'product-description';
        desc.textContent = sanitize(product.description);

        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = `$${product.price.toFixed(2)}`;

        const btn = document.createElement('button');
        btn.className = 'add-to-cart-btn';
        btn.textContent = 'Add to Cart';
        btn.addEventListener('click', () => {
            // Check for addToCart function when clicked, not when created
            if (typeof window.addToCart === 'function') {
                window.addToCart(product.id);
            } else {
                console.error('❌ addToCart function not available');
            }
        });

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(price);
        card.appendChild(btn);

        return card;
    }

    // Render empty state
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-products">
                <div class="empty-cart-icon">📦</div>
                <div class="empty-cart-message">No products found</div>
                <div class="empty-cart-submessage">Try adjusting your search or filters</div>
            </div>
        `;
    }

    // Show loading state
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
            `;
        }
    }

    // Hide loading state
    hideLoading() {
        // Loading is automatically hidden when renderProducts replaces the container content
        // This method exists to prevent errors but doesn't need to do anything
    }

    // Add visual feedback for add to cart
    animateAddToCart(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            const button = productCard.querySelector('.add-to-cart-btn');
            if (button) {
                button.classList.add('added');
                button.textContent = 'Added!';
                
                setTimeout(() => {
                    button.classList.remove('added');
                    button.textContent = 'Add to Cart';
                }, 1000);
            }
        }
    }
}

// Initialize product manager (will be used globally) — guarded to prevent double init
let productManager;
let productDisplay;

document.addEventListener('DOMContentLoaded', function() {
    if (!window.productManager) {
        window.productManager = new ProductManager();
    }
    if (!window.productDisplay) {
        window.productDisplay = new ProductDisplay(window.productManager);
    } else {
        // Ensure initial render occurs after refresh and keep category = all
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = 'all';
        window.productDisplay.renderProducts(window.productManager.getAllProducts());
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductManager, ProductDisplay, MOCK_PRODUCTS };
}
