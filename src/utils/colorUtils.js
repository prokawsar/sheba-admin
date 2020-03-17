export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function colorLuminance(hex){
  let rgb = hexToRgb(hex);
  if(rgb){
    let adjusted = Object.values(rgb).map((value) => {
      let v = value / 255;
      if (v < 0.03928) {
        v = v / 12.92;
      } else {
        v = (v + .055) / 1.055;
        v = Math.pow(v, 2);
      }
      return v;
    });
    let adjustedTotal = (adjusted[0] * .2126) + (adjusted[1] * .7152) + (adjusted[2] * .0722)
    return Math.round(adjustedTotal * 1e5) / 1e5; //5 decimal places
  }

  return 0;
}

export function findColorInvert(hex){
  if(colorLuminance(hex) > 0.55){
    return 'rgba(0, 0, 0, 0.7)';
  }
  return '#ffffff';
}

export function colorInverse(hex){
  var color = hex.substring(1); // remove #
  color = parseInt(color, 16); // convert to integer
  color = 0xFFFFFF ^ color; // invert three bytes
  color = color.toString(16); // convert to hex
  color = ("000000" + color).slice(-6); // pad with leading zeros
  return "#" + color;
}

export function colorComplement(hex){
  var {r,g,b} = hexToRgb(hex);
  r /= 255.0;
  g /= 255.0;
  b /= 255.0;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2.0;

  if(max == min) {
    h = s = 0;  //achromatic
  } else {
      var d = max - min;
      s = (l > 0.5 ? d / (2.0 - max - min) : d / (max + min));

      if(max == r && g >= b) {
          h = 1.0472 * (g - b) / d ;
      } else if(max == r && g < b) {
          h = 1.0472 * (g - b) / d + 6.2832;
      } else if(max == g) {
          h = 1.0472 * (b - r) / d + 2.0944;
      } else if(max == b) {
          h = 1.0472 * (r - g) / d + 4.1888;
      }
  }

  h = h / 6.2832 * 360.0 + 0;

  // Shift hue to opposite side of wheel and convert to [0-1] value
  h+= 180;
  if (h > 360) { h -= 360; }
  h /= 360;

  // Convert h s and l values into r g and b values
  // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
  if(s === 0){
      r = g = b = l; // achromatic
  } else {
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      };

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  return rgbToHex(r, g, b)
}