class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
      
    thisWidget.dom = {};//w obiekcie będą znajdować się wszystkie el. DOM, z których będziemy korzystać w naszej aplikacji
    thisWidget.dom.wrapper = wrapperElement;//wrapper przekazany konctruktorowi w momencie tworzenia instancji
  
    thisWidget.correctValue = initialValue;//pocz. wartość widgetu w jego własciwości value
  }
  get value(){//getter czyli metoda wykonywana przy kazdej probie odczytania wartości własciwosci value
    const thisWidget = this;
  
    return thisWidget.correctValue;
  }
  set value(value){//setter czyli metoda ktora jest wykonywana przy kazdej probie ustawienia nowej wartości właściwości value
    const thisWidget = this;
  
    const newValue = thisWidget.parseValue(value);
  
    /* To do: Add validation */
    if(newValue != thisWidget.correctValue &&  thisWidget.isValid(newValue)){ 
      thisWidget.correctValue = newValue;
      thisWidget.announce();
      thisWidget.renderValue();
    }  
  }
  setValue(value){
    const thisWidget = this;
  
    thisWidget.value = value;
  }
  parseValue(value){// bedzie przekształcac wartość, którą chcemy ustawić na odpowiedni typ lub format
    return parseInt(value);//metoda będzie zwracać wynik funkcji parseInt, ktorej użyjemy jako argumentu przekazanego do parseValue
  }
  
  isValid(value){//będzie zwracac prawdę lub fałsz w zależności od tego czy wartość która chcemy ustawić dla tego widgetu jest prawidłowa wedłe kryteriow przez nas ustalonych
    return !isNaN(value);
  }
  renderValue(){//metoda sluząca temu aby bierząca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;
  
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
  
export default BaseWidget;