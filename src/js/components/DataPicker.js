/* global flatpickr */
import { utils } from '../utils.js';
import { select } from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class DataPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.datePicker.input);
    this.initPlugin();
    console.log('1');
    //this.parseValue();
  }

  initPlugin(){
    const thisWidget = this;
    this.minDate = utils.dateToStr(new Date(this.value));
    this.maxDate = utils.dateToStr(utils.addDays(this.value, 14));    
    this.dom.datePicker = flatpickr(this.dom.input, {
      defaultDate: this.minDate,
      maxDate: this.maxDate,
      locale:{
        firstDayOfWeek: 1,
      },
      disable:[
        function(date){
          return (date.getDay() === 0);
        }],
      onChange: function(selectedDate, dateStr){
        thisWidget.setValue(dateStr);
      }
    });

  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  setValue(dateStr){
    this.value = dateStr;
  }
}