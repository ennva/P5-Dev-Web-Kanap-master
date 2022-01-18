const WEB_SERVICE = "http://localhost:3000/api/products";

/**
 * Get all products from web service API
 * @param {any} url
 * @returns {any}
 */
function getAllProducts(url) {
    fetch(url)
        .then(function (res) {
            if (res.ok) {
                return res.json();
            }
        })
        .then(function (products) {
            //let product = products[0];
            //console.log(products.length);
            let elt = document.getElementById('items');

            // variable necessaire pour collecter tous les produits en forme HTML
            let productsList = "";

            // 1er forme de boucle
            for (let index = 0; index < products.length; index++) {
                const product = products[index];
                //console.log(product);
                let innerHtml = `
            <a href="./product.html?id=${product._id}">
                <article>
                    <img src="${product.imageUrl}" alt="${product.altTxt}">
                    <h3 class="productName">${product.name}</h3>
                    <p class="productDescription">${product.description}</p>
                </article>
            </a>`;
                productsList += innerHtml;
            }


            // 2ieme forme de boucle
            /*
            products.forEach((product, index) => {
                //console.log(product);
                let innerHtml = `
            <a href="./product.html?id=${product._id}">
                <article>
                    <img src="${product.imageUrl}" alt="${product.altTxt}">
                    <h3 class="productName">${product.name}</h3>
                    <p class="productDescription">${product.description}</p>
                </article>
            </a>`;
                productsList += innerHtml;
            });
            */

            // Modification dynalique de la section id=items
            elt.innerHTML = productsList;

        })
        .catch(function (err) {
            //console.log(err);
        });
}

// Alimentation de la page d'Accueil avec tous les produits.
document.addEventListener("DOMContentLoaded", getAllProducts(WEB_SERVICE));