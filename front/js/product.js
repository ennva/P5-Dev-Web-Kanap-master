// obtenir L'URL du produit qui à été clicker dans la page d'accueil
const lien = window.location.href; // url = document.URL

// 1er methode pour recuperer l'ID du produit
let url = new URL(lien);
let id = url.searchParams.get('id');
//console.log(id)

// 2ieme methode pour recuperer l'ID du produit
/*
let url = new URL(lien);
let search_params = new URLSearchParams(url.search);
let id = "";
//console.log(search_params.has('id'))
if (search_params.has('id')) {
    id = search_params.get('id');
    console.log(id)
}
*/

// 3ieme methode pour recuperer l'ID du produit
/*
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');
console.log(id);
*/

const WEB_SERVICE = "http://localhost:3000/api/products/" + id;

function saveProductDetail(product) {
    // recuperation de tous les elements du DOM à modifier
    let img = document.querySelector(".item__img");
    let title = document.getElementById('title');
    let price = document.getElementById('price');
    let description = document.getElementById('description');
    let select = document.getElementById('colors');
    let article = document.querySelector('article');

    // Modification des elements
    // Sauver l'ID du produit dans le DOM
    article.setAttribute("id", product._id);
    //
    img.innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`;
    title.textContent = product.name;
    price.textContent = product.price;
    description.textContent = product.description;
    // Modification de la select
    for (let index = 0; index < product.colors.length; index++) {
        const color = product.colors[index];
        let el = document.createElement('option');
        el.textContent = color;
        //el.value = index;
        el.value = color;
        select.appendChild(el);
    }
}

/**
 * function pour obtenir les details d'un produit
 * @param {any} url
 * @returns {any}
 */
function getProduct(url) {
    fetch(url)
        .then(function (res) {
            if (res.ok) {
                product_details = res.json();
                return product_details;
            }
        })
        .then(function (product) {
            console.log(product);
            saveProductDetail(product);
        })
        .catch(function (err) {
            console.log(err);
        });
}

/**
 * Ajouter les produit dans le localStorage
 * @returns {any}
 */
function addToCart() {
    let produit = {
        id: "0",
        quantity: 0,
        color: ""
    }

    // Recuperation des données du produit (ID, quantité, couleur, categorie)
    let article_id = document.getElementsByTagName('article')[0].getAttribute('id');
    //console.log(article_id);
    let quantite = document.getElementById('quantity').value;
    //console.log(quantite);
    let selectColor = document.getElementById('colors').value;
    //let selectColor = document.getElementById('colors').options[select_colors.selectedIndex].value;
    //console.log(selectColor);
    let categorie = document.getElementById('title').innerText;
    //console.log(categorie);

    // Valoriser l'objet produit avant de le sauver dans le local storage
    produit.id = article_id;
    produit.quantity = parseInt(quantite);
    produit.color = selectColor;
    //console.log(produit);

    /** 
     * Acceder au localStorage qui n'est nul autre qu'un Array.
     * Ajouter le produit dans le localStorage en verifiant 
     * 1- si celui-ci n'était pas déjà présent dans le panier, on ajoute un nouvel élément dans l’array
     * 2- si celui-ci était déjà présent dans le panier (même id + même couleur), on incrémente simplement la quantité du produit correspondant dans l’array
    */
    //console.log(localStorage);
    if (produit.color != "" && produit.quantity > 0) { //Je sauvegade si la couleur et la quantité a été choisi
        if (localStorage.getItem(categorie)) {
            //console.log(localStorage.getItem(categorie));
            //liste de produits dans la categorie
            let productsArrayJson = JSON.parse(localStorage.getItem(categorie));
            //console.log(productsArrayJson);
            //variable pour verifier si le produit(meme ID, meme color) existe dans le localStorage
            let found = false;
            let index;

            for (let i in productsArrayJson) {
                const productJson = productsArrayJson[i];
                if (productJson.id == produit.id &&
                    productJson.color == produit.color) {
                    //console.log(productJson);
                    found = true;
                    index = i;
                    break;
                }

            }

            if (found) {
                //produit dans la categorie
                productsArrayJson[index].quantity = parseInt(productsArrayJson[index].quantity) + parseInt(produit.quantity);
            } else {
                productsArrayJson.push(produit);
            }

            localStorage.setItem(categorie, JSON.stringify(productsArrayJson));
            //console.log(localStorage.getItem(categorie));
        }
        else {

            let arrayDeProduits = [];
            arrayDeProduits.push(produit);
            let productsLinea = JSON.stringify(arrayDeProduits);
            localStorage.setItem(categorie, productsLinea);
            console.log(localStorage.getItem(categorie));
        }

    }

}

// Alimenter les données du produit lorsque la page est chargée 
document.addEventListener("DOMContentLoaded", getProduct(WEB_SERVICE));

// Ajouter le produit dans le panier quand bouton "Ajouter au panier" est cliqué
document.getElementById('addToCart').addEventListener("click", addToCart);
