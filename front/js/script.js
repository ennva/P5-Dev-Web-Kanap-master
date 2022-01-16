const HOST = "http://localhost:3000"; 
fetch(HOST + '/api/products')
    .then(function(res){
        if(res.ok){
            return res.json();
        }
    })
    .then(function(products){
        //let product = products[0];
        console.log(products.length);
        let elt = document.getElementById('items');
        let productsList = "";

        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            console.log(product);
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

        elt.innerHTML = productsList;

        /*
        products.forEach((index, product) => {
            let innerHtml = document.createElement(`
            <a href="./product.html?id=${product._id}">
                <article>
                    <img src="${product.imageUrl}" alt="${product.altTxt}">
                    <h3 class="productName">${product.name}</h3>
                    <p class="productDescription">${product.description}</p>
                </article>
            </a>`);
            elt.appendChild(innerHtml);
        });
        */
        /*
        elt.innerHTML = `
        <a href="./product.html?id=${product._id}">
            <article>
                <img src="${product.imageUrl}" alt="${product.altTxt}">
                <h3 class="productName">${product.name}</h3>
                <p class="productDescription">${product.description}</p>
            </article>
        </a>`;
        */
    })
    .catch(function(err){
        console.log(err);
    });