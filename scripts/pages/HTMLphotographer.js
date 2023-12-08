// Fonction pour récupérer l'ID du photographe depuis l'URL
function getPhotographerIdFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('id');
  }
  
  // Fonction pour charger les données du photographe
  async function getPhotographerData(photographerId) {
    try {
      const response = await fetch('../photographers.json'); // Assurez-vous que le chemin est correct
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.photographers.find(p => p.id.toString() === photographerId);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
    }
  }
  
  // Fonction pour afficher les détails du photographe sur la page
  async function displayPhotographerDetails() {
    const photographerId = getPhotographerIdFromUrl();
  
    if (photographerId) {
      const photographer = await getPhotographerData(photographerId);
  
      if (photographer) {
        const mainContainer = document.querySelector('#main');
  
        // Créer le conteneur pour l'image de profil
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
  
        // Utilisez le chemin fourni pour localiser l'image
      const img = document.createElement('img');
      img.setAttribute("src", `../../Sample Photos/Photographers ID Photos/${photographer.portrait}`);
      img.setAttribute("alt", `Portrait de ${photographer.name}`);
      imageContainer.appendChild(img);
  
        // Créer et configurer l'élément 'h2' pour le nom
        const h2 = document.createElement('h2');
        h2.textContent = photographer.name;
  
        // Créer et configurer les éléments pour les autres informations
        const locationElem = document.createElement('p');
        locationElem.textContent = `${photographer.city}, ${photographer.country}`;
        locationElem.className = 'location';
  
        const taglineElem = document.createElement('p');
        taglineElem.textContent = photographer.tagline;
        taglineElem.className = 'tagline';
  
        const priceElem = document.createElement('p');
        priceElem.textContent = `${photographer.price}€/jour`;
        priceElem.className = 'price';
  
        // Ajouter les nouveaux éléments au DOM
        mainContainer.appendChild(imageContainer);
        mainContainer.appendChild(h2);
        mainContainer.appendChild(locationElem);
        mainContainer.appendChild(taglineElem);
        mainContainer.appendChild(priceElem);
      } else {
        console.error('Photographe non trouvé avec l\'ID:', photographerId);
      }
    } else {
      console.error('Aucun ID de photographe fourni dans l\'URL');
    }
    
  }
  
  // Exécutez la fonction d'affichage lorsque la page est chargée
  window.addEventListener('DOMContentLoaded', displayPhotographerDetails);
  