document.addEventListener('DOMContentLoaded', () => {
    // GSAP Registration (VERY IMPORTANT to do this *once* at the top)
    gsap.registerPlugin(MotionPathPlugin); // Register MotionPathPlugin (for blob)

    // 1. Get button elements (wait to make sure they're loaded)
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (!loginBtn || !registerBtn) {
        console.error("Login or Register button not found. Check your HTML.");
        return; // Abort if buttons aren't found
    }

    console.log("Buttons found in DOM:", loginBtn, registerBtn); // Check if buttons are found initially

    // 2. Button Animations

    // Entry Animation (CORRECTED - using gsap.to() and animating TO opacity: 1)
    gsap.to([loginBtn, registerBtn], { // Use gsap.to() instead of gsap.from()
        y: 0,     // Animate Y to 0 (from wherever they are initially)
        opacity: 1, // Animate TO opacity: 1 to make them visible
        duration: 1,
        delay: 1,
        stagger: 0.2,
        ease: "power3.out",
        onStart: () => {
            console.log("Entry animation started for buttons.");
            console.log("Initial button styles (start of animation):", {
                loginBtn: getComputedStyle(loginBtn).cssText,
                registerBtn: getComputedStyle(registerBtn).cssText
            });
        },
        onComplete: () => {
            console.log("Entry animation complete for buttons.");
            console.log("Button styles AFTER animation:", {
                loginBtn: getComputedStyle(loginBtn).cssText,
                registerBtn: getComputedStyle(registerBtn).cssText
            });
            console.log("Button opacity after animation:", {
                loginBtn: getComputedStyle(loginBtn).opacity,
                registerBtn: getComputedStyle(registerBtn).opacity
            });
            console.log("Button display after animation:", {
                loginBtn: getComputedStyle(loginBtn).display,
                registerBtn: getComputedStyle(registerBtn).display
            });
            console.log("Button visibility after animation:", {
                loginBtn: getComputedStyle(loginBtn).visibility,
                registerBtn: getComputedStyle(registerBtn).visibility
            });
        }
    });
    // Hover Effect
    const applyHoverEffect = (button) => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.07,      // Slightly larger scale
                y: -3,          // Move up by a few pixels
                duration: 0.4,
                ease: "power3.out",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)" // Add a subtle shadow
            });
        });
    
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                y: 0,          // Return to original Y position
                duration: 0.4,
                ease: "power3.out",
                boxShadow: "0 0px 0px rgba(0,0,0,0)" // Remove shadow (or set to your default shadow)
            });
        });
    };

    applyHoverEffect(loginBtn);
    applyHoverEffect(registerBtn);

    // Click Effect
    const applyClickEffect = (button) => {
        button.addEventListener('mousedown', () => {
            gsap.to(button, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
            });
        });

        button.addEventListener('mouseup', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: "elastic.out(1, 0.5)"
            });
        });
    };

    applyClickEffect(loginBtn);
    applyClickEffect(registerBtn);
});
    document.addEventListener('DOMContentLoaded', () => {
gsap.registerPlugin(ScrollTrigger);

const popularForums = [
    {
        icon: "📚",
        title: "Programmation",
        description: "Discussions sur les langages de programmation.",
        members: 1200,
        topics: 450
    },
    {
        icon: "🎨",
        title: "Design",
        description: "Partagez vos créations et obtenez des retours.",
        members: 800,
        topics: 300
    }
];

const recentDiscussions = [
    {
        author: {
            name: "Jean Dupont",
            avatar: "https://via.placeholder.com/48"
        },
        timeAgo: "2 heures",
        title: "Meilleur framework JavaScript en 2024 ?",
        preview: "Quel framework recommandez-vous pour un projet moderne ?",
        likes: 45,
        replies: 12,
        tags: ["JavaScript", "Frontend"]
    },
    {
        author: {
            name: "Marie Curie",
            avatar: "https://via.placeholder.com/48"
        },
        timeAgo: "5 heures",
        title: "Conseils pour améliorer les performances CSS",
        preview: "Quelles sont vos astuces pour optimiser le CSS ?",
        likes: 32,
        replies: 8,
        tags: ["CSS", "Performance"]
    }
];

// Fonction pour rendre les forums populaires
function renderPopularForums() {
    const forumsContainer = document.getElementById('popularForums');
    if (!forumsContainer) return;

    forumsContainer.innerHTML = popularForums.map(forum => `
        <div class="forum-card">
            <span class="forum-icon">${forum.icon}</span>
            <h3>${forum.title}</h3>
            <p>${forum.description}</p>
            <div class="forum-stats">
                <div class="stat-item">
                    <i class="fas fa-users"></i>
                    <span>${forum.members.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-comments"></i>
                    <span>${forum.topics.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Fonction pour rendre les discussions récentes
function renderRecentDiscussions() {
    const discussionsContainer = document.getElementById('recentDiscussions');
    if (!discussionsContainer) return;

    discussionsContainer.innerHTML = recentDiscussions.map(discussion => `
        <div class="discussion-item">
            <div class="discussion-header">
                <div class="discussion-author">
                    <img src="${discussion.author.avatar}" alt="${discussion.author.name}" class="author-avatar">
                    <div class="discussion-meta">
                        <div class="author-name">${discussion.author.name}</div>
                        <div class="post-time">Il y a ${discussion.timeAgo}</div>
                    </div>
                </div>
            </div>
            <div class="discussion-content">
                <h3>${discussion.title}</h3>
                <p class="discussion-preview">${discussion.preview}</p>
            </div>
            <div class="discussion-footer">
                <div class="discussion-stats">
                    <div class="stat-item">
                        <i class="fas fa-heart"></i>
                        <span>${discussion.likes}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-comment"></i>
                        <span>${discussion.replies}</span>
                    </div>
                </div>
                <div class="discussion-tags">
                    ${discussion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Initialisation des données
function initializeData() {
    renderPopularForums();
    renderRecentDiscussions();
}

// Appel initial
initializeData();

// Animations GSAP pour les forums
gsap.utils.toArray('.forum-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power3.out"
    });
});


// Animations GSAP pour les discussions
gsap.utils.toArray('.discussion-item').forEach((item, index) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power3.out"
    });
});

