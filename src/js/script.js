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
        }
      }
      price = price * thisProduct.amountWidget.value;
      document.getElementById(thisProduct.id).getElementsByClassName('price')[0].innerHTML = price;

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

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElement(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      console.log('Widget: ', thisWidget);
      console.log('constructor arguments: ', element);
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
      console.log(value);
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
