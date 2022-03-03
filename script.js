// Variables
let myUrl;

let designWidth;
let maxWidthToggle;
let maxWidth;

let bodyUnit;
let minWidthToggle;
let minWidth;

let scaleType;
let scaleDirection;

let desktopLargeS = $("#desktop-large").find(".breakpoint_field");
let desktopLargeF = $("#desktop-large").find(".field");
let desktopSmallS = $("#desktop-small").find(".breakpoint_field");
let desktopSmallF = $("#desktop-small").find(".field");
let tabletS = $("#tablet").find(".breakpoint_field");
let tabletF = $("#tablet").find(".field");
let mobileS = $("#mobile").find(".breakpoint_field");
let mobileF = $("#mobile").find(".field");

// Set default values
$("[default-value]").each(function (index) {
  let defaultValue = +$(this).attr("default-value");
  $(this).val(defaultValue);
});

function updateValues() {
  designWidth = $("#design-width").find(".field").val();
  if ($("#max-width").find(".toggle").hasClass("active")) {
    maxWidthToggle = "on";
  } else {
    maxWidthToggle = "off";
  }
  maxWidth = +$("#max-width").find(".field").val();

  bodyUnit = $("#body-unit").find(".selected p").text();
  if ($("#min-width").find(".toggle").hasClass("active")) {
    minWidthToggle = "on";
  } else {
    minWidthToggle = "off";
  }
  minWidth = +$("#min-width").find(".field").val();

  scaleType = $("#scale-type").find(".selected p").text();
  scaleDirection = $("#scale-direction").find(".selected p").text();

  updateUI();
  if (scaleType === "Proportional") {
    proportionalCode();
  } else if (scaleType === "Disproportional") {
    disproportionalCode();
  }
  urlCreator();
}
updateValues();

function updateUI() {
  // Show or hide css javascript code
  if (scaleType === "Disproportional" || bodyUnit === "VW") {
    $("#js-code").addClass("hide");
  } else if (bodyUnit === "REM") {
    $("#js-code").removeClass("hide");
  }
  // Scale direction
  if (scaleDirection === "Scale Down") {
    $("#desktop-small").find(".field").removeClass("disabled");
    $("#desktop-large").find(".field").addClass("disabled");
  } else if (scaleDirection === "Scale Up") {
    $("#desktop-large").find(".field").removeClass("disabled");
    $("#desktop-small").find(".field").addClass("disabled");
  }
  // Show or hide dis/proportional settings panel
  $(".calc_divider").removeClass("hide");
  if (scaleType === "Disproportional") {
    $("#proportional").addClass("hide");
  } else if (scaleType === "Proportional") {
    $("#disproportional").addClass("hide");
  }
}

