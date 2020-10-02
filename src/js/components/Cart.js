import {utils} from '../utils.js';
import {settings, select, templates} from '../settings.js';
import {CartProduct} from './CartProduct.js';

export class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.deliveryFee = 20;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.price = thisCart.dom.wrapper.querySelector(select.cartProduct.price);
    thisCart.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      document.getElementById('cart').classList.toggle('active');
    });
    thisCart.productList.addEventListener('update', function(){
      thisCart.update();
    });

    thisCart.productList.addEventListener('remove', function(){
      thisCart.remover(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
      console.log(thisCart);
    });
  }

  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    thisCart.cartProduct = utils.createDOMFromHTML(generatedHTML);
    thisCart.cartProduct.getElementsByClassName('cart__product-details')[0].innerText = '';
    thisCart.cartProduct.getElementsByClassName('amount')[0].value = menuProduct.amountWidget.value;
    thisCart.cartProduct.getElementsByClassName('cart__product-header')[0].innerText = menuProduct.params.ingredients.label + ' $' + menuProduct.price;      let details = '';
    for(let key in menuProduct.params.ingredients.options){
      details += key.toUpperCase() + ': ';
      for (let i=0; i<menuProduct.params.ingredients.options[key].length; i++){
        details += menuProduct.params.ingredients.options[key][i] + ', ';
      }
      details += '\n';
    }
    thisCart.cartProduct.getElementsByClassName('cart__product-details')[0].innerText = details;
    const cartContainer = document.querySelector(select.cart.productList);
    cartContainer.appendChild(thisCart.cartProduct);
    thisCart.products.push(new CartProduct(menuProduct, thisCart.cartProduct));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.totalPrice = 0;
    thisCart.subtotalPrice = 0;
    for(let i=0; i<thisCart.products.length; i++){
      thisCart.subtotalPrice += thisCart.products[i].fullPrice;
      thisCart.totalNumber += thisCart.products[i].amountWidget.value;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remover(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    const cartContainer = document.querySelector(select.cart.productList);
    
    thisCart.products.splice(index, 1);
    cartContainer.removeChild(cartContainer.childNodes[index+1]);
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const cartProductsArray = [];

    const payload = {
      address: thisCart.address.value,
      phone: thisCart.phone.value,
      totalPrice: thisCart.totalPrice,
    };

    for (let i=0; i<thisCart.products.length; i++){
      cartProductsArray.push(this.productsDetail(i));
      payload[cartProductsArray[i].type] = JSON.stringify(cartProductsArray[i].params);
    }
 
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    console.log(options);
    fetch(url,options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log(parsedResponse);
      });
  }

  productsDetail(i){
    const product = {
      type: this.products[i].id,
      params: this.products[i].params.ingredients.options 
    };
    return product;
  }
}
