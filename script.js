document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = link.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    const scrollingSection = document.querySelector('.scrolling-text-section');
    if (!scrollingSection) return;

    const topRow = document.querySelector('.scrolling-row-top .scrolling-content');
    const bottomRow = document.querySelector('.scrolling-row-bottom .scrolling-content');

    if (!topRow || !bottomRow) return;

    function duplicateContent(element, times = 8) {
        const originalHTML = element.innerHTML;
        for (let i = 0; i < times; i++) {
            element.innerHTML += originalHTML;
        }
    }

    duplicateContent(topRow, 12);
    duplicateContent(bottomRow, 12);

    let lastScrollY = window.scrollY;
    let velocity = { top: 0, bottom: 0 };
    let position = { top: 0, bottom: 0 };
    let inertia = 0.92;

    const topContentWidth = topRow.scrollWidth / 2;
    const bottomContentWidth = bottomRow.scrollWidth / 2;

    function animate() {
        velocity.top *= inertia;
        velocity.bottom *= inertia;

        position.top += velocity.top;
        position.bottom += velocity.bottom;

        if (position.top >= topContentWidth) {
            position.top -= topContentWidth;
        } else if (position.top <= -topContentWidth) {
            position.top += topContentWidth;
        }

        if (position.bottom >= bottomContentWidth) {
            position.bottom -= bottomContentWidth;
        } else if (position.bottom <= -bottomContentWidth) {
            position.bottom += bottomContentWidth;
        }

        topRow.style.transform = `translateX(-${position.top}px)`;
        bottomRow.style.transform = `translateX(-${position.bottom}px)`;

        requestAnimationFrame(animate);
    }

    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const scrollDelta = currentScrollY - lastScrollY;
                const scrollSpeed = Math.abs(scrollDelta);
                const direction = scrollDelta > 0 ? 1 : -1;

                const speedFactor = Math.min(scrollSpeed * 0.8, 3);

                if (Math.abs(scrollDelta) > 0.1) {
                    velocity.top = direction * speedFactor;
                    velocity.bottom = -direction * speedFactor * 0.9;
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    velocity.top = 0.5;
    velocity.bottom = -0.45;

    animate();
});
