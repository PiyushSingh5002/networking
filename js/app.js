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
    const floatingElements = document.querySelector('.floating-elements');

    // Handle double click for cake reveal
    cakeBtn.addEventListener('dblclick', () => {
        // Hide button, hide fireworks, show cake and next button
        cakeBtn.style.display = 'none';
        document.getElementById('fireworks-container').style.opacity = '0';
        cakeReveal.classList.remove('hidden');
        
        // Small delay for smooth flow
        setTimeout(() => {
            giftBtn.classList.remove('hidden');
            giftBtn.style.animation = 'bounceIn 0.8s forwards';
        }, 500);

        // Spawn cats and balloons!
        spawnCatsAndBalloons();
    });

    // Handle single click feedback for "Give a cake"
    cakeBtn.addEventListener('click', (e) => {
        // If not double clicked, just a small jiggle
        if(e.detail === 1) {
            cakeBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                cakeBtn.style.transform = 'scale(1)';
            }, 150);
        }
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

    // Payment interactions
    qrPayBtn.addEventListener('click', () => {
        qrContainer.classList.toggle('hidden');
    });

    // ==========================================
    // ROBUST UPI PAYMENT IMPLEMENTATION
    // ==========================================

    // 1. Payment Configuration Data
    // Modify these values if your details change.
    const upiConfig = {
        upiId: "chuphals074@okhdfcbank", // Your exact UPI ID
        name: "Nitesh Lodu",             // Your Name
        amount: "250",                   // Pre-filled amount (250)
        note: "Birthday Gift",           // Transaction note
        currency: "INR"                  // Currency must be INR
    };

    // 2. Android Package Names for Fallbacks
    // If the app is not installed, the Intent will redirect to the Play Store using these IDs.
    const appPackages = {
        gpay: "com.google.android.apps.nbu.paisa.user",
        phonepe: "com.phonepe.app",
        paytm: "net.one97.paytm",
        bhim: "in.org.npci.upiapp"
    };

    // 3. Helper Function to generate the deep link
    function generateUpiLink(appId) {
        // URLSearchParams safely encodes the URL parameters (like spaces in the note/name)
        const params = new URLSearchParams({
            pa: upiConfig.upiId,
            pn: upiConfig.name,
            am: upiConfig.amount,
            tn: upiConfig.note,
            cu: upiConfig.currency
        }).toString();

        // Device detection using userAgent string
        const isAndroid = /android/i.test(navigator.userAgent);
        const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);

        if (isAndroid && appId !== 'generic') {
            // ANDROID: Use Intent URI. 
            // Benefits: Opens the specific app directly. If not installed, falls back to Google Play Store.
            const pkg = appPackages[appId];
            const fallbackUrl = encodeURIComponent(`https://play.google.com/store/apps/details?id=${pkg}`);
            return `intent://pay?${params}#Intent;scheme=upi;package=${pkg};S.browser_fallback_url=${fallbackUrl};end;`;
        
        } else if (isIOS && appId !== 'generic') {
            // iOS: Does not support the complex Intent fallback system.
            // We must use specific URL schemes to open the apps directly.
            if (appId === 'phonepe') return `phonepe://pay?${params}`;
            if (appId === 'paytm') return `paytmmp://pay?${params}`;
            if (appId === 'gpay') return `gpay://upi/pay?${params}`;
            
            // If unknown iOS app, fallback to generic UPI scheme
            return `upi://pay?${params}`;
        } else {
            // DESKTOP or 'Other' button: Use standard generic UPI link.
            // On desktop, this will usually fail or ask for an associated program.
            // That's why having the QR code scanner option is vital!
            return `upi://pay?${params}`;
        }
    }

    // 4. Attach click listeners to all buttons
    upiAppBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appId = btn.getAttribute('data-app');
            const targetUrl = generateUpiLink(appId);

            // Execute the redirect by changing the window location
            window.location.href = targetUrl;

            // Optional: Show the relaxing success tick animation after 3 seconds,
            // simulating that they completed the payment in the app and returned.
            setTimeout(() => {
                showSuccess();
            }, 3000); 
        });
    });

    function spawnCatsAndBalloons() {
        const emojis = ['🎈', '🎉', '🎊', '✨', '🎂', '💖', '😻', '😹', '😸'];
        const catGifUrls = [
            'https://media.tenor.com/Z4w2Q8gB5sMAAAAi/cat-dance.gif',
            'https://media.tenor.com/YwN-QeYwIigAAAAi/cat-dancing.gif'
        ];

        for (let i = 0; i < 25; i++) {
            // Every 4th element is an actual dancing cat GIF
            const isCatGif = i % 4 === 0;
            const el = document.createElement(isCatGif ? 'img' : 'div');
            el.classList.add(isCatGif ? 'cat-gif' : 'balloon');
            
            if (isCatGif) {
                el.src = catGifUrls[Math.floor(Math.random() * catGifUrls.length)];
            } else {
                el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            }
            
            // Random positioning and duration
            el.style.left = `${Math.random() * 100}%`;
            el.style.animationDuration = `${3 + Math.random() * 2}s`;
            el.style.animationDelay = `${Math.random() * 0.5}s`;
            
            if (!isCatGif) {
                el.style.fontSize = `${2 + Math.random() * 2}rem`;
            }
            
            floatingElements.appendChild(el);

            // Cleanup
            setTimeout(() => {
                el.remove();
            }, 6000);
        }
    }

    function showSuccess() {
        successOverlay.classList.remove('hidden');
        setTimeout(() => {
            // Optional: reset app state after showing success
            successOverlay.classList.add('hidden');
            paymentScreen.classList.remove('active');
            landingScreen.classList.add('active');
            
            // Reset cake button
            cakeBtn.style.display = 'inline-block';
            cakeReveal.classList.add('hidden');
            giftBtn.classList.add('hidden');
            qrContainer.classList.add('hidden');
        }, 4000); // Show success for 4 seconds
    }
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.glass-btn, .pay-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            
            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.style.position = 'absolute';
            ripples.style.background = 'rgba(255,255,255,0.3)';
            ripples.style.transform = 'translate(-50%, -50%)';
            ripples.style.pointerEvents = 'none';
            ripples.style.borderRadius = '50%';
            ripples.style.animation = 'animateRipple 1s linear forwards';
            
            // Adding keyframes dynamically for ripple
            if(!document.getElementById('ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.innerHTML = `
                    @keyframes animateRipple {
                        0% { width: 0px; height: 0px; opacity: 0.5; }
                        100% { width: 500px; height: 500px; opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            this.appendChild(ripples);
            
            setTimeout(() => {
                ripples.remove();
            }, 1000);
        });
    });
});
