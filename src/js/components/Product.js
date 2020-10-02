import {utils} from '../utils.js';
import {select, templates} from '../settings.js';
import {dataSource} from '../data.js';
import {AmountWidget} from './AmountWidget.js';


export class Product{
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
    const event = new CustomEvent('add-to-cart', {
      bubbles:true,
      detail:{
        product: thisProduct,
      },
    });
    thisProduct.elemnet.dispatchEvent(event);
  }
}