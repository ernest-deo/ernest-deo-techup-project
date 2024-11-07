document.addEventListener('DOMContentLoaded', function() {
    // Create the return to top button
    const returnToTopBtn = document.createElement('div');
    returnToTopBtn.id = 'return-to-top';
    returnToTopBtn.innerHTML = '&#8593;'; // Up arrow character
    document.body.appendChild(returnToTopBtn);

    // Function to check scroll position and show/hide button
    function toggleReturnToTopButton() {
        if (window.pageYOffset > 300) {
            returnToTopBtn.classList.add('show');
        } else {
            returnToTopBtn.classList.remove('show');
        }
    }

    // Add scroll event listener
    window.addEventListener('scroll', toggleReturnToTopButton);

    // Add click event to return to top
    returnToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});