import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = { //słuzy organizacji całej aplikacji deklaracja obiektu app
  initPages: function () { //metoda initPages jest uruchamiana w momencie odswiezenia strony
    const thisApp = this;
    //IMPLEMENTACJA PRZECHODZENIA POMIĘDZY PODSTRONAMI BOOKING I ORDER
    thisApp.pages = document.querySelector(select.containerOf.pages).children; //znajdujemy wszystkie kontenery podstron
    thisApp.navLinks = document.querySelectorAll(select.nav.links);//znajduje wszystkie linki proadzace do tych podstron

    const idFromHash = window.location.hash.replace('#/', '');//z # w URL strony uzyskujemy ID postrony ktora zostaje otwarta jako domyslna

    let pageMatchingHash = thisApp.pages[0].id; //strona pasujaca do #, z tej zmiennej korzystamy za zmienna for, dlatego tworzymy ja przed pętlą
    for (let page of thisApp.pages) { //znajdujemy podstrone pasujacą do id i sprawdzamy w tym celu kazda z podstron
      if (page.id == idFromHash) {
        pageMatchingHash = page.id; //zostaje otwarta ta podstrona, ktora pasuje do ID uzyskanego z adresu strony
        break; //sprawia ze nie zostana wykoane kolejne interacje pętli
      }
    }
    //console.log('ipageMatchingHas', pageMatchingHash);
    thisApp.activatePage(pageMatchingHash);  //aby aktywowala się pierwsza z podstron, przekazujemy jej ID conterena naszej podstrony

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) { //dodajemy eventListenery odsylajace do podstron
        const clickedElement = this; //definiujmy stałą, w której zapisujemy obiekt this!!
        event.preventDefault(); //zapobiegamy domyslnej akcji, ktora jesdt wykonywana przez przegladarke przy kliknieciu w link

        //get page id from href attribute klikajac na taki link uzyskujemy id z atrubuty href tego linka
        const id = clickedElement.getAttribute('href').replace('#', '');//ATRYBUT STRONY ZACZYNA SIE OD # ,KTORY NIE JEST CZESCIA ID PODSTRONY WIEC ZAMIENIAMY GO NA PUSTY CIAG ZNAKOW
        //run thisApp.activatePage with that id i aktywujemy odpowienia podstrone
        thisApp.activatePage(id);

        //CHANGE URL HASH
        window.location.hash = '#/' + id; // dodajac / po # strona nie zostaje przewiznieta w dol do sekcji ordwer lecz pozostaje z naglowkiem
      });
    }
  },
  //w momencie aktywacji strony:
  activatePage: function (pageID) { // aktywujac strone otrzymujemy info o id postrony ktora ma zostac aktywowana
    const thisApp = this;
    //add class active to matching pages, remove fron non-matching
    for (let page of thisApp.pages) { //przechodzimy przez wszystkie podstrony i dodajemy klase aktive jesli ID postrony jest rowne przekazanemu w przeciwnym razie usuwamy klase aktive
      /*if(page.id == pageID) {
        page.classList.add(classNames.pages.active);
      } else {
        page.classList.remove(classNames.pages.active);
      }*/
      page.classList.toggle(classNames.pages.active, page.id == pageID); //metoda toggle nadaje klase podaja jako 1 arg, jesli tej klasy nie bylo, a jesli byla odbiera ja
    }
    //add class active to matching links, remove fron non-matching
    for (let link of thisApp.navLinks) { //analogicznie to co dla stron wykomujemy dla linkow
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageID//jezeli link posiada href pasujacy do przekazanego ID poprzedzonego znakiem # ten link otrzyma klace active, w przeciwnym wyp. utraci ta klase
      );
    }
  },
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
    thisApp.productList = addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.Product); //nasz event posiada obiekt detail, w ktorym znajduje się właściwość product z product addToCart
    });
  },
  init: function () {
    const thisApp = this;
    /*console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);*/

    thisApp.initPages();
    thisApp.initData();
    /*thisApp.initMenu();*/
    thisApp.initCart();

  },

};
app.init();
