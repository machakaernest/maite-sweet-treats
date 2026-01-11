// Cart functionality
let cart = [];
let cartTotal = 0;

// DOM elements
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const successModal = document.getElementById('successModal');
const cartCount = document.querySelector('.cart-count');
const cartItems = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutTotalElement = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutBtn = document.getElementById('checkoutBtn');

// Event listeners
cartIcon.addEventListener('click', openCartModal);
checkoutBtn.addEventListener('click', openCheckoutModal);
checkoutForm.addEventListener('submit', handleOrderSubmission);

// Close modal functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Add to cart function
function addToCart(productId, productName, price) {
    console.log('Adding to cart:', productId, productName, price); // Debug log
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Updated existing item quantity:', existingItem.quantity); // Debug log
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
        console.log('Added new item to cart'); // Debug log
    }
    
    console.log('Current cart:', cart); // Debug log
    updateCartDisplay();
    showAddToCartAnimation();
}

// Update cart display
function updateCartDisplay() {
    console.log('Updating cart display...'); // Debug log
    
    if (!cartCount || !cartTotalElement || !checkoutTotalElement) {
        console.error('Cart DOM elements not found!');
        return;
    }
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotalElement.textContent = cartTotal.toFixed(2);
    checkoutTotalElement.textContent = cartTotal.toFixed(2);
    
    console.log('Cart updated - Items:', totalItems, 'Total:', cartTotal); // Debug log
    
    renderCartItems();
}

// Render cart items
function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    checkoutBtn.style.display = 'block';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <span class="item-price">R${item.price.toFixed(2)} each</span>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

// Show add to cart animation
function showAddToCartAnimation() {
    cartIcon.style.transform = 'scale(1.2)';
    cartIcon.style.color = '#28a745';
    
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
        cartIcon.style.color = '#e91e63';
    }, 300);
}

// Open cart modal
function openCartModal() {
    cartModal.style.display = 'block';
    updateCartDisplay();
}

// Open checkout modal
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
}

// Handle order submission
async function handleOrderSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const paymentProof = document.getElementById('paymentProof').files[0];
    
    if (!paymentProof) {
        alert('Please upload payment proof');
        return;
    }
    
    // Create order summary
    const orderSummary = {
        customer: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress
        },
        items: cart,
        total: cartTotal,
        timestamp: new Date().toISOString()
    };
    
    // Convert payment proof to base64 for WhatsApp message
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        sendWhatsAppMessage(orderSummary, base64Image);
    };
    reader.readAsDataURL(paymentProof);
}

// Send WhatsApp message
function sendWhatsAppMessage(orderSummary, paymentProofBase64) {
    // Create order details text
    let orderText = `🍰 NEW ORDER - Maite Sweet Treats 🧁\n\n`;
    orderText += `👤 Customer: ${orderSummary.customer.name}\n`;
    orderText += `📱 Phone: ${orderSummary.customer.phone}\n`;
    orderText += `📍 Address: ${orderSummary.customer.address}\n\n`;
    orderText += `🛒 ORDER DETAILS:\n`;
    
    orderSummary.items.forEach(item => {
        orderText += `• ${item.name} x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    orderText += `\n💰 TOTAL: R${orderSummary.total.toFixed(2)}\n`;
    orderText += `⏰ Order Time: ${new Date(orderSummary.timestamp).toLocaleString()}\n\n`;
    orderText += `💳 Payment Details:\n`;
    orderText += `Account Name: M Mthembu\n`;
    orderText += `Account Number: 1234567890\n`;
    orderText += `Bank: Capitec Bank\n`;
    orderText += `Branch Code: 470010\n\n`;
    orderText += `Payment proof will be sent separately.`;
    
    // WhatsApp business number (South African format)
    const whatsappNumber = '27820483902'; // +27 82 048 3902 (correct number)
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`;
    
    // Debug: Log the URL
    console.log('Order WhatsApp URL:', whatsappUrl);
    
    // Store order data in localStorage for reference
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        ...orderSummary,
        id: Date.now(),
        paymentProofUploaded: true
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Show success modal
    checkoutModal.style.display = 'none';
    successModal.style.display = 'block';
    
    // Clear cart
    cart = [];
    updateCartDisplay();
    
    // Reset form
    checkoutForm.reset();
    
    // Open WhatsApp immediately
    const opened = window.open(whatsappUrl, '_blank');
    
    // If popup was blocked, show the URL to user
    if (!opened || opened.closed || typeof opened.closed == 'undefined') {
        alert(`Please copy this link and open it manually: ${whatsappUrl}`);
    }
}

// Close success modal
function closeSuccessModal() {
    successModal.style.display = 'none';
}

// Open WhatsApp for direct ordering
function openWhatsAppOrder() {
    const whatsappNumber = '27820483902'; // Correct number: +27 82 048 3902
    const message = `Hi! I'm interested in ordering from Maite Sweet Treats. Could you please help me with the menu and pricing?`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Debug: Log the URL to console
    console.log('WhatsApp URL:', whatsappUrl);
    
    // Try opening WhatsApp
    const opened = window.open(whatsappUrl, '_blank');
    
    // If popup was blocked, show the URL to user
    if (!opened || opened.closed || typeof opened.closed == 'undefined') {
        alert(`Please copy this link and open it manually: ${whatsappUrl}`);
    }
}

// Scroll to products section
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth'
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing cart...'); // Debug log
    
    // Check if all required elements exist
    const requiredElements = {
        cartIcon: document.querySelector('.cart-icon'),
        cartModal: document.getElementById('cartModal'),
        cartCount: document.querySelector('.cart-count'),
        cartItems: document.getElementById('cartItems'),
        cartTotalElement: document.getElementById('cartTotal'),
        checkoutTotalElement: document.getElementById('checkoutTotal')
    };
    
    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`Required element not found: ${name}`);
        } else {
            console.log(`Found element: ${name}`);
        }
    }
    
    updateCartDisplay();
});

// File upload preview
document.getElementById('paymentProof').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Remove any existing preview
        const existingPreview = document.querySelector('.payment-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'payment-preview';
            preview.innerHTML = `
                <p style="margin-top: 10px; color: #28a745;">
                    <i class="fas fa-check-circle"></i> Payment proof uploaded: ${file.name}
                </p>
                <img src="${e.target.result}" alt="Payment Proof" style="max-width: 200px; max-height: 200px; margin-top: 10px; border-radius: 8px; border: 2px solid #ddd;">
            `;
            document.getElementById('paymentProof').parentNode.appendChild(preview);
        };
        reader.readAsDataURL(file);
    }
});

// Add some loading animation for better UX
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000;">
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #e91e63; margin-bottom: 1rem;"></i>
                <p>Processing your order...</p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingDiv);
    
    setTimeout(() => {
        document.getElementById('loading').remove();
    }, 2000);
}