
class CanvasImage {
  constructor(image) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    document.body.appendChild(this.canvas);

    this.width = this.canvas.width = image.width;
    this.height = this.canvas.height = image.height;

    this.context.drawImage(image, 0, 0, this.width, this.height);
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  update(imageData) {
    this.context.putImageData(imageData, 0, 0);
  }

  getPixelCount() {
    return this.width * this.height;
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.width, this.height);
  }

  removeCanvas() {
    this.canvas.parentNode.removeChild(this.canvas);
  }
}

class ColorSwatches {

  getHexSwatches(sourceImage, colorCount, quality) {
    const palettes = this.getPalette(sourceImage, colorCount, quality);
    return palettes.map((palette) => `#${palette.map((v) =>  ('0'+parseInt(v).toString(16)).slice(-2)).join('')}`)
  }

  getPalette(sourceImage, colorCount, quality) {

    if (typeof colorCount === 'undefined' || colorCount < 2 || colorCount > 256) {
      colorCount = 10;
    }
    if (typeof quality === 'undefined' || quality < 1) {
      quality = 10;
    }

    // Create custom CanvasImage object
    const image = new CanvasImage(sourceImage);
    const imageData = image.getImageData();
    const pixels = imageData.data;
    const pixelCount = image.getPixelCount();

    // Store the RGB values in an array format suitable for quantize function
    const pixelArray = [];
    for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
      offset = i * 4;
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];
      // If pixel is mostly opaque and not white
      if (a >= 125) {
        if (!(r > 250 && g > 250 && b > 250)) {
          pixelArray.push([r, g, b]);
        }
      }
    }

    // Send array to quantize function which clusters values
    // using median cut algorithm
    const cmap = MMCQ.quantize(pixelArray, colorCount);
    const palette = cmap ? cmap.palette() : null;

    // Clean up
    image.removeCanvas();
    return palette;
  };

  getImageData(imageUrl, callback) {
    xhr = new XMLHttpRequest();
    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'arraybuffer'
    xhr.onload = function (e) {
      if (this.status == 200) {
        uInt8Array = new Uint8Array(this.response)
        i = uInt8Array.length
        binaryString = new Array(i);
        for (var i = 0; i < uInt8Array.length; i++) {
          binaryString[i] = String.fromCharCode(uInt8Array[i])
        }
        data = binaryString.join('')
        base64 = window.btoa(data)
        callback(`data:image/png;base64,${base64}`)
      }
    }
    xhr.send();
  };
}




if (!pv) {
  var pv = {
    map(array, f) {
      var o = {};
      return f ? array.map((d, i) => { o.index = i; return f.call(o, d); }) : array.slice();
    },
    naturalOrder(a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    },
    sum(array, f) {
      var o = {};
      return array.reduce(f ? (p, d, i) => { o.index = i; return p + f.call(o, d); } : (p, d) => p + d, 0);
    },
    max(array, f) {
      return Math.max.apply(null, f ? pv.map(array, f) : array);
    }
  };
}


