let totalLikesCount = 0; // Ce sera mis à jour avec le total initial des likes
let currentMediaIndex = 0;
let currentPhotographerMedia = []; // Cette variable doit être définie globalement

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
// Fonction pour recalculer et mettre à jour le total des likes
function recalculateTotalLikes() {
  let newTotalLikes = 0;
  const likeElements = document.querySelectorAll('.like-count');
  likeElements.forEach(elem => {
    newTotalLikes += parseInt(elem.textContent, 10);
  });
  updateTotalLikesDisplay(newTotalLikes);
}

// Fonction pour mettre à jour l'affichage du total des likes
function updateTotalLikesDisplay(newTotal) {
  const totalLikesElement = document.querySelector('.total-likes');
  if (totalLikesElement) {
    totalLikesElement.textContent = `${newTotal} ♥`;
  }
}

// Fonction pour créer un élément de like cliquable
function createLikeElement(likes, mediaId) {
  const likesContainer = document.createElement('div');
  likesContainer.className = 'likes-container';
  likesContainer.tabIndex = 0; // Rend le conteneur focusable

  const likeCount = document.createElement('span');
  likeCount.textContent = likes;
  likeCount.className = 'like-count';

  const heartIcon = document.createElement('i');
  heartIcon.className = 'heart-icon fas fa-heart';
  heartIcon.textContent = '♥';
  heartIcon.style.cursor = 'pointer';

  likesContainer.appendChild(likeCount);
  likesContainer.appendChild(heartIcon);

  // Gestionnaire d'événements pour la souris
  likesContainer.addEventListener('click', function() {
    incrementLikes(likeCount, mediaId);
  });

  // Gestionnaire d'événements pour le clavier
  likesContainer.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      incrementLikes(likeCount, mediaId);
    }
  });

  return likesContainer;
}

// Fonction pour incrémenter les likes
function incrementLikes(likeCountElement, mediaId) {
  const currentLikes = parseInt(likeCountElement.textContent, 10);
  likeCountElement.textContent = currentLikes + 1;

  // Appel de la fonction pour recalculer et mettre à jour le total des likes
  recalculateTotalLikes();
}

function displayPhotographerMedia(media) {
  const mediaGridContainer = document.createElement('div');
  mediaGridContainer.className = 'media-grid-container';

  media.forEach((m, index) => {
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-item';

    const mediaImgContainer = document.createElement('div');
    mediaImgContainer.className = 'media-img-container';
    mediaImgContainer.tabIndex = 0; // Rend le conteneur focusable

    const mediaItem = m.image ? document.createElement('img') : document.createElement('video');
    mediaItem.alt = m.title;
    mediaItem.className = 'media-img';
    if (m.video) {
      const videoSource = document.createElement('source');
      videoSource.src = m.path;
      videoSource.type = 'video/mp4'; // Assurez-vous que le type est correct en fonction du format de la vidéo
      mediaItem.appendChild(videoSource);
      mediaItem.controls = true;
    } else {
      mediaItem.src = m.path; // Assurez-vous que l'image a également une source
    }

// Gestionnaire d'événements pour la souris
mediaImgContainer.addEventListener('click', () => {
  openGalleryModal(m);
});

// Gestionnaire d'événements pour le clavier
mediaImgContainer.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    openGalleryModal(m);
  }
});

mediaImgContainer.appendChild(mediaItem);
mediaElement.appendChild(mediaImgContainer);

const mediaDetails = document.createElement('div');
mediaDetails.className = 'media-details';

const titleElem = document.createElement('h3');
titleElem.textContent = m.title;
mediaDetails.appendChild(titleElem);

const likesElem = createLikeElement(m.likes, m.id); // Assurez-vous que la fonction createLikeElement accepte l'id du média
mediaDetails.appendChild(likesElem);

mediaElement.appendChild(mediaDetails);
mediaGridContainer.appendChild(mediaElement);
});

return mediaGridContainer;
}
// ......GALLERY MODAL
// Function to trap focus within the gallery modal
// ......GALLERY MODAL
// Function to trap focus within the gallery modal
// Fonction pour nettoyer les gestionnaires d'événements
function cleanUpGalleryEventListeners() {
  const prevButton = document.querySelector('.gallery-prev');
  const nextButton = document.querySelector('.gallery-next');

  // Retirer les anciens gestionnaires d'événements s'ils existent
  prevButton.removeEventListener('click', prevGalleryMedia);
  nextButton.removeEventListener('click', nextGalleryMedia);
}
function handleGalleryKeydown(event) {
  if (event.key === 'Escape') {
    closeGalleryModal();
  } else if (event.key === 'ArrowRight') {
    if (currentMediaIndex < currentPhotographerMedia.length - 1) {
      nextGalleryMedia();
    }
  } else if (event.key === 'ArrowLeft') {
    if (currentMediaIndex > 0) {
      prevGalleryMedia();
    }
  }
}

