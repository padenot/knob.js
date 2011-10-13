# knob.js, a knob and fader library in js.

## Story behind it
I was in need of faders and knobs to fiddle with parameters with experiments I
made with the Mozilla Audio data API (which were a complete failure, btw), and I
thought it was the opportunity to code something on the front-end, for once.

## Features

- Size is configurable
- Vertical, horizontal, rotative sliders / knobs are available
- Nice bouncing and inertia
- Mouse wheel
- Direct value entry
- Chrome & Firefox compatibility, maybe others.

## Features missing

- Logarithmic scale
- Ability to have more precision when the mouse is drag in another direction (i.e. more precision when dragging horizontally for a vertical slider).

## Usage

```html
<script src="knob.js"></script>
<div class=".anEmptyDiv"></div>
```

```js
// make a knob
var param = {
  width: "30",
  height: "150",
  min: 0,
  max: 100,
  progression: "linear",
  type: "vertical",
  increment: 3,
  unit: "dB"
};
var knob = new Knob(document.querySelector('.anEmptyDiv'), param);
knob.onValueChange(function(value) {
   console.log("value changed : " + value);
});
```

## Demo

<http://paul.cx/public/knob.js/tests/>

## License

New BSD

## The code sucks

Yes.

