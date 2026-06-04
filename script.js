// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    // ============================================
// ============================================
// BACKGROUND MUSIC - MINIMALIST CIRCLE BUTTON
// PANEL APPEARS EVERY TIME PAGE LOADS
// ============================================
function initBackgroundMusic() {
    const audio = new Audio();
    audio.loop = true;
    
    const musicCircle = document.getElementById('musicToggle');
    const initPanel = document.getElementById('musicInitPanel');
    const initVolumeSlider = document.getElementById('initVolumeSlider');
    const startBtn = document.getElementById('startMusicBtn');
    const noMusicBtn = document.getElementById('noMusicBtn');
    
    let isPlaying = false;
    let volume = 0.15; // 15% default
    let musicLoaded = false;
    let musicSource = null;
    
    // Load saved volume from previous session (if any)
    const savedVolume = localStorage.getItem('bgMusicVolume');
    if (savedVolume && initVolumeSlider) {
        initVolumeSlider.value = savedVolume;
        volume = savedVolume / 100;
    }
    
    // ALWAYS show panel on every load
    if (initPanel) {
        initPanel.classList.remove('hidden');
    }
    
    // Function to load and play music
    function loadAndPlayMusic() {
        if (musicLoaded) {
            audio.play().catch(e => console.log('Play error:', e));
            return;
        }
        
        // Try multiple music sources
        const musicUrls = [
            'TuloyParin.mp3'
        ];
        
        let currentUrlIndex = 0;
        
        function tryLoadUrl() {
            if (currentUrlIndex >= musicUrls.length) {
                console.log('All music sources failed, using web audio fallback');
                useWebAudioFallback();
                return;
            }
            
            audio.src = musicUrls[currentUrlIndex];
            audio.load();
            
            audio.addEventListener('canplaythrough', function onCanPlay() {
                audio.removeEventListener('canplaythrough', onCanPlay);
                musicLoaded = true;
                audio.volume = volume;
                audio.play().then(() => {
                    console.log('Music playing from source', currentUrlIndex + 1);
                }).catch(e => {
                    console.log('Play failed, trying next source');
                    currentUrlIndex++;
                    tryLoadUrl();
                });
            });
            
            audio.addEventListener('error', function() {
                console.log('Failed to load source', currentUrlIndex + 1);
                currentUrlIndex++;
                tryLoadUrl();
            });
        }
        
        tryLoadUrl();
    }
    
    // Fallback: Web Audio (soft ambient tones)
    function useWebAudioFallback() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            const gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);
            gainNode.gain.value = volume * 0.3;
            
            const frequencies = [130.81, 164.81, 196.00, 261.63];
            const oscillators = [];
            
            frequencies.forEach(freq => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                osc.connect(gainNode);
                osc.start();
                oscillators.push(osc);
            });
            
            // Store so we can stop later
            window.fallbackAudio = { audioCtx, oscillators, gainNode };
            
            // Resume context on user interaction
            if (audioCtx.state === 'suspended') {
                document.addEventListener('click', function resumeCtx() {
                    audioCtx.resume();
                    document.removeEventListener('click', resumeCtx);
                }, { once: true });
            }
            
            musicLoaded = true;
            console.log('Using web audio fallback');
        } catch (e) {
            console.log('Web audio not supported');
        }
    }
    
    // Stop fallback audio
    function stopFallbackAudio() {
        if (window.fallbackAudio) {
            window.fallbackAudio.oscillators.forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
            try { window.fallbackAudio.audioCtx.close(); } catch(e) {}
            window.fallbackAudio = null;
        }
    }
    
    // Update circle button appearance
    function updateButtonAppearance(playing) {
        const icon = musicCircle.querySelector('i');
        if (playing) {
            icon.className = 'fas fa-stop';
            musicCircle.classList.add('playing');
            isPlaying = true;
        } else {
            icon.className = 'fas fa-play';
            musicCircle.classList.remove('playing');
            isPlaying = false;
        }
    }
    
    // Stop music
    function stopMusic() {
        audio.pause();
        audio.currentTime = 0;
        stopFallbackAudio();
        updateButtonAppearance(false);
    }
    
    // Start music
    function startMusic() {
        if (audio.src && !musicLoaded) {
            loadAndPlayMusic();
        } else if (musicLoaded) {
            if (window.fallbackAudio) {
                // Resume web audio if needed
                if (window.fallbackAudio.audioCtx.state === 'suspended') {
                    window.fallbackAudio.audioCtx.resume();
                }
            } else {
                audio.play().catch(e => console.log('Play error:', e));
            }
        } else {
            loadAndPlayMusic();
        }
        updateButtonAppearance(true);
    }
    
    // Toggle play/stop
    function toggleMusic() {
        if (isPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    }
    
    // Circle button click
    if (musicCircle) {
        musicCircle.addEventListener('click', toggleMusic);
    }
    
    // Start button in panel
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (initVolumeSlider) {
                volume = initVolumeSlider.value / 100;
                localStorage.setItem('bgMusicVolume', initVolumeSlider.value);
            }
            // Hide panel
            if (initPanel) {
                initPanel.classList.add('hidden');
            }
            startMusic();
        });
    }
    
    // No thanks button
    if (noMusicBtn) {
        noMusicBtn.addEventListener('click', function() {
            // Just hide panel, don't play anything
            if (initPanel) {
                initPanel.classList.add('hidden');
            }
            // Make sure circle shows play icon (not playing)
            updateButtonAppearance(false);
        });
    }
    
    console.log('Minimalist music player initialized - panel shows every load');
}
    
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
                imageSrc: 'Image2 (4).jpeg'
            },
            '2': {
                imageSrc: 'Image1 (4).jpeg'
            },
            '3': {
                imageSrc: 'performance.jpeg'
            },
            '4': {
                imageSrc: 'planning.jpeg'
            },
            '5':{
                imageSrc: 'Mid1.jpeg'
            },
            '6':{
                imageSrc: 'Mid2.jpeg'
            },
            '7':{
                imageSrc: 'Mid3.jpeg'
            }, 
            '8':{
                imageSrc: 'Mid4.jpeg'
            },
            '9':{
                imageSrc: 'prefi1.jpeg'
            }, 
            '10': {
                imageSrc: 'prefi2.jpeg'
            },
            '11': {
                imageSrc: 'prefi3.png'
            },
            '12':{
                imageSrc: 'prefi4.JPG'
            },
            '13':{
                imageSrc: 'prefi5.JPG'
            },
            '14':{
                imageSrc: 'prefi6.JPG'
            },
            '15':{
                imageSrc: 'GFinal1.jpg'
            },
            '16':{
                imageSrc: 'Gfinal3.jpg'
            },
            '17':{
                imageSrc: 'GFinal4.jpeg'
            },
            '18':{
                imageSrc: 'final2.jpg'
            }

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
        // Function to open modal
