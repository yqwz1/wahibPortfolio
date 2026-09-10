(function () {
    'use strict';

    const STORAGE_KEY = 'wahib-portfolio-view';
    const VALID_VIEWS = new Set(['recruiter', 'portfolio']);
    const root = document.documentElement;
    const generatedPortfolioPanels = [document.getElementById('lightbox')].filter(Boolean);
    generatedPortfolioPanels.forEach((panel) => { panel.dataset.viewPanel = 'portfolio'; });
    const panels = Array.from(document.querySelectorAll('[data-view-panel]'));
    const navGroups = Array.from(document.querySelectorAll('[data-view-nav]'));
    const triggers = Array.from(document.querySelectorAll('[data-view-trigger]'));
    const homeLink = document.querySelector('[data-view-home]');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger');

    function normalizeView(value) {
        return VALID_VIEWS.has(value) ? value : 'recruiter';
    }

    function persistView(view) {
        try {
            localStorage.setItem(STORAGE_KEY, view);
        } catch (error) {
            // Storage can be unavailable in privacy-focused browser contexts.
        }
    }

    function closeMobileMenu() {
        mobileMenu?.classList.remove('open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
        mobileMenu?.setAttribute('aria-hidden', 'true');
        mobileMenu?.setAttribute('inert', '');
    }

    function updateVisibility(view) {
        panels.forEach((panel) => {
            const isActive = panel.dataset.viewPanel === view;
            panel.hidden = !isActive;
            panel.toggleAttribute('inert', !isActive);
        });

        navGroups.forEach((group) => {
            group.hidden = group.dataset.viewNav !== view;
        });

        triggers.forEach((trigger) => {
            if (trigger.closest('.view-switcher')) {
                trigger.setAttribute('aria-pressed', String(trigger.dataset.viewTrigger === view));
            }
        });

        if (homeLink) {
            homeLink.href = view === 'recruiter' ? '#recruiter-overview' : '#hero';
        }
    }

    function announceView(view) {
        const status = document.getElementById('view-status');
        if (status) {
            status.textContent = view === 'recruiter'
                ? 'Recruiter view enabled.'
                : 'Full portfolio enabled.';
        }
    }

    function applyView(nextView, options) {
        const view = normalizeView(nextView);
        const settings = Object.assign({ persist: true, announce: true, resetScroll: true }, options);

        root.dataset.view = view;
        updateVisibility(view);

        if (settings.persist) persistView(view);
        closeMobileMenu();

        if (settings.resetScroll) {
            if (location.hash) {
                history.replaceState(null, '', location.pathname + location.search);
            }
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        }

        if (settings.announce) announceView(view);

        requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new CustomEvent('portfolio-view-change', { detail: { view } }));
        });
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => applyView(trigger.dataset.viewTrigger));
    });

    applyView(root.dataset.view, { persist: false, announce: false, resetScroll: false });
    root.classList.add('view-mode-ready');
})();
