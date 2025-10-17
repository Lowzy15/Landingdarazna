const navbar = document.getElementById("navbar");
const navbarToggle = document.getElementById("navbarToggle");
const navLinks = document.querySelectorAll(".nav__links a");
const heroVisual = document.getElementById("heroVisual");
const heroSentinel = document.getElementById("heroSentinel");
const featureTabs = document.querySelectorAll("[data-feature-tab]");
const featurePanels = document.querySelectorAll("[data-feature-panel]");
const galleryViewport = document.getElementById("galleryViewport");
const galleryTrack = galleryViewport ? galleryViewport.querySelector(".gallery__track") : null;
let galleryItems = galleryTrack ? galleryTrack.querySelectorAll(".gallery__item") : [];
let touchStartX = 0;
let touchStartTime = 0;
const SWIPE_THRESHOLD = 40;
const SWIPE_TIME = 600;
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");
const heroHighlight = document.getElementById("heroHighlight");

const toggleMenu = () => {
    const isOpen = navbar.classList.toggle("open");
    navbarToggle.setAttribute("aria-expanded", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
};

const scrollToSection = (element) => {
    if (!element) return;
    const headerOffset = navbar ? navbar.offsetHeight + 12 : 0;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const targetPosition = Math.max(elementPosition - headerOffset, 0);

    window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
    });
};

const focusSection = (element) => {
    if (!element) return;
    if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
    }
    element.focus({ preventScroll: true });
};

if (navbarToggle) {
    navbarToggle.addEventListener("click", toggleMenu);
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        const isHashLink = href && href.startsWith("#") && href.length > 1;

        if (isHashLink) {
            const target = document.querySelector(href);
            if (target) {
                event.preventDefault();
                scrollToSection(target);
                setTimeout(() => focusSection(target), 600);
            }
        }

        if (navbar.classList.contains("open")) {
            navbar.classList.remove("open");
            navbarToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        }
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && navbar.classList.contains("open")) {
        navbar.classList.remove("open");
        navbarToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }
});

const onScroll = () => {
    if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
};

window.addEventListener("scroll", onScroll);
onScroll();

if (heroSentinel && heroVisual) {
    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                heroVisual.classList.add("merged");
                heroVisual.classList.remove("separated");
            } else {
                heroVisual.classList.add("separated");
                heroVisual.classList.remove("merged");
            }
        },
        {
            root: null,
            threshold: 0,
            rootMargin: `-${navbar.offsetHeight}px 0px 0px 0px`
        }
    );

    observer.observe(heroSentinel);
}

const activateFeatureTab = (targetId) => {
    featureTabs.forEach((tab) => {
        const isActive = tab.dataset.featureTab === targetId;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive);
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    featurePanels.forEach((panel) => {
        const shouldShow = panel.dataset.featurePanel === targetId;
        panel.classList.toggle("is-active", shouldShow);
        if (shouldShow) {
            panel.removeAttribute("hidden");
        } else {
            panel.setAttribute("hidden", "");
        }
    });
};

featureTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const targetId = tab.dataset.featureTab;
        activateFeatureTab(targetId);
    });

    tab.addEventListener("keydown", (event) => {
        const tabsArray = Array.from(featureTabs);
        const currentIndex = tabsArray.indexOf(tab);
        let nextIndex = currentIndex;

        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                nextIndex = (currentIndex + 1) % tabsArray.length;
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                nextIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
                break;
            case "Home":
                event.preventDefault();
                nextIndex = 0;
                break;
            case "End":
                event.preventDefault();
                nextIndex = tabsArray.length - 1;
                break;
            default:
                return;
        }

        const nextTab = tabsArray[nextIndex];
        nextTab.focus();
        activateFeatureTab(nextTab.dataset.featureTab);
    });
});

if (featureTabs.length && featurePanels.length) {
    const defaultActive = document.querySelector(".features__tab.is-active");
    const defaultId = defaultActive ? defaultActive.dataset.featureTab : featureTabs[0].dataset.featureTab;
    activateFeatureTab(defaultId);
}

if (heroHighlight) {
    const phrases = heroHighlight.dataset.phrases?.split("|") ?? [];
    let currentIndex = 0;

    const swapPhrase = () => {
        if (!phrases.length) return;
        heroHighlight.classList.add("is-changing");

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % phrases.length;
            heroHighlight.textContent = phrases[currentIndex];
            heroHighlight.classList.remove("is-changing");
        }, 250);
    };

    setInterval(swapPhrase, 3500);
}

const updateGalleryNavState = () => {
    if (!galleryViewport || !galleryTrack) return;
    galleryItems = galleryTrack.querySelectorAll(".gallery__item");
    if (!galleryItems.length) return;

    const maxScroll = galleryViewport.scrollWidth - galleryViewport.clientWidth;
    const currentScroll = galleryViewport.scrollLeft;

    if (galleryPrev) {
        galleryPrev.disabled = currentScroll <= 0;
    }

    if (galleryNext) {
        galleryNext.disabled = currentScroll >= maxScroll - 2;
    }
};

const scrollGalleryBy = (direction = 1) => {
    if (!galleryViewport || !galleryItems.length) return;
    const styles = getComputedStyle(galleryTrack);
    const gap = parseFloat(styles.gap || styles.columnGap || 0);
    const baseWidth = galleryItems[0].getBoundingClientRect().width || galleryViewport.clientWidth;
    const itemWidth = baseWidth + gap;
    galleryViewport.scrollBy({ left: direction * itemWidth, behavior: "smooth" });
};

const bindGalleryControls = () => {
    if (!galleryPrev || !galleryNext || !galleryViewport || !galleryTrack) return;

    galleryPrev.addEventListener("click", () => {
        scrollGalleryBy(-1);
        setTimeout(updateGalleryNavState, 300);
    });

    galleryNext.addEventListener("click", () => {
        scrollGalleryBy(1);
        setTimeout(updateGalleryNavState, 300);
    });

    galleryViewport.addEventListener("scroll", () => {
        window.requestAnimationFrame(updateGalleryNavState);
    });

    galleryViewport.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartTime = Date.now();
    }, { passive: true });

    galleryViewport.addEventListener("touchend", (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaTime = Date.now() - touchStartTime;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD && deltaTime < SWIPE_TIME) {
            if (deltaX < 0) {
                scrollGalleryBy(1);
            } else {
                scrollGalleryBy(-1);
            }
        }
    }, { passive: true });

    updateGalleryNavState();
};

if (galleryViewport) {
    bindGalleryControls();
    window.addEventListener("load", updateGalleryNavState);
    window.addEventListener("resize", updateGalleryNavState);
    updateGalleryNavState();
}