window.openImageModal = function(imageId) {
    console.log('Opening modal for image ID:', imageId);
    
    const details = imageDetails[imageId];
    if (!details) {
        console.error('No details found for image ID:', imageId);
        return;
    }
    
    const mediaSrc = details.imageSrc;
    const fallbackSrc = details.fallbackUrl;
    
    // Check if the file is a video (based on extension)
    const isVideo = mediaSrc && (mediaSrc.endsWith('.mp4') || 
                                  mediaSrc.endsWith('.webm') || 
                                  mediaSrc.endsWith('.ogg') ||
                                  mediaSrc.endsWith('.mov'));
    
    let mediaHTML = '';
    
    if (isVideo) {
        // Create video element with controls
        mediaHTML = `
            <video class="modal-expanded-video" controls autoplay loop muted>
                <source src="${mediaSrc}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } else {
        // Create img element for images
        mediaHTML = `
            <img src="${mediaSrc}" 
                 alt="${details.title || 'Media'}" 
                 class="modal-expanded-image"
                 onerror="this.onerror=null; this.src='${fallbackSrc}';">
        `;
    }
    
    const modalHTML = `
        <div class="image-modal">
            <button class="modal-close-btn" id="modalCloseBtn">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-content-simple">
                <div class="modal-image-container">
                    ${mediaHTML}
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
    initBackgroundMusic(); 
    
    console.log('All systems initialized');
});