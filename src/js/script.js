/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
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

      // console.log('triger', thisProduct.accordionTrigger);
      // console.log('form', thisProduct.form);
      // console.log('button', thisProduct.cartButton);
      // console.log('price', thisProduct.priceElem);
      // console.log('wrapper', thisProduct.imageWrapper);

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
      });
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = dataSource.products[thisProduct.id].price;
      for (let key in formData){
        for (let i=0; i<formData[key].length; i++){
          if (key != 'amount'){
            price += dataSource.products[thisProduct.id].params[key].options[formData[key][i]].price;
          }
          if (key == 'amount'){
            price = price * formData[key][i];
          }
        }
        document.getElementById(thisProduct.id).getElementsByClassName('price')[0].innerHTML = price;
      }

      if (thisProduct.id == 'pizza' || thisProduct.id == 'salad'){
        let imageArray = thisProduct.imageWrapper.querySelectorAll('img');
        for (let i=0; i<imageArray.length; i++){
          imageArray[i].classList.remove('active');
          if (imageArray[i].classList == '') imageArray[i].classList.add('active');
        }

        for(let key in formData){
          if (key !='amount'){
            const array = thisProduct.form.querySelectorAll('input');
            for (let i=0; i<array.length - 1; i++){
              if (array[i].checked == true){
                let target = key + '-' + array[i].id;
                if (document.querySelector('img.' + target) != null)
                  document.querySelector('img.' + target).classList.add('active');
              }
            }
          }
        }
      }
    }
  }



  const app = {
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);
      
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