var MMCQ = ((() => {
  // private constants
  var sigbits = 5;

  var rshift = 8 - sigbits;
  var maxIterations = 1000;
  var fractByPopulations = 0.75;

  // get reduced-space color index for a pixel
  function getColorIndex(r, g, b) {
    return (r << (2 * sigbits)) + (g << sigbits) + b;
  }

  // Simple priority queue
  function PQueue(comparator) {
    var contents = [];
    var sorted = false;

    function sort() {
      contents.sort(comparator);
      sorted = true;
    }

    return {
      push(o) {
        contents.push(o);
        sorted = false;
      },
      peek(index) {
        if (!sorted) sort();
        if (index === undefined) index = contents.length - 1;
        return contents[index];
      },
      pop() {
        if (!sorted) sort();
        return contents.pop();
      },
      size() {
        return contents.length;
      },
      map(f) {
        return contents.map(f);
      },
      debug() {
        if (!sorted) sort();
        return contents;
      }
    };
  }

  // 3d color space box
  class VBox {
    constructor(r1, r2, g1, g2, b1, b2, histo) {
      const vbox = this;
      vbox.r1 = r1;
      vbox.r2 = r2;
      vbox.g1 = g1;
      vbox.g2 = g2;
      vbox.b1 = b1;
      vbox.b2 = b2;
      vbox.histo = histo;
    }

    volume(force) {
      const vbox = this;
      if (!vbox._volume || force) {
        vbox._volume = ((vbox.r2 - vbox.r1 + 1) * (vbox.g2 - vbox.g1 + 1) * (vbox.b2 - vbox.b1 + 1));
      }
      return vbox._volume;
    }

    count(force) {
      const vbox = this;
      const histo = vbox.histo;
      if (!vbox._count_set || force) {
        let npix = 0;
        let index;
        let i;
        let j;
        let k;
        for (i = vbox.r1; i <= vbox.r2; i++) {
          for (j = vbox.g1; j <= vbox.g2; j++) {
            for (k = vbox.b1; k <= vbox.b2; k++) {
              index = getColorIndex(i, j, k);
              npix += (histo[index] || 0);
            }
          }
        }
        vbox._count = npix;
        vbox._count_set = true;
      }
      return vbox._count;
    }

    copy() {
      const vbox = this;
      return new VBox(vbox.r1, vbox.r2, vbox.g1, vbox.g2, vbox.b1, vbox.b2, vbox.histo);
    }

    avg(force) {
      const vbox = this;
      const histo = vbox.histo;
      if (!vbox._avg || force) {
        let ntot = 0;
        const mult = 1 << (8 - sigbits);
        let rsum = 0;
        let gsum = 0;
        let bsum = 0;
        let hval;
        let i;
        let j;
        let k;
        let histoindex;
        for (i = vbox.r1; i <= vbox.r2; i++) {
          for (j = vbox.g1; j <= vbox.g2; j++) {
            for (k = vbox.b1; k <= vbox.b2; k++) {
              histoindex = getColorIndex(i, j, k);
              hval = histo[histoindex] || 0;
              ntot += hval;
              rsum += (hval * (i + 0.5) * mult);
              gsum += (hval * (j + 0.5) * mult);
              bsum += (hval * (k + 0.5) * mult);
            }
          }
        }
        if (ntot) {
          vbox._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
        } else {
          //                    console.log('empty box');
          vbox._avg = [
            ~~(mult * (vbox.r1 + vbox.r2 + 1) / 2),
            ~~(mult * (vbox.g1 + vbox.g2 + 1) / 2),
            ~~(mult * (vbox.b1 + vbox.b2 + 1) / 2)
          ];
        }
      }
      return vbox._avg;
    }

    contains(pixel) {
      const vbox = this;
      const rval = pixel[0] >> rshift;
      gval = pixel[1] >> rshift;
      bval = pixel[2] >> rshift;
      return (rval >= vbox.r1 && rval <= vbox.r2 &&
        gval >= vbox.g1 && gval <= vbox.g2 &&
        bval >= vbox.b1 && bval <= vbox.b2);
    }
  }

  // Color map
  class CMap {
    constructor() {
      this.vboxes = new PQueue((a, b) => pv.naturalOrder(
        a.vbox.count() * a.vbox.volume(),
        b.vbox.count() * b.vbox.volume()
      ));
    }

    push(vbox) {
      this.vboxes.push({
        vbox,
        color: vbox.avg()
      });
    }

    palette() {
      return this.vboxes.map(vb => vb.color);
    }

    size() {
      return this.vboxes.size();
    }

    map(color) {
      const vboxes = this.vboxes;
      for (let i = 0; i < vboxes.size(); i++) {
        if (vboxes.peek(i).vbox.contains(color)) {
          return vboxes.peek(i).color;
        }
      }
      return this.nearest(color);
    }

    nearest(color) {
      const vboxes = this.vboxes;
      let d1;
      let d2;
      let pColor;
      for (let i = 0; i < vboxes.size(); i++) {
        d2 = Math.sqrt(
          (color[0] - vboxes.peek(i).color[0]) ** 2 +
          (color[1] - vboxes.peek(i).color[1]) ** 2 +
          (color[2] - vboxes.peek(i).color[2]) ** 2
        );
        if (d2 < d1 || d1 === undefined) {
          d1 = d2;
          pColor = vboxes.peek(i).color;
        }
      }
      return pColor;
    }

    forcebw() {
      // XXX: won't  work yet
      const vboxes = this.vboxes;
      vboxes.sort((a, b) => pv.naturalOrder(pv.sum(a.color), pv.sum(b.color)));

      // force darkest color to black if everything < 5
      const lowest = vboxes[0].color;
      if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5)
        vboxes[0].color = [0, 0, 0];

      // force lightest color to white if everything > 251
      const idx = vboxes.length - 1;

      const highest = vboxes[idx].color;
      if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251)
        vboxes[idx].color = [255, 255, 255];
    }
  }

  // histo (1-d array, giving the number of pixels in
  // each quantized region of color space), or null on error
  function getHisto(pixels) {
    var histosize = 1 << (3 * sigbits);
    var histo = new Array(histosize);
    var index;
    var rval;
    var gval;
    var bval;
    pixels.forEach(pixel => {
      rval = pixel[0] >> rshift;
      gval = pixel[1] >> rshift;
      bval = pixel[2] >> rshift;
      index = getColorIndex(rval, gval, bval);
      histo[index] = (histo[index] || 0) + 1;
    });
    return histo;
  }

  function vboxFromPixels(pixels, histo) {
    var rmin = 1000000;
    var rmax = 0;
    var gmin = 1000000;
    var gmax = 0;
    var bmin = 1000000;
    var bmax = 0;
    var rval;
    var gval;
    var bval;
    // find min/max
    pixels.forEach(pixel => {
      rval = pixel[0] >> rshift;
      gval = pixel[1] >> rshift;
      bval = pixel[2] >> rshift;
      if (rval < rmin) rmin = rval;
      else if (rval > rmax) rmax = rval;
      if (gval < gmin) gmin = gval;
      else if (gval > gmax) gmax = gval;
      if (bval < bmin) bmin = bval;
      else if (bval > bmax) bmax = bval;
    });
    return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
  }

  function medianCutApply(histo, vbox) {
    if (!vbox.count()) return;

    var rw = vbox.r2 - vbox.r1 + 1;
    var gw = vbox.g2 - vbox.g1 + 1;
    var bw = vbox.b2 - vbox.b1 + 1;
    var maxw = pv.max([rw, gw, bw]);
    // only one pixel, no split
    if (vbox.count() == 1) {
      return [vbox.copy()];
    }

    /* Find the partial sum arrays along the selected axis. */
    var total = 0;

    var partialsum = [];
    var lookaheadsum = [];
    var i;
    var j;
    var k;
    var sum;
    var index;
    if (maxw == rw) {
      for (i = vbox.r1; i <= vbox.r2; i++) {
        sum = 0;
        for (j = vbox.g1; j <= vbox.g2; j++) {
          for (k = vbox.b1; k <= vbox.b2; k++) {
            index = getColorIndex(i, j, k);
            sum += (histo[index] || 0);
          }
        }
        total += sum;
        partialsum[i] = total;
      }
    }
    else if (maxw == gw) {
      for (i = vbox.g1; i <= vbox.g2; i++) {
        sum = 0;
        for (j = vbox.r1; j <= vbox.r2; j++) {
          for (k = vbox.b1; k <= vbox.b2; k++) {
            index = getColorIndex(j, i, k);
            sum += (histo[index] || 0);
          }
        }
        total += sum;
        partialsum[i] = total;
      }
    }
    else {  /* maxw == bw */
      for (i = vbox.b1; i <= vbox.b2; i++) {
        sum = 0;
        for (j = vbox.r1; j <= vbox.r2; j++) {
          for (k = vbox.g1; k <= vbox.g2; k++) {
            index = getColorIndex(j, k, i);
            sum += (histo[index] || 0);
          }
        }
        total += sum;
        partialsum[i] = total;
      }
    }
    partialsum.forEach((d, i) => {
      lookaheadsum[i] = total - d;
    });
    function doCut(color) {
      var dim1 = color + '1';
      var dim2 = color + '2';
      var left;
      var right;
      var vbox1;
      var vbox2;
      var d2;
      var count2 = 0;
      for (i = vbox[dim1]; i <= vbox[dim2]; i++) {
        if (partialsum[i] > total / 2) {
          vbox1 = vbox.copy();
          vbox2 = vbox.copy();
          left = i - vbox[dim1];
          right = vbox[dim2] - i;
          if (left <= right)
            d2 = Math.min(vbox[dim2] - 1, ~~(i + right / 2));
          else d2 = Math.max(vbox[dim1], ~~(i - 1 - left / 2));
          // avoid 0-count boxes
          while (!partialsum[d2]) d2++;
          count2 = lookaheadsum[d2];
          while (!count2 && partialsum[d2 - 1]) count2 = lookaheadsum[--d2];
          // set dimensions
          vbox1[dim2] = d2;
          vbox2[dim1] = vbox1[dim2] + 1;
          //                    console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
          return [vbox1, vbox2];
        }
      }
    }
    // determine the cut planes
    return maxw == rw ? doCut('r') :
      maxw == gw ? doCut('g') :
        doCut('b');
  }

  function quantize(pixels, maxcolors) {
    // short-circuit
    if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
      //            console.log('wrong number of maxcolors');
      return false;
    }

    // XXX: check color content and convert to grayscale if insufficient

    var histo = getHisto(pixels);

    var histosize = 1 << (3 * sigbits);

    // check that we aren't below maxcolors already
    var nColors = 0;
    histo.forEach(() => { nColors++; });
    if (nColors <= maxcolors) {
      // XXX: generate the new colors from the histo and return
    }

    // get the beginning vbox from the colors
    var vbox = vboxFromPixels(pixels, histo);

    var pq = new PQueue((a, b) => pv.naturalOrder(a.count(), b.count()));
    pq.push(vbox);

    // inner function to do the iteration
    function iter(lh, target) {
      var ncolors = 1;
      var niters = 0;
      var vbox;
      while (niters < maxIterations) {
        vbox = lh.pop();
        if (!vbox.count()) { /* just put it back */
          lh.push(vbox);
          niters++;
          continue;
        }

        // do the cut
        var vboxes = medianCutApply(histo, vbox);

        var vbox1 = vboxes[0];
        var vbox2 = vboxes[1];

        if (!vbox1) {
          //                    console.log("vbox1 not defined; shouldn't happen!");
          return;
        }
        lh.push(vbox1);
        if (vbox2) {  /* vbox2 can be null */
          lh.push(vbox2);
          ncolors++;
        }
        if (ncolors >= target) return;
        if (niters++ > maxIterations) {
          //                    console.log("infinite loop; perhaps too few pixels!");
          return;
        }
      }
    }

    // first set of colors, sorted by population
    iter(pq, fractByPopulations * maxcolors);

    // Re-sort by the product of pixel occupancy times the size in color space.
    var pq2 = new PQueue((a, b) => pv.naturalOrder(a.count() * a.volume(), b.count() * b.volume()));
    while (pq.size()) {
      pq2.push(pq.pop());
    }

    // next set - generate the median cuts using the (npix * vol) sorting.
    iter(pq2, maxcolors - pq2.size());

    // calculate the actual colors
    var cmap = new CMap();
    while (pq2.size()) {
      cmap.push(pq2.pop());
    }

    return cmap;
  }

  return {
    quantize
  };
}))();

export default ColorSwatches;
