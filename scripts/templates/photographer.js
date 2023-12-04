function photographerTemplate(data) {
    const { name, city, country, tagline, price, portrait } = data;
    const picture = `../../Sample Photos/Photographers ID Photos/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement('article');
        
        // Créer le conteneur pour l'image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        // Créer et configurer l'élément img pour l'image de profil
        const img = document.createElement('img');
        img.setAttribute("src", picture);
        img.setAttribute("alt", `Portrait de ${name}`);
        imageContainer.appendChild(img); // Ajouter l'image au conteneur

        // Créer et configurer l'élément h2 pour le nom
        const h2 = document.createElement('h2');
        h2.textContent = name;

        // Ajouter plus d'éléments pour les autres informations
        const location = document.createElement('p');
        location.textContent = `${city}, ${country}`;
        location.className = 'location';

        const taglineElem = document.createElement('p');
        taglineElem.textContent = tagline;
        taglineElem.className = 'tagline';

        const priceElem = document.createElement('p');
        priceElem.textContent = `${price}€/jour`;
        priceElem.className = 'price';

        // Ajouter les nouveaux éléments au DOM
        article.appendChild(imageContainer); // Important: ajouter le conteneur de l'image au lieu de l'image elle-même
        article.appendChild(h2);
        article.appendChild(location);
        article.appendChild(taglineElem);
        article.appendChild(priceElem);

        return article;
    }
    return { getUserCardDOM };
}
