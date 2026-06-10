// Sticky Header
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Sliding Mobile Menu Drawer
const burger = document.querySelector('.burger-menu');
const mobileDrawer = document.querySelector('.mobile-nav-drawer');
const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
const drawerClose = document.querySelector('.mobile-drawer-close');
const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

function toggleDrawer() {
    if (mobileDrawer && drawerOverlay) {
        mobileDrawer.classList.toggle('open');
        drawerOverlay.classList.toggle('open');
    }
}

if (burger) burger.addEventListener('click', toggleDrawer);
if (drawerClose) drawerClose.addEventListener('click', toggleDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', toggleDrawer);
drawerLinks.forEach(link => {
    link.addEventListener('click', toggleDrawer);
});

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

// Hero Background Crossfade Slider
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // 5 seconds
}

// Horizontal Arrow References Carousel
const track = document.querySelector('.references-carousel-track');
const btnLeft = document.getElementById('carousel-btn-left');
const btnRight = document.getElementById('carousel-btn-right');

let loadedHomepageProjects = [];

// Modal functions exposed globally - only on pages with the carousel track to avoid clashing with subpages
if (track) {
    window.openProjectModal = function(index) {
        const p = loadedHomepageProjects[index];
        if (!p) return;
        
        const meta = p.customMetadata || {};
        const r2PublicUrl = "https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/";
        
        // Set text content
        document.getElementById('modal-title').textContent = (meta.title || 'Ohne Titel').replace(/\\n/g, ' ');
        document.getElementById('modal-category').textContent = meta.category || 'Projekt';
        document.getElementById('modal-desc').textContent = (meta.description || '').replace(/\\n/g, '\n');
        
        // Format body text
        const bodyContainer = document.getElementById('modal-body');
        if (meta.bodyText) {
            const cleanBody = meta.bodyText.replace(/\\n/g, '\n');
            bodyContainer.innerHTML = cleanBody.split('\n')
                .filter(para => para.trim().length > 0)
                .map(para => `<p>${para}</p>`)
                .join('');
        } else {
            const cleanDesc = (meta.description || '').replace(/\\n/g, '\n');
            bodyContainer.innerHTML = `<p>${cleanDesc || 'Keine weiteren Details verfügbar.'}</p>`;
        }
        
        // Handle images
        const mainImg = document.getElementById('modal-main-img');
        const thumbsContainer = document.getElementById('modal-thumbs');
        thumbsContainer.innerHTML = '';
        
        const mainKey = p.key.split('/').map(encodeURIComponent).join('/');
        const mainUrl = `${r2PublicUrl}${mainKey}`;
        
        mainImg.src = mainUrl;
        
        // Collect all images (main + extra)
        let allImages = [mainUrl];
        if (meta.extraImages) {
            const extraKeys = meta.extraImages.split(',');
            extraKeys.forEach(k => {
                if (k.trim().length > 0) {
                    const encodedExtra = k.trim().split('/').map(encodeURIComponent).join('/');
                    allImages.push(`${r2PublicUrl}${encodedExtra}`);
                }
            });
        }
        
        // Render thumbs if more than 1 image
        if (allImages.length > 1) {
            thumbsContainer.style.display = 'flex';
            allImages.forEach((url, imgIndex) => {
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.className = 'project-modal-thumb' + (imgIndex === 0 ? ' active' : '');
                thumb.onclick = () => {
                    mainImg.src = url;
                    document.querySelectorAll('.project-modal-thumb').forEach((t, i) => {
                        t.classList.toggle('active', i === imgIndex);
                    });
                };
                thumbsContainer.appendChild(thumb);
            });
        } else {
            thumbsContainer.style.display = 'none';
        }
        
        // Open modal
        const modal = document.getElementById('project-modal');
        if (modal) modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeProjectModal = function() {
        const modal = document.getElementById('project-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };
}

if (track && btnLeft && btnRight) {
    let x = 0;
    let cardWidth = 452; // measured dynamically
    let oneSetWidth = 0; // measured dynamically
    let isPaused = false;
    let isTransitioning = false;
    let autoScrollSpeed = 0.8; // pixels per frame (smooth slow crawl)
    
    // Dynamic Loading from Backend API
    const apiUrl = "https://weymann-backend.friese-scholz.workers.dev/api/projects";
    const r2PublicUrl = "https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/";

    function updateCarouselWidths() {
        const firstCard = track.firstElementChild;
        if (firstCard) {
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 32;
            cardWidth = firstCard.getBoundingClientRect().width + gap;
            oneSetWidth = track.scrollWidth / 2;
        }
    }

    async function fetchHomepageProjects() {
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Fehler beim Laden");
            const projects = await res.json();
            
            if (projects && projects.length > 0) {
                loadedHomepageProjects = projects;
                
                // Scholz & Friese Infinite Loop Logic:
                // We create a base set of cards. To ensure a seamless infinite scroll even on large monitors,
                // the base set must contain at least 6 elements (we repeat the projects if necessary).
                let displayProjects = [];
                while (displayProjects.length < 6) {
                    displayProjects = displayProjects.concat(projects.map((p, origIndex) => ({ ...p, origIndex })));
                }
                
                // Duplicate the base set to form the scroll buffer
                const finalProjects = displayProjects.concat(displayProjects);
                
                track.innerHTML = finalProjects.map(p => {
                    const meta = p.customMetadata || {};
                    const encodedKey = p.key.split('/').map(encodeURIComponent).join('/');
                    const category = meta.category || 'Projekt';
                    const cleanTitle = (meta.title || 'Ohne Titel').replace(/\\n/g, ' ');
                    const cleanDesc = (meta.description || '').replace(/\\n/g, ' ');
                    
                    return `
                        <div class="references-carousel-item" onclick="openProjectModal(${p.origIndex})">
                            <img src="${r2PublicUrl}${encodedKey}" alt="${cleanTitle}">
                            <div class="static-info">${category}</div>
                            <div class="references-carousel-overlay">
                                <div class="references-carousel-info">
                                    <span class="references-carousel-category">${category}</span>
                                    <h3>${cleanTitle}</h3>
                                    <p>${cleanDesc}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");
                
                // Measure sizes immediately after render
                updateCarouselWidths();
                
                // Reset translation
                x = 0;
                track.style.transform = `translate3d(0, 0, 0)`;
                
                // Start the smooth horizontal auto-scrolling ticker
                startTicker();
            }
        } catch (err) {
            console.error("Fehler beim Laden der Homepage-Projekte vom Backend:", err);
        }
    }

    function startTicker() {
        function tick() {
            if (!isPaused && !isTransitioning && oneSetWidth > 0) {
                x -= autoScrollSpeed;
                // Seamless jump back to start when we scroll past one set width
                if (Math.abs(x) >= oneSetWidth) {
                    x = 0;
                }
                track.style.transform = `translate3d(${x}px, 0, 0)`;
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function slideTo(target) {
        if (isTransitioning || oneSetWidth === 0) return;
        isTransitioning = true;
        isPaused = true;
        
        // Wrap target around boundaries to keep it in range [-oneSetWidth, 0]
        if (target < -oneSetWidth) {
            x += oneSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translate3d(${x}px, 0, 0)`;
            track.offsetHeight; // Force layout reflow
            target += oneSetWidth;
        } else if (target > 0) {
            x -= oneSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translate3d(${x}px, 0, 0)`;
            track.offsetHeight;
            target -= oneSetWidth;
        }
        
        // Apply smooth transition
        track.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        x = target;
        track.style.transform = `translate3d(${x}px, 0, 0)`;
        
        // Resume auto-scroll after transition completes
        setTimeout(() => {
            track.style.transition = 'none';
            isTransitioning = false;
            isPaused = false;
        }, 600);
    }

    // Hover state handles
    track.addEventListener('mouseenter', () => { isPaused = true; });
    track.addEventListener('mouseleave', () => { if (!isTransitioning) isPaused = false; });

    btnRight.addEventListener('click', () => {
        // Slide one card width to the right
        const currentCardIndex = Math.round(x / cardWidth);
        const target = (currentCardIndex - 1) * cardWidth;
        slideTo(target);
    });

    btnLeft.addEventListener('click', () => {
        // Slide one card width to the left
        const currentCardIndex = Math.round(x / cardWidth);
        const target = (currentCardIndex + 1) * cardWidth;
        slideTo(target);
    });

    window.addEventListener('resize', () => {
        updateCarouselWidths();
        // Recenter on resize
        x = 0;
        track.style.transition = 'none';
        track.style.transform = `translate3d(0, 0, 0)`;
    });

    fetchHomepageProjects();
}

// Careers Page: Category Filter & Detailed Job Cards Accordion
const jobCards = document.querySelectorAll('.job-detail-card');
if (jobCards.length > 0) {
    jobCards.forEach(card => {
        const header = card.querySelector('.job-card-header');
        if (header) {
            header.addEventListener('click', () => {
                jobCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                    }
                });
                card.classList.toggle('active');
            });
        }
    });

    // Category Filter Logic
    const filterTabs = document.querySelectorAll('.job-filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.dataset.category;
            
            jobCards.forEach(card => {
                // Close active cards when filtering
                card.classList.remove('active');
                
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Scroll Reveal Observer
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}
