// Fonction pour récupérer l'ID du photographe depuis l'URL
function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

// Fonction pour valider l'ID du photographe
function isValidPhotographerId(id) {
  return id && !isNaN(parseInt(id));
}

// Fonction pour effectuer une requête HTTP et gérer les erreurs
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Fonction pour charger les données du photographe
async function getPhotographerData(photographerId) {
  try {
    const data = await fetchJson('../photographers.json');
    return data.photographers.find(p => p.id.toString() === photographerId);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return null;
  }
}

// Fonction pour charger les médias d'un photographe spécifique
async function getPhotographerMedia(photographerId, photographerName) {
  try {
    const data = await fetchJson('../photographers.json');
    return data.media.filter(media => media.photographerId.toString() === photographerId)
      .map(media => {
        media.path = getMediaPath(media, photographerName);
        return media;
      });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error);
    return [];
  }
}

// Fonction pour déterminer le chemin du média
function getMediaPath(media, photographerName) {
  const firstName = photographerName.split(" ")[0].replace(/\s+/g, '-');
  return media.image ? `../../Sample Photos/${firstName}/${media.image}` :
         media.video ? `../../Sample Photos/${firstName}/${media.video}` : '';
}

// Fonction pour afficher les médias du photographe sur la page
function displayPhotographerMedia(media) {
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'media-container';

  media.forEach(m => {
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-element';
    const mediaItem = m.image ? document.createElement('img') : document.createElement('video');
    mediaItem.src = m.path;
    if (m.image) mediaItem.alt = m.title;
    if (m.video) mediaItem.controls = true;
    mediaElement.appendChild(mediaItem);

    const titleElem = document.createElement('h3');
    titleElem.textContent = m.title;
    const likesElem = document.createElement('span');
    likesElem.textContent = `${m.likes} ❤️`;
    mediaElement.append(titleElem, likesElem);
    mediaContainer.appendChild(mediaElement);
  });

  return mediaContainer;
}

async function initPage() {
  const photographerId = getPhotographerIdFromUrl();

  if (photographerId && isValidPhotographerId(photographerId)) {
    const photographer = await getPhotographerData(photographerId);
    if (photographer) {
      const media = await getPhotographerMedia(photographerId, photographer.name);
      const headerContainer = document.querySelector('.photograph-header')

      // Créer et configurer les éléments pour le photographe
      const imageContainer = document.createElement('div');
      imageContainer.className = 'image-container';
      const img = document.createElement('img');
      img.setAttribute("src", `../../Sample Photos/Photographers ID Photos/${photographer.portrait}`);
      img.setAttribute("alt", `Portrait de ${photographer.name}`);
      imageContainer.appendChild(img);

      const h2 = document.createElement('h2');
      h2.textContent = photographer.name;
      const locationElem = document.createElement('p');
      locationElem.textContent = `${photographer.city}, ${photographer.country}`;
      const taglineElem = document.createElement('p');
      taglineElem.textContent = photographer.tagline;
      const priceElem = document.createElement('p');
      priceElem.textContent = `${photographer.price}€/jour`;

      // Insérer les éléments avant le bouton de contact
      headerContainer.insertBefore(imageContainer, headerContainer.firstChild);
      headerContainer.insertBefore(taglineElem, headerContainer.firstChild);
      headerContainer.insertBefore(locationElem, headerContainer.firstChild);
      headerContainer.insertBefore(h2, headerContainer.firstChild);

      // Ajouter les éléments médias au conteneur principal
      const mainContainer = document.querySelector('#main');
      const mediaElements = displayPhotographerMedia(media);
      mainContainer.appendChild(mediaElements);
    }
  } else {
    console.error('Aucun ID de photographe valide fourni dans l\'URL');
  }
}
window.addEventListener('DOMContentLoaded', initPage);
