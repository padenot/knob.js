var debug = true;
var knob = null;

function log(msg) {
  if(debug) {
    console.log(msg);
  }
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
    knob = that;
  }, false);

  this.slider.addEventListener("click", function(e) {
    var m_y = e.clientY;
    var thumb = that.inside;
    log(m_y);
    var value = ((m_y - that.slider.offsetTop) / that.slider.offsetHeight) * that.max;
    that.setValue(value);
  }, false);

  document.addEventListener("mousemove", function(e) {
    if (knob) {
      var m_y = e.clientY;
      log(m_y);
      if (m_y < that.slider.offsetTop) {
        log(that.slider.offsetTop);
        m_y = that.slider.offsetTop;
      }
      if (m_y >= (that.slider.offsetHeight)) {
        m_y = that.slider.offsetHeight + that.slider.offsetTop;
      }
      var value = (m_y - that.slider.offsetTop)/ that.slider.offsetHeight * knob.max;
      knob.setValue(value);
    }
  }, false);

  this.slider.addEventListener("DOMMouseScroll", function(e) {
    var factor;
    if (e.altKey) {
      factor = 10;
    } else if (e.shiftKey) {
      factor = 0.1;
    }
    if(e.detail > 0) { // mousewheel down
      that.setValue(that.value + that.increment * factor);
    } else { // mousewheel up
      that.setValue(that.value - that.increment * factor);
    }
  }, false);

  document.addEventListener("mouseup", function(e) {
    if (knob) {
      knob = null;
    }
  }, false);
}

Knob.prototype.setValue = function(value) {
  log("about to set this.value to : " + value);
  if (value > this.max) {
    this.value = this.max;
  } else if (value < this.min) {
    this.value = this.min;
  } else {
    this.value = value;
  }

  log("New value :" + this.value);

  this.root.querySelector('.inside').style.top = this.value / this.max * 100 + "%";
  this.label.value = ((this.value * 10) | 0) / 10;
}
