var debug = true;
var knob = null;

function log(msg) {
  if(debug) {
    console.log(msg);
  }
}

function getOffset( el ) {
  var _x = 0;
  var _y = 0;
  while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
}


function distance(ox, oy, px, py) {
  return Math.sqrt(Math.pow(ox - px, 2) + Math.pow(oy - py, 2));
}

document.addEventListener("mousemove", function onmousemove(e) {
  if (knob) {
    document.body.focus();
    knob.dx = knob.x - e.clientX;
    knob.dy = knob.y - e.clientY;
    knob.x = e.clientX;
    knob.y = e.clientY;

    knob.element.mouseMoved(e.clientX, e.clientY);
  }
}, false);

/**
 * element : a div without child which will receive the knob
 * width, height in pixel (default : 200x30px)
 * min, max : in unit (default : 0 to 100)
 * increment : for wheel, coarse or fine adjusement (default : 1)
 * progression : linear, log (default : linerar)
 * type : vertical, horizontal, circular (default : vertical)
 * unit : the unit showed in the input (default : none)
 */

function Knob(element, param) {
  this.callbackValueChange = null;
  this.root = element;
  this.progression = param.progression || "linear";
  this.max = param.max || 100;
  this.min = param.min || 0;
  this.increment = param.increment || 1;
  this.width = param.width || "3Opx";
  this.height = param.height || "300px";
  this.type = param.type || "vertical";
  this.value = this.min;
  this.unit = param.unit || "";

  this.slider = document.createElement('div');
    var that = this;

  switch (this.type) {
    case "vertical":
      this.slider.className = "verticalFader";
      this.mouseMoved = mousemovedVertical;
      this.updateView = updateViewVertical;
      this.slider.addEventListener("click", fader_onclick_vertical, false);
      document.addEventListener("mouseup", function(e) {
        if (knob) {
          onmouseup(knob.dy);
        }
      }, false);
      break;
    case "horizontal":
      this.slider.className = "horizontalFader";
      this.mouseMoved = mousemovedHorizontal;
      this.updateView = updateViewHorizontal;
      this.slider.addEventListener("click", fader_onclick_horizontal, false);
      document.addEventListener("mouseup", function(e) {
        if (knob) {
          onmouseup(knob.dx);
        }
      }, false);
      break;
    case "circular":
      this.slider.className = "circularFader";
      this.height = this.width = this.height < this.width ? this.height : this.width;
      this.mouseMoved = mousemovedCircular;
      this.updateView = updateViewCircular;
      this.slider.addEventListener("click", fader_onclick_circular, false);
      document.addEventListener("mouseup", function(e) {
        if (knob) {
          onmouseup(knob.dy);
        }
      }, false);
      break;
    default:
      throw "type != (vertical|horizontal|circular)";
  }

  this.slider.style.height = this.height;
  this.slider.style.width = this.width;
  this.root.appendChild(this.slider);

  this.inside = document.createElement('div');
  this.inside.className = "inside";
  this.slider.appendChild(this.inside);

  this.label = document.createElement('input');
  this.label.className = "label";
  this.label.innerHTML = "0.0";
  this.label.addEventListener("change", function() {
    that.setValue(that.label.value);
  }, false);
  this.root.appendChild(this.label)


  function onmousedown(e) {
    // Only leftclick
    if (e.button == 0) {
      // Prevent dragging start dragging the image, if the background of the
      // fader is set to a gradient or svg (or even a bitmap).
      if(e.preventDefault) {
        e.preventDefault();
      }
      knob = {element: that,
        x:e.clientX,
        y:e.clientY,
        dx: 0,
        dy: 0};
    }
    document.addEventListener("mouseup", this.onmouseup, false);
  }

  function normalize(value, offset, maxValue, maxFinal) {
    return ((value - offset) / maxValue) * maxFinal;
  }


  this.slider.addEventListener("mousedown", onmousedown, false);
  this.slider.addEventListener("DOMMouseScroll", onscroll, false);
  this.slider.addEventListener("mousewheel", onscroll, false);

  var scrollDuration = 0;
  var isScrolling = false;

  function startDecelerate(element, initialSpeed) {
    var speed = initialSpeed;
    if (initialSpeed == 1) return;
    var factor = 0.99;
    function momentum() {
      if (isScrolling == true) {
        isScrolling = false;
        setTimeout(momentum, 33);
        return;
      }
      if (Math.abs(factor) > 0.1) {
        // reset the scroll duration counter
        scrollDuration = 0;
        factor *= factor;
        var computedValue = element.value - speed * factor * 0.1;
        if( computedValue > element.max*0.99 || computedValue < element.min * 0.99) {
          speed = -speed*0.7;
        }
        element.setValue(computedValue);
        setTimeout(function() {
          momentum();
        }, 33);
      } else {
        knob = null;
        scrollDuration = 0;
      }
    }
    momentum();
  }

  function onscroll(e) {
    isScrolling = true;
    var delta = 0;
    if (e.wheelDelta != undefined) {
      delta = -e.wheelDelta / 30;
    } else {
      delta = e.detail;
    }
    scrollDuration++;
    var factor = 1;
    if (e.altKey) {
      factor = 10;
    } else if (e.shiftKey) {
      factor = 0.1;
    }
    if(delta > 0) { // mousewheel down
      that.setValue(that.value + that.increment * factor);
      startDecelerate(that, -scrollDuration);
    } else { // mousewheel up
      that.setValue(that.value - that.increment * factor);
      startDecelerate(that, scrollDuration);
    }
  }

  function fader_onclick_vertical(e) {
    var pos = getOffset(that.slider);
    var value = normalize(e.clientY, pos.top, that.slider.offsetHeight, that.max);
    that.setValue(value);
  }

  function fader_onclick_horizontal(e) {
    var pos = getOffset(that.slider);
    var value = normalize(e.clientX, pos.left, that.slider.offsetWidth, that.max);
    that.setValue(value);
  }

  function fader_onclick_circular(e) {
  }

  function onmouseup(speed) {
    document.removeEventListener("mouseup", onmouseup);
    // Don't bouce or decelerate if we are slow
    if(knob.element.value != knob.element.max &&
        knob.element.value != knob.element.min ||
        Math.abs(speed) > 10) {
      startDecelerate(knob.element, speed);
    }
    knob = null;
  }

  this.setValue(this.min);
}


