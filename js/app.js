document.addEventListener('DOMContentLoaded', () => {
    const landingScreen = document.getElementById('landing-screen');
    const paymentScreen = document.getElementById('payment-screen');
    const cakeBtn = document.getElementById('cake-btn');
    const cakeReveal = document.getElementById('cake-reveal');
    const giftBtn = document.getElementById('gift-btn');
    const backBtn = document.getElementById('back-btn');
    const qrPayBtn = document.getElementById('qr-pay-btn');
    const qrContainer = document.getElementById('qr-container');
    const upiAppBtns = document.querySelectorAll('.upi-app-btn');
    const successOverlay = document.getElementById('success-overlay');

    // ==========================================
    // AMBIENT BACKGROUND PARTICLES (CANVAS)
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100; // Start below screen
            this.size = Math.random() * 2 + 0.5;
            this.speed = Math.random() * 1 + 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Golden hues
            this.color = `rgba(212, 175, 55, ${this.opacity})`;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }
        update() {
            this.y -= this.speed;
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.5;

            if (this.y < -10) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Add subtle glow
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        }
    }

    function initAmbientParticles() {
        particles = [];
        const count = window.innerWidth < 600 ? 30 : 60;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
            // Randomize initial Y so they aren't all at bottom
            particles[i].y = Math.random() * canvas.height;
        }
    }

    function animateAmbient() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animateAmbient);
    }
    
    initAmbientParticles();
    animateAmbient();

    // ==========================================
    // UI INTERACTIONS
    // ==========================================

    // Elegant reveal surprise
    cakeBtn.addEventListener('click', () => {
        // Hide button gracefully
        cakeBtn.style.opacity = '0';
        cakeBtn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            cakeBtn.style.display = 'none';
            cakeReveal.classList.remove('hidden');
            triggerGoldenExplosion();
            
            // Show gift button after a moment
            setTimeout(() => {
                giftBtn.classList.remove('hidden');
                giftBtn.style.animation = 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            }, 1000);
        }, 400);
    });

    // Screen transitions
    giftBtn.addEventListener('click', () => {
        landingScreen.classList.remove('active');
        paymentScreen.classList.add('active');
    });

    backBtn.addEventListener('click', () => {
        paymentScreen.classList.remove('active');
        landingScreen.classList.add('active');
    });

    // QR Code toggle
    qrPayBtn.addEventListener('click', () => {
        qrContainer.classList.toggle('hidden');
        if (!qrContainer.classList.contains('hidden')) {
            qrPayBtn.textContent = "Hide QR Code";
        } else {
            qrPayBtn.textContent = "Show QR Code";
        }
    });

    // ==========================================
    // ELEGANT GOLDEN EXPLOSION (DOM PARTICLES)
    // ==========================================
    function triggerGoldenExplosion() {
        const container = document.getElementById('landing-screen');
        const numParticles = 40;
        
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('golden-particle');
            
            // Random properties for explosion
            const size = Math.random() * 15 + 5;
            const left = 50 + (Math.random() - 0.5) * 40; // Center weighted
            const duration = 1.5 + Math.random() * 1.5;
            const maxOpacity = 0.4 + Math.random() * 0.6;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.bottom = `40%`;
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.setProperty('--maxOpacity', maxOpacity);
            
            // Add a slight horizontal drift via transform
            const driftX = (Math.random() - 0.5) * 100;
            particle.style.transform = `translateX(${driftX}px)`;
            
            container.appendChild(particle);
            
            // Cleanup
            setTimeout(() => particle.remove(), duration * 1000);
        }
    }

    // ==========================================
    // ROBUST UPI PAYMENT IMPLEMENTATION
    // ==========================================
    const upiConfig = {
        upiId: "chuphals074@okhdfcbank",
        name: "Birthday Gift", 
        amount: "500", // Suggested amount for premium feel
        note: "A token of appreciation",
        currency: "INR"
    };

    const appPackages = {
        gpay: "com.google.android.apps.nbu.paisa.user",
        phonepe: "com.phonepe.app",
        paytm: "net.one97.paytm",
        bhim: "in.org.npci.upiapp"
    };

    function generateUpiLink(appId) {
        const params = new URLSearchParams({
            pa: upiConfig.upiId,
            pn: upiConfig.name,
            am: upiConfig.amount,
            tn: upiConfig.note,
            cu: upiConfig.currency
        }).toString();

        const isAndroid = /android/i.test(navigator.userAgent);
        const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);

        if (isAndroid && appId !== 'generic') {
            const pkg = appPackages[appId];
            const fallbackUrl = encodeURIComponent(`https://play.google.com/store/apps/details?id=${pkg}`);
            return `intent://pay?${params}#Intent;scheme=upi;package=${pkg};S.browser_fallback_url=${fallbackUrl};end;`;
        } else if (isIOS && appId !== 'generic') {
            if (appId === 'phonepe') return `phonepe://pay?${params}`;
            if (appId === 'paytm') return `paytmmp://pay?${params}`;
            if (appId === 'gpay') return `gpay://upi/pay?${params}`;
            return `upi://pay?${params}`;
        } else {
            return `upi://pay?${params}`;
        }
    }

    upiAppBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.getAttribute('data-app');
            const targetUrl = generateUpiLink(appId);
            window.location.href = targetUrl;

            // Simulate successful return from app
            setTimeout(() => {
                showSuccess();
            }, 3000); 
        });
    });

    function showSuccess() {
        successOverlay.classList.remove('hidden');
        setTimeout(() => {
            successOverlay.classList.add('hidden');
            paymentScreen.classList.remove('active');
            landingScreen.classList.add('active');
            
            // Reset state
            cakeBtn.style.display = 'block';
            cakeBtn.style.opacity = '1';
            cakeBtn.style.pointerEvents = 'all';
            cakeReveal.classList.add('hidden');
            giftBtn.classList.add('hidden');
            qrContainer.classList.add('hidden');
            qrPayBtn.textContent = "Show QR Code";
        }, 4000);
    }
});
