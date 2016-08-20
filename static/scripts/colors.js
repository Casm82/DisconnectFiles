window.addEventListener("load", color, false);

function color() {
  var colors = ["yellow", "#00FF7F", "#FF8C69", "#FFAA00", "#6193CF", "lime", "#5CFFEC", "#FFA858"];
  var manageButtonsArray = document.getElementsByClassName("manageButtons");
  var prevGrp = manageButtonsArray[0].dataset.dir;
  var n=0;
  for(var i=0; i < manageButtonsArray.length; i++) {
    var elmt = manageButtonsArray[i];
    var currGrp = elmt.dataset.dir;
    if (prevGrp != currGrp) { prevGrp = currGrp; n++; };
    var idx = n%colors.length;
    elmt.style.backgroundColor=colors[idx];
    //elmt.innerHTML += colors[idx];
  }
}