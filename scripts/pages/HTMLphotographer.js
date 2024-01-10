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

// Fonction pour créer un élément de like cliquable
function createLikeElement(likes) {
  const likesContainer = document.createElement('div');
  likesContainer.className = 'likes-container';

  const likeCount = document.createElement('span');
  likeCount.textContent = likes;
  likeCount.className = 'like-count';

  const heartIcon = document.createElement('i');
  heartIcon.className = 'heart-icon fas fa-heart';
  heartIcon.textContent = '♥';
  heartIcon.style.cursor = 'pointer';

  likesContainer.appendChild(likeCount);
  likesContainer.appendChild(heartIcon);

  likesContainer.addEventListener('click', function() {
    const currentLikes = parseInt(likeCount.textContent, 10);
    likeCount.textContent = currentLikes + 1;
  });

  return likesContainer;
}

// Fonction pour afficher les médias du photographe sur la page en grille
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

// Fonction pour trier les médias
// Fonction pour trier les médias en fonction de l'option sélectionnée
function sortMedia(media, sortBy) {
  let sortedMedia = [...media];
  switch (sortBy) {
    case 'likes':
      sortedMedia.sort((a, b) => b.likes - a.likes);
      break;
    case 'date':
      sortedMedia.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'title':
      sortedMedia.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }
  return sortedMedia;
}

// Fonction pour afficher les médias triés
function displaySortedMedia(sortedMedia) {
  const mediaContainer = document.querySelector('#media-container');
  if (mediaContainer) {
    mediaContainer.innerHTML = '';
    mediaContainer.appendChild(displayPhotographerMedia(sortedMedia));
  }
}
let currentSortValue = 'default'; // Une valeur par défaut pour le tri
// Fonction pour gérer le clic sur les options du sélecteur
function onOptionClicked(event) {
  const option = event.target;
  const dropdown = option.closest('.custom-select');
  const triggerSpan = dropdown.querySelector('.custom-select__trigger span');
  const selectedValue = option.getAttribute('data-value');

  updateSelectedOption(dropdown, option);
  triggerSpan.textContent = option.textContent;

  const photographerId = getPhotographerIdFromUrl();
  if (currentPhotographer) {
    getPhotographerMedia(photographerId, currentPhotographer.name).then(media => {
      const sortedMedia = sortMedia(media, selectedValue);
      displaySortedMedia(sortedMedia);
    });
  }

  dropdown.classList.remove('open');
}

// Fonction pour mettre à jour l'option sélectionnée dans le sélecteur
function updateSelectedOption(dropdown, selectedOption) {
  const options = dropdown.querySelectorAll('.custom-option');
  options.forEach(opt => opt.classList.remove('selected'));
  selectedOption.classList.add('selected');
}

// Fonction pour basculer l'état du sélecteur personnalisé et de la flèche
function toggleDropdown(dropdown) {
  const isOpen = dropdown.classList.toggle('open');
  setArrowDirection(dropdown, isOpen);
}

// Fonction pour définir la direction de la flèche
function setArrowDirection(dropdown, isOpen) {
  const arrow = dropdown.querySelector('.arrow');
  arrow.textContent = isOpen ? '▲' : '▼';
  arrow.style.display = 'block'; // Assurez-vous que la flèche est toujours affichée
}

// Écouteurs d'événements pour le sélecteur personnalisé
document.addEventListener('DOMContentLoaded', function() {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  const dropdown = document.querySelector('.custom-select');
  const options = dropdown.querySelectorAll('.custom-option');

  selectTrigger.addEventListener('click', () => toggleDropdown(dropdown));

  options.forEach(option => {
      option.addEventListener('click', onOptionClicked);
  });

  setArrowDirection(dropdown, false); // Initialise la flèche dans l'état fermé

  initPage(); // Appel de la fonction initPage ici pour initialiser la page
});

