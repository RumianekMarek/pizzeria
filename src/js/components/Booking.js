import {AmountWidget} from './AmountWidget.js';
import {templates, select, settings, classNames} from '../settings.js';
import{utils} from '../utils.js';
import { DataPicker } from './DataPicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking{
  constructor(element){
    this.render(element);
    this.initWidget();
    this.getData();
  }
	
  render(element){
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.map = utils.createDOMFromHTML(generatedHTML);
    this.dom.peopleAmount = this.map.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.map.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.map.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.map.querySelector(select.widgets.hourPicker.wrapper);   
    this.dom.tables = this.map.querySelectorAll(select.booking.tables); 

    element.appendChild(this.map);
  }

  initWidget(){
    const thisBooking = this;

    this.dom.peopleAmount.widget = new AmountWidget(this.dom.peopleAmount);
    this.dom.hoursAmount.widget = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DataPicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = this.datePicker.minDate;
    startEndDates[settings.db.dateEndParamKey] = this.datePicker.maxDate;
  
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];
  
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(booking, eventsCurrent, eventsRepeat){
    this.booked = {};
    for(let i=0; i<eventsCurrent.length; i++){
      this.makeBooked(eventsCurrent[i]);
    }
    for(let i=0; i<booking.length; i++){
      this.makeBooked(booking[i]);
    }
    for(let i=0; i<eventsRepeat.length; i++){
      if(eventsRepeat[i].repeat == 'daily'){
        eventsRepeat[i].date = utils.dateToStr(new Date());
        for (let j=0; j<15; j++){
          this.makeBooked(eventsRepeat[i]);
          eventsRepeat[i].date = utils.dateToStr(utils.addDays(eventsRepeat[i].date, 1));
        }
      }
    }
    console.log(this.booked);
    this.updateDOM();
  }

  makeBooked(event){

    if(this.booked[event.date] == undefined){
      this.booked[event.date] = {};
    }
    for(let i=0; i<event.duration * 2; i++){
      let hour = utils.hourToNumber(event.hour) + (i * 0.5);
      if(this.booked[event.date][hour] == undefined){
        this.booked[event.date][hour] = []; 
      }
      this.booked[event.date][hour].push(event.table);
    } 
  }

  updateDOM(){
    for (let i=0; i<this.dom.tables.length; i++){
      this.dom.tables[i].classList.remove(classNames.booking.tableBooked);
    }

    this.date = this.datePicker.value;
    this.hour = this.hourPicker.value;
    for(let date in this.booked){
      if (this.date == date){
        for(let hour in this.booked[date]){
          if (this.hour == hour){
            for(let i=0; i<this.booked[date][hour].length; i++){
              for(let j=0; j<this.dom.tables.length; j++){
                if(this.dom.tables[j].dataset.table == this.booked[date][hour][i]){
                  this.dom.tables[j].classList.add(classNames.booking.tableBooked);
                }

              }
            }
            
          }
        }
      }
    }
    
    
  }

}