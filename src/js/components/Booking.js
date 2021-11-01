import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(); //generuje kod HTML za pomocą szablonu templates.bookingWidget
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element; //dodaje do tego obiektu wlasciwosc wrapper i przypisuje referencje kontenera
    thisBooking.dom.wrapper.innerHTML = generatedHTML; //zmiana zawartości wrapper na kod HTML wynegerowany z szablonu
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
  }
  initWidgets() { // obsługa widgetów Book a table
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
    });
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
    });
  }
}

export default Booking;
