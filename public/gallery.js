var slideIndex = 1;
var arrow = 0;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  arrow = n;
  showSlides(slideIndex += n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("slide");
  var prevIndex = slideIndex;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    $(slides[i]).removeClass('sr');
    $(slides[i]).removeClass('sl');
  }

  if(arrow == 1) {
    $(slides[slideIndex-1]).addClass('sr');
  } else if(arrow == -1) {
    $(slides[slideIndex-1]).addClass('sl');
  }
  
  slides[slideIndex-1].style.display = "flex";
}