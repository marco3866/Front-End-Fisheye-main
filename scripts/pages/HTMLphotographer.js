// MAIN I Fonction pour récupérer l'ID du photographe depuis l'URL
function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

// II Fonction pour valider l'ID du photographe
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

// II Fonction pour charger les données du photographe
async function getPhotographerData(photographerId) {
  try {
    const data = await fetchJson('../photographers.json');
    return data.photographers.find(p => p.id.toString() === photographerId);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return null;
  }
}

// IV Fonction pour charger les médias d'un photographe spécifique
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

// V Fonction pour déterminer le chemin du média
function getMediaPath(media, photographerName) {
  const firstName = photographerName.split(" ")[0].replace(/\s+/g, '-');
  return media.image ? `../../Sample Photos/${firstName}/${media.image}` :
         media.video ? `../../Sample Photos/${firstName}/${media.video}` : '';
}

//MAIN VI CHARGER LES MEDIAS Fonction pour afficher les médias du photographe sur la page
// VII Fonction pour créer un élément de like cliquable qui incrémente le nombre de likes
function createLikeElement(likes) {
  const likesContainer = document.createElement('div');
  likesContainer.className = 'likes-container';

  const likeCount = document.createElement('span');
  likeCount.textContent = likes;
  likeCount.className = 'like-count';

  const heartIcon = document.createElement('i');
  heartIcon.className = 'heart-icon fas fa-heart';
  heartIcon.textContent = '♥'; // Cœur plein
  heartIcon.style.cursor = 'pointer'; // Change le curseur en main de clic pour l'icône de cœur

  // Ajoutez les éléments au conteneur de likes
  likesContainer.appendChild(likeCount);
  likesContainer.appendChild(heartIcon);

  // Écouteur d'événement pour augmenter le nombre de likes quand on clique sur le nombre ou le cœur
  likesContainer.addEventListener('click', function() {
    const currentLikes = parseInt(likeCount.textContent, 10);
    likeCount.textContent = currentLikes + 1;
  });

  // Écouteur d'événement pour le cœur, pour permettre la propagation du clic
  heartIcon.addEventListener('click', function(event) {
    const currentLikes = parseInt(likeCount.textContent, 10);
    likeCount.textContent = currentLikes + 1;
    event.stopPropagation(); // Empêche le clic sur l'icône de cœur de propager à l'élément parent
  });

  return likesContainer;
}

// VIII Fonction pour afficher les médias du photographe sur la page en grille
function displayPhotographerMedia(media) {
  const mediaGridContainer = document.createElement('div');
  mediaGridContainer.className = 'media-grid-container';

  media.forEach(m => {
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-item';

    const mediaImgContainer = document.createElement('div');
    mediaImgContainer.className = 'media-img-container';

    const mediaItem = m.image ? document.createElement('img') : document.createElement('video');
    mediaItem.src = m.path;
    mediaItem.alt = m.title;
    mediaItem.className = 'media-img';
    if (m.video) mediaItem.controls = true;
    mediaImgContainer.appendChild(mediaItem);

    const mediaDetails = document.createElement('div');
    mediaDetails.className = 'media-details';

    const titleElem = document.createElement('h3');
    titleElem.textContent = m.title;
    mediaDetails.appendChild(titleElem);

    const likesElem = createLikeElement(m.likes);
    mediaDetails.appendChild(likesElem);

    mediaElement.appendChild(mediaImgContainer);
    mediaElement.appendChild(mediaDetails);

    mediaGridContainer.appendChild(mediaElement);
  });

  return mediaGridContainer;
}

async function initPage() {
  const photographerId = getPhotographerIdFromUrl();

  if (photographerId && isValidPhotographerId(photographerId)) {
    const photographer = await getPhotographerData(photographerId);
    if (photographer) {
      const nameElement = document.getElementById('photographerName');
      const locationElement = document.getElementById('photographerLocation');
      const taglineElement = document.getElementById('photographerTagline');
      const imageContainer = document.getElementById('photographerImageContainer');

      nameElement.textContent = photographer.name;
      locationElement.textContent = `${photographer.city}, ${photographer.country}`;
      taglineElement.textContent = photographer.tagline;

      const img = document.createElement('img');
      img.setAttribute("src", photographer.portrait);
      img.setAttribute("alt", `Portrait of ${photographer.name}`);
      imageContainer.appendChild(img);

      const media = await getPhotographerMedia(photographerId, photographer.name);
      const mainContainer = document.querySelector('#main');
      const mediaElements = displayPhotographerMedia(media);
      mainContainer.appendChild(mediaElements);
    }
  } else {
    console.error('Invalid photographer ID provided in the URL');
  }
}

window.addEventListener('DOMContentLoaded', initPage);

function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

function isValidPhotographerId(id) {
  return id && !isNaN(parseInt(id));
}


// MAIN VII Function to get the photographer's ID from the URL
function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

// VIII Function to validate the photographer's ID
function isValidPhotographerId(id) {
  return id && !isNaN(parseInt(id));
}

document.addEventListener('DOMContentLoaded', function() {
  const heartIcons = document.querySelectorAll('.heart-icon');
  
  heartIcons.forEach(icon => {
    icon.addEventListener('click', function() {
      let likesElem = this.previousElementSibling; // on suppose que le span des likes est juste avant l'icône
      let currentLikes = parseInt(likesElem.textContent);
      
      // Toggle the filled class
      this.classList.toggle('filled');

      // Check if the heart is filled, and increment or decrement the likes
      if (this.classList.contains('filled')) {
        likesElem.textContent = currentLikes + 1;
      } else {
        likesElem.textContent = currentLikes - 1;
      }
    });
  });
});

// Add other functions here (getPhotographerData, getPhotographerMedia, displayPhotographerMedia)
// MAIN X FILTRE
// Toggle the custom select dropdown and adjust the arrow direction
// Fonction pour basculer le sélecteur personnalisé et ajuster la direction de la flèche
function toggleCustomSelect() {
  const dropdown = document.querySelector('.custom-select');
  const arrow = dropdown.querySelector('.arrow');
  
  // Change la direction de la flèche en fonction de l'état ouvert/fermé du menu déroulant
  const isOpen = dropdown.classList.toggle('open');
  arrow.textContent = isOpen ? '▲' : '▼';
}

// XI Fonction pour gérer le clic sur les options
function onOptionClicked(event) {
  const option = event.target;
  const dropdown = option.closest('.custom-select');
  const triggerSpan = dropdown.querySelector('.custom-select__trigger span');
  
  // Met à jour l'option sélectionnée visuellement et le texte du déclencheur
  dropdown.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');
  triggerSpan.textContent = option.textContent;
  
  // Ferme le menu déroulant
  dropdown.classList.remove('open');
}

// Ajout des écouteurs d'événements
document.addEventListener('DOMContentLoaded', function() {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  const firstOption = document.querySelector('.custom-option[data-value="popularity"]');
  
  // Assurez-vous que 'Popularité' est sélectionnée par défaut et met à jour le texte du déclencheur
  if (!firstOption.classList.contains('selected')) {
    firstOption.classList.add('selected');
  }
  selectTrigger.querySelector('span').textContent = firstOption.textContent;

  selectTrigger.addEventListener('click', toggleCustomSelect);

  // Gère le clic sur une option
  document.querySelectorAll('.custom-option').forEach(option => {
    option.addEventListener('click', onOptionClicked);
  });

  // Ferme le menu déroulant lorsque l'on clique en dehors
  window.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.custom-select');
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('open');
      const arrow = dropdown.querySelector('.arrow');
      arrow.textContent = '▼';
    }
  });
});
