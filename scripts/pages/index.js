// CHANGEMENT POUR UTILISER LE JSON
async function getPhotographers() {
    try {
        // Le chemin remonte d'un niveau depuis le script vers le dossier contenant photographers.json
        const response = await fetch('../photographers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return { photographers: [] };
    }
}
const images = document.getElementsByTagName('img');
for (let i = 0; i < images.length; i++) {
  images[i].setAttribute('tabindex', '0');
}
function displayData(photographers) {
    const photographersSection = document.querySelector(".photographer_section");

    photographers.forEach((photographer) => {
        const photographerModel = photographerTemplate(photographer);
        const userCardDOM = photographerModel.getUserCardDOM();

        userCardDOM.classList.add('photographer-profile');
        userCardDOM.dataset.photographerId = photographer.id;

        // Ajouter aria-label avec les informations du photographe pour l'accessibilité
        userCardDOM.setAttribute('aria-label', `Lien vers le photographe ${photographer.name}, situé à ${photographer.city}. Tarif : ${photographer.price}€ par jour.`);

        photographersSection.appendChild(userCardDOM);
    });

    // Ajouter la navigation clavier après avoir ajouté tous les éléments de photographe
    addKeyboardNavigationToPhotographers();
}

async function init() {
    const { photographers } = await getPhotographers();
    displayData(photographers);
}

window.addEventListener('DOMContentLoaded', init);

// Ajout de la navigation avec Tab et la sélection avec Entrée
function addKeyboardNavigationToPhotographers() {
    const photographerElements = document.querySelectorAll('.photographer-profile');

    photographerElements.forEach(element => {
        element.setAttribute('tabindex', '0');
        element.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const photographerId = element.getAttribute('data-photographer-id');
                window.location.href = `photographer.html?id=${photographerId}`;
            }
        });
    });
}