function disproportionalCode() {
  let cssMaxS;
  let cssMaxF;
  let cssMinS = +desktopSmallS.val();
  let cssMinF;
  let warningMessage;
  let warningThreshold;
  if (maxWidthToggle === "on") {
    cssMaxS = maxWidth;
    warningThreshold = 0.3;
  } else {
    cssMaxS = designWidth;
    warningThreshold = 0.5;
  }
  desktopLargeS.val(cssMaxS);
  if (scaleDirection === "Scale Down") {
    cssMinF = desktopSmallF.val();
    cssMaxF = (cssMaxS * 16) / designWidth;
    desktopLargeF.val(cssMaxF);
    warningMessage = $("#desktop-small").find(".warning");
  } else if (scaleDirection === "Scale Up") {
    cssMaxF = desktopLargeF.val();
    cssMinF = (cssMinS * 16) / designWidth;
    desktopSmallF.val(cssMinF);
    warningMessage = $("#desktop-large").find(".warning");
  }
  // get calc
  let myVW = getCalcVW(cssMinF, cssMaxF, cssMinS, cssMaxS);
  let myEM = getCalcEM(cssMinF, cssMaxF, cssMinS, cssMaxS);

  $(".warning").removeClass("show");
  if (myEM < warningThreshold) {
    warningMessage.addClass("show");
  } else {
    warningMessage.removeClass("show");
  }

  let cssMaxWidth;
  if (maxWidthToggle === "on") {
    cssMaxWidth = `/* Max Font Size */
@media screen and (min-width:${maxWidth}px) {
 body { font-size: ${(myVW * (maxWidth / 100)) / 16 + myEM}em; }
}`;
  } else {
    cssMaxWidth = "";
  }

  let myVW2 = getCalcVW(
    mobileF.val(),
    tabletF.val(),
    mobileS.val(),
    tabletS.val()
  );
  let myEM2 = getCalcEM(
    mobileF.val(),
    tabletF.val(),
    mobileS.val(),
    tabletS.val()
  );

  let minFontSize;
  if (cssMinS === 0) {
    $(".is-group2").addClass("hide");
  } else {
    $(".is-group2").removeClass("hide");
  }
  if (cssMinS === 0) {
    minFontSize = "";
  } else if (tabletF.val() === mobileF.val()) {
    minFontSize = `/* Min Font Size */
@media screen and (max-width:${tabletS.val()}px) {
 body { font-size: ${tabletF.val() / 16}em; }
}`;
  } else if (+mobileS.val() === 0) {
    if (myEM2 < 0.3) {
      $(".is-group2 .warning").addClass("show");
    } else {
      $(".is-group2 .warning").removeClass("show");
    }
    minFontSize = `/* Min Font Size */
@media screen and (max-width:${tabletS.val()}px) {
 body { font-size: calc(${myVW2}vw + ${myEM2}em); }
}`;
  } else {
    if (myEM2 < 0.3) {
      $(".is-group2 .warning").addClass("show");
    } else {
      $(".is-group2 .warning").removeClass("show");
    }
    minFontSize = `/* Min Font Size */
@media screen and (min-width: ${mobileS.val()}px) and (max-width: ${tabletS.val()}px)  {
 body { font-size: calc(${myVW2}vw + ${myEM2}em); }
}
@media screen and (max-width:${mobileS.val() - 1}px) {
  body { font-size: ${(myVW2 * ((mobileS.val() - 1) / 100)) / 16 + myEM2}em; }
}`;
  }

  let finalCode = `<style>
body { font-size: calc(${myVW}vw + ${myEM}em); }
${cssMaxWidth}
${minFontSize}
.container {
  max-width: ${designWidth / 16}em;
}
</style>`;
  editor.getDoc().setValue(finalCode);
}

function getCalcVW(calcMinFont, calcMaxFont, calcMinWidth, calcMaxWidth) {
  let calcVW =
    (100 * (calcMaxFont - calcMinFont)) / (calcMaxWidth - calcMinWidth);
  return calcVW;
}
function getCalcEM(calcMinFont, calcMaxFont, calcMinWidth, calcMaxWidth) {
  let calcEM =
    (calcMinWidth * calcMaxFont - calcMaxWidth * calcMinFont) /
    (calcMinWidth - calcMaxWidth) /
    16;
  return calcEM;
}

