/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-listnpm r > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
    // CODE ADDED END
  };
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProduct();

      /*console.log('new Product:', thisProduct);*/
    }
    renderInMenu() {
      const thisProduct = this;

      /* generate  HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*console.log('menuContainer:', menuContainer);*/

      /* add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;
      thisProduct.dom = {};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      /* const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); */

      /* START: add event listener to clickable trigger on event click */
      /* clickableTrigger.addEventListener('click', function (event) { */
      thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct != thisProduct.element) {
          activeProduct.classList.remove('active');
          /*console.log('remove class active');*/
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm() { /*odpowiedzialna za dodanie listenerów eventów do formularza, jego kontrolek, oraz guzika dodania do koszyka.*/
      const thisProduct = this;

      /*console.log('thisProduct:', this);*/
      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;

      /*console.log('thisProduct:', this);*/
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form); /* funkcja zwraca nam tablice zawierajace wartosci z atrybutami*/
      /* console.log('formData', formData);*/
      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        /* console.log(paramId, param);*/

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          /*console.log(optionId, option);*/
          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable
              price = price + option.price;
              /*console.log('option.price: ', option.price);*/
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price = price - option.price;
              /* console.log('option.price: ', option.price);*/
            }
          }
          const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          if (optionImage) {
            if (formData[paramId] && formData[paramId].includes(optionId)) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /*Single price */
      thisProduct.priceSingle = price;
      /*multiply price by amount */
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
      /*console.log('new price: ', price);*/

    }
    prepareCartProduct() {//dzieki tej metodzie generujemy podsumowanie produktow w formie małego obiektu
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.amountWidget.value * thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }
    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
      // for very category (param)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      console.log('params: ', params);
      return params;
    }
  }
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
      thisWidget.initActions();
      /* console.log('AmountWidget:', thisWidget);*/
      /*console.log('construktor arguments:', element);*/
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      /*TODO: Add validation*/

      if (thisWidget.value !== newValue
        && !isNaN(newValue)
        && newValue >= settings.amountWidget.defaultMin
        && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }
    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;
      /*const event = new Event('updated');*/
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      payload.totalPrice = thisCart.dom.totalPrice;//całkowita cena za zamówienie;
      payload.subtotalPrice = thisCart.dom.subtotalPrice; //cena całkowita - koszt dostawy;
      payload.totalNumber = thisCart.dom.totalNumber; //całkowita liczba sztuk;
      payload.deliveryFee = thisCart.dom.deliveryFee; //koszt dostawy;
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

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.amountWidget = menuProduct.amountWidget;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      /*console.log('thisCartProduct: ', thisCartProduct);*/
    }
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        /*console.log(thisCartProduct.amount);*/
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
        console.log('thisCartProduct.dom.remove: ', thisCartProduct.dom.remove);
      });
    }
    getData() { //wzięłąm właściwości z całej instancji thisCartProduct, a wzorowałam się na metodzie prepareCartProduct
      const thisCartProduct = this;
      const productData = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        params: thisCartProduct.params,
      };
      return productData;
    }
  }
  const app = { //deklaracja obiektu app
    initMenu: function () {
      /*const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
   
      const testProduct = new Product();
      console.log('testProduct:', testProduct);
    }, */
      const thisApp = this;
      /*console.log('thisApp.data:', thisApp.data);*/

      for (let productData in thisApp.data.products) {
        /*new Product(productData, thisApp.data.products[productData]);*/ //zamieniam na poniższą właściwość id
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = {}; //zastąpiłam [dataSource] pustym obiektem
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function (RawResponse) {
          return RawResponse.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
      /*console.log('thisApp.cart: ', thisApp.cart);*/
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      /*console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);*/

      thisApp.initData();
      /*thisApp.initMenu();*/ //AJAX//kasuje wywołanie metody
      thisApp.initCart();
    },
  };
  app.init();
}
