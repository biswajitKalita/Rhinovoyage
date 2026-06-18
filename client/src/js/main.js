function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("active");
    const hamburger = document.querySelector(".hamburger");
    if (hamburger) hamburger.classList.toggle("active");
}

// Auto-close menu when clicking links on mobile
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.querySelector(".nav-links").classList.remove("active");
            const hamburger = document.querySelector(".hamburger");
            if (hamburger) hamburger.classList.remove("active");
        });
    });
});