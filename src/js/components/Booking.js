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
    
    for(let i=0; i<this.dom.tables.length; i++){
      this.map.querySelector('[data-table="'+(i+1)+'"]').addEventListener('click',function(){
        thisBooking.tableBooked(this);
      });
    }

    this.map.querySelector('.btn-secondary').addEventListener('click', function(){
      event.preventDefault();
      thisBooking.colectBooking();
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
    this.updateDOM();
    console.log(this.booked);
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
          if (this.hour == hour || (Number(this.hour) == Number(hour + 0.5) )) {
            for(let i=0; i<this.booked[date][hour].length; i++){
              for(let j=0; j<this.dom.tables.length; j++){
                if(this.dom.tables[j].dataset.table == this.booked[date][hour][i]){
                  this.dom.tables[j].classList.add(classNames.booking.tableBooked);
                }
              }
            }
            if(this.booked[date][(Number(hour)+0.5)] != undefined){
              for(let i=0; i<this.booked[date][(Number(hour)+0.5)].length; i++){
                for(let j=0; j<this.dom.tables.length; j++){
                  if(this.dom.tables[j].dataset.table == this.booked[date][(Number(hour)+0.5)][i]){
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

  tableBooked(table){
    if(!table.classList.contains(classNames.booking.tableBooked)){
      this.bookedRemove();
      table.classList.add('reserv');
      if (this.map.querySelector('.warning') != null){
        this.map.querySelector('.warning').remove();
      }
    }
    settings.amountWidget.defaultMax = this.tableCheck(table);
    document.querySelector('[name="hours"]').value = 1;
    this.dom.hoursAmount.widget.correctValue = 1;
    console.log(this.dom.hoursAmount.widget.correctValue);
  }

  bookedRemove(){
    for(let i=0; i<this.dom.tables.length; i++){
      this.map.querySelector('[data-table="'+(i+1)+'"]').classList.remove('reserv');
    }
  }

  colectBooking(){
    const starters = this.map.querySelectorAll('[name="starter"]');

    const booking = {
      address: this.map.querySelector('[name="address"]').value,
      phone: this.map.querySelector('[name="phone"]').value,
      date: this.datePicker.value,
      hour: utils.numberToHour(this.hourPicker.value),
      repeat: 'false',
      duration: this.map.querySelector('[name="hours"]').value,
      ppl: this.map.querySelector('[name="people"]').value,
      starters: [],
    };
    
    for (let i=0; i<this.dom.tables.length; i++){
      if(this.map.querySelector('[data-table="'+(i+1)+'"]').classList.contains('reserv')){
        booking.table = (i+1);
      }
    }

    for(let i=0; i<starters.length; i++ ){
      if(starters[i].checked){
        booking.starters.push(starters[i].value);
      }
    }

    if (booking.phone.length < 8){
      this.map.querySelector('[name="phone"]').value = '';
      this.map.querySelector('[name="phone"]').placeholder = 'please put 9-digits phone';
      this.map.querySelector('[name="phone"]').style.setProperty('border', '5px solid red');
    } else if (booking.table == undefined){
      let warning = document.createElement('a');
      warning.classList.add('warning');
      warning.innerText = 'please pick a table';
      warning.style.setProperty('color', 'red');
      warning.style.setProperty('font-size', '20px');
      this.map.querySelector('.floor-plan').before(warning);
    } else {
      this.sendData(booking);    
    }
    
  }

  sendData(booking){
    console.log(JSON.stringify(booking));
    const url = settings.db.url + '/' + settings.db.booking;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url,options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log(parsedResponse);
      });
  }

  tableCheck(table){
    const thisBooking = this;
    const tableIndex = table.innerText.charAt(table.innerText.length-1);
    const array = [];
    for( let key in this.booked[this.datePicker.value]){
      for (let i=0; i<this.booked[this.datePicker.value][key].length; i++){
        if (this.booked[this.datePicker.value][key][i] == tableIndex){
          array.push(key);
        }        
      }
    }
    array.push('23');
    array.sort();

    let closestHour = 0;
    for (let key in array){
      if(thisBooking.hourPicker.value < array[key]){
        closestHour = array[key];
        break;
      }
    }
    const maxTime = closestHour - this.hourPicker.value;
    return maxTime;    
  }
}