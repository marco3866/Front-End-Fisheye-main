let totalLikesCount = 0; // Ce sera mis à jour avec le total initial des likes
let currentMediaIndex = 0;
let currentPhotographerMedia = []; // Cette variable doit être définie globalement
let indexMap = {};

// Fonction pour récupérer l'ID du photographe depuis l'URL
function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const photographerId = urlParams.get('id');
  console.log(`Photographer ID from URL: ${photographerId}`); // Log de l'ID récupéré
  return photographerId;
}

// Fonction pour valider l'ID du photographe
function isValidPhotographerId(id) {
  const isValid = id && !isNaN(parseInt(id));
  console.log(`Is Photographer ID valid: ${isValid}`); // Log de la validation de l'ID
  return isValid;
}

// Fonction pour effectuer une requête HTTP et gérer les erreurs
async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Data fetched successfully:', data); // Log des données récupérées
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Fonction pour charger les données du photographe
async function getPhotographerData(photographerId) {
  try {
    const data = await fetchJson('../photographers.json');
    const photographerData = data.photographers.find(p => p.id.toString() === photographerId);
    console.log('Photographer data:', photographerData); // Log des données du photographe
    return photographerData;
  } catch (error) {
    console.error('Error getting photographer data:', error);
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
      mediaImgContainer.setAttribute('role', 'button'); // Ajout du rôle de bouton pour accessibilité
      mediaImgContainer.setAttribute('aria-label', `Afficher ${m.title} en grand`); // Description pour lecteurs d'écran

      const mediaItem = m.image ? document.createElement('img') : document.createElement('video');
      mediaItem.alt = m.title;
      mediaItem.className = 'media-img';
      if (m.video) {
          const videoSource = document.createElement('source');
          videoSource.src = m.path;
          videoSource.type = 'video/mp4';
          mediaItem.appendChild(videoSource);
          mediaItem.controls = true;
      } else {
          mediaItem.src = m.path;
      }

      // Gestionnaire d'événements pour la souris
      mediaImgContainer.addEventListener('click', () => {
          openGalleryModal(m, index);
      });

      // Gestionnaire d'événements pour le clavier
      mediaImgContainer.addEventListener('keypress', (event) => {
          if (event.key === 'Enter') {
              openGalleryModal(m, index);
          }
      });

      mediaImgContainer.appendChild(mediaItem);
      mediaElement.appendChild(mediaImgContainer);

      const mediaDetails = document.createElement('div');
      mediaDetails.className = 'media-details';

      const titleElem = document.createElement('h3');
      titleElem.textContent = m.title;
      mediaDetails.appendChild(titleElem);

      const likesElem = createLikeElement(m.likes, m.id);
      mediaDetails.appendChild(likesElem);

      mediaElement.appendChild(mediaDetails);
      mediaGridContainer.appendChild(mediaElement);
  });

  return mediaGridContainer;
}

// GALLERY MODAL SCRIPT

// Fonction pour nettoyer les gestionnaires d'événements de la galerie
function cleanUpGalleryEventListeners() {
  const prevButton = document.querySelector('.gallery-prev');
  const nextButton = document.querySelector('.gallery-next');

  if (prevButton) prevButton.removeEventListener('click', prevGalleryMedia);
  if (nextButton) nextButton.removeEventListener('click', nextGalleryMedia);
}

// Fonction pour gérer les touches du clavier dans la galerie
function handleGalleryKeydown(event) {
  if (event.key === 'Escape') {
    closeGalleryModal();
  } else if (event.key === 'ArrowRight') {
    nextGalleryMedia();
  } else if (event.key === 'ArrowLeft') {
    prevGalleryMedia();
  }
}

