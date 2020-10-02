import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings} from './settings.js';

const app = {
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
    
        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /*execute initMenu method */
        thisApp.initMenu();
      });
  },

  initMenu: function(){
    const thisApp = this;
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
    
    thisApp.cart = new Cart(cartElem);
  },

  init: function(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
};
app.init();
