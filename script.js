// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ============================================
    // TERM TAB SWITCHING
    // ============================================
    function initTermTabs() {
        const termTabs = document.querySelectorAll('.term-tab');
        
        termTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                if (this.classList.contains('locked')) {
                    return;
                }
                
                document.querySelectorAll('.term-tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                this.classList.add('active');
                
                document.querySelectorAll('.term-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const termId = this.getAttribute('data-term');
                const targetContent = document.getElementById(`${termId}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // ============================================
    // IMAGE GALLERY MODAL - WITH WORKING X BUTTON
    // ============================================
    function initImageGallery() {
        // Image details database
        const imageDetails = {
            '1': {
                imageSrc: 'Image2 (4).jpeg',
                fallbackUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'
            },
            '2': {
                title: 'Long Island\'s Gold Coast - East Egg & West Egg, c.1925',
                imageSrc: 'Image1 (4).jpeg',
                fallbackUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
            },
            '3': {
                title: 'Annotated Passages - The Green Light Symbolism',
                imageSrc: 'performance.jpeg',
                fallbackUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800'
            },
            '4': {
                title: 'Character Relationship Map - Social Connections',
                imageSrc: 'planning.jpeg',
                fallbackUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'
            },
        };

        // Get ALL image cards
        const imageCards = document.querySelectorAll('.image-card');
        
        if (imageCards.length === 0) {
            console.error('No image cards found!');
            return;
        }

        // Create modal overlay if it doesn't exist
        let modalOverlay = document.querySelector('.image-modal-overlay');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.className = 'image-modal-overlay';
            document.body.appendChild(modalOverlay);
        }

        // Function to open modal
        window.openImageModal = function(imageId) {
            console.log('Opening modal for image ID:', imageId);
            
            const details = imageDetails[imageId];
            if (!details) {
                console.error('No details found for image ID:', imageId);
                return;
            }
            
            const imageSrc = details.imageSrc;
            const fallbackSrc = details.fallbackUrl;
            
            const modalHTML = `
                <div class="image-modal">
                    <button class="modal-close-btn" id="modalCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-content-simple">
                        <div class="modal-image-container">
                            <img src="${imageSrc}" 
                                 alt="${details.title}" 
                                 class="modal-expanded-image"
                                 onerror="this.onerror=null; this.src='${fallbackSrc}';">
                        </div>
                    </div>
                </div>
            `;
            
            modalOverlay.innerHTML = modalHTML;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Add event listener to the close button AFTER it's in the DOM
            const closeBtn = document.getElementById('modalCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeImageModal);
            }
        };

        // Function to close modal
        window.closeImageModal = function() {
            const modalOverlay = document.querySelector('.image-modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
                // Clear the content after animation
                setTimeout(() => {
                    modalOverlay.innerHTML = '';
                }, 300);
            }
        };

        // Add click event to each image card
        imageCards.forEach(function(card) {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const imageId = this.getAttribute('data-id');
                if (imageId) {
                    window.openImageModal(imageId);
                }
            });
            
            card.style.cursor = 'pointer';
            card.setAttribute('title', 'Click to expand image');
        });

        // Close modal when clicking outside the image
        modalOverlay.addEventListener('click', function(e) {
            if (e.target.classList.contains('image-modal-overlay')) {
                window.closeImageModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.image-modal-overlay.active');
                if (activeModal) {
                    window.closeImageModal();
                }
            }
        });
    }

    // ============================================
    // DATE DISPLAY
    // ============================================
    function initDateDisplay() {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = today.toLocaleDateString('en-US', options);
        
        const dateElements = document.querySelectorAll('.current-date');
        dateElements.forEach(el => {
            el.textContent = dateString;
        });
    }

    // ============================================
    // REMOVE DATA-CATEGORY ATTRIBUTES
    // ============================================
    function cleanupImageCards() {
        const cards = document.querySelectorAll('.image-card');
        cards.forEach(card => {
            if (!card.hasAttribute('data-id')) {
                console.warn('Card missing data-id:', card);
            }
            if (card.hasAttribute('data-category')) {
                card.removeAttribute('data-category');
            }
        });
    }

    // ============================================
    // INITIALIZE EVERYTHING
    // ============================================
    cleanupImageCards();
    initTermTabs();
    initImageGallery();
    initDateDisplay();
    
    console.log('All systems initialized');
});
