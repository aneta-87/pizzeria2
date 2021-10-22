import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';



class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    /*console.log('new Cart: ', thisCart);*/
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = element.querySelector(select.cart.form); //9.9. referencja do elementu formularza
    thisCart.dom.phone = element.querySelector(select.cart.phone); // 9.9. referencja do imputu phone
    thisCart.dom.address = element.querySelector(select.cart.address); //9.9. referencja do imputu address
  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () { //dzięki temu koszyk zwija się i rozwija
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update(); // nasluchujemy listę produktów, w której umieszczamy produkty
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct); // nasluchujemy przycisk remove
    });
    thisCart.dom.form.addEventListener('submit', function (event) { //9.9. nasłuchiwacz do formularza. Nasłuchuje event submit
      event.preventDefault(); //9.9 funkcja blokująca domyślne zachowanie formularza. Przycisk ORDER nie działa teraz
      thisCart.sendOrder(); //9.9 wywołanie metody, która kompletuje info o zamówieniu i poźniejsza wysyłka na serwer
    });
  }
  add(menuProduct) {
    const thisCart = this;
    console.log('adding product', menuProduct);
    /* generate  HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element DOM using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    console.log('generatedDOM: ', generatedDOM);
    /* add element DOM to thisCart*/
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); //dzieki temu mamy podsumowanie zamowienia w konsoli i stały dostęp do instancji wszystkich produktów
    console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  update() { //methoda do sumowania koszyka
    const thisCart = this;
    thisCart.totalNumber = 0; //odpowiada całościowej liczbie sztuk
    thisCart.subtotalPrice = 0; //zsumowana cena za wszystko bez dostawy
    thisCart.totalPrice = 0; //cena z kosztem dostawy
    let deliveryFee = settings.cart.defaultDeliveryFee;

    if (thisCart.products.length === 0) {
      deliveryFee = 0;
    }
    for (const product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    thisCart.totalNumber == 0 ? thisCart.deliveryFee = 0 : thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;//odpowiada całościowej liczbie sztuk
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice; //zsumowana cena za wszystko bez dostawy
    thisCart.dom.deliveryFee.innerHTML = deliveryFee; //koszt dostawy
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice; // cena całkowita z kosztem dostawy
    for (const domTotalPrice of thisCart.dom.totalPrice) {
      domTotalPrice.innerHTML = thisCart.totalPrice;
    }
  }
  remove(removeProduct) { //metoda usuwa reprezentacje prod. z HTML, informacje o produkcie z tablicy i wywołuje metode update
    const thisCart = this;

    const indexOfProduct = thisCart.products.indexOf(CartProduct);
    thisCart.products.splice(indexOfProduct, 1);

    removeProduct.dom.wrapper.remove();
    thisCart.update();
  }
  sendOrder() { //9.9 metoda kompletuje info o zamówieniu i poźniejsza wysyłka na serwer
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders; //adres endpointu z którym chcemy się połączyć

    const payload = {}; //obiekt z danymi, które chcemy wysłać do serwera
    payload.address = thisCart.dom.address.value; //adres klienta wpisany w koszyku;
    payload.phone = thisCart.dom.phone.value;//numer telefonu wpisany w koszyku;
    payload.totalPrice = thisCart.dom.totalPrice.innerHTML;//całkowita cena za zamówienie;
    payload.subtotalPrice = thisCart.dom.subtotalPrice.innerHTML; //cena całkowita - koszt dostawy;
    payload.totalNumber = thisCart.dom.totalNumber.innerHTML; //całkowita liczba sztuk;
    payload.deliveryFee = thisCart.dom.deliveryFee.innerHTML; //koszt dostawy;
    payload.products = []; //tablica obecnych w koszyku produktów
    console.log('payload: ', payload);
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;