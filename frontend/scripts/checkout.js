// Checkout Page JavaScript

class CheckoutManager {
    constructor() {
        console.log('🏗️ Creating CheckoutManager...');
        this.cartData = this.loadCartData();
        this.shippingCost = 9.99;
        this.taxRate = 0.085; // 8.5%
        console.log('⚙️ Initializing checkout...');
        this.init();
    }

    init() {
        console.log('📋 Setting up checkout components...');
        this.loadOrderSummary();
        this.setupEventListeners();
        this.setupFormValidation();
        this.updateProgressStep(1);
        console.log('✅ Checkout initialization complete!');
    }

    loadCartData() {
        try {
            const cartData = localStorage.getItem('cartData');
            return cartData ? JSON.parse(cartData) : { items: [], total: 0 };
        } catch (error) {
            console.error('Error loading cart data:', error);
            return { items: [], total: 0 };
        }
    }

    loadOrderSummary() {
        console.log('📦 Loading order summary with cart data:', this.cartData);
        
        const cartItemsContainer = document.getElementById('checkout-cart-items');
        const subtotalElement = document.getElementById('checkout-subtotal');
        const taxElement = document.getElementById('checkout-tax');
        const shippingElement = document.getElementById('checkout-shipping');
        const totalElement = document.getElementById('checkout-total');

        // Check if required elements exist
        if (!cartItemsContainer) {
            throw new Error('checkout-cart-items element not found');
        }
        if (!subtotalElement) {
            throw new Error('checkout-subtotal element not found');
        }
        if (!taxElement) {
            throw new Error('checkout-tax element not found');
        }
        if (!totalElement) {
            throw new Error('checkout-total element not found');
        }

        // Clear existing items
        cartItemsContainer.innerHTML = '';

        if (!this.cartData.items || this.cartData.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-checkout">
                    <p>Your cart is empty. <a href="index.html">Continue shopping</a></p>
                </div>
            `;
            return;
        }

        // Calculate totals
        let subtotal = 0;
        
        this.cartData.items.forEach(item => {
            console.log('📦 Processing cart item:', item);
            
            // Handle different item structures
            let itemName, itemPrice, itemQuantity;
            
            if (item.product) {
                // New structure: item has a product property
                itemName = item.product.name;
                itemPrice = item.product.price;
                itemQuantity = item.quantity;
            } else {
                // Direct structure: item has direct properties
                itemName = item.name;
                itemPrice = item.price;
                itemQuantity = item.quantity;
            }
            
            const itemTotal = itemPrice * itemQuantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-cart-item';
            itemElement.innerHTML = `
                <div class="checkout-item-info">
                    <h4>${this.sanitizeInput(itemName)}</h4>
                    <div class="checkout-item-details">
                        Quantity: ${itemQuantity} × $${itemPrice.toFixed(2)}
                    </div>
                </div>
                <div class="checkout-item-price">
                    $${itemTotal.toFixed(2)}
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        const tax = subtotal * this.taxRate;
        const total = subtotal + tax + this.shippingCost;

        // Update totals display
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        shippingElement.textContent = `$${this.shippingCost.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Store calculated values
        this.orderTotals = {
            subtotal,
            tax,
            shipping: this.shippingCost,
            total
        };
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Payment method change
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', this.handlePaymentMethodChange.bind(this));
        });

        // Form submission
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', this.handleFormSubmission.bind(this));
        } else {
            console.warn('⚠️ Checkout form not found');
        }

        // Card number formatting
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', this.formatCardNumber.bind(this));
        }

        // Expiry date formatting
        const expiryDateInput = document.getElementById('expiryDate');
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', this.formatExpiryDate.bind(this));
        }

        // CVV validation
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', this.formatCVV.bind(this));
        }
        
        console.log('✅ Event listeners setup complete');
    }

    setupFormValidation() {
        const form = document.getElementById('checkout-form');
        if (!form) {
            console.warn('⚠️ Checkout form not found, skipping validation setup');
            return;
        }
        
        const inputs = form.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        console.log('✅ Form validation setup complete');
    }

    handlePaymentMethodChange(event) {
        const cardDetails = document.getElementById('card-details');
        if (event.target.value === 'card') {
            cardDetails.style.display = 'block';
            this.makeCardFieldsRequired(true);
        } else {
            cardDetails.style.display = 'none';
            this.makeCardFieldsRequired(false);
        }
    }

    makeCardFieldsRequired(required) {
        const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (required) {
                    field.setAttribute('required', '');
                } else {
                    field.removeAttribute('required');
                }
            }
        });
    }

    formatCardNumber(event) {
        let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        const formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
        event.target.value = formattedValue;
    }

    formatExpiryDate(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        event.target.value = value;
    }

    formatCVV(event) {
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Card number validation
        if (field.id === 'cardNumber' && value) {
            const cardNumber = value.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                isValid = false;
                errorMessage = 'Please enter a valid card number';
            }
        }

        // Expiry date validation
        if (field.id === 'expiryDate' && value) {
            const [month, year] = value.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
                isValid = false;
                errorMessage = 'Please enter a valid expiry date';
            } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                isValid = false;
                errorMessage = 'Card has expired';
            }
        }

        // CVV validation
        if (field.id === 'cvv' && value) {
            if (value.length < 3 || value.length > 4) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            `;
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.innerHTML = `⚠️ ${message}`;
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('.place-order-btn');
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoader = submitButton.querySelector('.btn-loader');

        // Validate all fields
        let isFormValid = true;
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please correct the errors in the form', 'error');
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // Simulate API call
            await this.processOrder(formData);
            
            // Show success
            this.showSuccessModal();
            
            // Clear cart
            localStorage.removeItem('cartData');
            
        } catch (error) {
            console.error('Order processing error:', error);
            this.showNotification('Failed to process order. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    async processOrder(formData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate order ID
        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
        
        // Prepare order data
        const orderData = {
            orderId,
            items: this.cartData.items,
            totals: this.orderTotals,
            customer: {
                firstName: this.sanitizeInput(formData.get('firstName')),
                lastName: this.sanitizeInput(formData.get('lastName')),
                email: this.sanitizeInput(formData.get('email')),
                phone: this.sanitizeInput(formData.get('phone'))
            },
            shipping: {
                address: this.sanitizeInput(formData.get('address')),
                city: this.sanitizeInput(formData.get('city')),
                state: formData.get('state'),
                zipCode: this.sanitizeInput(formData.get('zipCode'))
            },
            payment: {
                method: formData.get('paymentMethod')
            },
            timestamp: new Date().toISOString()
        };

        // Store order in localStorage (in a real app, this would be sent to a server)
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Store order ID for success modal
        this.currentOrderId = orderId;
        
        return orderData;
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        const orderIdElement = document.getElementById('order-id');
        const finalTotalElement = document.getElementById('final-total');
        
        orderIdElement.textContent = this.currentOrderId;
        finalTotalElement.textContent = `$${this.orderTotals.total.toFixed(2)}`;
        
        modal.classList.add('active');
        
        // Update progress to completion
        this.updateProgressStep(3);
    }

    updateProgressStep(step) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((stepElement, index) => {
            if (index + 1 <= step) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.innerHTML = `
            <div class="notification-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</div>
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    sanitizeInput(input) {
        if (!input) return '';
        return input.toString()
            .replace(/[<>]/g, '')
            .trim();
    }
}

// Utility functions
function goBackToShop() {
    window.location.href = 'index.html';
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Initializing Checkout System...');
    
    try {
        window.checkoutManager = new CheckoutManager();
        console.log('✅ Checkout System initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing checkout:', error);
        
        // Show error message
        const container = document.querySelector('.checkout-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #ffffff;">
                    <h2>⚠️ Checkout System Error</h2>
                    <p>Failed to load checkout. Please try refreshing the page.</p>
                    <button onclick="goBackToShop()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Back to Shop
                    </button>
                </div>
            `;
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', (event) => {
    // Only warn if form has been modified
    const form = document.getElementById('checkout-form');
    if (form) {
        const formData = new FormData(form);
        let hasData = false;
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                hasData = true;
                break;
            }
        }
        
        if (hasData) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    }
});
