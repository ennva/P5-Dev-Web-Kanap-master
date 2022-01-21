const WEB_SERVICE = "http://localhost:3000/api/products/";
const WEB_SERVICE_ORDER = "http://localhost:3000/api/products/order";

// obtenir orderId si la commande est envoyee
const lien = window.location.href; // url = document.URL

// 1er methode pour recuperer l'ID du produit
let url = new URL(lien);
let orderId = url.searchParams.get('orderId');
//ajouner la page confirmation si l'orderId est present dans l'URL
if (orderId) {
  document.getElementById("orderId").innerText = orderId;
}

/**
 * Function pour Appeller l'API et obtenir l'info sur le Produit
 * @param {any} id du produit
 * @returns {any} , Retour une Promise
 */
function getArticleInfo(id) {
  return fetch(WEB_SERVICE + id)
    .then(function (res) {
      if (res.ok) {
        return res.json();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

/**
 * Description
 * @param {any} orderJson
 * @returns {any}
 */
function sendOrder(orderJson) {
  fetch(WEB_SERVICE_ORDER, {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderJson)
  })
    .then(function (response) {
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      //recuper orderId
      let orderId = data.orderId;
      //Rediriger l’utilisateur sur la page Confirmation,
      window.location.href = './confirmation.html?orderId=' + orderId;
      //document.querySelector(".cart__order__form").action = './confirmation.html?orderId=' + orderId;
      //document.querySelector(".cart__order__form").submit();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/**
 * Function necessaire pour ajourner la liste des produits
 * @param {any} nodes
 * @returns {any}
 */
function updateCartItems(nodes) {
  let totalPrice = 0;
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    const prom = getArticleInfo(element.dataset.id);
    prom.then((p) => {
      element.querySelector(".cart__item__img").innerHTML = `<img src="${p.imageUrl}" alt="${p.altTxt}">`;
      element.querySelector(".cart__item__content__description").querySelector(':nth-child(3)').innerText = p.price + ' €';
      totalPrice += parseInt(p.price) * parseInt(element.querySelector(".itemQuantity").value);
      document.getElementById('totalPrice').innerText = totalPrice;
    });
  }
}

function updateTotalCartPrice(articles) {
  let total = 0;
  if (articles.length > 0) {
    for (let index = 0; index < articles.length; index++) {
      const article = articles[index];
      let priceText = article.querySelector(".cart__item__content__description").querySelector(':nth-child(3)').innerText;
      let priceNumber = parseInt(priceText.split(" ")[0]); console.log("PRICE=" + priceNumber);
      let quantityNumber = parseInt(article.querySelector(".itemQuantity").value);
      total += priceNumber * quantityNumber;
      console.log(total);
    }
    document.getElementById('totalPrice').innerText = total;
  }
}


/**
 * Function pour ajourner la quantite de produit
 * @param {any} event: ce parametre est utile pour ecouter l'event change
 * @returns {any}
 */
function changeProductQuantity(event) {
  //Article dont la quantite veut etre change
  // event.target = pour retrouver l'element dont la quantite veut etre change
  let elt = event.target.closest("article");
  //Nouvelle quantite
  let newQty = event.target.value;
  let categorie = event.target.closest("article > div").querySelector(".cart__item__content__description > h2").innerText;
  let id = elt.dataset.id;
  let color = elt.dataset.color;
  let productsArrayJson = JSON.parse(localStorage.getItem(categorie));
  let index = findProductOnLocalStorage(productsArrayJson, id, color);
  if (index) {
    //console.log(productsArrayJson[index]);
    productsArrayJson[index].quantity = parseInt(newQty);
    localStorage.setItem(categorie, JSON.stringify(productsArrayJson))
  }
  updateCartItems(document.getElementById('cart__items').childNodes);
  document.getElementById("totalQuantity").innerText = getTotalArticleInCart();
}

/**
 * Function pour supprimer le produit dans le panier
 * @param {any} event
 * @returns {any}
 */
function removeProductCart(event) {
  let element = event.target;
  // Verifier si c'est le button Supprimer qui a ete cliquer
  let deleteItem = element.getAttribute("class");
  if (deleteItem == "deleteItem") {
    //recuperer ID et COLOR de l'article
    let article = element.closest("article")
    console.log(article);
    let categorie = event.target.closest("article > div").querySelector(".cart__item__content__description > h2").innerText;
    let id = article.dataset.id;
    let color = article.dataset.color;
    let productsArrayJson = JSON.parse(localStorage.getItem(categorie));
    let index = findProductOnLocalStorage(productsArrayJson, id, color);
    if (index) {
      console.log(productsArrayJson[index]);
      productsArrayJson.splice(index, 1);
      localStorage.setItem(categorie, JSON.stringify(productsArrayJson))
    }
    showCartItems();
    document.getElementById("totalQuantity").innerText = getTotalArticleInCart();
    //updateTotalCartPrice(document.getElementById('cart__items').childNodes);
  }
}

/**
 * Function pour Chercher le produit dans le localStorage
 * @param {any} productsArrayJson
 * @param {any} id
 * @param {any} color
 * @returns {any}
 */
function findProductOnLocalStorage(productsArrayJson, id, color) {
  let found = false;
  let index;
  for (let i in productsArrayJson) {
    const productJson = productsArrayJson[i];
    if (productJson.id == id &&
      productJson.color == color) {
      found = true;
      index = i;
      break;
    }
  }

  //produit dans la categorie
  //return productsArrayJson[index];
  if (found) {
    return index;
  }

  return found;
}

/**
 * Function pour obtenir le Total des articles dans le panier
 * @returns {any}
 */
function getTotalArticleInCart() {
  let total = 0;
  for (let index = 0; index < localStorage.length; index++) {
    let categorie = localStorage.key(index);
    let produits_de_la_categorie = JSON.parse(localStorage.getItem(categorie));
    for (let j in produits_de_la_categorie) {
      product = produits_de_la_categorie[j];
      total += parseInt(product.quantity);
    }
  }
  return parseInt(total);
}

/**
 * Function pour lister tout les produits dans le panier
 * @returns {any}
 */
function showCartItems() {
  let panierHtml = "";
  let cartItemsId = document.getElementById('cart__items');

  //Je verifie qu'on est bien dans la page panier
  if (cartItemsId) {
    document.getElementById('totalPrice').innerText = 0;

    for (let i = 0; i < localStorage.length; i++) {
      let categorie = localStorage.key(i);
      //console.log(categorie);
      let produits_de_la_categorie = JSON.parse(localStorage.getItem(categorie));
      //console.log(produits_de_la_categorie);
      for (let j in produits_de_la_categorie) {
        product = produits_de_la_categorie[j];
        panierHtml += `<article class="cart__item" data-id="${product.id}" data-color="${product.color}">
    <div class="cart__item__img">
      <img src="" alt="Photographie d'un canapé">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__description">
        <h2>${categorie}</h2>
        <p>${product.color}</p>
        <p>242 €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.quantity}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
    </article>`
      }
    }
    cartItemsId.innerHTML = panierHtml;
    updateCartItems(document.getElementById('cart__items').childNodes);
    document.getElementById("totalQuantity").innerText = getTotalArticleInCart();
  }

}

function validationEmail(email) {
  let expressionReguliere = /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
  if (!expressionReguliere.test(email) || email == "") {
    return false;
  }
  return true;
}

function validateFistLastName(name) {
  //let expressionReguliere = /\A([ áàíóúéëöüñÄĞİŞȘØøğışÐÝÞðýþA-Za-z-']*)\z/;
  //if (!expressionReguliere.test(name) || name == "") {
  if (name == "") {
    return false;
  }
  return true;
}

/**
 * Decoder les character dangereux pour le server
 * @param {any} str
 * @returns {any}
 */
function HTMLEncode(str) {
  var i = str.length,
    aRet = [];

  while (i--) {
    var iC = str[i].charCodeAt();
    if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
      aRet[i] = '&#' + iC + ';';
    } else {
      aRet[i] = str[i];
    }
  }
  return aRet.join('');
}

function order(event) {
  event.preventDefault();
  let submit = true;
  let orderJson = {
    contact: {
      "firstName": "firstName",
      "lastName": "lastName",
      "address": "address",
      "city": "city",
      "email": "nepthta@libero.it"
    },
    products: []
  }
  //desactiver la validation HTML5
  ////document.querySelector(".cart__order__form").setAttribute("novalidate","novalidate")
  //recuperer les donnees saisies par l'utilisteur
  let firstname = document.getElementById("firstName").value;
  let lastname = document.getElementById("lastName").value;
  let address = document.getElementById("address").value;
  let city = document.getElementById("city").value;
  let email = document.getElementById("email").value;

  //control champ vide
  if (!validateFistLastName(firstname)) {
    document.getElementById("firstNameErrorMsg").innerText = "Le prénom n'est pas valide";
    document.getElementById("firstNameErrorMsg").style.color = 'red';
    submit = false;
  } else {
    document.getElementById("firstNameErrorMsg").innerText = "";
  }
  if (!validateFistLastName(lastname)) {
    document.getElementById("lastNameErrorMsg").innerText = "Le nom n'est pas valide";
    document.getElementById("lastNameErrorMsg").style.color = 'red';
    submit = false;
  } else {
    document.getElementById("lastNameErrorMsg").innerText = "";
  }
  if (!validateFistLastName(address)) {
    document.getElementById("addressErrorMsg").innerText = "Le champ est vide";
    document.getElementById("addressErrorMsg").style.color = "red";
    submit = false;
  } else {
    document.getElementById("addressErrorMsg").innerText = "";
  };
  if (!validateFistLastName(city)) {
    document.getElementById("cityErrorMsg").innerText = "Le champ est vide";
    document.getElementById("cityErrorMsg").style.color = "red";
    submit = false;
  } else {
    document.getElementById("cityErrorMsg").innerText = "";
  };
  if (!validateFistLastName(email)) {
    document.getElementById("emailErrorMsg").innerText = "Le champ est vide";
    document.getElementById("emailErrorMsg").style.color = "red";
    submit = false;
  } else {
    document.getElementById("emailErrorMsg").innerText = "";
  };
  //validation email
  if (validationEmail(email)) {
    console.log(email);
  } else {
    document.getElementById("emailErrorMsg").innerText = "L'adresse mail n'est pas valide";
    document.getElementById("emailErrorMsg").style.color = 'red';
    submit = false;
  }

  if (submit) {
    let productInCart = false;
    orderJson.contact.firstName = HTMLEncode(firstname);
    orderJson.contact.lastName = HTMLEncode(lastname);
    orderJson.contact.address = HTMLEncode(address);
    orderJson.contact.city = HTMLEncode(city);
    orderJson.contact.email = email;

    console.log(localStorage);
    let countProduct = 0;
    for (let i = 0; i < localStorage.length; i++) {
      let categorie = localStorage.key(i);
      let produits_de_la_categorie = JSON.parse(localStorage.getItem(categorie));
      countProduct += produits_de_la_categorie.length;
      for (let j in produits_de_la_categorie) {
        product = produits_de_la_categorie[j];
        console.log(product);
        orderJson.products.push(product.id);
      }
    }
    //console.log(orderJson);
    if(countProduct > 0){
      sendOrder(orderJson);
    } else {
      let messageDiv = document.createElement('div');
      messageDiv.innerText  = "Pas de produit dans le panier";
      messageDiv.style.color = 'red';
      document.getElementById("order").parentNode.insertBefore(messageDiv,document.getElementById("order").nextSibling);

    }
  }
}

//Chargement de la liste des produits present dans le localStorage
document.addEventListener("DOMContentLoaded", showCartItems);
//Changement de la quantite de produit
if (document.querySelector("#cart__items")) {
  document.querySelector("#cart__items").addEventListener('change', changeProductQuantity);
}
//Supression du produit
if (document.querySelector("#cart__items")) {
  document.querySelector("#cart__items").addEventListener('click', removeProductCart);
}
//commander
if (document.getElementById("order")) {
  document.getElementById("order").addEventListener('click', order);
}

