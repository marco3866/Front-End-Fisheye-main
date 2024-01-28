document.addEventListener("DOMContentLoaded", function() {
    const contactButton = document.querySelector('.contact_button');
    if (contactButton) {
        contactButton.addEventListener('click', function() {
            displayModal('Nom du Photographe');
        });
    }

    const closeButton = document.querySelector(".close");
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
        closeButton.tabIndex = 0;
        closeButton.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

function displayModal(photographerName) {
    const modal = document.getElementById("contact_modal");
    const photographerNameElement = document.getElementById("photographer-name-modal");
    if (photographerNameElement) {
        photographerNameElement.textContent = photographerName;
    }
    if (modal) {
        modal.style.display = "block";
        trapFocus(modal);
    }
}

function closeModal() {
    const modal = document.getElementById("contact_modal");
    if (modal) {
        modal.style.display = "none";
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    console.log('Prénom:', firstName);
    console.log('Nom:', lastName);
    console.log('Email:', email);
    console.log('Message:', message);

    closeModal();
}

function trapFocus(element) {
    const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    function handleKeyDown(e) {
        let isTabPressed = e.key === 'Tab';
        if (!isTabPressed) {
            return;
        }
        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
}