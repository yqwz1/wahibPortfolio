(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let targetY = window.scrollY;
    let frameId = 0;
    let lastFrameTime = 0;

    function maxScrollY() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function cancelScroll() {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrameTime = 0;
        targetY = window.scrollY;
    }

    function hasScrollableParent(element, deltaY) {
        for (let node = element instanceof Element ? element : null;
             node && node !== document.body;
             node = node.parentElement) {
            const { overflowY } = window.getComputedStyle(node);
            const canOverflow = overflowY === 'auto' || overflowY === 'scroll';

            if (!canOverflow || node.scrollHeight <= node.clientHeight + 1) continue;

            const canScrollUp = deltaY < 0 && node.scrollTop > 0;
            const canScrollDown = deltaY > 0
                && node.scrollTop + node.clientHeight < node.scrollHeight - 1;

            if (canScrollUp || canScrollDown) return true;
        }

        return false;
    }

    function normalizeDelta(event) {
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18;
        if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
        return event.deltaY;
    }

    function animateScroll(timestamp) {
        const currentY = window.scrollY;
        const distance = targetY - currentY;

        if (Math.abs(distance) <= 1) {
            window.scrollTo(0, targetY);
            frameId = 0;
            lastFrameTime = 0;
            return;
        }

        const elapsed = lastFrameTime ? Math.min(timestamp - lastFrameTime, 32) : 1000 / 60;
        const smoothing = 1 - Math.pow(0.84, elapsed / (1000 / 60));
        const step = Math.sign(distance) * Math.max(1, Math.abs(distance) * smoothing);
        lastFrameTime = timestamp;
        window.scrollTo({ top: currentY + step, behavior: 'instant' });
        frameId = requestAnimationFrame(animateScroll);
    }

    function onWheel(event) {
        if (event.defaultPrevented || reducedMotion.matches || event.ctrlKey || event.metaKey) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && Math.abs(event.deltaY) < 40) return;

        const deltaY = normalizeDelta(event);
        if (!deltaY || hasScrollableParent(event.target, deltaY)) return;

        event.preventDefault();

        if (!frameId) targetY = window.scrollY;
        targetY = clamp(targetY + deltaY, 0, maxScrollY());

        if (!frameId) frameId = requestAnimationFrame(animateScroll);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerdown', cancelScroll, { passive: true });
    window.addEventListener('resize', () => {
        targetY = clamp(targetY, 0, maxScrollY());
    }, { passive: true });
    reducedMotion.addEventListener('change', cancelScroll);
})();