// Fonction pour ouvrir la modale de la galerie et afficher les médias
function openGalleryModal(media, index) {
  // Mise à jour de l'index actuel en fonction de la cartographie après le tri
  currentMediaIndex = indexMap.hasOwnProperty(index) ? indexMap[index] : index;
  
  console.log(`Ouverture du média numéro ${currentMediaIndex}: ${media.title}`); // Log pour le débogage

  cleanUpGalleryEventListeners();

  const galleryModal = document.getElementById('gallery-modal');
  const galleryContent = document.getElementById('gallery-content');
  const caption = document.getElementById('caption');
  galleryContent.innerHTML = '';

  let mediaElement;
  if (media.image) {
    mediaElement = document.createElement('img');
    mediaElement.src = media.path;
    mediaElement.alt = media.title;
    mediaElement.className = 'gallery-content-img';
    mediaElement.setAttribute('role', 'img');
    mediaElement.setAttribute('aria-label', `Image agrandie : ${media.title}`);
  } else if (media.video) {
    mediaElement = document.createElement('video');
    mediaElement.src = media.path;
    mediaElement.alt = media.title;
    mediaElement.controls = true;
    mediaElement.className = 'gallery-content-video';
    mediaElement.setAttribute('role', 'video');
    mediaElement.setAttribute('aria-label', `Vidéo agrandie : ${media.title}`);
  }
  galleryContent.appendChild(mediaElement);
  caption.textContent = media.title;

  galleryModal.style.display = "block";
  galleryModal.setAttribute('aria-modal', 'true');
  galleryModal.setAttribute('role', 'dialog');
  galleryModal.setAttribute('aria-labelledby', caption.id);

  trapFocus(galleryModal);

  document.addEventListener('keydown', handleGalleryKeydown);

  updateGalleryNavigationArrows();
}

// Fonction pour fermer la modale de la galerie
function closeGalleryModal() {
  const galleryModal = document.getElementById('gallery-modal');
  if (galleryModal) {
    galleryModal.style.display = 'none';
    document.removeEventListener('keydown', handleGalleryKeydown);
  }
}

// Fonction pour mettre à jour la visibilité des flèches de navigation
function updateGalleryNavigationArrows() {
  const prevButton = document.querySelector('.gallery-prev');
  const nextButton = document.querySelector('.gallery-next');

  prevButton.style.display = currentMediaIndex === 0 ? 'none' : 'block';
  nextButton.style.display = currentMediaIndex === currentPhotographerMedia.length - 1 ? 'none' : 'block';
}

// Fonction pour naviguer au média suivant
function nextGalleryMedia() {
  currentMediaIndex = (currentMediaIndex + 1) % currentPhotographerMedia.length;
  const nextMedia = currentPhotographerMedia[currentMediaIndex];
  console.log(`Passage au média suivant, index ${currentMediaIndex}`);
  openGalleryModal(nextMedia, currentMediaIndex);
}

// Fonction pour naviguer au média précédent
function prevGalleryMedia() {
  currentMediaIndex = (currentMediaIndex - 1 + currentPhotographerMedia.length) % currentPhotographerMedia.length;
  const prevMedia = currentPhotographerMedia[currentMediaIndex];
  console.log(`Passage au média précédent, index ${currentMediaIndex}`);
  openGalleryModal(prevMedia, currentMediaIndex);
}

// Fonction pour piéger le focus dans la modale
function trapFocus(element) {
  const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    let isTabPressed = e.key === 'Tab';
    if (!isTabPressed) return;

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
  });

  firstFocusableElement.focus();
  return () => element.removeEventListener('keydown', handleKeyDown);
}

// FIN MODALE GALLERY


// Fonction pour trier les médias
// Fonction pour trier les médias en fonction de l'option sélectionnée
function sortMedia(media, sortBy) {
  let sortedMedia = [...media];
  indexMap = {}; // Réinitialisation de la cartographie des indices

  // Tri des médias en fonction du critère sélectionné
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

  // Mise à jour de la cartographie des indices après le tri
  sortedMedia.forEach((item, newIndex) => {
      const originalIndex = indexMap[item.id];
      indexMap[originalIndex] = newIndex;
  });

  console.log("Médias triés et indexMap mis à jour", indexMap); // Log pour le débogage
  return sortedMedia;
}

