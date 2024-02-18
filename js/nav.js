const isOpen = true;
const navLinks = document.querySelector(".navbar-nav");
const menuIcon = document.querySelector(".navbar-toggler");

if (isOpen) {
  navLinks.style.maxHeight = "0";
  menuIcon.querySelector(".bar1").style.transform += " rotate(-45deg)";
  menuIcon.querySelector(".bar3").style.transform += " rotate(45deg)";

  menuIcon.querySelector(".bar2").style.opacity = 1;
  menuIcon.querySelector(".bar2").style.transition = "opacity 1.1s";
  setTimeout(() => {
    menuIcon.querySelector(".bar1").style.transform = "translate(0px, 0px)";
    menuIcon.querySelector(".bar1").style.transition = "transform 0.1s";
    menuIcon.querySelector(".bar1").style.transitionDelay = "0.1s";

    menuIcon.querySelector(".bar3").style.transform = "translate(0px, 0px)";
    menuIcon.querySelector(".bar3").style.transition = "transform 0.1s";
    menuIcon.querySelector(".bar3").style.transitionDelay = "0.1s";
  }, 400);
} else {
  navLinks.style.maxHeight = "500px";
  //bar 1,bar3
  menuIcon.querySelector(".bar1").style.transform = "translate(0px, 5px)";
  menuIcon.querySelector(".bar1").style.transition = "transform 0.1s";
  menuIcon.querySelector(".bar1").style.transitionDelay = "0.1s";

  menuIcon.querySelector(".bar3").style.transform = "translate(0px, -5px)";
  menuIcon.querySelector(".bar3").style.transition = "transform 0.1s";
  menuIcon.querySelector(".bar3").style.transitionDelay = "0.1s";

  // bar 2
  menuIcon.querySelector(".bar2").style.opacity = 0;
  menuIcon.querySelector(".bar2").style.transition = "opacity 1.1s";

  setTimeout(function () {
    // Rotate the bars.
    menuIcon.querySelector(".bar1").style.transform += " rotate(45deg)";
    menuIcon.querySelector(".bar3").style.transform += " rotate(-45deg)";
  }, 500);
    }