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
async function displayData(photographers) {
    const photographersSection = document.querySelector(".photographer_section");

    photographers.forEach((photographer) => {
        const photographerModel = photographerTemplate(photographer);
        const userCardDOM = photographerModel.getUserCardDOM();
        photographersSection.appendChild(userCardDOM);
    });
}

async function init() {
    // Récupère les datas des photographes
    const { photographers } = await getPhotographers();
    displayData(photographers);
}

window.addEventListener('DOMContentLoaded', (event) => {
    init();
});

