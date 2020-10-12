import {app} from '../app.js';

export class MainMenu {
  constructor(){
    this.render();

  }
  createElement(element, clas, id){
    const elem = document.createElement(element);
   
    if(id != undefined){
      elem.id = id;
    }

    elem.classList.add(clas);
    return elem;
  }

  render(){
    const mainDiv = this.createElement('div', 'mainDiv', 'mainDiv');
    const linksContainer = this.createElement('div', 'container', 'linksContainer');
    
    const imageDiv1 = this.createElement('div', 'imageDiv1');
    const image1 = this.createElement('img', 'linkImage', 'image1');
    image1.src = '../../assets/pizza-1.jpg';
    image1.addEventListener('click', function(){
      document.querySelector('#mainDiv').style.setProperty('display','none');
      app.init();
    });
    
    const image1Text = this.createElement('p','imageText', 'imageText1');
    image1Text.innerText = 'ORDER ONLINE';
    const image1Overlay = this.createElement('div', 'overlay','overlay1');
    image1Overlay.innerText = 'Greate food delivery';

    const imageDiv2 =this.createElement('div', 'imageDiv2');
    const image2 = this.createElement('img', 'linkImage', 'image2');
    image2.src = '../../assets/pizza-2.jpg';
    image2.addEventListener('click', function(){
      document.querySelector('#mainDiv').style.setProperty('display','none');
      app.init();
      app.activatePage('booking');
    });

    const image2Text = this.createElement('p','imageText','imageText2');
    image2Text.innerText = 'BOOK A TABLE';
    const image2Overlay = this.createElement('div', 'overlay','overlay2');
    image2Overlay.innerText = 'Fast and easy Booking';

    const redSpace = this.createElement('div', 'redSpace');
    const redText1 = this.createElement('p', 'redOpening');
    redText1.innerText = 'OPENING HOURS:';
    
    const redtext2 = this.createElement('p', 'redHours');
    redtext2.innerText =  'TUE-SUN, 12PM - 12AM';

    const slideContainer = this.createElement('div','slideContainer');
    const slideImage = this.createElement('img', 'slideImage');
    slideImage.src = '../../assets/pizza-3.jpg';
    const slideTextDiv = this.createElement('div', 'slideTextDiv');
    const slideText1 = this.createElement('p', 'slideText', 'hedder');
    const slideText2 = this.createElement('p', 'slideText', 'Text');
    const slideText3 = this.createElement('p', 'slideText', 'Author');
    slideText1.innerText = 'Hedder';
    slideText2.innerText = 'text, lots of text';
    slideText3.innerText = '--Author';

    const gallery = this.createElement('div', 'gallery');
    const galleryImage1 = this.createElement('img', 'galleryImage');
    galleryImage1.src = '../../assets/pizza-4.jpg';
    const galleryImage2 = this.createElement('img', 'galleryImage');
    galleryImage2.src = '../../assets/pizza-5.jpg';
    const galleryImage3 = this.createElement('img', 'galleryImage');
    galleryImage3.src = '../../assets/pizza-6.jpg';
    const galleryImage4 = this.createElement('img', 'galleryImage');
    galleryImage4.src = '../../assets/pizza-7.jpg';
    const galleryImage5 = this.createElement('img', 'galleryImage');
    galleryImage5.src = '../../assets/pizza-8.jpg';
    const galleryImage6 = this.createElement('img', 'galleryImage');
    galleryImage6.src = '../../assets/pizza-9.jpg';

    const link = this.createElement('a', 'link');
    link.href = '#';
    link.innerText = 'more on Instagram';

    document.querySelector('header').after(mainDiv);
    mainDiv.appendChild(linksContainer);
    linksContainer.append(imageDiv1);
    imageDiv1.append(image1);
    imageDiv1.append(image1Text);
    imageDiv1.append(image1Overlay);
    linksContainer.append(imageDiv2);
    imageDiv2.append(image2);
    imageDiv2.append(image2Text);
    imageDiv2.append(image2Overlay);
    linksContainer.appendChild(redSpace);
    redSpace.appendChild(redText1);
    redSpace.appendChild(redtext2);

    mainDiv.appendChild(slideContainer);
    slideContainer.append(slideImage);
    slideContainer.append(slideTextDiv);
    slideTextDiv.append(slideText1);
    slideTextDiv.append(slideText2);
    slideTextDiv.append(slideText3);

    mainDiv.appendChild(gallery);
    gallery.append(galleryImage1);
    gallery.append(galleryImage2);
    gallery.append(galleryImage3);
    gallery.append(galleryImage4);
    gallery.append(galleryImage5);
    gallery.append(galleryImage6);

    mainDiv.appendChild(link);

    console.log(mainDiv);
  }
}