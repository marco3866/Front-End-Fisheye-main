function photographerTemplate(data) {
    const { name, id, city, country, tagline, price, portrait } = data;
    const picture = `../../Sample Photos/Photographers ID Photos/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement('article');
        
        // Créez et configurez l'élément img pour l'image de profil
        const img = document.createElement('img');
        img.setAttribute("src", picture);
        img.setAttribute("alt", `Portrait de ${name}`);

        // Créez et configurez l'élément h2 pour le nom
        const h2 = document.createElement('h2');
        h2.textContent = name;

        // Ajoutez plus d'éléments pour les autres informations
        const location = document.createElement('p');
        location.textContent = `${city}, ${country}`;
        location.className = 'location';

        const taglineElem = document.createElement('p');
        taglineElem.textContent = tagline;
        taglineElem.className = 'tagline';

        const priceElem = document.createElement('p');
        priceElem.textContent = `${price}€/jour`;
        priceElem.className = 'price';

        // Ajoutez les nouveaux éléments au DOM
        article.appendChild(img);
        article.appendChild(h2);
        article.appendChild(location);
        article.appendChild(taglineElem);
        article.appendChild(priceElem);

        return article;
    }
    return { getUserCardDOM };
}
