import {select} from '../settings.js';


export class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElement(element);
    thisWidget.setValue(thisWidget.input.value, element);
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
    const event = new CustomEvent('updated', {
      bubbles: true
    });
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