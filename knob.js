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

function Knob(element, width, height) {
  this.root = element;
  this.max = 100;
  this.min = 0;
  this.increment = 1;
  this.width = width;
  this.height = height;
  this.value = 0;

  this.className = "knobroot";

  this.slider = document.createElement('div');
  this.slider.className = "knob";
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
  var that = this;

  this.slider.addEventListener("mousedown", function(e) {
    if (e.button == 0) {
      if(e.preventDefault) {
        e.preventDefault();
      }
      knob = {element: that,
              x:e.clientX,
              y:e.clientY,
              dx: 0,
              dy: 0};
      return false;
    }
  }, false);

  this.slider.addEventListener("click", function(e) {
    var m_y = e.clientY;
    var thumb = that.inside;
    var pos = getOffset(that.slider);
    var value = ((m_y - pos.top) / that.slider.offsetHeight) * that.max;
    that.setValue(value);
  }, false);

  document.addEventListener("mousemove", function(e) {
    if (knob) {
      document.body.focus();
      knob.dx = knob.x - e.clientX;
      knob.dy = knob.y - e.clientY;
      knob.x = e.clientX;
      knob.y = e.clientY;
      var pos = getOffset(that.slider);
      var m_y = e.clientY;
      log(m_y +" "+ pos.top + " " + that.slider.offsetHeight);
      if (m_y < pos.top) {
        m_y = pos.top;
      }
      if (m_y >= (pos.top + that.slider.offsetHeight)) {
        m_y = pos.top + that.slider.offsetHeight;
      }
      var value = (m_y - pos.top)/ (that.slider.offsetHeight) * knob.element.max;
      knob.element.setValue(value);
    }
  }, false);

  this.slider.addEventListener("DOMMouseScroll", onscroll, false);
  this.slider.addEventListener("mousewheel", onscroll, false);
 
  var scrollDuration = 0;
  var isScrolling = false;

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

  document.addEventListener("mouseup", function(e) {
    if (knob) {
      if(Math.abs(knob.dy) > 0.1 && knob.element.value != knob.element.max && knob.element.value != knob.element.min) {
        startDecelerate(knob.element, knob.dy);
      }
    }
    log("knob is null");
    knob = null;
  }, false);
}

Knob.prototype.setValue = function(value) {
  if (value > this.max) {
    this.value = this.max;
  } else if (value < this.min) {
    this.value = this.min;
  } else {
    this.value = value;
  }

  this.root.querySelector('.inside').style.top = this.value / this.max * 100 + "%";
  this.label.value = ((this.value * 10) | 0) / 10;
}
