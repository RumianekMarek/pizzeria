import {select} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.params.ingredients.label;
    this.fullPrice = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amountWidget.value;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    thisCartProduct.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    thisCartProduct.subtotal = document.querySelector(select.cart.subtotalPrice);
    thisCartProduct.totalTop = document.querySelector(select.cart.totalPrice);
    thisCartProduct.totalCart = document.querySelector('.cart__order-total .cart__order-price-sum strong');
    thisCartProduct.totalNumber = document.querySelector('.cart__total-number');
  }

  remover(){
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(){});

    thisCartProduct.dom.remove.addEventListener('click', function(){
      thisCartProduct.remover();
    });
  }

  initAmountWidget(){
    const thisCartProduct = this;
    let priceCheck = thisCartProduct.fullPrice;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.amountWidgetElem);
    thisCartProduct.amountWidgetElem.addEventListener('updated', function(){
      thisCartProduct.fullPrice = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
      thisCartProduct.dom.wrapper.getElementsByClassName('cart__product-header')[0].innerText = thisCartProduct.name + ' $' + thisCartProduct.fullPrice;
      thisCartProduct.update(priceCheck);
      priceCheck = thisCartProduct.fullPrice;
    });
  }

  update(price){
    const thisCartProduct = this;
    let priceCheck = price;
     
    if (priceCheck < thisCartProduct.fullPrice){
      thisCartProduct.subtotal.innerText = parseInt(thisCartProduct.subtotal.innerText) + parseInt(thisCartProduct.priceSingle);
      thisCartProduct.totalTop.innerText = parseInt(thisCartProduct.totalTop.innerText) + parseInt(thisCartProduct.priceSingle);
    } else {
      thisCartProduct.subtotal.innerText = +thisCartProduct.subtotal.innerText - parseInt(thisCartProduct.priceSingle);
      thisCartProduct.totalTop.innerText = parseInt(thisCartProduct.totalTop.innerText) - parseInt(thisCartProduct.priceSingle);
    }
    thisCartProduct.totalCart.innerText = thisCartProduct.totalTop.innerText;
  }
}