// Fonction pour afficher les médias triés
// Fonction pour afficher les médias triés
function displaySortedMedia(sortedMedia) {
  const mediaContainer = document.querySelector('#media-container');
  if (mediaContainer) {
    mediaContainer.innerHTML = '';
    const newMediaGrid = displayPhotographerMedia(sortedMedia);
    mediaContainer.appendChild(newMediaGrid);

    // Mise à jour de currentPhotographerMedia avec les médias triés
    currentPhotographerMedia = sortedMedia;

    // Trouver l'index actuel dans le nouveau tableau trié
    const currentMedia = currentPhotographerMedia.find(media => media.id === currentMediaId);
    currentMediaIndex = currentPhotographerMedia.indexOf(currentMedia);
  }
}

// Fonction pour gérer le clic sur les options du sélecteur
function onOptionClicked(event) {
  const option = event.currentTarget;
  const dropdown = option.closest('.custom-select');
  const triggerSpan = dropdown.querySelector('.custom-select__trigger span');
  const selectedValue = option.getAttribute('data-value');

  updateSelectedOption(dropdown, option);
  triggerSpan.textContent = option.textContent;

  const photographerId = getPhotographerIdFromUrl();
  if (photographerId) {
    getPhotographerMedia(photographerId).then(media => {
      const sortedMedia = sortMedia(media, selectedValue);
      displaySortedMedia(sortedMedia);
    });
  }

  dropdown.classList.remove('open');
}

// Fonction pour mettre à jour l'option sélectionnée dans le sélecteur
function updateSelectedOption(dropdown, selectedOption) {
  const options = dropdown.querySelectorAll('.custom-option');
  options.forEach(opt => {
    opt.classList.remove('selected');
    opt.setAttribute('aria-selected', 'false');
  });

  selectedOption.classList.add('selected');
  selectedOption.setAttribute('aria-selected', 'true');
  selectedOption.setAttribute('aria-label', `Trié par ${selectedOption.textContent}`);
}

// Configuration des événements pour le sélecteur personnalisé
document.addEventListener('DOMContentLoaded', () => {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  selectTrigger.tabIndex = 0;

  selectTrigger.addEventListener('click', () => {
    toggleDropdown(selectTrigger.parentElement);
    selectTrigger.setAttribute('aria-label', selectTrigger.getAttribute('aria-expanded') === 'true' ? "Cliquez pour fermer le menu de tri" : "Cliquez pour ouvrir le menu de tri");
  });

  const options = document.querySelectorAll('.custom-option');
  options.forEach(option => {
    option.addEventListener('click', onOptionClicked);
    option.tabIndex = 0;
    option.setAttribute('aria-label', `Trié par ${option.textContent}`);
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
  option.addEventListener('click', onOptionClicked);
  option.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onOptionClicked(event);
    }
  });
  option.tabIndex = 0;
});

// RENDRE CLICKABLE LES FILTRES 
document.addEventListener('DOMContentLoaded', () => {
  const selectTrigger = document.querySelector('.custom-select__trigger');
  selectTrigger.tabIndex = 0;

  selectTrigger.addEventListener('click', () => {
    toggleDropdown(selectTrigger.parentElement);
  });

  selectTrigger.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleDropdown(selectTrigger.parentElement);
    }
  });

  const options = document.querySelectorAll('.custom-option');
  if (options.length > 0) {
    const firstOption = options[0];
    firstOption.classList.add('selected');
    selectTrigger.querySelector('span').textContent = firstOption.textContent;
  }

  options.forEach(option => {
    option.addEventListener('click', onOptionClicked);
    option.tabIndex = 0;
  });
});

// FIN TRIAGE


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

  options.forEach(option => {
    option.removeEventListener('click', onOptionClicked);
    option.addEventListener('click', onOptionClicked);
  });
});

  