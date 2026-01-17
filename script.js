(function() {
    const preloader = document.getElementById('preloader');
    const preloaderWord = document.getElementById('preloader-word');
    
    if (!preloader || !preloaderWord) {
        if (document.body) {
            document.body.classList.remove('preloader-active');
        }
        return;
    }

    const hasSeenPreloader = sessionStorage.getItem('preloader-complete');
    
    if (hasSeenPreloader) {
        preloader.remove();
        if (document.body) {
            document.body.classList.remove('preloader-active');
        }
        return;
    }

    if (document.body) {
        document.body.classList.add('preloader-active');
    }

    const words = ['Hello', 'Hola', 'Ciao', 'こんにちは'];
    let currentWordIndex = 0;
    let wordInterval = null;
    let exitTimeout = null;

    function cleanupPreloader() {
        if (wordInterval) {
            clearTimeout(wordInterval);
            wordInterval = null;
        }
        if (exitTimeout) {
            clearTimeout(exitTimeout);
            exitTimeout = null;
        }
    }

    function showWord(index) {
        if (index >= words.length) {
            exitTimeout = setTimeout(() => {
                if (!preloader.parentNode) return;
                preloader.classList.add('exiting');
                exitTimeout = setTimeout(() => {
                    cleanupPreloader();
                    sessionStorage.setItem('preloader-complete', 'true');
                    if (preloader.parentNode) {
                        preloader.remove();
                    }
                    if (document.body) {
                        document.body.classList.remove('preloader-active');
                    }
                }, 1000);
            }, 350);
            return;
        }

        if (!preloaderWord || !preloaderWord.parentNode) {
            cleanupPreloader();
            return;
        }

        preloaderWord.textContent = words[index];
        preloaderWord.classList.remove('visible');
        
        setTimeout(() => {
            if (!preloaderWord || !preloaderWord.parentNode) {
                cleanupPreloader();
                return;
            }
            preloaderWord.classList.add('visible');
            currentWordIndex++;
            
            wordInterval = setTimeout(() => {
                if (currentWordIndex < words.length) {
                    if (preloaderWord && preloaderWord.parentNode) {
                        preloaderWord.classList.remove('visible');
                        setTimeout(() => showWord(currentWordIndex), 200);
                    }
                } else {
                    showWord(currentWordIndex);
                }
            }, 450);
        }, 50);
    }

    showWord(0);
})();

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

    setTimeout(() => {
        calculateContentWidths();
    }, 100);

    let lastScrollY = window.scrollY;
    let velocity = { top: 0, bottom: 0 };
    let position = { top: 0, bottom: 0 };
    let inertia = 0.92;
    let scrollAnimationId = null;
    let topContentWidth = 0;
    let bottomContentWidth = 0;

    function calculateContentWidths() {
        if (!topRow || !bottomRow) return;
        topContentWidth = topRow.scrollWidth / 2;
        bottomContentWidth = bottomRow.scrollWidth / 2;
    }

    calculateContentWidths();
    
    let resizeTimeout = null;
    window.addEventListener('resize', function() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateContentWidths();
        }, 150);
    }, { passive: true });

    function animateScroll() {
        if (!topRow || !bottomRow || !topRow.parentNode || !bottomRow.parentNode) {
            if (scrollAnimationId) {
                cancelAnimationFrame(scrollAnimationId);
                scrollAnimationId = null;
            }
            return;
        }

        velocity.top *= inertia;
        velocity.bottom *= inertia;

        position.top += velocity.top;
        position.bottom += velocity.bottom;

        if (topContentWidth > 0) {
            if (position.top >= topContentWidth) {
                position.top -= topContentWidth;
            } else if (position.top <= -topContentWidth) {
                position.top += topContentWidth;
            }
        }

        if (bottomContentWidth > 0) {
            if (position.bottom >= bottomContentWidth) {
                position.bottom -= bottomContentWidth;
            } else if (position.bottom <= -bottomContentWidth) {
                position.bottom += bottomContentWidth;
            }
        }

        topRow.style.transform = `translateX(-${position.top}px)`;
        bottomRow.style.transform = `translateX(-${position.bottom}px)`;

        scrollAnimationId = requestAnimationFrame(animateScroll);
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

    animateScroll();

    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let baseSize = 700;
    let globeAnimationId = null;
    
    function resizeGlobeCanvas() {
        if (!canvas || !canvas.parentNode) return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        const displaySize = Math.min(rect.width, rect.height, 700);
        baseSize = displaySize;
        canvas.width = displaySize * dpr;
        canvas.height = displaySize * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = displaySize + 'px';
        canvas.style.height = displaySize + 'px';
    }
    
    resizeGlobeCanvas();
    
    let globeResizeTimeout = null;
    window.addEventListener('resize', function() {
        if (globeResizeTimeout) clearTimeout(globeResizeTimeout);
        globeResizeTimeout = setTimeout(() => {
            resizeGlobeCanvas();
        }, 150);
    }, { passive: true });

    const getCenterX = () => baseSize / 2;
    const getCenterY = () => baseSize / 2;
    const radius = 250;
    const segments = 24;
    const rings = 12;

    function generateSphere() {
        const points = [];
        for (let i = 0; i <= rings; i++) {
            const lat = (Math.PI / rings) * i - Math.PI / 2;
            const ring = [];
            for (let j = 0; j <= segments; j++) {
                const lon = (2 * Math.PI / segments) * j;
                const x = Math.cos(lat) * Math.cos(lon);
                const y = Math.sin(lat);
                const z = Math.cos(lat) * Math.sin(lon);
                ring.push({ x, y, z, lat, lon });
            }
            points.push(ring);
        }
        return points;
    }

    const sphere = generateSphere();

    function randomPoints(count = 40) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const lat = (Math.random() - 0.5) * Math.PI;
            const lon = Math.random() * Math.PI * 2;
            const x = Math.cos(lat) * Math.cos(lon);
            const y = Math.sin(lat);
            const z = Math.cos(lat) * Math.sin(lon);
            points.push({ x, y, z, intensity: 0.3 + Math.random() * 0.4 });
        }
        return points;
    }

    const glowPoints = randomPoints(35);

    function rotateY(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x * cos - point.z * sin,
            y: point.y,
            z: point.x * sin + point.z * cos
        };
    }

    function rotateX(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x,
            y: point.y * cos - point.z * sin,
            z: point.y * sin + point.z * cos
        };
    }

    function project(point, distance = 800) {
        const scale = distance / (distance - point.z);
        const centerX = getCenterX();
        const centerY = getCenterY();
        return {
            x: centerX + point.x * radius * scale,
            y: centerY + point.y * radius * scale,
            z: point.z
        };
    }

    let rotationX = 0.3;
    let rotationY = 0;
    let targetRotationY = 0;
    let autoRotationY = 0.002;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseRotationY = 0;
    let mouseRotationX = 0;
    let easingFactor = 0.95;

    function drawGlobe() {
        if (!canvas || !canvas.parentNode) {
            if (globeAnimationId) {
                cancelAnimationFrame(globeAnimationId);
                globeAnimationId = null;
            }
            return;
        }
        ctx.clearRect(0, 0, baseSize, baseSize);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;

        const rotatedSphere = sphere.map(ring => 
            ring.map(p => {
                let rotated = rotateY(p, rotationY + mouseRotationY);
                rotated = rotateX(rotated, rotationX + mouseRotationX);
                return { ...rotated, projected: project(rotated) };
            })
        );

        for (let i = 0; i < rotatedSphere.length; i++) {
            for (let j = 0; j < rotatedSphere[i].length - 1; j++) {
                const p1 = rotatedSphere[i][j];
                const p2 = rotatedSphere[i][j + 1];
                if (p1.projected.z > -150 && p2.projected.z > -150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.projected.x, p1.projected.y);
                    ctx.lineTo(p2.projected.x, p2.projected.y);
                    ctx.stroke();
                }
            }
        }

        for (let i = 0; i < rotatedSphere.length - 1; i++) {
            for (let j = 0; j < rotatedSphere[i].length; j++) {
                const p1 = rotatedSphere[i][j];
                const p2 = rotatedSphere[i + 1][j];
                if (p1.projected.z > -150 && p2.projected.z > -150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.projected.x, p1.projected.y);
                    ctx.lineTo(p2.projected.x, p2.projected.y);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = 'rgba(102, 252, 241, 0.6)';
        glowPoints.forEach(point => {
            let rotated = rotateY(point, rotationY + mouseRotationY);
            rotated = rotateX(rotated, rotationX + mouseRotationX);
            const projected = project(rotated);
            if (projected.z > -100) {
                const dotSize = 3 * point.intensity * (1 + projected.z / 400);
                const alpha = 0.4 * point.intensity * (1 + projected.z / 400);
                ctx.fillStyle = `rgba(102, 252, 241, ${alpha})`;
                ctx.beginPath();
                ctx.arc(projected.x, projected.y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(102, 252, 241, 0.5)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }

    function animateGlobe() {
        if (!canvas || !canvas.parentNode || !ctx) {
            if (globeAnimationId) {
                cancelAnimationFrame(globeAnimationId);
                globeAnimationId = null;
            }
            return;
        }
        if (!isDragging) {
            rotationY += autoRotationY;
            mouseRotationY *= easingFactor;
            mouseRotationX *= easingFactor;
            if (Math.abs(mouseRotationY) < 0.001) mouseRotationY = 0;
            if (Math.abs(mouseRotationX) < 0.001) mouseRotationX = 0;
        }
        drawGlobe();
        globeAnimationId = requestAnimationFrame(animateGlobe);
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', function(e) {
        isDragging = true;
        canvas.classList.add('dragging');
        const pos = getMousePos(e);
        lastMouseX = pos.x;
        lastMouseY = pos.y;
    });

    canvas.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const pos = getMousePos(e);
            const deltaX = pos.x - lastMouseX;
            const deltaY = pos.y - lastMouseY;
            mouseRotationY += deltaX * 0.005;
            mouseRotationX += deltaY * 0.005;
            mouseRotationX = Math.max(-0.5, Math.min(0.5, mouseRotationX));
            lastMouseX = pos.x;
            lastMouseY = pos.y;
        }
    });

    canvas.addEventListener('mouseup', function() {
        isDragging = false;
        canvas.classList.remove('dragging');
    });

    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
        canvas.classList.remove('dragging');
    });

    animateGlobe();

    const particleCanvas = document.getElementById('particle-text-canvas');
    if (!particleCanvas) return;

    const particleSection = document.querySelector('.particle-text-section');
    if (!particleSection) return;

    const pCtx = particleCanvas.getContext('2d');
    if (!pCtx) return;
    
    const pDpr = window.devicePixelRatio || 1;
    let isAnimating = false;
    let animationFrameId = null;
    let canvasWidth = 0;
    let canvasHeight = 0;
    
    function resizeParticleCanvas() {
        if (!particleCanvas || !particleCanvas.parentNode || !pCtx) return;
        const rect = particleCanvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            requestAnimationFrame(resizeParticleCanvas);
            return;
        }
        
        const width = rect.width;
        const height = rect.height;
        canvasWidth = width;
        canvasHeight = height;
        
        particleCanvas.width = width * pDpr;
        particleCanvas.height = height * pDpr;
        pCtx.scale(pDpr, pDpr);
        particleCanvas.style.width = width + 'px';
        particleCanvas.style.height = height + 'px';
    }
    
    resizeParticleCanvas();
    
    let particleResizeTimeout = null;
    window.addEventListener('resize', function() {
        if (particleResizeTimeout) clearTimeout(particleResizeTimeout);
        particleResizeTimeout = setTimeout(() => {
            resizeParticleCanvas();
        }, 150);
    }, { passive: true });

    const words = ['BLOCKCHAIN', 'DECENTRALIZED', 'DISTRIBUTED', 'CONSENSUS', 'NETWORK'];
    let currentWordIndex = 0;
    let particles = [];
    let targetParticles = [];
    let transitionProgress = 0;
    let state = 'assemble';
    let mouseX = 0;
    let mouseY = 0;
    let isInitialized = false;

    function getTextParticles(text, fontSize = 120) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return [];
        
        tempCanvas.width = 2000;
        tempCanvas.height = 400;
        tempCtx.fillStyle = 'white';
        tempCtx.font = `bold ${fontSize}px Inter, sans-serif`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        const points = [];
        const step = 4;

        for (let y = 0; y < tempCanvas.height; y += step) {
            for (let x = 0; x < tempCanvas.width; x += step) {
                const index = (y * tempCanvas.width + x) * 4;
                if (data[index + 3] > 128) {
                    points.push({
                        x: x - tempCanvas.width / 2,
                        y: y - tempCanvas.height / 2,
                        baseX: x - tempCanvas.width / 2,
                        baseY: y - tempCanvas.height / 2,
                        vx: 0,
                        vy: 0,
                        opacity: 1
                    });
                }
            }
        }

        return points;
    }

    function initParticles() {
        if (!particleCanvas || canvasWidth === 0 || canvasHeight === 0) {
            if (canvasWidth === 0 || canvasHeight === 0) {
                resizeParticleCanvas();
                setTimeout(() => initParticles(), 50);
            }
            return;
        }
        
        const word = words[currentWordIndex];
        targetParticles = getTextParticles(word);
        if (targetParticles.length === 0) return;
        
        if (!isInitialized || particles.length === 0) {
            const startX = canvasWidth / 2;
            const startY = canvasHeight / 2;
            
            particles = targetParticles.map((p, i) => {
                const angle = (i / targetParticles.length) * Math.PI * 2;
                const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
                return {
                    x: startX + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5),
                    y: startY + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5),
                    baseX: p.baseX,
                    baseY: p.baseY,
                    vx: 0,
                    vy: 0,
                    opacity: 0
                };
            });
            isInitialized = true;
            state = 'assemble';
            transitionProgress = 0;
        } else {
            if (particles.length !== targetParticles.length) {
                if (particles.length < targetParticles.length) {
                    const startX = canvasWidth / 2;
                    const startY = canvasHeight / 2;
                    while (particles.length < targetParticles.length) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
                        particles.push({
                            x: startX + Math.cos(angle) * radius,
                            y: startY + Math.sin(angle) * radius,
                            baseX: 0,
                            baseY: 0,
                            vx: 0,
                            vy: 0,
                            opacity: 0
                        });
                    }
                } else {
                    particles = particles.slice(0, targetParticles.length);
                }
            }
            
            particles.forEach((p, i) => {
                if (targetParticles[i]) {
                    p.baseX = targetParticles[i].baseX;
                    p.baseY = targetParticles[i].baseY;
                }
                p.vx = 0;
                p.vy = 0;
            });
            
            state = 'assemble';
            transitionProgress = 0;
        }
    }

    function updateParticles() {
        if (!particleCanvas || !particleCanvas.parentNode || particles.length === 0 || targetParticles.length === 0) return;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        if (state === 'assemble') {
            transitionProgress += 0.015;
            if (transitionProgress >= 1) {
                transitionProgress = 1;
                state = 'hold';
            }
            
            particles.forEach((p, i) => {
                const target = targetParticles[i] || { baseX: 0, baseY: 0 };
                const dx = (target.baseX + centerX) - p.x;
                const dy = (target.baseY + centerY) - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                p.vx += dx * 0.08 * transitionProgress;
                p.vy += dy * 0.08 * transitionProgress;
                p.vx *= 0.90;
                p.vy *= 0.90;
                
                p.x += p.vx;
                p.y += p.vy;
                p.opacity = Math.min(1, p.opacity + 0.03);
            });
        } else if (state === 'hold') {
            transitionProgress += 0.005;
            if (transitionProgress > 2) {
                state = 'dissolve';
                transitionProgress = 0;
            }
            
            particles.forEach((p, i) => {
                const target = targetParticles[i] || { baseX: 0, baseY: 0 };
                const targetX = target.baseX + centerX;
                const targetY = target.baseY + centerY;
                
                const dx = targetX - p.x;
                const dy = targetY - p.y;
                p.x += dx * 0.1;
                p.y += dy * 0.1;
                
                const mouseDx = mouseX - p.x;
                const mouseDy = mouseY - p.y;
                const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                if (mouseDist < 150) {
                    const force = (150 - mouseDist) / 150 * 0.3;
                    p.vx -= mouseDx * force * 0.001;
                    p.vy -= mouseDy * force * 0.001;
                }
                
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.95;
                p.vy *= 0.95;
            });
        } else if (state === 'dissolve') {
            transitionProgress += 0.018;
            if (transitionProgress >= 1) {
                currentWordIndex = (currentWordIndex + 1) % words.length;
                particles = particles.map(p => ({
                    x: p.x,
                    y: p.y,
                    baseX: 0,
                    baseY: 0,
                    vx: (Math.random() - 0.5) * 2.5,
                    vy: (Math.random() - 0.5) * 2.5,
                    opacity: p.opacity
                }));
                initParticles();
                return;
            }
            
            particles.forEach(p => {
                p.vx += (Math.random() - 0.5) * 0.8;
                p.vy += (Math.random() - 0.5) * 0.8;
                p.vx *= 0.97;
                p.vy *= 0.97;
                p.x += p.vx;
                p.y += p.vy;
                p.opacity = Math.max(0, p.opacity - 0.025);
            });
        }
    }

    function drawParticles() {
        if (!particleCanvas || !particleCanvas.parentNode || !pCtx || particles.length === 0 || canvasWidth === 0) return;
        pCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        particles.forEach((p, i) => {
            if (p.opacity > 0.01) {
                const useAccent = (i % 7 === 0);
                const color = useAccent ? `rgba(102, 252, 241, ${p.opacity * 0.4})` : `rgba(255, 255, 255, ${p.opacity * 0.3})`;
                pCtx.fillStyle = color;
                const size = useAccent ? 2.5 : 1.5;
                pCtx.beginPath();
                pCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
                pCtx.fill();
            }
        });
    }

    function animateParticles() {
        if (!isAnimating || !particleCanvas || !particleCanvas.parentNode) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            return;
        }
        updateParticles();
        drawParticles();
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    function startAnimation() {
        if (isAnimating || !particleCanvas || !particleCanvas.parentNode) return;
        
        if (!isInitialized || particles.length === 0 || targetParticles.length === 0) {
            initParticles();
            if (particles.length === 0 || targetParticles.length === 0) {
                setTimeout(() => startAnimation(), 100);
                return;
            }
        }
        
        isAnimating = true;
        animateParticles();
    }

    particleCanvas.addEventListener('mousemove', function(e) {
        const rect = particleCanvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left);
        mouseY = (e.clientY - rect.top);
    }, { passive: true });

    function initializeParticleSystem() {
        if (canvasWidth === 0 || canvasHeight === 0) {
            resizeParticleCanvas();
            setTimeout(() => initializeParticleSystem(), 50);
            return;
        }
        
        if (!isInitialized || particles.length === 0) {
            initParticles();
        }
        
        if (particles.length > 0 && targetParticles.length > 0 && !isAnimating) {
            startAnimation();
        } else if (particles.length === 0 || targetParticles.length === 0) {
            setTimeout(() => initializeParticleSystem(), 100);
        }
    }

    setTimeout(() => {
        initializeParticleSystem();
    }, 300);

    window.addEventListener('load', () => {
        setTimeout(() => initializeParticleSystem(), 200);
    });

    const aboutSection = document.getElementById('about');
    const narrativeContent = document.querySelector('.narrative-content');
    
    if (aboutSection && narrativeContent) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.3 && !narrativeContent.classList.contains('visible')) {
                    narrativeContent.classList.add('visible');
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '50px'
        });
        
        aboutObserver.observe(aboutSection);
    }
});
