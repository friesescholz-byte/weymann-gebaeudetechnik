// Sticky Header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const burger = document.querySelector('.burger-menu');
if(burger) {
    burger.addEventListener('click', () => {
        alert('Mobile Menu wird hier geöffnet!');
    });
}

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        // Toggle current item
        item.classList.toggle('active');
    });
});

// Robust Form Submission with Cloudflare Turnstile & Base64 Attachments
const contactForms = document.querySelectorAll('form');
contactForms.forEach(form => {
    // Phone field protection: block alphabetical characters dynamically
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (!/^[0-9+\s()/-]*$/.test(val)) {
                e.target.value = val.replace(/[^0-9+\s()/-]/g, '');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Locate elements
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Absenden';
        
        // Remove existing alerts
        const existingAlert = form.querySelector('.form-alert');
        if (existingAlert) existingAlert.remove();
        
        // Validate Turnstile Token
        const turnstileResponse = form.querySelector('[name="cf-turnstile-response"]');
        const turnstileToken = turnstileResponse ? turnstileResponse.value : '';
        
        if (!turnstileToken) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'form-alert';
            alertDiv.style.cssText = 'color: #c62828; background: #ffebee; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: 500; font-size: 0.95rem;';
            alertDiv.textContent = 'Bitte bestätigen Sie den Spam-Schutz (Turnstile).';
            form.prepend(alertDiv);
            return;
        }

        // Set loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Wird gesendet... <span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-radius:50%; border-top-color:transparent; animation: spin 0.8s linear infinite; margin-left: 5px;"></span>';
        }

        // CSS for loading spinner
        if (!document.getElementById('form-spin-style')) {
            const style = document.createElement('style');
            style.id = 'form-spin-style';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        try {
            // Read files to base64
            const fileInputs = form.querySelectorAll('input[type="file"]');
            let attachments = [];
            
            for (const fileInput of fileInputs) {
                if (fileInput.files.length > 0) {
                    const filePromises = Array.from(fileInput.files).map(file => {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const base64Content = event.target.result.split(',')[1];
                                resolve({
                                    filename: file.name,
                                    content: base64Content
                                });
                            };
                            reader.onerror = error => reject(error);
                            reader.readAsDataURL(file);
                        });
                    });
                    const fileResults = await Promise.all(filePromises);
                    attachments = attachments.concat(fileResults);
                }
            }

            // Build payload
            const formData = new FormData(form);
            const payload = {
                source: 'weymann-gebaeudetechnik',
                turnstileToken: turnstileToken,
                attachments: attachments
            };

            for (let [key, value] of formData.entries()) {
                if (key !== 'images' && key !== 'resume' && key !== 'cf-turnstile-response') {
                    payload[key] = value;
                }
            }

            // Send to central backend
            const res = await fetch('https://friesescholzwebdesign.pages.dev/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                // Premium success state UX: replace the form content with a success card
                form.innerHTML = `
                    <div class="success-card" style="text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.2rem; animation: fadeInUp 0.5s ease; background: #ffffff; border-radius: var(--radius-lg);">
                        <div style="width: 70px; height: 70px; background: #e8f5e9; color: #2e7d32; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 10px 20px rgba(46, 125, 50, 0.1);">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h3 style="color: var(--primary-color); font-size: 1.8rem; font-weight: 700; margin: 0; font-family: var(--font-display);">Vielen Dank!</h3>
                        <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; max-width: 400px; margin: 0;">
                            Ihre Anfrage wurde erfolgreich übermittelt. Wir prüfen Ihre Angaben und melden uns in Kürze persönlich bei Ihnen.
                        </p>
                    </div>
                `;
            } else {
                throw new Error(result.message || 'Ein Fehler ist aufgetreten.');
            }

        } catch (err) {
            console.error('Submission error:', err);
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }

            const alertDiv = document.createElement('div');
            alertDiv.className = 'form-alert';
            alertDiv.style.cssText = 'color: #c62828; background: #ffebee; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: 500; font-size: 0.95rem;';
            alertDiv.textContent = err.message || 'Fehler beim Senden der Anfrage. Bitte versuchen Sie es später noch einmal.';
            form.prepend(alertDiv);
            
            // Reset Turnstile widget if possible to allow retry
            if (window.turnstile) {
                try {
                    window.turnstile.reset(form.querySelector('.cf-turnstile'));
                } catch (resetErr) {}
            }
        }
    });
});

// Sticky Horizontal Scroll for CM Gallery
const scrollContainer = document.querySelector('.gallery-scroll-container');
const stickyWrapper = document.querySelector('.gallery-sticky-wrapper');
const galleryTrack = document.getElementById('gallery-track');

if (scrollContainer && stickyWrapper && galleryTrack) {
    window.addEventListener('scroll', () => {
        const containerTop = scrollContainer.offsetTop;
        const containerHeight = scrollContainer.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // The scrollable distance inside the container
        const scrollableDistance = containerHeight - windowHeight;
        
        // Current scroll position relative to the container
        let scrollY = window.scrollY - containerTop;
        
        // Clamp scrollY between 0 and scrollableDistance
        scrollY = Math.max(0, Math.min(scrollY, scrollableDistance));
        
        // Calculate progress (0 to 1)
        const progress = scrollY / scrollableDistance;
        
        // Calculate max horizontal scroll distance
        const maxScrollLeft = galleryTrack.offsetWidth - window.innerWidth;
        
        // Apply transform if there is enough content to scroll
        if(maxScrollLeft > 0) {
            galleryTrack.style.transform = `translate3d(-${progress * maxScrollLeft}px, 0, 0)`;
        }
    });
}