function updateGalleryNavigationArrows() {
  const prevButton = document.querySelector('.gallery-prev');
  const nextButton = document.querySelector('.gallery-next');

  // Masquer la flèche gauche pour la première image
  if (currentMediaIndex === 0) {
    prevButton.style.display = 'none';
  } else {
    prevButton.style.display = 'block';
  }

  // Masquer la flèche droite pour la dernière image
  if (currentMediaIndex === currentPhotographerMedia.length - 1) {
    nextButton.style.display = 'none';
  } else {
    nextButton.style.display = 'block';
  }
}

function nextGalleryMedia() {
  currentMediaIndex = (currentMediaIndex + 1) % currentPhotographerMedia.length;
  openGalleryModal(currentPhotographerMedia[currentMediaIndex]);
  updateGalleryNavigationArrows();
}

function prevGalleryMedia() {
  currentMediaIndex = (currentMediaIndex - 1 + currentPhotographerMedia.length) % currentPhotographerMedia.length;
  openGalleryModal(currentPhotographerMedia[currentMediaIndex]);
  updateGalleryNavigationArrows();
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

    if (e.shiftKey) { // Si la touche Maj est enfoncée
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else { // Si la touche Maj n'est pas enfoncée
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);

  // Focus on the first element
  firstFocusableElement.focus();

  // Return function to remove the event listener
  return () => element.removeEventListener('keydown', handleKeyDown);
}

// Fonction pour ouvrir la modale de la galerie
function openGalleryModal(media) {
  // Appel à la fonction de nettoyage des gestionnaires d'événements
  cleanUpGalleryEventListeners();

  const galleryModal = document.getElementById('gallery-modal');
  const galleryContent = document.getElementById('gallery-content');
  const caption = document.getElementById('caption');

  // Vider le contenu précédent
  galleryContent.innerHTML = '';
  document.addEventListener('keydown', handleGalleryKeydown);
  let mediaElement;
  if (media.image) {
    mediaElement = document.createElement('img');
    mediaElement.src = media.path;
    mediaElement.alt = media.title;
    mediaElement.className = 'gallery-content-img';
  } else if (media.video) {
    mediaElement = document.createElement('video');
    mediaElement.src = media.path;
    mediaElement.alt = media.title;
    mediaElement.controls = true;
    mediaElement.className = 'gallery-content-video';
  }
  galleryContent.appendChild(mediaElement);
  caption.textContent = media.title;

  galleryModal.style.display = "block";
  const removeTrapFocus = trapFocus(galleryModal);

  function closeGalleryModal() {
    galleryModal.style.display = 'none';
    removeTrapFocus();
  }

  const closeButton = document.querySelector('.gallery-close');
  closeButton.addEventListener('click', closeGalleryModal);
  closeButton.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') closeGalleryModal();
  });

  const prevButton = document.querySelector('.gallery-prev');
  prevButton.addEventListener('click', prevGalleryMedia);
  prevButton.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') prevGalleryMedia();
  });

  const nextButton = document.querySelector('.gallery-next');
  nextButton.addEventListener('click', nextGalleryMedia);
  nextButton.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') nextGalleryMedia();
  });
}   
// FIN MODALE !!!!!!


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

// Fonction pour gérer le clic sur les options du sélecteur
function onOptionClicked(event) {
  const option = event.currentTarget; // Utilisation de currentTarget pour cibler l'élément cliqué
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

// Configuration des événements pour le sélecteur personnalisé
document.addEventListener('DOMContentLoaded', () => {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  selectTrigger.tabIndex = 0; // Rend le sélecteur focusable

  selectTrigger.addEventListener('click', () => toggleDropdown(selectTrigger.parentElement));

  const options = document.querySelectorAll('.custom-option');
  options.forEach(option => {
    option.addEventListener('click', onOptionClicked);
    option.tabIndex = 0; // Rend chaque option focusable
  });

  setArrowDirection(selectTrigger.parentElement, false);
});

// Fonction pour basculer l'état du sélecteur personnalisé et de la flèche
function toggleDropdown(dropdown) {
  const isOpen = dropdown.classList.toggle('open');
  setArrowDirection(dropdown, isOpen);
}

// Fonction pour définir la direction de la flèche
function setArrowDirection(dropdown, isOpen) {
  const arrow = dropdown.querySelector('.arrow');
  arrow.textContent = isOpen ? '▲' : '▼';
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

// Configuration pour chaque option du sélecteur
const options = document.querySelectorAll('.custom-option');
options.forEach(option => {
  // Ajout du gestionnaire d'événements pour la souris sur chaque option
  option.addEventListener('click', onOptionClicked);

  // Ajout du gestionnaire d'événements pour le clavier (touche "Entrée")
  option.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onOptionClicked(event);
    }
  });

  // Rend chaque option focusable
  option.tabIndex = 0;
});



// RENDRE CLICKABLE LES FILTRES 

