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

// Hero Background Crossfade Slider (disabled – replaced by video background)
// const slides = document.querySelectorAll('.hero-slide');
// if (slides.length > 0) {
//     let currentSlide = 0;
//     setInterval(() => {
//         slides[currentSlide].classList.remove('active');
//         currentSlide = (currentSlide + 1) % slides.length;
//         slides[currentSlide].classList.add('active');
//     }, 10000);
// }

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
        const imgProxy = "https://weymann-backend.friese-scholz.workers.dev/img/";
        
        // Set text content
        document.getElementById('modal-title').textContent = (meta.title || 'Ohne Titel').replace(/\\n/g, ' ');
        document.getElementById('modal-category').textContent = meta.category || 'Projekt';
        document.getElementById('modal-desc').textContent = (meta.description || '').replace(/\\n/g, '\n');
        
        function parseInlineMarkdown(txt) {
            return txt
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/__(.*?)__/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/_(.*?)_/g, '<em>$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        }

        function formatBodyText(txt) {
            if (!txt) return '';
            const cleanTxt = txt.replace(/\\n/g, '\n').trim();
            const lines = cleanTxt.split('\n');
            let html = [];
            let inList = false;
            
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.length === 0) {
                    if (inList) {
                        html.push('</ul>');
                        inList = false;
                    }
                    continue;
                }
                
                // Check if list item
                const listMatch = line.match(/^\s*([•\-\*\+])\s*(.*)/);
                if (listMatch) {
                    if (!inList) {
                        html.push('<ul class="project-details-list">');
                        inList = true;
                    }
                    const content = parseInlineMarkdown(listMatch[2]);
                    html.push(`<li>${content}</li>`);
                    continue;
                }
                
                if (inList) {
                    html.push('</ul>');
                    inList = false;
                }
                
                // Check if standard Markdown heading
                const headerMatch = line.match(/^\s*(#{1,6})\s+(.*)/);
                if (headerMatch) {
                    const level = headerMatch[1].length;
                    const content = parseInlineMarkdown(headerMatch[2]);
                    const hLevel = (level % 2 === 1) ? 3 : 4;
                    html.push(`<h${hLevel} class="project-details-heading">${content}</h${hLevel}>`);
                    continue;
                }
                
                // Auto-detect heading
                const isShort = line.length < 80;
                const noEndingPunctuation = !/[.\?!]$/.test(line);
                
                if (isShort && noEndingPunctuation) {
                    const content = parseInlineMarkdown(line);
                    html.push(`<h3 class="project-details-heading">${content}</h3>`);
                } else {
                    const content = parseInlineMarkdown(line);
                    html.push(`<p>${content}</p>`);
                }
            }
            
            if (inList) {
                html.push('</ul>');
            }
            
            return html.join('\n');
        }

        // Format body text
        const bodyContainer = document.getElementById('modal-body');
        if (meta.bodyText) {
            bodyContainer.innerHTML = formatBodyText(meta.bodyText);
        } else {
            const cleanDesc = (meta.description || '').replace(/\\n/g, '\n');
            bodyContainer.innerHTML = formatBodyText(cleanDesc || 'Keine weiteren Details verfügbar.');
        }
        
        // Handle images
        const mainImg = document.getElementById('modal-main-img');
        const thumbsContainer = document.getElementById('modal-thumbs');
        thumbsContainer.innerHTML = '';
        
        const mainKey = p.key.split('/').map(encodeURIComponent).join('/');
        const mainUrl = `${imgProxy}${mainKey}`;
        
        mainImg.src = mainUrl;
        
        // Collect all images (main + extra)
        let allImages = [mainUrl];
        if (meta.extraImages) {
            const extraKeys = meta.extraImages.split(',');
            extraKeys.forEach(k => {
                if (k.trim().length > 0) {
                    const encodedExtra = k.trim().split('/').map(encodeURIComponent).join('/');
                    allImages.push(`${imgProxy}${encodedExtra}`);
                }
            });
        }
        
        let currentImgIndex = 0;
        const navLeft = document.getElementById('modal-nav-left');
        const navRight = document.getElementById('modal-nav-right');
        
        function updateModalImage(imgIndex) {
            currentImgIndex = imgIndex;
            mainImg.src = allImages[imgIndex];
            document.querySelectorAll('.project-modal-thumb').forEach((t, i) => {
                t.classList.toggle('active', i === imgIndex);
            });
        }
        
        if (allImages.length > 1) {
            navLeft.classList.remove('hidden');
            navRight.classList.remove('hidden');
            
            navLeft.onclick = (e) => {
                e.stopPropagation();
                let nextIdx = currentImgIndex - 1;
                if (nextIdx < 0) nextIdx = allImages.length - 1;
                updateModalImage(nextIdx);
            };
            
            navRight.onclick = (e) => {
                e.stopPropagation();
                let nextIdx = currentImgIndex + 1;
                if (nextIdx >= allImages.length) nextIdx = 0;
                updateModalImage(nextIdx);
            };
        } else {
            navLeft.classList.add('hidden');
            navRight.classList.add('hidden');
        }
        
        // Render thumbs if more than 1 image
        if (allImages.length > 1) {
            thumbsContainer.style.display = 'flex';
            allImages.forEach((url, imgIndex) => {
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.className = 'project-modal-thumb' + (imgIndex === 0 ? ' active' : '');
                thumb.onclick = () => {
                    updateModalImage(imgIndex);
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
    const imgProxy = "https://weymann-backend.friese-scholz.workers.dev/img/";

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
                            <img src="${imgProxy}${encodedKey}" alt="${cleanTitle}" loading="lazy">
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
                
                // Start the smooth horizontal auto-scrolling ticker (disabled as requested)
                // startTicker();
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
function initCareersAccordionAndFilters() {
    const jobCards = document.querySelectorAll('.job-detail-card');
    if (jobCards.length > 0) {
        jobCards.forEach(card => {
            const header = card.querySelector('.job-card-header');
            if (header) {
                // Clone header to remove old listeners if re-initialized
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
                
                newHeader.addEventListener('click', () => {
                    // Fetch latest node list since elements might change
                    const currentCards = document.querySelectorAll('.job-detail-card');
                    currentCards.forEach(otherCard => {
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
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);

            newTab.addEventListener('click', () => {
                const currentTabs = document.querySelectorAll('.job-filter-tab');
                currentTabs.forEach(t => t.classList.remove('active'));
                newTab.classList.add('active');
                const category = newTab.dataset.category;
                
                const currentCards = document.querySelectorAll('.job-detail-card');
                currentCards.forEach(card => {
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
}

function getJobIcon(category) {
    switch (category) {
        case 'shk':
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="job-icon"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
        case 'service':
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="job-icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
        case 'elektro':
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="job-icon"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>`;
        case 'azubi':
        default:
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="job-icon"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`;
    }
}

async function fetchAndRenderJobs() {
    const listContainer = document.querySelector('.jobs-list-detailed');
    if (!listContainer) return;

    try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const jobs = await res.json();
        
        const activeJobs = jobs.filter(j => j.active !== false);
        if (activeJobs.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 3rem 0; font-size: 1.1rem; width: 100%;">Aktuell sind keine Stellen ausgeschrieben. Du kannst dich jedoch gerne initiativ bewerben!</p>';
            updateApplicationDropdown([]);
            return;
        }

        let html = '';
        activeJobs.forEach((job, index) => {
            const isActive = index === 0 ? ' active' : '';
            const tagsHtml = (job.tags || []).map(t => `<span class="job-tag">${t}</span>`).join('');
            
            const aufgabenHtml = (job.aufgaben || []).map(a => `<li><svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>${a}</li>`).join('');
            const anforderungenHtml = (job.anforderungen || []).map(a => `<li><svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>${a}</li>`).join('');
            
            const middleColHeader = job.category === 'azubi' ? 'Das bringst du mit' : 'Das solltest du mitbringen';
            const rightColHeader = job.category === 'azubi' ? 'Das bieten wir dir' : 'Das erwartet dich bei uns';
            
            const vorteileHtml = (job.vorteile || []).map(v => `<li><svg class="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>${v}</li>`).join('');

            html += `
                <div class="job-detail-card${isActive}" data-category="${job.category}">
                    <div class="job-card-header">
                        <div class="job-card-title-group">
                            <div class="job-icon-box">
                                ${getJobIcon(job.category)}
                            </div>
                            <div>
                                <h4>${job.title}</h4>
                                <div class="job-tags">${tagsHtml}</div>
                            </div>
                        </div>
                        <div class="job-card-toggle">+</div>
                    </div>
                    <div class="job-card-body-wrapper">
                        <div class="job-card-body">
                            <p class="job-intro">${job.intro}</p>
                            <div class="job-details-grid">
                                <div class="job-details-column">
                                    <h5>${job.category === 'azubi' ? 'Das lernst du bei uns' : 'Deine Aufgaben'}</h5>
                                    <ul>${aufgabenHtml}</ul>
                                </div>
                                <div class="job-details-column">
                                    <h5>${middleColHeader}</h5>
                                    <ul>${anforderungenHtml}</ul>
                                </div>
                                <div class="job-details-column">
                                    <h5>${rightColHeader}</h5>
                                    <ul>${vorteileHtml}</ul>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <a href="#bewerben" class="job-apply-trigger">Direkt bewerben &rarr;</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
        updateApplicationDropdown(activeJobs);
        initCareersAccordionAndFilters();
        bindApplyTriggers();
    } catch (e) {
        console.error('Error fetching jobs:', e);
    }
}

function updateApplicationDropdown(activeJobs) {
    const select = document.querySelector('#karriere-form select[name="position"]');
    if (!select) return;

    select.innerHTML = '';
    
    const defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.disabled = true;
    defOpt.selected = true;
    defOpt.textContent = 'Als was möchtest du starten?';
    select.appendChild(defOpt);

    activeJobs.forEach(job => {
        const opt = document.createElement('option');
        opt.textContent = job.title;
        select.appendChild(opt);
    });

    const initOpt = document.createElement('option');
    initOpt.textContent = 'Initiativbewerbung';
    select.appendChild(initOpt);
}

function bindApplyTriggers() {
    const applyTriggers = document.querySelectorAll('.job-apply-trigger');
    const positionSelect = document.querySelector('#karriere-form select[name="position"]');
    if (applyTriggers.length > 0 && positionSelect) {
        applyTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const card = trigger.closest('.job-detail-card');
                if (card) {
                    const title = card.querySelector('.job-card-title-group h4').textContent;
                    for (let option of positionSelect.options) {
                        if (option.text === title) {
                            positionSelect.value = option.value;
                            break;
                        }
                    }
                }
            });
        });
    }
}

// Initial binding for accordion/filters and start dynamic job fetch
initCareersAccordionAndFilters();
fetchAndRenderJobs();
bindApplyTriggers();

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
