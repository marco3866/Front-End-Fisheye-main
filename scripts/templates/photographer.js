function photographerTemplate(data) {
    // Destructuration des données du photographe
    const { id, name, city, country, tagline, price, portrait } = data;
    // Le chemin relatif vers les images des photographes
    const picture = `../../Sample Photos/Photographers ID Photos/${portrait}`;

    function getUserCardDOM() {
        // Création de l'élément 'article' qui contiendra les informations du photographe
        const article = document.createElement('article');

        // Ajout d'un gestionnaire d'événements 'click' pour rediriger vers la page du photographe
        article.addEventListener('click', function() {
            location.href = `photographer.html?id=${id}`;
        });

        // Création et configuration du conteneur pour l'image de profil
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        // Création et configuration de l'élément 'img' pour l'image de profil
        const img = document.createElement('img');
        img.setAttribute("src", picture);
        img.setAttribute("alt", `Portrait de ${name}`);
        imageContainer.appendChild(img);  // Ajout de l'image au conteneur

        // Création et configuration de l'élément 'h2' pour le nom
        const h2 = document.createElement('h2');
        h2.textContent = name;

        // Création et configuration des éléments pour les autres informations
        const locationElem = document.createElement('p');
        locationElem.textContent = `${city}, ${country}`;
        locationElem.className = 'location';

        const taglineElem = document.createElement('p');
        taglineElem.textContent = tagline;
        taglineElem.className = 'tagline';

        const priceElem = document.createElement('p');
        priceElem.textContent = `${price}€/jour`;
        priceElem.className = 'price';

        // Ajout des nouveaux éléments au 'article'
        article.appendChild(imageContainer);
        article.appendChild(h2);
        article.appendChild(locationElem);
        article.appendChild(taglineElem);
        article.appendChild(priceElem);

        return article;
    }

    return { getUserCardDOM };
}