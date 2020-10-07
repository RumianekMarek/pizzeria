import {AmountWidget} from './AmountWidget.js';
import {templates, select} from '../settings.js';
import{utils} from '../utils.js';

export class Booking{
  constructor(element){
    this.render(element);
    this.initWidget();
  }
	
  render(element){
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.map = utils.createDOMFromHTML(generatedHTML);
    this.dom.peopleAmount = this.map.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.map.querySelector(select.booking.hoursAmount);    

    element.appendChild(this.map);
  }

  initWidget(){
    this.dom.peopleAmount.widget = new AmountWidget(this.dom.peopleAmount);
    this.dom.hoursAmount.widget = new AmountWidget(this.dom.hoursAmount);
    console.log(this.dom);
  }
}