function proportionalCode() {
  // CSS stuff
  let scaleFactor = designWidth / 100;
  let vwFontSize = 16 / scaleFactor;
  let vwMaxSize = ((maxWidth / 100) * vwFontSize) / 16;
  let vwMinSize = ((minWidth / 100) * vwFontSize) / 16;
  // Pro on body
  let maxCode;
  let minCode;
  let containerCode;
  // VW vs REM variables
  let VRmax;
  let VRmaxFont;
  let VRminFont;
  if (bodyUnit === "VW") {
    VRmax = maxWidth + "px";
    VRmaxFont = (maxWidth / 100) * vwFontSize + "px";
    VRminFont = (minWidth / 100) * vwFontSize + "px";
  } else if (bodyUnit === "REM") {
    VRmax = designWidth / 16 + "em";
    VRmaxFont = vwMaxSize + "rem";
    VRminFont = vwMinSize + "rem";
  }
  if (maxWidthToggle === "on") {
    maxCode = `/* Max Font Size */
@media screen and (min-width:${maxWidth}px) {
 body {font-size: ${VRmaxFont};}
}
/* Container Max Width */
.container {
  max-width: ${VRmax};
}`;
  } else {
    maxCode = "";
  }
  if (minWidthToggle === "on") {
    minCode = `/* Min Font Size */
@media screen and (max-width:${minWidth}px) {
 body {font-size: ${VRminFont};}
}`;
  } else {
    minCode = "";
  }
  let finalCode = `<style>
body {
 font-size: ${vwFontSize}vw;
}
${maxCode}
${minCode}
</style>`;
  editor.getDoc().setValue(finalCode);
  // Javascript stuff
  let rangeStartScript;
  let rangeEndScript;
  if (maxWidthToggle === "on" || minWidthToggle === "on") {
    if (maxWidthToggle === "on" && minWidthToggle === "on") {
      rangeStartScript = `if (window.innerWidth <= ${maxWidth} && window.innerWidth >= ${minWidth}) {`;
    } else if (minWidthToggle === "on") {
      rangeStartScript = `if (window.innerWidth >= ${minWidth}) {`;
    } else if (maxWidthToggle === "on") {
      rangeStartScript = `if (window.innerWidth <= ${maxWidth}) {`;
    }
    rangeEndScript = `} else {
   if (document.body.style.removeProperty) {
    document.body.style.removeProperty("font-size");
   } else {
    document.body.style.removeAttribute("font-size");
   }
  }`;
  } else {
    rangeStartScript = "";
    rangeEndScript = "";
  }
  let finalScript = `<script>
document.addEventListener('DOMContentLoaded', (event) => {
 function setFontSize() {
  ${rangeStartScript}
   document.body.style.fontSize = window.innerWidth / ${designWidth} + "rem";
  ${rangeEndScript}
 }
 window.addEventListener("resize", function () { setFontSize(); });
 setFontSize();
});
</script>`;
  editor2.getDoc().setValue(finalScript);
}

// Dropdown
$(".dropdown").on("click", function () {
  if ($(this).hasClass("open")) {
    $(this).removeClass("open");
  } else {
    $(this).addClass("open");
  }
});
$(".dropdown").on("mouseenter", function () {
  $(this).addClass("open");
});
$(".dropdown").on("mouseleave", function () {
  $(this).removeClass("open");
});
$(".dropdown_link").on("click", function () {
  let linkText = $(this).find(".dropdown_text").text();
  let linkImg = $(this).find(".image-contain").attr("src");
  let parentDropdown = $(this).closest(".dropdown");
  parentDropdown.find(".selected").removeClass("selected");
  $(this).addClass("selected");
  parentDropdown.find(".dropdown_toggle .dropdown_text").text(linkText);
  parentDropdown.find(".dropdown_toggle .image-contain").attr("src", linkImg);
  updateValues();
});

$(".dropdown_link").on("click", function () {
  let linkText = $(this).find(".dropdown_text").text();
  let linkImg = $(this).find(".image-contain").attr("src");
  let parentDropdown = $(this).closest(".dropdown");
  parentDropdown.find(".selected").removeClass("selected");
  $(this).addClass("selected");
  parentDropdown.find(".dropdown_toggle .dropdown_text").text(linkText);
  parentDropdown.find(".dropdown_toggle .image-contain").attr("src", linkImg);
  updateValues();
});

// Field validation
$("[default-value]").on("focusout", function (e) {
  if ($(this).val() === "" || +$(this).val() < 0) {
    let defaultValue = +$(this).attr("default-value");
    $(this).val(defaultValue);
  }
});

// Toggle
$(".toggle").on("click", function () {
  $(this).toggleClass("active");
  $(this).closest(".field-wrap").find(".field").toggleClass("disabled");
  updateValues();
});
// Disable field if it has class
$("input[type=number]").on("keydown", function (e) {
  if ($(this).hasClass("disabled")) {
    return false;
  }
});
$(".field.is-url").on("keydown", function (e) {
  return false;
});
// Focus out on enter key press
$("input").on("keyup", function (e) {
  if (e.which == 13) {
    this.blur();
  }
});
// Focusout on all input field
$("input").on("focusout keyup change", function (e) {
  updateValues();
});
// Desktop small and tablet screen size change
desktopSmallS.on("focusout change keyup", function (e) {
  tabletS.val(+$(this).val() - 1);
});

