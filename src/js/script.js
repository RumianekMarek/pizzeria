/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  // const classNames = {
  //   menuProduct: {
  //     wrapperActive: 'active',
  //     imageVisible: 'active',
  //   },
  //   cart: {
  //     wrapperActive: 'active',
  //   },
  // };
  
  // const settings = {
  //   amountWidget: {
  //     defaultValue: 1,
  //     defaultMin: 1,
  //     defaultMax: 9,
  //   },
  //   cart: {
  //     defaultDeliveryFee: 20,
  //   },
  // };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      //const thisProductParams = [];
      
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      thisProduct.element.id = thisProduct.id;
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      const elementAnchor = document.getElementById(thisProduct.id);
      elementAnchor.className = 'product inactive';
      elementAnchor.addEventListener('click', function(){
        for (let key in dataSource.products)
          document.getElementById(key).className = 'product inactive';
        elementAnchor.className = 'product active';
      });
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = dataSource.products[thisProduct.id].price;
      
      thisProduct.params = {
        ingredients: {
          label: dataSource.products[thisProduct.id].name,
          options: {},
        },
      };

      thisProduct.params.ingredients.options = formData;

      for (let key in formData){
        
        console.log(thisProduct);
        for (let i=0; i<formData[key].length; i++){
          if (key != 'amount'){
            price += dataSource.products[thisProduct.id].params[key].options[formData[key][i]].price;
          }
        }
      }
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      document.getElementById(thisProduct.id).getElementsByClassName('price')[0].innerHTML = thisProduct.price;

      let imageArray = thisProduct.imageWrapper.querySelectorAll('img');
      for (let i=0; i<imageArray.length; i++){
        imageArray[i].classList.remove('active');
        if (imageArray[i].classList == '') imageArray[i].classList.add('active');
      }

      for(let key in formData){
        if (key !='amount'){
          const allInputsArray = thisProduct.form.querySelectorAll('input');
          for (let i=0; i<allInputsArray.length - 1; i++){
            if (allInputsArray[i].checked){
              let target = key + '-' + allInputsArray[i].id;
              if (document.querySelector('img.' + target) != null)
                document.querySelector('img.' + target).classList.add('active');
            }
          }
        }
      }
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElement(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElement(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      const max = 9;
      const min = 1;
      if (newValue >= min && newValue <= max){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(){
        thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(){
        thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
      });
    }
  }
  
  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        document.getElementById('cart').classList.toggle('active');
      });
    }

    add(menuProduct){
      const thisCart = this;
      console.log(menuProduct);
      const generatedHTML = templates.cartProduct(menuProduct);
      thisCart.cartProduct = utils.createDOMFromHTML(generatedHTML);
      thisCart.cartProduct.getElementsByClassName('cart__product-details-label')[0].innerText = '';
      console.log(thisCart.cartProduct.getElementsByClassName('cart__product-details-label'));
      thisCart.cartProduct.getElementsByClassName('amount')[0].value = menuProduct.amountWidget.value;
      thisCart.cartProduct.getElementsByClassName('cart__product-header')[0].innerText = menuProduct.params.ingredients.label;
      let details = '';
      for(let key in menuProduct.params.ingredients.options){
        details += key.toUpperCase() + ': ';
        for (let i=0; i<menuProduct.params.ingredients.options[key].length; i++){
          details += menuProduct.params.ingredients.options[key][i] + ', ';
        }
        details += '\n';
      }
      thisCart.cartProduct.getElementsByClassName('cart__product-details-label')[0].innerText = details;
      const cartContainer = document.querySelector(select.cart.productList);
      cartContainer.appendChild(thisCart.cartProduct);
    }
  }

  const app = {
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
