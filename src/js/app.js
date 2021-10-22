import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js'; 

const app = { //słuzy organizacji całej aplikacji deklaracja obiektu app
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

    thisApp.productList = document.querySelector(select.containerOf.menu);// kod odpowiedzialny za nasluchiwanie stworzonego przez nas Eventu customowy
    thisApp.productList = addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.Product); //nasz event posiada obiekt detail, w ktorym znajduje się właściwość product z product addToCart
    });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    /*console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);*/

    thisApp.initData();
    /*thisApp.initMenu();*/
    thisApp.initCart();
  },
};
app.init();