// COPY TO CLIPBOARD
var temp = $("<textarea>");
$(".copy1").on("click", function () {
  $("body").append(temp);
  temp.val(editor.getValue()).select();
  document.execCommand("copy");
  temp.remove();
});
$(".copy2").on("click", function () {
  $("body").append(temp);
  temp.val(editor2.getValue()).select();
  document.execCommand("copy");
  temp.remove();
});
$(".code_copy.is-settings").on("click", function () {
  $("body").append(temp);
  temp.val($(".field.is-url").val()).select();
  document.execCommand("copy");
  temp.remove();
});
$(".code_copy").on("click", function () {
  $(this).addClass("pressed");
  setTimeout(() => {
    $(this).removeClass("pressed");
  }, 800);
});

function urlCreator() {
  let domain = location.host;
  let projectName = $(".field.is-client").val().replace(" ", "%20");
  myUrl = `https://${domain}/?designWidth=${designWidth}
&maxWidthToggle=${maxWidthToggle}
&maxWidth=${maxWidth}
&scaleType=${scaleType}
&bodyUnit=${bodyUnit}
&minWidthToggle=${minWidthToggle}
&minWidth=${minWidth}
&scaleDirection=${scaleDirection.replace(" ", "%20")}
&desktopLargeS=${desktopLargeS.val()}
&desktopLargeF=${desktopLargeF.val()}
&desktopSmallS=${desktopSmallS.val()}
&desktopSmallF=${desktopSmallF.val()}
&tabletS=${tabletS.val()}
&tabletF=${tabletF.val()}
&mobileS=${mobileS.val()}
&mobileF=${mobileF.val()}
&projectName=${projectName}`;
  $(".field.is-project.is-url").val(myUrl);
}
const params = new URLSearchParams(window.location.search);
function checkURL() {
  if (params.has("designWidth")) {
    $("#design-width").find(".field").val(params.get("designWidth"));
  }
  if (params.has("maxWidthToggle")) {
    if (params.get("maxWidthToggle") === "off") {
      $("#max-width").find(".toggle").click();
    }
  }
  if (params.has("maxWidth")) {
    $("#max-width").find(".field").val(params.get("maxWidth"));
  }
  if (params.has("scaleType")) {
    if (params.get("scaleType") === "Disproportional") {
      $("#disproportional-scale-type").click();
      $("#disproportional-scale-type").click();
    }
  }
  if (params.get("bodyUnit") === "REM") {
    $("#rem-body-unit").click();
    $("#rem-body-unit").click();
  }
  if (params.get("minWidthToggle") === "on") {
    $("#min-width").find(".toggle").click();
  }
  if (params.has("minWidth")) {
    $("#min-width").find(".field").val(params.get("minWidth"));
  }
  if (params.get("scaleDirection") === "Scale Up") {
    $("#up-scale-direction").click();
    $("#up-scale-direction").click();
  }
  if (params.has("desktopLargeS")) {
    desktopLargeS.val(params.get("desktopLargeS"));
  }
  if (params.has("desktopLargeF")) {
    desktopLargeF.val(params.get("desktopLargeF"));
  }
  if (params.has("desktopSmallS")) {
    desktopSmallS.val(params.get("desktopSmallS"));
  }
  if (params.has("desktopSmallF")) {
    desktopSmallF.val(params.get("desktopSmallF"));
  }
  if (params.has("tabletS")) {
    tabletS.val(params.get("tabletS"));
  }
  if (params.has("tabletF")) {
    tabletF.val(params.get("tabletF"));
  }
  if (params.has("mobileS")) {
    mobileS.val(params.get("mobileS"));
  }
  if (params.has("mobileF")) {
    mobileF.val(params.get("mobileF"));
  }
  if (params.has("projectName")) {
    $(".field.is-client").val(params.get("projectName"));
  }
  updateValues();
}
checkURL();
