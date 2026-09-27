function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("active");
    const hamburger = document.querySelector(".hamburger");
    if (hamburger) hamburger.classList.toggle("active");
}

// Auto-close menu when clicking links on mobile & initialize WhatsApp Chatbox
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.querySelector(".nav-links").classList.remove("active");
            const hamburger = document.querySelector(".hamburger");
            if (hamburger) hamburger.classList.remove("active");
        });
    });

    initWhatsAppChat();
});

// =========================================
// INTERACTIVE WHATSAPP CHATBOX WIDGET
// =========================================
function initWhatsAppChat() {
    // Avoid double initialization
    if (document.querySelector('.rv-wa-widget')) return;

    const waPhone = '919864820229';
    const waIconSvg = `<svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
    const sendIconSvg = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

    const widget = document.createElement('div');
    widget.className = 'rv-wa-widget';
    widget.innerHTML = `
        <div class="rv-wa-teaser" id="rvWaTeaser" title="Click to chat with RhinoVoyage">
            <span>👋 Need help? Chat with us!</span>
        </div>
        <button class="rv-wa-trigger" id="rvWaTrigger" aria-label="Open WhatsApp Chat" title="Chat on WhatsApp">
            <div class="rv-wa-pulse"></div>
            ${waIconSvg}
            <span class="rv-wa-badge" id="rvWaBadge"></span>
        </button>

        <div class="rv-wa-box" id="rvWaBox" role="dialog" aria-modal="true" aria-labelledby="rvWaTitle">
            <div class="rv-wa-header">
                <div class="rv-wa-header-left">
                    <div class="rv-wa-avatar">
                        🦏
                        <span class="rv-wa-online-dot"></span>
                    </div>
                    <div>
                        <div class="rv-wa-title" id="rvWaTitle">RhinoVoyage Support</div>
                        <div class="rv-wa-subtitle">Online • Instant WhatsApp Reply</div>
                    </div>
                </div>
                <button class="rv-wa-close-btn" id="rvWaClose" aria-label="Close Chat">✕</button>
            </div>

            <div class="rv-wa-body">
                <div class="rv-wa-date-divider">Today</div>
                <div class="rv-wa-msg-bubble">
                    Hello! 👋 Welcome to <strong>RhinoVoyage</strong>.<br>
                    Planning a trip to Sivasagar or exploring Northeast India? Let us know how we can assist you with cabs, bus tours, or custom packages!
                    <div class="rv-wa-msg-time">Just now ✓✓</div>
                </div>

                <div class="rv-wa-quick-chips">
                    <button type="button" class="rv-wa-chip" data-msg="Hi RhinoVoyage, I need to book a Cab / Rental in Assam.">
                        <span>🚕 Book a Cab / Rental</span>
                        <span>→</span>
                    </button>
                    <button type="button" class="rv-wa-chip" data-msg="Hi RhinoVoyage, I want details about the Sivasagar Heritage Tour.">
                        <span>🏰 Sivasagar Heritage Tour</span>
                        <span>→</span>
                    </button>
                    <button type="button" class="rv-wa-chip" data-msg="Hi RhinoVoyage, I am inquiring about Northeast Holiday Tour Packages.">
                        <span>🗺️ Northeast Tour Packages</span>
                        <span>→</span>
                    </button>
                    <button type="button" class="rv-wa-chip" data-msg="Hi RhinoVoyage, please share your vehicle rental rates and availability.">
                        <span>💬 Rates & Availability</span>
                        <span>→</span>
                    </button>
                </div>
            </div>

            <form class="rv-wa-footer" id="rvWaForm">
                <div class="rv-wa-input-row">
                    <input type="text" class="rv-wa-input" id="rvWaInput" placeholder="Type a message..." autocomplete="off">
                    <button type="submit" class="rv-wa-send-btn" title="Send WhatsApp Message" aria-label="Send WhatsApp Message">
                        ${sendIconSvg}
                    </button>
                </div>
                <div class="rv-wa-footer-caption">Connects directly to Official WhatsApp Support (+91 9864820229)</div>
            </form>
        </div>
    `;

    document.body.appendChild(widget);

    const trigger = document.getElementById('rvWaTrigger');
    const box = document.getElementById('rvWaBox');
    const closeBtn = document.getElementById('rvWaClose');
    const teaser = document.getElementById('rvWaTeaser');
    const badge = document.getElementById('rvWaBadge');
    const form = document.getElementById('rvWaForm');
    const input = document.getElementById('rvWaInput');
    const chips = widget.querySelectorAll('.rv-wa-chip');

    function toggleChat(open) {
        const isOpen = open !== undefined ? open : !box.classList.contains('active');
        if (isOpen) {
            box.classList.add('active');
            if (badge) badge.style.display = 'none';
            if (teaser) teaser.style.display = 'none';
            setTimeout(() => input && input.focus(), 150);
        } else {
            box.classList.remove('active');
        }
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChat();
    });

    if (teaser) {
        teaser.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleChat(true);
        });
    }

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChat(false);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && box.classList.contains('active')) {
            toggleChat(false);
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && box.classList.contains('active')) {
            toggleChat(false);
        }
    });

    function sendToWhatsApp(messageText) {
        const text = (messageText || '').trim() || 'Hi RhinoVoyage, I would like to inquire about cab rentals and tour packages.';
        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        toggleChat(false);
        if (input) input.value = '';
    }

    // Handle Quick Action Chips
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            const msg = chip.getAttribute('data-msg');
            sendToWhatsApp(msg);
        });
    });

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = input.value;
        sendToWhatsApp(msg);
    });
}