// Configuration des événements pour le sélecteur personnalisé
document.addEventListener('DOMContentLoaded', () => {
  // Sélecteur personnalisé
  const selectTrigger = document.querySelector('.custom-select__trigger');

  // Rend le sélecteur focusable
  selectTrigger.tabIndex = 0;

  // Gestionnaire d'événements pour la souris
  selectTrigger.addEventListener('click', () => {
    const dropdown = selectTrigger.parentElement;
    toggleDropdown(dropdown);
  });

  // Gestionnaire d'événements pour le clavier
  selectTrigger.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const dropdown = selectTrigger.parentElement;
      toggleDropdown(dropdown);
    }
  });

  // Configuration pour chaque option du sélecteur
  const options = document.querySelectorAll('.custom-option');
  if (options.length > 0) {
    const firstOption = options[0];
    firstOption.classList.add('selected');
    selectTrigger.querySelector('span').textContent = firstOption.textContent;
  }

  options.forEach(option => {
    option.addEventListener('click', onOptionClicked);
    option.tabIndex = 0; // Rend chaque option focusable
  });
});


// Fonction pour basculer l'état du sélecteur personnalisé et de la flèche
function toggleDropdown(dropdown) {
  const isOpen = dropdown.classList.toggle('open');
  setArrowDirection(dropdown, isOpen);
}

// Fonction pour définir la direction de la flèche
function setArrowDirection(dropdown, isOpen) {
  const arrow = dropdown.querySelector('.arrow');
  arrow.textContent = isOpen ? '▲' : '▼';
}

// FINNNNNNNN TRIERRRRRRRRRR

// Écouteurs d'événements pour le sélecteur personnalisé et la galerie
document.addEventListener('DOMContentLoaded', () => {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  const dropdown = document.querySelector('.custom-select');
  const options = dropdown.querySelectorAll('.custom-option');

  selectTrigger.addEventListener('click', () => toggleDropdown(dropdown));
  options.forEach(option => {
    option.addEventListener('click', onOptionClicked);
  });
  setArrowDirection(dropdown, false);

  initPage();
});


// IIIIIIIIIII INIIIIITIALISER      Fonction pour initialiser la page
let isPageInitialized = false; // Variable pour suivre si la page a été initialisée

async function initPage() {
  if (isPageInitialized) {
    return; // Si la page a déjà été initialisée, ne faites rien
  }

  const photographerId = getPhotographerIdFromUrl();
  if (photographerId && isValidPhotographerId(photographerId)) {
    try {
      const photographerData = await getPhotographerData(photographerId);
      if (photographerData) {
        currentPhotographer = photographerData;
        createPhotographHeader(currentPhotographer);

        currentPhotographerMedia = await getPhotographerMedia(photographerId, currentPhotographer.name);
        console.log("Photographer media:", currentPhotographerMedia); // Débogage

        if (currentPhotographerMedia && currentPhotographerMedia.length > 0) {
          currentMediaIndex = 0;
          const mediaContainer = document.querySelector('#media-container');
          mediaContainer.innerHTML = ''; // Videz le conteneur avant d'ajouter de nouveaux éléments
          mediaContainer.appendChild(displayPhotographerMedia(currentPhotographerMedia));

          // Calculez le nombre total de likes
          const totalLikes = currentPhotographerMedia.reduce((sum, item) => sum + item.likes, 0);
          createFooter(currentPhotographer, totalLikes);
        } else {
          console.error('No media found for this photographer');
        }
      }
    } catch (error) {
      console.error('An error occurred while initializing the page:', error);
    }
  } else {
    console.error('Invalid photographer ID provided in the URL');
  }

  isPageInitialized = true; // Marquez la page comme initialisée
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
  contactButton.addEventListener('click', () => displayModal(photographer.name));
  headerSection.appendChild(contactButton);

  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';
  imageContainer.id = 'photographerImageContainer';
  imageContainer.tabIndex = 0; // Rend le conteneur focusable

  const img = document.createElement('img');
  img.src = `../../Sample Photos/Photographers ID Photos/${photographer.portrait}`;
  img.alt = `Portrait de ${photographer.name}`;
  imageContainer.appendChild(img);

  // Gestionnaire d'événements pour réagir à la touche Entrée
  imageContainer.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      displayModal(photographer.name);
    }
  });

  headerSection.appendChild(imageContainer);
  main.prepend(headerSection);
}

// Fonction pour afficher la modale de contact
function displayModal(photographerName) {
  const modal = document.getElementById("contact_modal");
  const photographerNameElement = document.getElementById("photographer-name-modal");
  
  if (photographerNameElement) {
    photographerNameElement.textContent = photographerName;
  }

  if (modal) {
    modal.style.display = "block";
  }
}

// Configuration des événements du sélecteur personnalisé
document.addEventListener('DOMContentLoaded', () => {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  const options = document.querySelectorAll('.custom-option');

  if (options.length > 0) {
    const firstOption = options[0];
    firstOption.classList.add('selected');
    selectTrigger.querySelector('span').textContent = firstOption.textContent;
  }

  selectTrigger.addEventListener('click', toggleCustomSelect);
  options.forEach(option => {
    option.removeEventListener('click', onOptionClicked);
    option.addEventListener('click', onOptionClicked);
  });
});

  