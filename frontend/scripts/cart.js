// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.loadFromStorage();
        
        // Performance optimizations
        this.updateTimeout = null;
        this.lastUpdateTime = 0;
        this.updateThrottle = 16; // ~60fps throttling
        this.cachedTotals = null;
        this.cacheValid = false;
    }

    // Add item to cart
    addItem(productId, quantity = 1) {
        const product = window.productManager ? window.productManager.getProductById(productId) : null;
        if (!product) {
            console.error('Product not found:', productId);
            return false;
        }

        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId: productId,
                product: product,
                quantity: quantity,
                addedAt: new Date()
            });
        }

        this.saveToStorage();
        // Force immediate display update
        this.performUpdate();
        
        // Enhanced notification with product details
        const isNewItem = !existingItem;
        const totalQuantity = existingItem ? existingItem.quantity : quantity;
        
        if (isNewItem) {
            this.showNotification(`🛒 ${product.name} added to cart! (${totalQuantity})`, 'success', 2000);
        } else {
            this.showNotification(`📦 ${product.name} quantity updated! (${totalQuantity})`, 'info', 1500);
        }
        
        // Animate the add to cart button
        if (window.productDisplay) {
            window.productDisplay.animateAddToCart(productId);
        }
        
        // Flash cart icon
        this.flashCartIcon();
        
        return true;
    }

    // Remove item from cart
    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
            const removedItem = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            this.saveToStorage();
            this.updateDisplay();
            this.showNotification(`${removedItem.product.name} removed from cart`, 'error', 1500);
            return true;
        }
        return false;
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        // Validate quantity
        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }
        
        // Max quantity limit for demo purposes
        if (newQuantity > 99) {
            this.showNotification('Maximum quantity is 99', 'error');
            return false;
        }

        const item = this.items.find(item => item.productId === productId);
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = newQuantity;
            this.saveToStorage();
            this.updateDisplay();
            
            // Show quantity change feedback
            if (newQuantity > oldQuantity) {
                this.showNotification(`${item.product.name} quantity increased to ${newQuantity}`);
            } else {
                this.showNotification(`${item.product.name} quantity decreased to ${newQuantity}`);
            }
            
            // Animate quantity change
            this.animateQuantityUpdate(productId);
            
            return true;
        }
        return false;
    }

    // Increase quantity
    increaseQuantity(productId) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            return this.updateQuantity(productId, item.quantity + 1);
        }
        return false;
    }

    // Decrease quantity
    decreaseQuantity(productId) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            return this.updateQuantity(productId, item.quantity - 1);
        }
        return false;
    }

    // Clear entire cart
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateDisplay();
        this.showNotification('Cart cleared!', 'error');
    }

    // Get cart items
    getItems() {
        return this.items;
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get subtotal (before tax)
    getSubtotal() {
        return this.items.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0
        );
    }

    // Get tax amount
    getTaxAmount(taxRate = 0.08) {
        return this.getSubtotal() * taxRate;
    }

    // Get total price (including tax)
    getTotalPrice(includeTax = false, taxRate = 0.08) {
        const subtotal = this.getSubtotal();
        return includeTax ? subtotal + this.getTaxAmount(taxRate) : subtotal;
    }

    // Get detailed cart totals
    getCartTotals(includeTax = false, taxRate = 0.08) {
        // Use cache if valid and parameters match
        if (this.cacheValid && this.cachedTotals && 
            this.cachedTotals.includeTax === includeTax && 
            this.cachedTotals.taxRate === taxRate) {
            return this.cachedTotals;
        }
        
        const subtotal = this.getSubtotal();
        const tax = includeTax ? this.getTaxAmount(taxRate) : 0;
        const total = subtotal + tax;
        
        // Cache the result for performance
        this.cachedTotals = {
            subtotal: subtotal,
            tax: tax,
            total: total,
            taxRate: taxRate,
            itemCount: this.getTotalItems(),
            includeTax: includeTax
        };
        this.cacheValid = true;
        
        return this.cachedTotals;
    }

    // Simple method to get just the total amount
    calculateTotal() {
        const totals = this.getCartTotals();
        return totals.total;
    }

    // Get item subtotal
    getItemSubtotal(productId) {
        const item = this.items.find(item => item.productId === productId);
        return item ? item.product.price * item.quantity : 0;
    }

    // Check if cart is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Toggle cart visibility
    toggleCart() {
        this.isOpen = !this.isOpen;
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            if (this.isOpen) {
                // Update display before showing to ensure fresh data
                console.log('Opening cart with', this.items.length, 'items');
                this.updateDisplay();
                overlay.classList.add('active');
                document.body.classList.add('cart-open');
                document.body.style.overflow = 'hidden';
            } else {
                overlay.classList.remove('active');
                document.body.classList.remove('cart-open');
                document.body.style.overflow = '';
            }
        }
    }

    // Close cart
    closeCart() {
        this.isOpen = false;
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.classList.remove('cart-open');
            document.body.style.overflow = '';
        }
    }

    // Save cart to localStorage
    saveToStorage() {
        try {
            const cartData = {
                items: this.items,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('shoppingCart', JSON.stringify(cartData));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Load cart from localStorage
    loadFromStorage() {
        try {
            const cartData = localStorage.getItem('shoppingCart');
            if (cartData) {
                const parsed = JSON.parse(cartData);
                if (parsed.items && Array.isArray(parsed.items)) {
                    // Validate items and refresh product data
                    this.items = parsed.items.filter(item => {
                        const product = window.productManager?.getProductById(item.productId);
                        if (product) {
                            item.product = product; // Refresh product data
                            return true;
                        }
                        return false;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }

    // Optimized cart display update with throttling
    updateDisplay() {
        // Throttle updates for better performance
        const now = performance.now();
        if (now - this.lastUpdateTime < this.updateThrottle) {
            // Cancel previous timeout and schedule new one
            if (this.updateTimeout) {
                cancelAnimationFrame(this.updateTimeout);
            }
            
            this.updateTimeout = requestAnimationFrame(() => {
                this.performUpdate();
                this.lastUpdateTime = performance.now();
            });
            return;
        }
        
        this.performUpdate();
        this.lastUpdateTime = now;
    }

    // Perform the actual update
    performUpdate() {
        // Invalidate cache
        this.cacheValid = false;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            this.updateCartCount();
            this.updateCartItems();
            this.updateCartTotal();
        });
    }

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    // Update cart items display
    updateCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        if (this.isEmpty()) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <div class="empty-cart-message">Your cart is empty</div>
                    <div class="empty-cart-submessage">Add some products to get started!</div>
                </div>
            `;
            return;
        }

        this.items.forEach(item => {
            const cartItem = this.createCartItemElement(item);
            cartItemsContainer.appendChild(cartItem);
        });

        // Items updated
    }



    // Create cart item element
    createCartItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.setAttribute('data-product-id', item.productId);

        const subtotal = this.getItemSubtotal(item.productId);

        itemElement.innerHTML = `
            <div class="cart-item-header">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="(window.cart || cart).decreaseQuantity(${item.productId})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="(window.cart || cart).increaseQuantity(${item.productId})">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.productId})">Remove</button>
            </div>
            <div class="cart-item-subtotal">
                Subtotal: <strong>$${subtotal.toFixed(2)}</strong>
            </div>
        `;

        return itemElement;
    }

    // Update cart total
    updateCartTotal() {
        const includeTaxCheckbox = document.getElementById('includeTax');
        const includeTax = includeTaxCheckbox ? includeTaxCheckbox.checked : false;
        
        const totals = this.getCartTotals(includeTax);
        
        // Update subtotal
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        if (cartSubtotalElement) {
            cartSubtotalElement.textContent = totals.subtotal.toFixed(2);
        }
        
        // Update tax
        const cartTaxElement = document.getElementById('cartTax');
        const cartTaxRow = document.getElementById('cartTaxRow');
        if (cartTaxElement && cartTaxRow) {
            cartTaxElement.textContent = totals.tax.toFixed(2);
            cartTaxRow.style.display = includeTax ? 'block' : 'none';
        }
        
        // Update total
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            cartTotalElement.textContent = totals.total.toFixed(2);
        }
        
        // Add pulse animation to totals
        this.animateTotalsUpdate();
    }

    // Animate totals update
    animateTotalsUpdate() {
        const cartTotals = document.querySelector('.cart-totals');
        if (cartTotals) {
            cartTotals.classList.remove('updated');
            // Force reflow
            cartTotals.offsetHeight;
            cartTotals.classList.add('updated');
            
            // Remove class after animation
            setTimeout(() => {
                cartTotals.classList.remove('updated');
            }, 800);
        }
    }

    // Animate quantity update
    animateQuantityUpdate(productId) {
        const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
        if (cartItem) {
            const quantityDisplay = cartItem.querySelector('.quantity-display');
            if (quantityDisplay) {
                quantityDisplay.classList.remove('updated');
                // Force reflow
                quantityDisplay.offsetHeight;
                quantityDisplay.classList.add('updated');
                
                // Remove class after animation
                setTimeout(() => {
                    quantityDisplay.classList.remove('updated');
                }, 600);
            }
        }
    }

    // Show notification
    showNotification(message, type = 'success', duration = 3000) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add spinner for loading notifications
        if (type === 'info' && message.includes('Processing')) {
            notification.innerHTML = `
                <div class="notification-spinner"></div>
                <span>${message}</span>
            `;
        } else {
            notification.textContent = message;
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after specified duration (unless it's a loading notification)
        if (type !== 'info' || !message.includes('Processing')) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }
    }

    // Hide current notification
    hideNotification() {
        const notification = document.querySelector('.notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    // Flash cart icon animation
    flashCartIcon() {
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.classList.add('cart-flash');
            setTimeout(() => {
                cartToggle.classList.remove('cart-flash');
            }, 600);
        }
    }

    // Get cart summary for checkout
    getCartSummary() {
        return {
            items: this.items,
            totalItems: this.getTotalItems(),
            totalPrice: this.getTotalPrice(),
            timestamp: new Date().toISOString()
        };
    }

    // Open checkout modal
    openCheckout() {
        const checkoutOverlay = document.getElementById('checkoutOverlay');
        if (checkoutOverlay) {
            this.populateCheckoutItems();
            this.populateCheckoutTotals();
            checkoutOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Close checkout modal
    closeCheckout() {
        const checkoutOverlay = document.getElementById('checkoutOverlay');
        if (checkoutOverlay) {
            checkoutOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Populate checkout items
    populateCheckoutItems() {
        const checkoutItems = document.getElementById('checkoutItems');
        if (!checkoutItems) return;

        checkoutItems.innerHTML = '';

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            
            const subtotal = this.getItemSubtotal(item.productId);
            
            itemElement.innerHTML = `
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.product.name}</div>
                    <div class="checkout-item-details">
                        ${item.product.image} • Qty: ${item.quantity} • $${item.product.price.toFixed(2)} each
                    </div>
                </div>
                <div class="checkout-item-total">$${subtotal.toFixed(2)}</div>
            `;
            
            checkoutItems.appendChild(itemElement);
        });
    }

    // Populate checkout totals
    populateCheckoutTotals() {
        const checkoutTotals = document.getElementById('checkoutTotals');
        const includeTaxCheckbox = document.getElementById('includeTax');
        const includeTax = includeTaxCheckbox ? includeTaxCheckbox.checked : false;
        
        if (!checkoutTotals) return;

        const totals = this.getCartTotals(includeTax);
        
        let totalsHTML = `
            <div class="checkout-total-row">
                <span>Subtotal (${totals.itemCount} items):</span>
                <span>$${totals.subtotal.toFixed(2)}</span>
            </div>
            <div class="checkout-total-row">
                <span>Shipping:</span>
                <span>FREE</span>
            </div>
        `;
        
        if (includeTax) {
            totalsHTML += `
                <div class="checkout-total-row">
                    <span>Tax (${(totals.taxRate * 100)}%):</span>
                    <span>$${totals.tax.toFixed(2)}</span>
                </div>
            `;
        }
        
        totalsHTML += `
            <div class="checkout-total-row final">
                <span>Total:</span>
                <span>$${totals.total.toFixed(2)}</span>
            </div>
        `;
        
        checkoutTotals.innerHTML = totalsHTML;
    }

    // Handle checkout form submission
    handleCheckoutSubmission(formData) {
        // Show processing notification
        this.showNotification('Processing your order...', 'info');
        
        // Disable form during processing
        const submitButton = document.getElementById('placeOrder');
        if (submitButton) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
        }
        
        // Simulate order processing with potential for failure
        setTimeout(() => {
            // Hide processing notification
            this.hideNotification();
            
            // Re-enable form
            if (submitButton) {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
            
            // Simulate random success/failure for demo (90% success rate)
            const isSuccess = Math.random() > 0.1;
            
            if (isSuccess) {
                // Simulate successful order
                const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
                
                this.showNotification(`🎉 Order ${orderNumber} placed successfully! Thank you for your purchase!`, 'success', 5000);
                
                // Save order to localStorage for demo
                const orderDetails = {
                    orderNumber,
                    customer: formData,
                    items: [...this.items],
                    totals: this.getCartTotals(),
                    timestamp: new Date().toISOString()
                };
                
                try {
                    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                    existingOrders.push(orderDetails);
                    localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
                } catch (error) {
                    console.warn('Could not save order to localStorage:', error);
                }
                
                // Clear cart and close checkout
                this.clearCart();
                this.closeCheckout();
                
                // Log order details for demo
                console.log('Order Details:', orderDetails);
                
            } else {
                // Simulate order failure
                this.showNotification('⚠️ Order processing failed. Please check your information and try again.', 'error', 5000);
            }
        }, 2000 + Math.random() * 1000); // Random processing time 2-3 seconds
    }
}

// Initialize cart
let cart;

// Global functions for cart operations (called from HTML)
function addToCart(productId, quantity = 1) {
    const activeCart = cart || window.cart;
    if (activeCart) {
        return activeCart.addItem(productId, quantity);
    }
    console.error('❌ Cart not initialized');
    return false;
}

// Explicitly attach to window object for global access
window.addToCart = addToCart;

function removeFromCart(productId) {
    const activeCart = cart || window.cart;
    if (activeCart) {
        return activeCart.removeItem(productId);
    }
    return false;
}

function toggleCart() {
    const activeCart = cart || window.cart;
    if (activeCart) {
        activeCart.toggleCart();
    }
}

function clearCart() {
    const activeCart = cart || window.cart;
    if (activeCart && confirm('Are you sure you want to clear your cart?')) {
        activeCart.clearCart();
    }
}

// Attach all global functions to window object
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;

function proceedToCheckout() {
    console.log('🚀 Proceed to checkout clicked');
    const activeCart = cart || window.cart;
    
    if (!activeCart) {
        console.error('❌ No cart instance found');
        alert('Cart system error. Please refresh the page.');
        return;
    }
    
    if (activeCart.isEmpty()) {
        console.log('⚠️ Cart is empty');
        activeCart.showNotification('Your cart is empty!', 'error');
        return;
    }
    
    console.log('💾 Saving cart data to localStorage');
    // Save cart data to localStorage for checkout page
    const cartData = {
        items: activeCart.items,
        total: activeCart.calculateTotal()
    };
    localStorage.setItem('cartData', JSON.stringify(cartData));
    console.log('✅ Cart data saved:', cartData);
    
    console.log('🔄 Navigating to checkout page');
    // Navigate to checkout page
    window.location.href = 'checkout.html';
}

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.cart = new ShoppingCart();
    cart = window.cart;
    
    // Set up event listeners
    const cartToggle = document.getElementById('cartToggle');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartToggle) {
        cartToggle.addEventListener('click', toggleCart);
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => cart.closeCart());
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cart.closeCart();
            }
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }

    // Add tax toggle event listener
    const includeTaxCheckbox = document.getElementById('includeTax');
    if (includeTaxCheckbox) {
        includeTaxCheckbox.addEventListener('change', () => {
            cart.updateCartTotal();
        });
    }



    // Checkout modal event listeners
    const closeCheckout = document.getElementById('closeCheckout');
    const backToCart = document.getElementById('backToCart');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutOverlay = document.getElementById('checkoutOverlay');

    if (closeCheckout) {
        closeCheckout.addEventListener('click', () => cart.closeCheckout());
    }

    if (backToCart) {
        backToCart.addEventListener('click', () => cart.closeCheckout());
    }

    if (checkoutOverlay) {
        checkoutOverlay.addEventListener('click', (e) => {
            if (e.target === checkoutOverlay) {
                cart.closeCheckout();
            }
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(checkoutForm);
            const customerData = Object.fromEntries(formData.entries());
            
            // Basic validation
            const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
            const missingFields = requiredFields.filter(field => !customerData[field]);
            
            if (missingFields.length > 0) {
                cart.showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerData.email)) {
                cart.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Process checkout
            cart.handleCheckoutSubmission(customerData);
        });
    }

    // Update display on initialization
    cart.updateDisplay();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart };
}

