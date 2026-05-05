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

// Simple Form Submission Prevent (for demo purposes)
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Vielen Dank für Ihre Anfrage! Wir melden uns in Kürze bei Ihnen.');
        form.reset();
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
