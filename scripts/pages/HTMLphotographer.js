let totalLikesCount = 0; // Ce sera mis à jour avec le total initial des likes
let currentMediaIndex = 0;
let currentPhotographerMedia = []; // Cette variable doit être définie globalement

// Function next gallerymedia
function nextGalleryMedia() {
  console.log("Current index before increment:", currentMediaIndex);
  currentMediaIndex = (currentMediaIndex + 1) % currentPhotographerMedia.length;
  console.log("Current index after increment:", currentMediaIndex, "Media length:", currentPhotographerMedia.length);
  openGalleryModal(currentPhotographerMedia[currentMediaIndex]);
}
// Function prev gallery
function prevGalleryMedia() {
  currentMediaIndex = (currentMediaIndex - 1 + currentPhotographerMedia.length) % currentPhotographerMedia.length;
  openGalleryModal(currentPhotographerMedia[currentMediaIndex]);
}

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
      // Code pour incrémenter les likes
      incrementLikes(likeCount, mediaId);
  });

  // Gestionnaire d'événements pour le clavier
  likesContainer.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          // Code pour incrémenter les likes
          incrementLikes(likeCount, mediaId);
      }
  });

  return likesContainer;
}

// Fonction pour incrémenter les likes
function incrementLikes(likeCountElement, mediaId) {
  const currentLikes = parseInt(likeCountElement.textContent, 10);
  likeCountElement.textContent = currentLikes + 1;
  // Ici, vous pouvez ajouter toute logique supplémentaire nécessaire, 
  // comme la mise à jour du total des likes ou des données côté serveur
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
// Function to trap focus within a given element
// Function to trap focus within a given element
// Function to trap focus within the gallery modal
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

// Function to open gallery modal
function openGalleryModal(media) {
  const galleryModal = document.getElementById('gallery-modal');
  const galleryContent = document.getElementById('gallery-content');
  const caption = document.getElementById('caption');

  // Clear previous content
  galleryContent.innerHTML = '';

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




// RENDRE CLICKABLE LES FILTRES 

// Configuration des événements pour le sélecteur personnalisé
document.addEventListener('DOMContentLoaded', () => {
  // Code pour rendre le sélecteur focusable et gérer les événements de souris et de clavier
  const selectTrigger = document.querySelector('.custom-select__trigger');
  selectTrigger.tabIndex = 0; // Rend le sélecteur focusable

  // Gestionnaire d'événements pour la souris
  selectTrigger.addEventListener('click', () => {
    toggleDropdown(selectTrigger.parentElement);
  });

  // Gestionnaire d'événements pour le clavier
  selectTrigger.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleDropdown(selectTrigger.parentElement);
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
  arrow.style.display = 'block';
}

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

  const prevArrow = document.querySelector('.gallery-prev');
  const nextArrow = document.querySelector('.gallery-next');

  if (prevArrow && nextArrow) {
    prevArrow.addEventListener('click', prevGalleryMedia);
    nextArrow.addEventListener('click', nextGalleryMedia);
  }

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

document.addEventListener('DOMContentLoaded', () => {
  // Sélection des boutons
  const closeButton = document.querySelector('.gallery-close');
  const prevButton = document.querySelector('.gallery-prev');
  const nextButton = document.querySelector('.gallery-next');

  // Rendre les boutons focusables
  closeButton.tabIndex = 0;
  prevButton.tabIndex = 0;
  nextButton.tabIndex = 0;

  // Gestionnaire d'événements pour le clavier et la souris pour le bouton de fermeture
  closeButton.addEventListener('click', closeGalleryModal);  // Souris
  closeButton.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          closeGalleryModal();  // Clavier
      }
  });

  // Gestionnaire d'événements pour le clavier et la souris pour le bouton précédent
  prevButton.addEventListener('click', prevGalleryMedia);  // Souris
  prevButton.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          prevGalleryMedia();  // Clavier
      }
  });

  // Gestionnaire d'événements pour le clavier et la souris pour le bouton suivant
  nextButton.addEventListener('click', nextGalleryMedia);  // Souris
  nextButton.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          nextGalleryMedia();  // Clavier
      }
  });
});
  
