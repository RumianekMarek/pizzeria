/* global rangeSlider */
import {BaseWidget} from './BaseWidget.js';
import {settings, select} from '../settings.js';
import {utils} from'../utils.js';
//import {rangeSlider} from '../../vendor/rangeSlider.min.js';


export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    this.dom.output = this.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    this.dom.output.innerText = utils.numberToHour(this.value);
    this.initPulgin();
  }

  initPulgin(){
    rangeSlider.create(this.dom.input,{
      min: 10,
      max: 21,
      step: 0.5,
      onSlide: function (position) {
        this.value = position;
      },
    });
  }

  parseValue(){
    this.dom.input.addEventListener('change', function(){
      document.querySelector(select.widgets.hourPicker.output).innerText = utils.numberToHour(this.value);
    });
  }

  isValid(){
    return true;
  }
}