// IIIIIIIIIII INIIIIITIALISER      Fonction pour initialiser la page
async function initPage() {
  const photographerId = getPhotographerIdFromUrl();
  if (photographerId && isValidPhotographerId(photographerId)) {
    const photographer = await getPhotographerData(photographerId);
    if (photographer) {
      currentPhotographer = photographer;
      createPhotographHeader(photographer);
      const media = await getPhotographerMedia(photographerId, photographer.name);
      const mediaContainer = document.querySelector('#media-container');
      mediaContainer.appendChild(displayPhotographerMedia(media));

      const totalLikes = media.reduce((sum, item) => sum + item.likes, 0);
      createFooter(photographer, totalLikes); // Appel de la fonction createFooter
    }
    if (currentPhotographer) {
      createPhotographHeader(currentPhotographer);
      currentPhotographerMedia = await getPhotographerMedia(photographerId, currentPhotographer.name);
      displaySortedMedia(); // Affiche les médias sans tri initial
    }
  } else {
    console.error('Invalid photographer ID provided in the URL');
  }
}

// Fonction pour créer et afficher le footer
function createFooter(photographer, totalLikes) {
  const footer = document.createElement('footer');
  footer.className = 'page-footer';

  const totalLikesElement = document.createElement('div');
  totalLikesElement.className = 'total-likes';
  totalLikesElement.textContent = `${totalLikes} ♥`;

  const priceElement = document.createElement('div');
  priceElement.className = 'photographer-price';
  priceElement.textContent = `${photographer.price}€ / jour`;

  footer.appendChild(totalLikesElement);
  footer.appendChild(priceElement);

  document.body.appendChild(footer);
}

// Fonction modifiée pour initialiser la page
async function initPage() {
  const photographerId = getPhotographerIdFromUrl();

  if (photographerId && isValidPhotographerId(photographerId)) {
    const photographer = await getPhotographerData(photographerId);
    if (photographer) {
      currentPhotographer = photographer;
      createPhotographHeader(photographer);

      const media = await getPhotographerMedia(photographerId, photographer.name);
      const mediaContainer = document.querySelector('#media-container');
      mediaContainer.appendChild(displayPhotographerMedia(media));

      // Calculez le nombre total de likes
      const totalLikes = media.reduce((sum, item) => sum + item.likes, 0);
      createFooter(photographer, totalLikes);
    }
  } else {
    console.error('Invalid photographer ID provided in the URL');
  }
}

// Fonction pour créer et afficher l'en-tête du photographe
function createPhotographHeader(photographer) {
  const main = document.getElementById('main');
  const headerSection = document.createElement('section');
  headerSection.className = 'photograph-header';

  const photographerInfo = document.createElement('div');
  photographerInfo.className = 'photographer-info';
  headerSection.appendChild(photographerInfo);

  const name = document.createElement('h1');
  name.id = 'photographerName';
  name.textContent = photographer.name;
  photographerInfo.appendChild(name);

  const location = document.createElement('p');
  location.id = 'photographerLocation';
  location.textContent = `${photographer.city}, ${photographer.country}`;
  photographerInfo.appendChild(location);

  const tagline = document.createElement('p');
  tagline.id = 'photographerTagline';
  tagline.textContent = photographer.tagline;
  photographerInfo.appendChild(tagline);

  const contactButton = document.createElement('button');
  contactButton.className = 'contact_button';
  contactButton.textContent = 'Contactez-moi';
  // Attachez l'écouteur ici avec le nom du photographe
  contactButton.addEventListener('click', () => displayModal(photographer.name));
  headerSection.appendChild(contactButton);

  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';
  imageContainer.id = 'photographerImageContainer';
  const img = document.createElement('img');
  img.src = `../../Sample Photos/Photographers ID Photos/${photographer.portrait}`;
  img.alt = `Portrait de ${photographer.name}`;
  imageContainer.appendChild(img);
  headerSection.appendChild(imageContainer);

  main.prepend(headerSection);
}

// Modifiez la fonction displayModal pour accepter un paramètre name
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

// Configuration des événements du sélecteur personnalisé
document.addEventListener('DOMContentLoaded', function() {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  const options = document.querySelectorAll('.custom-option');

  if (options.length > 0) {
    const firstOption = options[0];
    firstOption.classList.add('selected');
    selectTrigger.querySelector('span').textContent = firstOption.textContent;
  }

  selectTrigger.addEventListener('click', toggleCustomSelect);

  options.forEach(option => {
    option.removeEventListener('click', onOptionClicked); // Assurez-vous de retirer d'abord les anciens gestionnaires d'événements
    option.addEventListener('click', onOptionClicked);
  });

  initPage();
});
