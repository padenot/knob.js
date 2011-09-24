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
  this.width = param.width || "3O";
  this.height = param.height || "300";
  this.type = param.type || "vertical";
  this.value = this.min;
  this.unit = param.unit || "";

  this.slider = document.createElement('div');
  var that = this;

  this.root.appendChild(this.slider);

  this.inside = document.createElement('div');
  this.inside.className = "inside";
  this.slider.appendChild(this.inside);

  this.label = document.createElement('input');
  this.label.className = "label";
  this.label.addEventListener("change", function() {
    that.setValue(that.label.value);
  }, false);
  this.root.appendChild(this.label)

  switch (this.type) {
    case "vertical":
      this.slider.className = "verticalFader";
      this.mouseMoved = mousemovedVertical;
      this.updateView = updateViewVertical;
      this.slider.addEventListener("click", fader_onclick_vertical, false);
      this.inside.width = this.width - this.width / 5;
      this.inside.height = this.height / 10;
      this.slider.style.paddingTop = this.height / 15 + "px";
      this.slider.style.paddingBottom = this.height / 15 + "px";
      this.inside.style.height = this.inside.height + "px";
      this.inside.style.marginLeft = this.inside.width / 10 + "px";
      this.inside.style.marginTop = -this.inside.height / 2 + "px";
      this.inside.style.width = this.inside.width + "px";
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
      this.inside.height = this.height - this.height / 5;
      this.inside.width = this.width / 15;
      this.slider.style.paddingRight = this.width / 20 + "px";
      this.slider.style.paddingLeft = this.width / 20 + "px";
      this.inside.style.height = this.inside.height + "px";
      this.inside.style.marginTop = this.inside.height / 10 + "px";
      this.inside.style.marginLeft = -this.inside.width / 2 + "px";
      this.inside.style.width = this.inside.width + "px";
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
      this.inside.width = this.inside.height = param.insideSize || this.height / 8;
      this.inside.style.width = this.inside.style.height = this.inside.width + "px";
      document.addEventListener("mouseup", function(e) {
        if (knob) {
          onmouseup(knob.dy);
        }
      }, false);
      break;
    default:
      throw "type != (vertical|horizontal|circular)";
  }

  this.slider.style.height = this.height + "px";
  this.slider.style.width = this.width + "px";


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
  }

  function normalize(value, offset, maxValue, maxFinal) {
    return ((value - offset) / maxValue) * maxFinal;
  }


  this.slider.addEventListener("mousedown", onmousedown, false);
  this.slider.addEventListener("DOMMouseScroll", onscroll, false);
  this.slider.addEventListener("mousewheel", onscroll, false);

  var scrollDuration = 0;
  var isScrolling = false;

  function startDecelerate(element, initialSpeed, direction) {
    direction = direction || -1;
    if (element.type == "horizontal") {
      direction = 1;
    }
    var speed = initialSpeed * direction;
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
        // decrease speed when we bounce
        if( computedValue > element.max*0.99 || computedValue < element.min * 0.99) {
          speed = -speed*0.3;
        }
        element.setValue(computedValue);
        setTimeout(momentum, 33);
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
      delta = -e.wheelDelta / 20;
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
      that.setValue(that.value - that.increment * factor);
      startDecelerate(that, scrollDuration, 1);
    } else { // mousewheel up
      that.setValue(that.value + that.increment * factor);
      startDecelerate(that, -scrollDuration, 1);
    }
  }

  function fader_onclick_vertical(e) {
    var pos = getOffset(that.slider);
    var value = that.max - normalize(e.clientY, pos.top, that.slider.offsetHeight, that.max);
    that.setValue(value);
  }

  function fader_onclick_horizontal(e) {
    var pos = getOffset(that.slider);
    var value = normalize(e.clientX, pos.left, that.slider.offsetWidth, that.max);
    that.setValue(value);
  }

  function fader_onclick_circular(e) {
    // NOOP
  }

  function onmouseup(speed) {
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
  // Round to first decimal, and append unit
  this.label.value = (((this.value * 10) | 0) / 10) + " " + this.unit;
  if (this.callbackValueChange) {
    this.callbackValueChange(this.value);
  }
}

Knob.prototype.onValueChange = function(callback) {
  this.callbackValueChange = callback;
}

function updateViewVertical() {
  this.inside.style.top = this.max - this.value / this.max * 100 + "%";
}

function updateViewHorizontal() {
  this.inside.style.left = this.value / this.max * 100 + "%";
}

function updateViewCircular() {
  var angle = (this.value / this.max) * 1.75 * Math.PI;
  angle += Math.PI + Math.PI / 8;
  this.inside.style.left = (Math.sin(angle)) * (this.height/3) + this.height/2 - this.inside.width/2 + "px";
  this.inside.style.bottom = (Math.cos(angle)) * (this.height/3) - this.height/2 + this.inside.height/2 + "px";
}

function mousemovedVertical(x, y) {
  this.setValue(this.value + knob.dy / 2);
}

function mousemovedHorizontal(x, y) {
  this.setValue(this.value - knob.dx / 3);
}

function mousemovedCircular(x, y) {
  var pos = getOffset(this.slider);
  value = knob.dy / 4;
  this.setValue(this.value + value);
}


