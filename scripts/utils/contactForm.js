document.addEventListener("DOMContentLoaded", function() {
    // Attach click event to the 'Contact Me' button
    const contactButton = document.querySelector('.contact_button');
    if (contactButton) {
        contactButton.addEventListener('click', function() {
            displayModal('Nom du Photographe'); // Replace with the real photographer's name
        });
    }

    // Attach click event to the close button
    const closeButton = document.querySelector(".close");
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
        closeButton.tabIndex = 0; // Make the close button focusable
        closeButton.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                closeModal();
            }
        });
    }

    // Event listener to close the modal with the Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

function displayModal(photographerName) {
    const modal = document.getElementById("contact_modal");
    const photographerNameElement = document.getElementById("photographer-name-modal");

    if (photographerNameElement) {
        photographerNameElement.textContent = photographerName;
    }

    if (modal) {
        modal.style.display = "block";
        trapFocus(modal); // Call trapFocus function for the modal
    }
}

function closeModal() {
    const modal = document.getElementById("contact_modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Function to trap focus within the modal
function trapFocus(element) {
    const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e) {
        let isTabPressed = e.key === 'Tab' || e.keyCode === 9;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) { // If the Shift key is pressed
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // If the Shift key is not pressed
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }

    element.addEventListener('keydown', handleKeyDown);

    // Return a function to remove the event listener
    return () => element.removeEventListener('keydown', handleKeyDown);
}
