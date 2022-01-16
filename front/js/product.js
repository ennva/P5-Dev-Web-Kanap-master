const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const product_id = urlParams.get('id');
console.log(product_id);
const HOST = "http://localhost:3000";

fetch(HOST + '/api/products/' + product_id)
    .then(function(res){
        if(res.ok){
            return res.json();
        }
    })
    .then(function(product){
        console.log(product);
        let img = document.querySelector(".item__img"); 
        let title = document.getElementById('title');
        let price = document.getElementById('price');
        let description = document.getElementById('description');
        let select = document.getElementById('colors');

        img.innerHTML = `<img src="${product.imageUrl}" alt="Photographie d'un canapé">`;
        title.innerHTML = product.name;
        price.innerHTML = product.price;
        description.innerHTML = product.description;
        for (let index = 0; index < product.colors.length; index++) {
            const color = product.colors[index];
            let el = document.createElement('option');
            el.textContent = color;
            el.value = index;
            select.appendChild(el);
        }

    })
    .catch(function(err){
        console.log(err);
    });
