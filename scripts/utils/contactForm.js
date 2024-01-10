document.addEventListener("DOMContentLoaded", function() {
    // Attachez l'événement 'click' au bouton 'Contactez-moi'
    const contactButton = document.querySelector('.contact_button');
    if (contactButton) {
        contactButton.addEventListener('click', function() {
            displayModal('Nom du Photographe'); // Remplacez par le nom du photographe réel
        });
    }
  
    // Attachez l'événement 'click' à la croix de fermeture
    const closeButton = document.querySelector(".close");
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
  });
  
  function displayModal(photographerName) {
    const modal = document.getElementById("contact_modal");
    const photographerNameElement = document.getElementById("photographer-name-modal");
    
    // Met à jour le contenu de l'élément avec l'id "photographer-name-modal"
    if (photographerNameElement) {
        photographerNameElement.textContent = photographerName;
    }
  
    // Affiche la modale
    if (modal) {
        modal.style.display = "block";
    }
  }

function closeModal() {
    const modal = document.getElementById("contact_modal");
    modal.style.display = "none";
}
