import { select, templates, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


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
    //thisProduct.prepareCartProduct()
    //thisProduct.prepareCartProductParams();

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
      if (activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove('active');
        /*console.log('remove class active');*/
      } else {
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      }
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
    //thisProduct.name = thisProduct.data.name;
    //thisProduct.amount = thisProduct.amountWidget.value;
    //app.cart.add(thisProduct.prepareCartProduct());
    //app.cart.add(thisProduct); 

    const event = new CustomEvent('add-to-Cart', { //tworze event customowy
      bubbles: true, //chce by event bąbelkował tzn. byl przekazywany do rodzica, rodzica rodzica itd.
      detail: {
        product: thisProduct.prepareCartProduct(), //chce by pod kluczem Product znajdował sięprodukt, który został dodany do koszyka
      },
    });
    thisProduct.element.dispatchEvent(event);//wywołanie eventu
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
export default Product;