// Logo subtle animation
gsap.from('.logo-animation', {
    scale: 0.7, 
    opacity: 0, 
    duration: 1, 
    ease: 'back.out'
});

// Hero section animations
gsap.from('.hero-content', {
    y: 50, 
    opacity: 0, 
    duration: 1, 
    ease: 'power3.out'
});

// Forum and discussions section animations - Improved
gsap.utils.toArray('.popular-forums, .recent-discussions').forEach(section => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50, 
        opacity: 0, 
        duration: 1
    });
});

// Specific children animations for forums and discussions
gsap.utils.toArray('.forums-grid > *, .discussions-list > *').forEach((item, index) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        y: 50, 
        opacity: 0, 
        duration: 0.7,
        delay: index * 0.2
    });
});

gsap.to(".blob", {
    motionPath: {
        path: [
            {x: "25vw", y: "15vh"},
            {x: "-20vw", y: "30vh"},
            {x: "10vw", y: "-10vh"}
        ],
        curviness: 1.5
    },
    duration: 20,
    repeat: -1,
    ease: "power1.inOut"
});

// Statistics section animation - Improved
gsap.utils.toArray('.stat-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: '.statistics',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.5, 
        opacity: 0, 
        duration: 0.8, 
        delay: index * 0.2
    });
});

});

document.addEventListener('DOMContentLoaded', () => {
const carousel = document.getElementById('reasonsCarousel');
const cards = carousel.querySelectorAll('.reason-card');

function rotateCarousel() {
    // Récupérer l'ordre actuel des cartes
    const currentPositions = Array.from(cards).map(card => card.getAttribute('data-position'));
    
    // Mapper les nouvelles positions
    const newPositions = {
        'left': 'hidden',
        'center': 'left',
        'right': 'center',
        'hidden': 'right'
    };
    
    // Appliquer les nouvelles positions
    cards.forEach(card => {
        const currentPosition = card.getAttribute('data-position');
        card.setAttribute('data-position', newPositions[currentPosition]);
    });
}

// Rotation automatique toutes les 5 secondes
setInterval(rotateCarousel, 5000);

// Animation de scroll trigger pour la section
gsap.from('.why-latton-forum', {
    scrollTrigger: {
        trigger: '.why-latton-forum',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    y: 50, 
    opacity: 0, 
    duration: 1
});



// Ajoutez cette animation
gsap.to(".statistics::before", {
    scrollTrigger: {
        trigger: ".statistics",
        start: "top center",
        end: "bottom center",
        scrub: 0.5
    },
    height: "100px",
    background: "linear-gradient(to bottom, rgba(26, 26, 26, 1) 0%, rgba(26, 26, 26, 0.2) 100%)"
});

// Animation des forums avec une seule timeline
ScrollTrigger.batch(".forum-card", {
    interval: 0.1,
    batchMax: 3,
    onEnter: batch => gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    onLeave: batch => gsap.to(batch, {
        autoAlpha: 0,
        y: -50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    onEnterBack: batch => gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    onLeaveBack: batch => gsap.to(batch, {
        autoAlpha: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    start: "top 85%",
    end: "bottom 15%",
    markers: false
});

// Animation des discussions avec une seule timeline
ScrollTrigger.batch(".discussion-item", {
    interval: 0.1,
    batchMax: 3,
    onEnter: batch => gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    onLeave: batch => gsap.to(batch, {
        autoAlpha: 0,
        y: -50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    onEnterBack: batch => gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    onLeaveBack: batch => gsap.to(batch, {
        autoAlpha: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
    }),
    start: "top 85%",
    end: "bottom 15%",
    markers: false
});


gsap.from(".statistics::after", {
    scrollTrigger: {
        trigger: ".statistics",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 20,
    duration: 1.2
});

    // Lancement automatique
    HomeController.init();

    // Expose l'instance pour le débogage
    window.HomeController = HomeController;
});

