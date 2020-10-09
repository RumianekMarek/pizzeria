/* global rangeSlider */
import {BaseWidget} from './BaseWidget.js';
import {settings, select} from '../settings.js';
import {utils} from'../utils.js';


export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    this.dom.output = this.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    this.dom.output.innerText = utils.numberToHour(this.value);
    this.initPulgin();
  }

  initPulgin(){
    const thisWidget = this;

    rangeSlider.create(this.dom.input,{
      step: 0.5,
      onSlide: function (position) {
        thisWidget.setValue(position);
      },
    });
  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  setValue(position){
    this.value = position;
    this.dom.output.innerText = utils.numberToHour(this.value);
  }
}