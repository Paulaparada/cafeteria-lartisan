// Manejo del menú por categorías
const categoryBtns = document.querySelectorAll('.category-btn');
const menuSections = document.querySelectorAll('.menu-section');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover clase active de todos los botones y secciones
        categoryBtns.forEach(b => b.classList.remove('active'));
        menuSections.forEach(section => section.classList.remove('active'));
        
        // Agregar clase active al botón clickeado
        btn.classList.add('active');
        
        // Mostrar la sección correspondiente
        const category = btn.getAttribute('data-category');
        document.getElementById(category).classList.add('active');
    });
});

// Carrito de compras
let cart = [];
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.querySelector('.close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const orderFormModal = document.getElementById('order-form-modal');
const closeOrderForm = document.querySelector('.close-order-form');
const orderForm = document.getElementById('order-form');
const pedidoDetalle = document.getElementById('pedido-detalle');
const notification = document.getElementById('notification');

// Mostrar/ocultar carrito
cartIcon.addEventListener('click', function(e) {
    e.preventDefault();
    updateCartDisplay();
    cartModal.style.display = 'block';
});

closeCart.addEventListener('click', function() {
    cartModal.style.display = 'none';
});

// Mostrar formulario de pedido al hacer clic en Finalizar Pedido
checkoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }
    cartModal.style.display = 'none';
    orderFormModal.style.display = 'block';
});

closeOrderForm.addEventListener('click', function() {
    orderFormModal.style.display = 'none';
});

// Añadir productos al carrito
document.querySelectorAll('.add-to-cart').forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const menuItem = this.closest('.menu-item');
        const itemName = menuItem.querySelector('h3').textContent;
        const itemPriceText = menuItem.querySelector('.menu-item-price').textContent;
        const itemPrice = parseFloat(itemPriceText.replace('$', '').replace('.', ''));
        
        addToCart(itemName, itemPrice);
        showNotification(`${itemName} añadido al carrito`, 'success');
    });
});

// Función para añadir al carrito
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name,
            price,
            quantity: 1
        });
    }
    
    updateCartCount();
}

// Actualizar contador del carrito
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Actualizar visualización del carrito
function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Tu carrito está vacío</p>';
        cartTotal.textContent = '$0';
        return;
    }
    
    let total = 0;
    let detallePedido = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price} x ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="decrease-item" data-name="${item.name}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-item" data-name="${item.name}">+</button>
            </div>
            <div class="cart-item-total">
                $${itemTotal.toFixed(2)}
            </div>
        `;
        
        cartItems.appendChild(itemElement);
        
        // Preparar detalle para el correo
        detallePedido += `${item.name} x${item.quantity} - $${itemTotal.toFixed(2)}\n`;
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    pedidoDetalle.value = detallePedido + `\nTotal: $${total.toFixed(2)}`;
    
    // Añadir eventos a los botones de cantidad
    document.querySelectorAll('.increase-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.getAttribute('data-name');
            const item = cart.find(item => item.name === itemName);
            item.quantity++;
            updateCartDisplay();
            updateCartCount();
        });
    });
    
    document.querySelectorAll('.decrease-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.getAttribute('data-name');
            const itemIndex = cart.findIndex(item => item.name === itemName);
            
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                cart.splice(itemIndex, 1);
            }
            
            updateCartDisplay();
            updateCartCount();
        });
    });
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    // Limpiar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        // Esperar a que termine la animación para remover la clase de tipo
        setTimeout(() => notification.className = 'notification', 300);
    }, 3000);
}

// Enviar formulario de pedido
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
    
    try {
        const response = await fetch(orderForm.action, {
            method: 'POST',
            body: new FormData(orderForm),
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showNotification('¡Pedido enviado con éxito! Recibirás un correo con los detalles.', 'success');
            
            // Limpiar carrito después del envío exitoso
            cart = [];
            updateCartCount();
            updateCartDisplay();
            orderFormModal.style.display = 'none';
            orderForm.reset();
        } else {
            throw new Error('Error al enviar el pedido');
        }
    } catch (error) {
        showNotification('Error al enviar el pedido. Por favor intenta nuevamente.', 'error');
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar Pedido';
    }
});

// Para el formulario de reservas
document.getElementById('reservationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
    
    try {
        // Validar campos requeridos
        if (!validateForm(this)) {
            showNotification('Por favor completa todos los campos requeridos correctamente', 'error');
            return;
        }
        
        // Configurar campos ocultos
        this.querySelector('[name="_replyto"]').value = this.querySelector('[name="email"]').value;
        
        const formData = new FormData(this);
        
        const response = await fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showNotification('¡Reserva enviada con éxito! Te esperamos.', 'success');
            this.reset();
            
            // Opcional: redirigir después de éxito
            setTimeout(() => {
                window.location.href = '#reservaciones?success=true';
            }, 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al procesar la reserva');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error al enviar la reserva. Por favor intenta nuevamente.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});
// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (e.target === orderFormModal) {
        orderFormModal.style.display = 'none';
    }
});
function validateForm(form) {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    form.querySelectorAll('[required]').forEach(input => {
        input.style.borderColor = '#ddd'; // Resetear color
        
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            isValid = false;
        } else if (input.type === 'email' && !emailRegex.test(input.value)) {
            input.style.borderColor = 'red';
            showNotification('Por favor ingresa un email válido', 'error');
            isValid = false;
        }
    });
    
    return isValid;
}