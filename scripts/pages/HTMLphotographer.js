// Fonction pour récupérer l'ID du photographe depuis l'URL
function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

// Fonction pour charger les données du photographe
async function getPhotographerData(photographerId) {
  try {
    const response = await fetch('../photographers.json');
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

// Fonction pour charger les médias d'un photographe spécifique
async function getPhotographerMedia(photographerId, photographerName) {
  try {
    const response = await fetch('../photographers.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
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
  const firstName = photographerName.split(" ")[0]; // Utilisez seulement le prénom
  const formattedName = firstName.replace(/\s+/g, '-');
  if (media.image) {
    return `../../Sample Photos/${formattedName}/${media.image}`;
  } else if (media.video) {
    return `../../Sample Photos/${formattedName}/${media.video}`;
  }
  return ''; // Retourner un chemin vide si aucun média n'est trouvé
}

// Fonction pour afficher les médias du photographe sur la page
function displayPhotographerMedia(media) {
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'media-container';

  media.forEach(m => {
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-element';

    if (m.image) {
      const mediaImg = document.createElement('img');
      mediaImg.src = m.path;
      mediaImg.alt = m.title;
      mediaElement.appendChild(mediaImg);
    } else if (m.video) {
      const mediaVideo = document.createElement('video');
      mediaVideo.src = m.path;
      mediaVideo.controls = true;
      mediaElement.appendChild(mediaVideo);
    }

    const titleElem = document.createElement('h3');
    titleElem.textContent = m.title;
    mediaElement.appendChild(titleElem);

    const likesElem = document.createElement('span');
    likesElem.textContent = `${m.likes} ❤️`;
    mediaElement.appendChild(likesElem);

    mediaContainer.appendChild(mediaElement);
  });

  return mediaContainer;
}

// Fonction principale pour initialiser la page
async function initPage() {
  const photographerId = getPhotographerIdFromUrl();

  if (photographerId) {
    const photographer = await getPhotographerData(photographerId);
    const media = await getPhotographerMedia(photographerId, photographer.name);

    if (photographer && media) {
      const mainContainer = document.querySelector('#main');

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

      mainContainer.appendChild(imageContainer);
      mainContainer.appendChild(h2);
      mainContainer.appendChild(locationElem);
      mainContainer.appendChild(taglineElem);
      mainContainer.appendChild(priceElem);

      const mediaElements = displayPhotographerMedia(media);
      mainContainer.appendChild(mediaElements);
    }
  } else {
    console.error('Aucun ID de photographe fourni dans l\'URL');
  }
}

window.addEventListener('DOMContentLoaded', initPage);