Knob.prototype.setValue = function(value) {
  if (value > this.max) {
    this.value = this.max;
  } else if (value < this.min) {
    this.value = this.min;
  } else {
    this.value = value;
  }
  this.updateView();
  this.label.value = (((this.value * 10) | 0) / 10) + this.unit;
  if (this.callbackValueChange) {
    this.callbackValueChange(this.value);
  }
}

Knob.prototype.onValueChange = function(callback) {
  this.callbackValueChange = callback;
}

function updateViewVertical() {
  this.inside.style.top = this.value / this.max * 100 + "%";
}

function updateViewHorizontal() {
  this.inside.style.left = this.value / this.max * 100 + "%";
}

function updateViewCircular() {
  var angle = (this.value / this.max) * 1.75 * Math.PI;
  angle += Math.PI + Math.PI / 2 + Math.PI / 8;
  this.inside.style.right = (Math.cos(angle)) * 35 - 40 + "%";
  this.inside.style.bottom = (Math.sin(angle)) * 35 - 42 + "%";
}

function mousemovedVertical(x, y) {
  var pos = getOffset(this.slider);
  if (y < pos.top) {
    y = pos.top;
  }
  if (y >= (pos.top + knob.element.slider.offsetHeight)) {
    y = pos.top + knob.element.slider.offsetHeight;
  }
  var value = (y - pos.top)/ (knob.element.slider.offsetHeight) * knob.element.max;
  knob.element.setValue(value);
}

function mousemovedHorizontal(x, y) {
  var pos = getOffset(this.slider);
  if (x < pos.top) {
    x = pos.top;
  }
  if (x >= (pos.left + this.slider.offsetWidth)) {
    x = pos.left + this.slider.offsetWidth;
  }
  var value = (x - pos.left)/ (this.slider.offsetWidth) * this.max;
  this.setValue(value);
}

function mousemovedCircular(x, y) {
  var pos = getOffset(this.slider);
  var center = pos.top + this.slider.offsetHeight/2;
  log(center + " " + y);
  if (y < (center - this.slider.offsetHeight*4)) {
    y = 0;
  }
  if (y >= ((center + this.slider.offsetHeight)*4)) {
    y = this.slider.offsetHeight*4;
  }
  var value = ((y / (this.slider.offsetHeight*4))) * this.max;
  value=this.max-value/2;
  this.setValue(value);
}


