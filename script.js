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

    function animateScroll() {
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

        requestAnimationFrame(animateScroll);
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
    const dpr = window.devicePixelRatio || 1;
    const size = 700;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const centerX = size / 2;
    const centerY = size / 2;
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
        ctx.clearRect(0, 0, size, size);

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
        if (!isDragging) {
            rotationY += autoRotationY;
            mouseRotationY *= easingFactor;
            mouseRotationX *= easingFactor;
            if (Math.abs(mouseRotationY) < 0.001) mouseRotationY = 0;
            if (Math.abs(mouseRotationX) < 0.001) mouseRotationX = 0;
        }
        drawGlobe();
        requestAnimationFrame(animateGlobe);
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
});
