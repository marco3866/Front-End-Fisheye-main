function photographerTemplate(data, mediaData) {
    const { id, name, city, country, tagline, price, portrait } = data;
    const picture = `../../Sample Photos/Photographers ID Photos/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement('article');
        article.addEventListener('click', function() {
            location.href = `photographer.html?id=${id}`;
        });

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        const img = document.createElement('img');
        img.setAttribute("src", picture);
        img.setAttribute("alt", `Portrait de ${name}`);
        imageContainer.appendChild(img);

        const h2 = document.createElement('h2');
        h2.textContent = name;

        const locationElem = document.createElement('p');
        locationElem.textContent = `${city}, ${country}`;
        locationElem.className = 'location';

        const taglineElem = document.createElement('p');
        taglineElem.textContent = tagline;
        taglineElem.className = 'tagline';

        const priceElem = document.createElement('p');
        priceElem.textContent = `${price}€/jour`;
        priceElem.className = 'price';

        article.appendChild(imageContainer);
        article.appendChild(h2);
        article.appendChild(locationElem);
        article.appendChild(taglineElem);
        article.appendChild(priceElem);

        // Fonction pour déterminer le chemin du média
        function getMediaPath(media) {
            if (media.image) {
                return `../../Sample Photos/${name}/${media.image}`;
            } else if (media.video) {
                return `../../Sample Photos/${name}/${media.video}`;
            }
            return '';
        }

        // Ajout des informations média
        if (mediaData && mediaData.length > 0) {
            mediaData.forEach(media => {
                if (media.photographerId === id) {
                    const mediaElem = document.createElement('div');
                    mediaElem.className = 'media-element';

                    if (media.image) {
                        const mediaImg = document.createElement('img');
                        mediaImg.src = getMediaPath(media);
                        mediaImg.alt = media.title;
                        mediaElem.appendChild(mediaImg);
                    } else if (media.video) {
                        const mediaVideo = document.createElement('video');
                        mediaVideo.src = getMediaPath(media);
                        mediaVideo.controls = true;
                        mediaElem.appendChild(mediaVideo);
                    }

                    const titleElem = document.createElement('h3');
                    titleElem.textContent = media.title;
                    mediaElem.appendChild(titleElem);

                    const likesElem = document.createElement('span');
                    likesElem.textContent = `Likes: ${media.likes}`;
                    mediaElem.appendChild(likesElem);

                    const dateElem = document.createElement('span');
                    dateElem.textContent = `Date: ${media.date}`;
                    mediaElem.appendChild(dateElem);

                    const priceMediaElem = document.createElement('span');
                    priceMediaElem.textContent = `Prix: ${media.price}€`;
                    mediaElem.appendChild(priceMediaElem);

                    article.appendChild(mediaElem);
                }
            });
        }

        return article;
    }

    return { getUserCardDOM };
}
