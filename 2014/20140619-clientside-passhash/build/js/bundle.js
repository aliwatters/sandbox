(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Hashes = require('jshashes');

// custom alphabet defined.
window._app = {
  Hashes   : Hashes,
  alphabet : '0123456789abcdefghijklmnopqrstuvwzxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!#$%^&*()_+-={};":<>?,./',
  safeAlphabet : '0123456789abcdefghijklmnopqrstuvwzxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeric  : '0123456789'
};
console.log('jsHashes loaded');

var str = 'This is a sample text!';
// new SHA1 instance and base64 string encoding

var SHA512 = new Hashes.SHA512();

// some stretching - 10 to test
var max = 10;
var i;
var code = str;

console.time('testing');
for (i = 0; i < max; i++) {
  code = SHA512.hex(code);
}
console.timeEnd('testing');
if (code === '86d2244eab6d733d690a7cf746cf450a23acd002e650667d0fb04055952ef30d384a075f595818410911ec5cdd8733d9e9e4b3ffa3b9e3ca61d05935c9c62b6f') {
  console.log('TEST PASSED');
} else {
  console.log('problem in browser for hashesjs');
}


},{"jshashes":2}],2:[function(require,module,exports){
(function (global){
/**
 * jshashes - https://github.com/h2non/jshashes
 * Released under the "New BSD" license
 *
 * Algorithms specification:
 *
 * MD5 - http://www.ietf.org/rfc/rfc1321.txt
 * RIPEMD-160 - http://homes.esat.kuleuven.be/~bosselae/ripemd160.html
 * SHA1   - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA256 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA512 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * HMAC - http://www.ietf.org/rfc/rfc2104.txt
 */
(function() {
  var Hashes;

  function utf8Encode(str) {
    var x, y, output = '',
      i = -1,
      l;

    if (str && str.length) {
      l = str.length;
      while ((i += 1) < l) {
        /* Decode utf-16 surrogate pairs */
        x = str.charCodeAt(i);
        y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
          i += 1;
        }
        /* Encode output as utf-8 */
        if (x <= 0x7F) {
          output += String.fromCharCode(x);
        } else if (x <= 0x7FF) {
          output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
            0x80 | (x & 0x3F));
        } else if (x <= 0xFFFF) {
          output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        } else if (x <= 0x1FFFFF) {
          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
            0x80 | ((x >>> 12) & 0x3F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        }
      }
    }
    return output;
  }

  function utf8Decode(str) {
    var i, ac, c1, c2, c3, arr = [],
      l;
    i = ac = c1 = c2 = c3 = 0;

    if (str && str.length) {
      l = str.length;
      str += '';

      while (i < l) {
        c1 = str.charCodeAt(i);
        ac += 1;
        if (c1 < 128) {
          arr[ac] = String.fromCharCode(c1);
          i += 1;
        } else if (c1 > 191 && c1 < 224) {
          c2 = str.charCodeAt(i + 1);
          arr[ac] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = str.charCodeAt(i + 1);
          c3 = str.charCodeAt(i + 2);
          arr[ac] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
    }
    return arr.join('');
  }

  /**
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */

  function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /**
   * Bitwise rotate a 32-bit number to the left.
   */

  function bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /**
   * Convert a raw string to a hex string
   */

  function rstr2hex(input, hexcase) {
    var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef',
      output = '',
      x, i = 0,
      l = input.length;
    for (; i < l; i += 1) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
  }

  /**
   * Encode a string as utf-16
   */

  function str2rstr_utf16le(input) {
    var i, l = input.length,
      output = '';
    for (i = 0; i < l; i += 1) {
      output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
    }
    return output;
  }

  function str2rstr_utf16be(input) {
    var i, l = input.length,
      output = '';
    for (i = 0; i < l; i += 1) {
      output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
    }
    return output;
  }

  /**
   * Convert an array of big-endian words to a string
   */

  function binb2rstr(input) {
    var i, l = input.length * 32,
      output = '';
    for (i = 0; i < l; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
    }
    return output;
  }

  /**
   * Convert an array of little-endian words to a string
   */

  function binl2rstr(input) {
    var i, l = input.length * 32,
      output = '';
    for (i = 0; i < l; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
    }
    return output;
  }

  /**
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   */

  function rstr2binl(input) {
    var i, l = input.length * 8,
      output = Array(input.length >> 2),
      lo = output.length;
    for (i = 0; i < lo; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < l; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return output;
  }

  /**
   * Convert a raw string to an array of big-endian words
   * Characters >255 have their high-byte silently ignored.
   */

  function rstr2binb(input) {
    var i, l = input.length * 8,
      output = Array(input.length >> 2),
      lo = output.length;
    for (i = 0; i < lo; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < l; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return output;
  }

  /**
   * Convert a raw string to an arbitrary string encoding
   */

  function rstr2any(input, encoding) {
    var divisor = encoding.length,
      remainders = Array(),
      i, q, x, ld, quotient, dividend, output, full_length;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    dividend = Array(Math.ceil(input.length / 2));
    ld = dividend.length;
    for (i = 0; i < ld; i += 1) {
      dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    /**
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. We stop when the dividend is zerHashes.
     * All remainders are stored for later use.
     */
    while (dividend.length > 0) {
      quotient = Array();
      x = 0;
      for (i = 0; i < dividend.length; i += 1) {
        x = (x << 16) + dividend[i];
        q = Math.floor(x / divisor);
        x -= q * divisor;
        if (quotient.length > 0 || q > 0) {
          quotient[quotient.length] = q;
        }
      }
      remainders[remainders.length] = x;
      dividend = quotient;
    }

    /* Convert the remainders to the output string */
    output = '';
    for (i = remainders.length - 1; i >= 0; i--) {
      output += encoding.charAt(remainders[i]);
    }

    /* Append leading zero equivalents */
    full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    for (i = output.length; i < full_length; i += 1) {
      output = encoding[0] + output;
    }
    return output;
  }

  /**
   * Convert a raw string to a base-64 string
   */

  function rstr2b64(input, b64pad) {
    var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = '',
      len = input.length,
      i, j, triplet;
    b64pad = b64pad || '=';
    for (i = 0; i < len; i += 3) {
      triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      for (j = 0; j < 4; j += 1) {
        if (i * 8 + j * 6 > input.length * 8) {
          output += b64pad;
        } else {
          output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
      }
    }
    return output;
  }

  Hashes = {
    /**
     * @property {String} version
     * @readonly
     */
    VERSION: '1.0.5',
    /**
     * @member Hashes
     * @class Base64
     * @constructor
     */
    Base64: function() {
      // private properties
      var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        pad = '=', // default pad according with the RFC standard
        url = false, // URL encoding support @todo
        utf8 = true; // by default enable UTF-8 support encoding

      // public method for encoding
      this.encode = function(input) {
        var i, j, triplet,
          output = '',
          len = input.length;

        pad = pad || '=';
        input = (utf8) ? utf8Encode(input) : input;

        for (i = 0; i < len; i += 3) {
          triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
          for (j = 0; j < 4; j += 1) {
            if (i * 8 + j * 6 > len * 8) {
              output += pad;
            } else {
              output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
            }
          }
        }
        return output;
      };

      // public method for decoding
      this.decode = function(input) {
        // var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var i, o1, o2, o3, h1, h2, h3, h4, bits, ac,
          dec = '',
          arr = [];
        if (!input) {
          return input;
        }

        i = ac = 0;
        input = input.replace(new RegExp('\\' + pad, 'gi'), ''); // use '='
        //input += '';

        do { // unpack four hexets into three octets using index points in b64
          h1 = tab.indexOf(input.charAt(i += 1));
          h2 = tab.indexOf(input.charAt(i += 1));
          h3 = tab.indexOf(input.charAt(i += 1));
          h4 = tab.indexOf(input.charAt(i += 1));

          bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

          o1 = bits >> 16 & 0xff;
          o2 = bits >> 8 & 0xff;
          o3 = bits & 0xff;
          ac += 1;

          if (h3 === 64) {
            arr[ac] = String.fromCharCode(o1);
          } else if (h4 === 64) {
            arr[ac] = String.fromCharCode(o1, o2);
          } else {
            arr[ac] = String.fromCharCode(o1, o2, o3);
          }
        } while (i < input.length);

        dec = arr.join('');
        dec = (utf8) ? utf8Decode(dec) : dec;

        return dec;
      };

      // set custom pad string
      this.setPad = function(str) {
        pad = str || pad;
        return this;
      };
      // set custom tab string characters
      this.setTab = function(str) {
        tab = str || tab;
        return this;
      };
      this.setUTF8 = function(bool) {
        if (typeof bool === 'boolean') {
          utf8 = bool;
        }
        return this;
      };
    },

    /**
     * CRC-32 calculation
     * @member Hashes
     * @method CRC32
     * @static
     * @param {String} str Input String
     * @return {String}
     */
    CRC32: function(str) {
      var crc = 0,
        x = 0,
        y = 0,
        table, i, iTop;
      str = utf8Encode(str);

      table = [
        '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 ',
        '79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 ',
        '84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F ',
        '63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD ',
        'A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC ',
        '51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 ',
        'B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 ',
        '06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 ',
        'E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 ',
        '12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 ',
        'D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 ',
        '33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 ',
        'CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 ',
        '9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E ',
        '7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D ',
        '806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 ',
        '60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA ',
        'AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 ',
        '5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 ',
        'B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 ',
        '05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 ',
        'F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA ',
        '11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 ',
        'D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F ',
        '30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E ',
        'C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D'
      ].join('');

      crc = crc ^ (-1);
      for (i = 0, iTop = str.length; i < iTop; i += 1) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = '0x' + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
      }
      // always return a positive number (that's what >>> 0 does)
      return (crc ^ (-1)) >>> 0;
    },
    /**
     * @member Hashes
     * @class MD5
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See <http://pajhome.org.uk/crypt/md5> for more infHashes.
     */
    MD5: function(options) {
      /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
        b64pad = (options && typeof options.pad === 'string') ? options.pda : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

      // privileged (public) methods
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8), hexcase);
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d), hexcase);
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {Boolean}
       * @return {Object} this
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {String} Pad
       * @return {Object} this
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {Boolean}
       * @return {Object} [this]
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the MD5 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binl2rstr(binl(rstr2binl(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-MD5, of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        var bkey, ipad, opad, hash, i;

        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        bkey = rstr2binl(key);
        if (bkey.length > 16) {
          bkey = binl(bkey, key.length * 8);
        }

        ipad = Array(16), opad = Array(16);
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl(opad.concat(hash), 512 + 128));
      }

      /**
       * Calculate the MD5 of an array of little-endian words, and a bit length.
       */

      function binl(x, len) {
        var i, olda, oldb, oldc, oldd,
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878;

        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;

          a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
      }

      /**
       * These functions implement the four basic operations the algorithm uses.
       */

      function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
      }

      function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
      }

      function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
      }

      function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
      }
    },
    /**
     * @member Hashes
     * @class Hashes.SHA1
     * @param {Object} [config]
     * @constructor
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS 180-1
     * Version 2.2 Copyright Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    SHA1: function(options) {
      /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
        b64pad = (options && typeof options.pad === 'string') ? options.pda : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

      // public methods
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8), hexcase);
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-SHA1 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        var bkey, ipad, opad, i, hash;
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        bkey = rstr2binb(key);

        if (bkey.length > 16) {
          bkey = binb(bkey, key.length * 8);
        }
        ipad = Array(16), opad = Array(16);
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 512 + 160));
      }

      /**
       * Calculate the SHA-1 of an array of big-endian words, and a bit length
       */

      function binb(x, len) {
        var i, j, t, olda, oldb, oldc, oldd, olde,
          w = Array(80),
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878,
          e = -1009589776;

        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        for (i = 0; i < x.length; i += 16) {
          olda = a,
          oldb = b;
          oldc = c;
          oldd = d;
          olde = e;

          for (j = 0; j < 80; j += 1) {
            if (j < 16) {
              w[j] = x[i + j];
            } else {
              w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
              safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = bit_rol(b, 30);
            b = a;
            a = t;
          }

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
          e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
      }

      /**
       * Perform the appropriate triplet combination function for the current
       * iteration
       */

      function sha1_ft(t, b, c, d) {
        if (t < 20) {
          return (b & c) | ((~b) & d);
        }
        if (t < 40) {
          return b ^ c ^ d;
        }
        if (t < 60) {
          return (b & c) | (b & d) | (c & d);
        }
        return b ^ c ^ d;
      }

      /**
       * Determine the appropriate additive constant for the current iteration
       */

      function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
          (t < 60) ? -1894007588 : -899497514;
      }
    },
    /**
     * @class Hashes.SHA256
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2
     * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://anmar.eu.org/projects/jssha2/
     */
    SHA256: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pda : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        sha256_K;

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s, utf8) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-sha256 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        var hash, i = 0,
          bkey = rstr2binb(key),
          ipad = Array(16),
          opad = Array(16);

        if (bkey.length > 16) {
          bkey = binb(bkey, key.length * 8);
        }

        for (; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 512 + 256));
      }

      /*
       * Main sha256 function, with its support functions
       */

      function sha256_S(X, n) {
        return (X >>> n) | (X << (32 - n));
      }

      function sha256_R(X, n) {
        return (X >>> n);
      }

      function sha256_Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
      }

      function sha256_Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
      }

      function sha256_Sigma0256(x) {
        return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));
      }

      function sha256_Sigma1256(x) {
        return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));
      }

      function sha256_Gamma0256(x) {
        return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));
      }

      function sha256_Gamma1256(x) {
        return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));
      }

      function sha256_Sigma0512(x) {
        return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));
      }

      function sha256_Sigma1512(x) {
        return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));
      }

      function sha256_Gamma0512(x) {
        return (sha256_S(x, 1) ^ sha256_S(x, 8) ^ sha256_R(x, 7));
      }

      function sha256_Gamma1512(x) {
        return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));
      }

      sha256_K = [
        1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
        1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
        264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
        113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
        1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
        1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
      ];

      function binb(m, l) {
        var HASH = [1779033703, -1150833019, 1013904242, -1521486534,
          1359893119, -1694144372, 528734635, 1541459225
        ];
        var W = new Array(64);
        var a, b, c, d, e, f, g, h;
        var i, j, T1, T2;

        /* append padding */
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (i = 0; i < m.length; i += 16) {
          a = HASH[0];
          b = HASH[1];
          c = HASH[2];
          d = HASH[3];
          e = HASH[4];
          f = HASH[5];
          g = HASH[6];
          h = HASH[7];

          for (j = 0; j < 64; j += 1) {
            if (j < 16) {
              W[j] = m[j + i];
            } else {
              W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                sha256_Gamma0256(W[j - 15])), W[j - 16]);
            }

            T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
              sha256_K[j]), W[j]);
            T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
            h = g;
            g = f;
            f = e;
            e = safe_add(d, T1);
            d = c;
            c = b;
            b = a;
            a = safe_add(T1, T2);
          }

          HASH[0] = safe_add(a, HASH[0]);
          HASH[1] = safe_add(b, HASH[1]);
          HASH[2] = safe_add(c, HASH[2]);
          HASH[3] = safe_add(d, HASH[3]);
          HASH[4] = safe_add(e, HASH[4]);
          HASH[5] = safe_add(f, HASH[5]);
          HASH[6] = safe_add(g, HASH[6]);
          HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
      }

    },

    /**
     * @class Hashes.SHA512
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-512, as defined in FIPS 180-2
     * Version 2.2 Copyright Anonymous Contributor, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    SHA512: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false,
        /* hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pda : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        sha512_k;

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      /* private methods */

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }
      /*
       * Calculate the HMAC-SHA-512 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;

        var hash, i = 0,
          bkey = rstr2binb(key),
          ipad = Array(32),
          opad = Array(32);

        if (bkey.length > 32) {
          bkey = binb(bkey, key.length * 8);
        }

        for (; i < 32; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        hash = binb(ipad.concat(rstr2binb(data)), 1024 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 1024 + 512));
      }

      /**
       * Calculate the SHA-512 of an array of big-endian dwords, and a bit length
       */

      function binb(x, len) {
        var j, i, l,
          W = new Array(80),
          hash = new Array(16),
          //Initial hash values
          H = [
            new int64(0x6a09e667, -205731576),
            new int64(-1150833019, -2067093701),
            new int64(0x3c6ef372, -23791573),
            new int64(-1521486534, 0x5f1d36f1),
            new int64(0x510e527f, -1377402159),
            new int64(-1694144372, 0x2b3e6c1f),
            new int64(0x1f83d9ab, -79577749),
            new int64(0x5be0cd19, 0x137e2179)
          ],
          T1 = new int64(0, 0),
          T2 = new int64(0, 0),
          a = new int64(0, 0),
          b = new int64(0, 0),
          c = new int64(0, 0),
          d = new int64(0, 0),
          e = new int64(0, 0),
          f = new int64(0, 0),
          g = new int64(0, 0),
          h = new int64(0, 0),
          //Temporary variables not specified by the document
          s0 = new int64(0, 0),
          s1 = new int64(0, 0),
          Ch = new int64(0, 0),
          Maj = new int64(0, 0),
          r1 = new int64(0, 0),
          r2 = new int64(0, 0),
          r3 = new int64(0, 0);

        if (sha512_k === undefined) {
          //SHA512 constants
          sha512_k = [
            new int64(0x428a2f98, -685199838), new int64(0x71374491, 0x23ef65cd),
            new int64(-1245643825, -330482897), new int64(-373957723, -2121671748),
            new int64(0x3956c25b, -213338824), new int64(0x59f111f1, -1241133031),
            new int64(-1841331548, -1357295717), new int64(-1424204075, -630357736),
            new int64(-670586216, -1560083902), new int64(0x12835b01, 0x45706fbe),
            new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, -704662302),
            new int64(0x72be5d74, -226784913), new int64(-2132889090, 0x3b1696b1),
            new int64(-1680079193, 0x25c71235), new int64(-1046744716, -815192428),
            new int64(-459576895, -1628353838), new int64(-272742522, 0x384f25e3),
            new int64(0xfc19dc6, -1953704523), new int64(0x240ca1cc, 0x77ac9c65),
            new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
            new int64(0x5cb0a9dc, -1119749164), new int64(0x76f988da, -2096016459),
            new int64(-1740746414, -295247957), new int64(-1473132947, 0x2db43210),
            new int64(-1341970488, -1728372417), new int64(-1084653625, -1091629340),
            new int64(-958395405, 0x3da88fc2), new int64(-710438585, -1828018395),
            new int64(0x6ca6351, -536640913), new int64(0x14292967, 0xa0e6e70),
            new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
            new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, -1651133473),
            new int64(0x650a7354, -1951439906), new int64(0x766a0abb, 0x3c77b2a8),
            new int64(-2117940946, 0x47edaee6), new int64(-1838011259, 0x1482353b),
            new int64(-1564481375, 0x4cf10364), new int64(-1474664885, -1136513023),
            new int64(-1035236496, -789014639), new int64(-949202525, 0x654be30),
            new int64(-778901479, -688958952), new int64(-694614492, 0x5565a910),
            new int64(-200395387, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
            new int64(0x19a4c116, -1194143544), new int64(0x1e376c08, 0x5141ab53),
            new int64(0x2748774c, -544281703), new int64(0x34b0bcb5, -509917016),
            new int64(0x391c0cb3, -976659869), new int64(0x4ed8aa4a, -482243893),
            new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, -692930397),
            new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
            new int64(-2067236844, -1578062990), new int64(-1933114872, 0x1a6439ec),
            new int64(-1866530822, 0x23631e28), new int64(-1538233109, -561857047),
            new int64(-1090935817, -1295615723), new int64(-965641998, -479046869),
            new int64(-903397682, -366583396), new int64(-779700025, 0x21c0c207),
            new int64(-354779690, -840897762), new int64(-176337025, -294727304),
            new int64(0x6f067aa, 0x72176fba), new int64(0xa637dc5, -1563912026),
            new int64(0x113f9804, -1090974290), new int64(0x1b710b35, 0x131c471b),
            new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
            new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, -1676669620),
            new int64(0x4cc5d4be, -885112138), new int64(0x597f299c, -60457430),
            new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817)
          ];
        }

        for (i = 0; i < 80; i += 1) {
          W[i] = new int64(0, 0);
        }

        // append padding to the source string. The format is described in the FIPS.
        x[len >> 5] |= 0x80 << (24 - (len & 0x1f));
        x[((len + 128 >> 10) << 5) + 31] = len;
        l = x.length;
        for (i = 0; i < l; i += 32) { //32 dwords is the block size
          int64copy(a, H[0]);
          int64copy(b, H[1]);
          int64copy(c, H[2]);
          int64copy(d, H[3]);
          int64copy(e, H[4]);
          int64copy(f, H[5]);
          int64copy(g, H[6]);
          int64copy(h, H[7]);

          for (j = 0; j < 16; j += 1) {
            W[j].h = x[i + 2 * j];
            W[j].l = x[i + 2 * j + 1];
          }

          for (j = 16; j < 80; j += 1) {
            //sigma1
            int64rrot(r1, W[j - 2], 19);
            int64revrrot(r2, W[j - 2], 29);
            int64shr(r3, W[j - 2], 6);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;
            //sigma0
            int64rrot(r1, W[j - 15], 1);
            int64rrot(r2, W[j - 15], 8);
            int64shr(r3, W[j - 15], 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
          }

          for (j = 0; j < 80; j += 1) {
            //Ch
            Ch.l = (e.l & f.l) ^ (~e.l & g.l);
            Ch.h = (e.h & f.h) ^ (~e.h & g.h);

            //Sigma1
            int64rrot(r1, e, 14);
            int64rrot(r2, e, 18);
            int64revrrot(r3, e, 9);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;

            //Sigma0
            int64rrot(r1, a, 28);
            int64revrrot(r2, a, 2);
            int64revrrot(r3, a, 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            //Maj
            Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
            Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);

            int64add5(T1, h, s1, Ch, sha512_k[j], W[j]);
            int64add(T2, s0, Maj);

            int64copy(h, g);
            int64copy(g, f);
            int64copy(f, e);
            int64add(e, d, T1);
            int64copy(d, c);
            int64copy(c, b);
            int64copy(b, a);
            int64add(a, T1, T2);
          }
          int64add(H[0], H[0], a);
          int64add(H[1], H[1], b);
          int64add(H[2], H[2], c);
          int64add(H[3], H[3], d);
          int64add(H[4], H[4], e);
          int64add(H[5], H[5], f);
          int64add(H[6], H[6], g);
          int64add(H[7], H[7], h);
        }

        //represent the hash as an array of 32-bit dwords
        for (i = 0; i < 8; i += 1) {
          hash[2 * i] = H[i].h;
          hash[2 * i + 1] = H[i].l;
        }
        return hash;
      }

      //A constructor for 64-bit numbers

      function int64(h, l) {
        this.h = h;
        this.l = l;
        //this.toString = int64toString;
      }

      //Copies src into dst, assuming both are 64-bit numbers

      function int64copy(dst, src) {
        dst.h = src.h;
        dst.l = src.l;
      }

      //Right-rotates a 64-bit number by shift
      //Won't handle cases of shift>=32
      //The function revrrot() is for that

      function int64rrot(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift) | (x.l << (32 - shift));
      }

      //Reverses the dwords of the source and then rotates right by shift.
      //This is equivalent to rotation by 32+shift

      function int64revrrot(dst, x, shift) {
        dst.l = (x.h >>> shift) | (x.l << (32 - shift));
        dst.h = (x.l >>> shift) | (x.h << (32 - shift));
      }

      //Bitwise-shifts right a 64-bit number by shift
      //Won't handle shift>=32, but it's never needed in SHA512

      function int64shr(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift);
      }

      //Adds two 64-bit numbers
      //Like the original implementation, does not rely on 32-bit operations

      function int64add(dst, x, y) {
        var w0 = (x.l & 0xffff) + (y.l & 0xffff);
        var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
        var w2 = (x.h & 0xffff) + (y.h & 0xffff) + (w1 >>> 16);
        var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }

      //Same, except with 4 addends. Works faster than adding them one by one.

      function int64add4(dst, a, b, c, d) {
        var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff);
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
        var w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (w1 >>> 16);
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }

      //Same, except with 5 addends

      function int64add5(dst, a, b, c, d, e) {
        var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff) + (e.l & 0xffff),
          w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16),
          w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (e.h & 0xffff) + (w1 >>> 16),
          w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }
    },
    /**
     * @class Hashes.RMD160
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RIPEMD-160 Algorithm
     * Version 2.2 Copyright Jeremy Lin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://www.ocf.berkeley.edu/~jjlin/jsotp/
     */
    RMD160: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false,
        /* hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pda : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        rmd160_r1 = [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
          7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
          3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
          1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
          4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ],
        rmd160_r2 = [
          5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
          6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
          15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
          8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
          12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ],
        rmd160_s1 = [
          11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
          7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
          11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
          11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
          9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ],
        rmd160_s2 = [
          8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
          9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
          9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
          15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
          8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ];

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        if (typeof a !== 'undefined') {
          b64pad = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      /* private methods */

      /**
       * Calculate the rmd160 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binl2rstr(binl(rstr2binl(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-rmd160 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        var i, hash,
          bkey = rstr2binl(key),
          ipad = Array(16),
          opad = Array(16);

        if (bkey.length > 16) {
          bkey = binl(bkey, key.length * 8);
        }

        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl(opad.concat(hash), 512 + 160));
      }

      /**
       * Convert an array of little-endian words to a string
       */

      function binl2rstr(input) {
        var i, output = '',
          l = input.length * 32;
        for (i = 0; i < l; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
      }

      /**
       * Calculate the RIPE-MD160 of an array of little-endian words, and a bit length.
       */

      function binl(x, len) {
        var T, j, i, l,
          h0 = 0x67452301,
          h1 = 0xefcdab89,
          h2 = 0x98badcfe,
          h3 = 0x10325476,
          h4 = 0xc3d2e1f0,
          A1, B1, C1, D1, E1,
          A2, B2, C2, D2, E2;

        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        l = x.length;

        for (i = 0; i < l; i += 16) {
          A1 = A2 = h0;
          B1 = B2 = h1;
          C1 = C2 = h2;
          D1 = D2 = h3;
          E1 = E2 = h4;
          for (j = 0; j <= 79; j += 1) {
            T = safe_add(A1, rmd160_f(j, B1, C1, D1));
            T = safe_add(T, x[i + rmd160_r1[j]]);
            T = safe_add(T, rmd160_K1(j));
            T = safe_add(bit_rol(T, rmd160_s1[j]), E1);
            A1 = E1;
            E1 = D1;
            D1 = bit_rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = safe_add(A2, rmd160_f(79 - j, B2, C2, D2));
            T = safe_add(T, x[i + rmd160_r2[j]]);
            T = safe_add(T, rmd160_K2(j));
            T = safe_add(bit_rol(T, rmd160_s2[j]), E2);
            A2 = E2;
            E2 = D2;
            D2 = bit_rol(C2, 10);
            C2 = B2;
            B2 = T;
          }

          T = safe_add(h1, safe_add(C1, D2));
          h1 = safe_add(h2, safe_add(D1, E2));
          h2 = safe_add(h3, safe_add(E1, A2));
          h3 = safe_add(h4, safe_add(A1, B2));
          h4 = safe_add(h0, safe_add(B1, C2));
          h0 = T;
        }
        return [h0, h1, h2, h3, h4];
      }

      // specific algorithm methods

      function rmd160_f(j, x, y, z) {
        return (0 <= j && j <= 15) ? (x ^ y ^ z) :
          (16 <= j && j <= 31) ? (x & y) | (~x & z) :
          (32 <= j && j <= 47) ? (x | ~y) ^ z :
          (48 <= j && j <= 63) ? (x & z) | (y & ~z) :
          (64 <= j && j <= 79) ? x ^ (y | ~z) :
          'rmd160_f: j out of range';
      }

      function rmd160_K1(j) {
        return (0 <= j && j <= 15) ? 0x00000000 :
          (16 <= j && j <= 31) ? 0x5a827999 :
          (32 <= j && j <= 47) ? 0x6ed9eba1 :
          (48 <= j && j <= 63) ? 0x8f1bbcdc :
          (64 <= j && j <= 79) ? 0xa953fd4e :
          'rmd160_K1: j out of range';
      }

      function rmd160_K2(j) {
        return (0 <= j && j <= 15) ? 0x50a28be6 :
          (16 <= j && j <= 31) ? 0x5c4dd124 :
          (32 <= j && j <= 47) ? 0x6d703ef3 :
          (48 <= j && j <= 63) ? 0x7a6d76e9 :
          (64 <= j && j <= 79) ? 0x00000000 :
          'rmd160_K2: j out of range';
      }
    }
  };

  // exposes Hashes
  (function(window, undefined) {
    var freeExports = false;
    if (typeof exports === 'object') {
      freeExports = exports;
      if (exports && typeof global === 'object' && global && global === global.global) {
        window = global;
      }
    }

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
      // define as an anonymous module, so, through path mapping, it can be aliased
      define(function() {
        return Hashes;
      });
    } else if (freeExports) {
      // in Node.js or RingoJS v0.8.0+
      if (typeof module === 'object' && module && module.exports === freeExports) {
        module.exports = Hashes;
      }
      // in Narwhal or RingoJS v0.7.0-
      else {
        freeExports.Hashes = Hashes;
      }
    } else {
      // in a browser or Rhino
      window.Hashes = Hashes;
    }
  }(this));
}()); // IIFE

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5kZXguanMiLCJub2RlX21vZHVsZXMvanNoYXNoZXMvaGFzaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEhhc2hlcyA9IHJlcXVpcmUoJ2pzaGFzaGVzJyk7XG5cbi8vIGN1c3RvbSBhbHBoYWJldCBkZWZpbmVkLlxud2luZG93Ll9hcHAgPSB7XG4gIEhhc2hlcyAgIDogSGFzaGVzLFxuICBhbHBoYWJldCA6ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd6eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVp+ISMkJV4mKigpXystPXt9O1wiOjw+PywuLycsXG4gIHNhZmVBbHBoYWJldCA6ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd6eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonLFxuICBudW1lcmljICA6ICcwMTIzNDU2Nzg5J1xufTtcbmNvbnNvbGUubG9nKCdqc0hhc2hlcyBsb2FkZWQnKTtcblxudmFyIHN0ciA9ICdUaGlzIGlzIGEgc2FtcGxlIHRleHQhJztcbi8vIG5ldyBTSEExIGluc3RhbmNlIGFuZCBiYXNlNjQgc3RyaW5nIGVuY29kaW5nXG5cbnZhciBTSEE1MTIgPSBuZXcgSGFzaGVzLlNIQTUxMigpO1xuXG4vLyBzb21lIHN0cmV0Y2hpbmcgLSAxMCB0byB0ZXN0XG52YXIgbWF4ID0gMTA7XG52YXIgaTtcbnZhciBjb2RlID0gc3RyO1xuXG5jb25zb2xlLnRpbWUoJ3Rlc3RpbmcnKTtcbmZvciAoaSA9IDA7IGkgPCBtYXg7IGkrKykge1xuICBjb2RlID0gU0hBNTEyLmhleChjb2RlKTtcbn1cbmNvbnNvbGUudGltZUVuZCgndGVzdGluZycpO1xuaWYgKGNvZGUgPT09ICc4NmQyMjQ0ZWFiNmQ3MzNkNjkwYTdjZjc0NmNmNDUwYTIzYWNkMDAyZTY1MDY2N2QwZmIwNDA1NTk1MmVmMzBkMzg0YTA3NWY1OTU4MTg0MTA5MTFlYzVjZGQ4NzMzZDllOWU0YjNmZmEzYjllM2NhNjFkMDU5MzVjOWM2MmI2ZicpIHtcbiAgY29uc29sZS5sb2coJ1RFU1QgUEFTU0VEJyk7XG59IGVsc2Uge1xuICBjb25zb2xlLmxvZygncHJvYmxlbSBpbiBicm93c2VyIGZvciBoYXNoZXNqcycpO1xufVxuXG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKipcbiAqIGpzaGFzaGVzIC0gaHR0cHM6Ly9naXRodWIuY29tL2gybm9uL2pzaGFzaGVzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgXCJOZXcgQlNEXCIgbGljZW5zZVxuICpcbiAqIEFsZ29yaXRobXMgc3BlY2lmaWNhdGlvbjpcbiAqXG4gKiBNRDUgLSBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmMxMzIxLnR4dFxuICogUklQRU1ELTE2MCAtIGh0dHA6Ly9ob21lcy5lc2F0Lmt1bGV1dmVuLmJlL35ib3NzZWxhZS9yaXBlbWQxNjAuaHRtbFxuICogU0hBMSAgIC0gaHR0cDovL2NzcmMubmlzdC5nb3YvcHVibGljYXRpb25zL2ZpcHMvZmlwczE4MC00L2ZpcHMtMTgwLTQucGRmXG4gKiBTSEEyNTYgLSBodHRwOi8vY3NyYy5uaXN0Lmdvdi9wdWJsaWNhdGlvbnMvZmlwcy9maXBzMTgwLTQvZmlwcy0xODAtNC5wZGZcbiAqIFNIQTUxMiAtIGh0dHA6Ly9jc3JjLm5pc3QuZ292L3B1YmxpY2F0aW9ucy9maXBzL2ZpcHMxODAtNC9maXBzLTE4MC00LnBkZlxuICogSE1BQyAtIGh0dHA6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzIxMDQudHh0XG4gKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIEhhc2hlcztcblxuICBmdW5jdGlvbiB1dGY4RW5jb2RlKHN0cikge1xuICAgIHZhciB4LCB5LCBvdXRwdXQgPSAnJyxcbiAgICAgIGkgPSAtMSxcbiAgICAgIGw7XG5cbiAgICBpZiAoc3RyICYmIHN0ci5sZW5ndGgpIHtcbiAgICAgIGwgPSBzdHIubGVuZ3RoO1xuICAgICAgd2hpbGUgKChpICs9IDEpIDwgbCkge1xuICAgICAgICAvKiBEZWNvZGUgdXRmLTE2IHN1cnJvZ2F0ZSBwYWlycyAqL1xuICAgICAgICB4ID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHkgPSBpICsgMSA8IGwgPyBzdHIuY2hhckNvZGVBdChpICsgMSkgOiAwO1xuICAgICAgICBpZiAoMHhEODAwIDw9IHggJiYgeCA8PSAweERCRkYgJiYgMHhEQzAwIDw9IHkgJiYgeSA8PSAweERGRkYpIHtcbiAgICAgICAgICB4ID0gMHgxMDAwMCArICgoeCAmIDB4MDNGRikgPDwgMTApICsgKHkgJiAweDAzRkYpO1xuICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICAvKiBFbmNvZGUgb3V0cHV0IGFzIHV0Zi04ICovXG4gICAgICAgIGlmICh4IDw9IDB4N0YpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh4KTtcbiAgICAgICAgfSBlbHNlIGlmICh4IDw9IDB4N0ZGKSB7XG4gICAgICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhDMCB8ICgoeCA+Pj4gNikgJiAweDFGKSxcbiAgICAgICAgICAgIDB4ODAgfCAoeCAmIDB4M0YpKTtcbiAgICAgICAgfSBlbHNlIGlmICh4IDw9IDB4RkZGRikge1xuICAgICAgICAgIG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RTAgfCAoKHggPj4+IDEyKSAmIDB4MEYpLFxuICAgICAgICAgICAgMHg4MCB8ICgoeCA+Pj4gNikgJiAweDNGKSxcbiAgICAgICAgICAgIDB4ODAgfCAoeCAmIDB4M0YpKTtcbiAgICAgICAgfSBlbHNlIGlmICh4IDw9IDB4MUZGRkZGKSB7XG4gICAgICAgICAgb3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGMCB8ICgoeCA+Pj4gMTgpICYgMHgwNyksXG4gICAgICAgICAgICAweDgwIHwgKCh4ID4+PiAxMikgJiAweDNGKSxcbiAgICAgICAgICAgIDB4ODAgfCAoKHggPj4+IDYpICYgMHgzRiksXG4gICAgICAgICAgICAweDgwIHwgKHggJiAweDNGKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHV0ZjhEZWNvZGUoc3RyKSB7XG4gICAgdmFyIGksIGFjLCBjMSwgYzIsIGMzLCBhcnIgPSBbXSxcbiAgICAgIGw7XG4gICAgaSA9IGFjID0gYzEgPSBjMiA9IGMzID0gMDtcblxuICAgIGlmIChzdHIgJiYgc3RyLmxlbmd0aCkge1xuICAgICAgbCA9IHN0ci5sZW5ndGg7XG4gICAgICBzdHIgKz0gJyc7XG5cbiAgICAgIHdoaWxlIChpIDwgbCkge1xuICAgICAgICBjMSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBhYyArPSAxO1xuICAgICAgICBpZiAoYzEgPCAxMjgpIHtcbiAgICAgICAgICBhcnJbYWNdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjMSk7XG4gICAgICAgICAgaSArPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKGMxID4gMTkxICYmIGMxIDwgMjI0KSB7XG4gICAgICAgICAgYzIgPSBzdHIuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgICAgYXJyW2FjXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjMSAmIDMxKSA8PCA2KSB8IChjMiAmIDYzKSk7XG4gICAgICAgICAgaSArPSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGMyID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgIGMzID0gc3RyLmNoYXJDb2RlQXQoaSArIDIpO1xuICAgICAgICAgIGFyclthY10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYzEgJiAxNSkgPDwgMTIpIHwgKChjMiAmIDYzKSA8PCA2KSB8IChjMyAmIDYzKSk7XG4gICAgICAgICAgaSArPSAzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnIuam9pbignJyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGludGVnZXJzLCB3cmFwcGluZyBhdCAyXjMyLiBUaGlzIHVzZXMgMTYtYml0IG9wZXJhdGlvbnMgaW50ZXJuYWxseVxuICAgKiB0byB3b3JrIGFyb3VuZCBidWdzIGluIHNvbWUgSlMgaW50ZXJwcmV0ZXJzLlxuICAgKi9cblxuICBmdW5jdGlvbiBzYWZlX2FkZCh4LCB5KSB7XG4gICAgdmFyIGxzdyA9ICh4ICYgMHhGRkZGKSArICh5ICYgMHhGRkZGKSxcbiAgICAgIG1zdyA9ICh4ID4+IDE2KSArICh5ID4+IDE2KSArIChsc3cgPj4gMTYpO1xuICAgIHJldHVybiAobXN3IDw8IDE2KSB8IChsc3cgJiAweEZGRkYpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpdHdpc2Ugcm90YXRlIGEgMzItYml0IG51bWJlciB0byB0aGUgbGVmdC5cbiAgICovXG5cbiAgZnVuY3Rpb24gYml0X3JvbChudW0sIGNudCkge1xuICAgIHJldHVybiAobnVtIDw8IGNudCkgfCAobnVtID4+PiAoMzIgLSBjbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgcmF3IHN0cmluZyB0byBhIGhleCBzdHJpbmdcbiAgICovXG5cbiAgZnVuY3Rpb24gcnN0cjJoZXgoaW5wdXQsIGhleGNhc2UpIHtcbiAgICB2YXIgaGV4X3RhYiA9IGhleGNhc2UgPyAnMDEyMzQ1Njc4OUFCQ0RFRicgOiAnMDEyMzQ1Njc4OWFiY2RlZicsXG4gICAgICBvdXRwdXQgPSAnJyxcbiAgICAgIHgsIGkgPSAwLFxuICAgICAgbCA9IGlucHV0Lmxlbmd0aDtcbiAgICBmb3IgKDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgeCA9IGlucHV0LmNoYXJDb2RlQXQoaSk7XG4gICAgICBvdXRwdXQgKz0gaGV4X3RhYi5jaGFyQXQoKHggPj4+IDQpICYgMHgwRikgKyBoZXhfdGFiLmNoYXJBdCh4ICYgMHgwRik7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvKipcbiAgICogRW5jb2RlIGEgc3RyaW5nIGFzIHV0Zi0xNlxuICAgKi9cblxuICBmdW5jdGlvbiBzdHIycnN0cl91dGYxNmxlKGlucHV0KSB7XG4gICAgdmFyIGksIGwgPSBpbnB1dC5sZW5ndGgsXG4gICAgICBvdXRwdXQgPSAnJztcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShpbnB1dC5jaGFyQ29kZUF0KGkpICYgMHhGRiwgKGlucHV0LmNoYXJDb2RlQXQoaSkgPj4+IDgpICYgMHhGRik7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBzdHIycnN0cl91dGYxNmJlKGlucHV0KSB7XG4gICAgdmFyIGksIGwgPSBpbnB1dC5sZW5ndGgsXG4gICAgICBvdXRwdXQgPSAnJztcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoaW5wdXQuY2hhckNvZGVBdChpKSA+Pj4gOCkgJiAweEZGLCBpbnB1dC5jaGFyQ29kZUF0KGkpICYgMHhGRik7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhbiBhcnJheSBvZiBiaWctZW5kaWFuIHdvcmRzIHRvIGEgc3RyaW5nXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGJpbmIycnN0cihpbnB1dCkge1xuICAgIHZhciBpLCBsID0gaW5wdXQubGVuZ3RoICogMzIsXG4gICAgICBvdXRwdXQgPSAnJztcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSA4KSB7XG4gICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoaW5wdXRbaSA+PiA1XSA+Pj4gKDI0IC0gaSAlIDMyKSkgJiAweEZGKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGFuIGFycmF5IG9mIGxpdHRsZS1lbmRpYW4gd29yZHMgdG8gYSBzdHJpbmdcbiAgICovXG5cbiAgZnVuY3Rpb24gYmlubDJyc3RyKGlucHV0KSB7XG4gICAgdmFyIGksIGwgPSBpbnB1dC5sZW5ndGggKiAzMixcbiAgICAgIG91dHB1dCA9ICcnO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDgpIHtcbiAgICAgIG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChpbnB1dFtpID4+IDVdID4+PiAoaSAlIDMyKSkgJiAweEZGKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgcmF3IHN0cmluZyB0byBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzXG4gICAqIENoYXJhY3RlcnMgPjI1NSBoYXZlIHRoZWlyIGhpZ2gtYnl0ZSBzaWxlbnRseSBpZ25vcmVkLlxuICAgKi9cblxuICBmdW5jdGlvbiByc3RyMmJpbmwoaW5wdXQpIHtcbiAgICB2YXIgaSwgbCA9IGlucHV0Lmxlbmd0aCAqIDgsXG4gICAgICBvdXRwdXQgPSBBcnJheShpbnB1dC5sZW5ndGggPj4gMiksXG4gICAgICBsbyA9IG91dHB1dC5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxvOyBpICs9IDEpIHtcbiAgICAgIG91dHB1dFtpXSA9IDA7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDgpIHtcbiAgICAgIG91dHB1dFtpID4+IDVdIHw9IChpbnB1dC5jaGFyQ29kZUF0KGkgLyA4KSAmIDB4RkYpIDw8IChpICUgMzIpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSByYXcgc3RyaW5nIHRvIGFuIGFycmF5IG9mIGJpZy1lbmRpYW4gd29yZHNcbiAgICogQ2hhcmFjdGVycyA+MjU1IGhhdmUgdGhlaXIgaGlnaC1ieXRlIHNpbGVudGx5IGlnbm9yZWQuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJzdHIyYmluYihpbnB1dCkge1xuICAgIHZhciBpLCBsID0gaW5wdXQubGVuZ3RoICogOCxcbiAgICAgIG91dHB1dCA9IEFycmF5KGlucHV0Lmxlbmd0aCA+PiAyKSxcbiAgICAgIGxvID0gb3V0cHV0Lmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbG87IGkgKz0gMSkge1xuICAgICAgb3V0cHV0W2ldID0gMDtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gOCkge1xuICAgICAgb3V0cHV0W2kgPj4gNV0gfD0gKGlucHV0LmNoYXJDb2RlQXQoaSAvIDgpICYgMHhGRikgPDwgKDI0IC0gaSAlIDMyKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgcmF3IHN0cmluZyB0byBhbiBhcmJpdHJhcnkgc3RyaW5nIGVuY29kaW5nXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJzdHIyYW55KGlucHV0LCBlbmNvZGluZykge1xuICAgIHZhciBkaXZpc29yID0gZW5jb2RpbmcubGVuZ3RoLFxuICAgICAgcmVtYWluZGVycyA9IEFycmF5KCksXG4gICAgICBpLCBxLCB4LCBsZCwgcXVvdGllbnQsIGRpdmlkZW5kLCBvdXRwdXQsIGZ1bGxfbGVuZ3RoO1xuXG4gICAgLyogQ29udmVydCB0byBhbiBhcnJheSBvZiAxNi1iaXQgYmlnLWVuZGlhbiB2YWx1ZXMsIGZvcm1pbmcgdGhlIGRpdmlkZW5kICovXG4gICAgZGl2aWRlbmQgPSBBcnJheShNYXRoLmNlaWwoaW5wdXQubGVuZ3RoIC8gMikpO1xuICAgIGxkID0gZGl2aWRlbmQubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZDsgaSArPSAxKSB7XG4gICAgICBkaXZpZGVuZFtpXSA9IChpbnB1dC5jaGFyQ29kZUF0KGkgKiAyKSA8PCA4KSB8IGlucHV0LmNoYXJDb2RlQXQoaSAqIDIgKyAxKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXBlYXRlZGx5IHBlcmZvcm0gYSBsb25nIGRpdmlzaW9uLiBUaGUgYmluYXJ5IGFycmF5IGZvcm1zIHRoZSBkaXZpZGVuZCxcbiAgICAgKiB0aGUgbGVuZ3RoIG9mIHRoZSBlbmNvZGluZyBpcyB0aGUgZGl2aXNvci4gT25jZSBjb21wdXRlZCwgdGhlIHF1b3RpZW50XG4gICAgICogZm9ybXMgdGhlIGRpdmlkZW5kIGZvciB0aGUgbmV4dCBzdGVwLiBXZSBzdG9wIHdoZW4gdGhlIGRpdmlkZW5kIGlzIHplckhhc2hlcy5cbiAgICAgKiBBbGwgcmVtYWluZGVycyBhcmUgc3RvcmVkIGZvciBsYXRlciB1c2UuXG4gICAgICovXG4gICAgd2hpbGUgKGRpdmlkZW5kLmxlbmd0aCA+IDApIHtcbiAgICAgIHF1b3RpZW50ID0gQXJyYXkoKTtcbiAgICAgIHggPSAwO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGRpdmlkZW5kLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHggPSAoeCA8PCAxNikgKyBkaXZpZGVuZFtpXTtcbiAgICAgICAgcSA9IE1hdGguZmxvb3IoeCAvIGRpdmlzb3IpO1xuICAgICAgICB4IC09IHEgKiBkaXZpc29yO1xuICAgICAgICBpZiAocXVvdGllbnQubGVuZ3RoID4gMCB8fCBxID4gMCkge1xuICAgICAgICAgIHF1b3RpZW50W3F1b3RpZW50Lmxlbmd0aF0gPSBxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZW1haW5kZXJzW3JlbWFpbmRlcnMubGVuZ3RoXSA9IHg7XG4gICAgICBkaXZpZGVuZCA9IHF1b3RpZW50O1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgdGhlIHJlbWFpbmRlcnMgdG8gdGhlIG91dHB1dCBzdHJpbmcgKi9cbiAgICBvdXRwdXQgPSAnJztcbiAgICBmb3IgKGkgPSByZW1haW5kZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBvdXRwdXQgKz0gZW5jb2RpbmcuY2hhckF0KHJlbWFpbmRlcnNbaV0pO1xuICAgIH1cblxuICAgIC8qIEFwcGVuZCBsZWFkaW5nIHplcm8gZXF1aXZhbGVudHMgKi9cbiAgICBmdWxsX2xlbmd0aCA9IE1hdGguY2VpbChpbnB1dC5sZW5ndGggKiA4IC8gKE1hdGgubG9nKGVuY29kaW5nLmxlbmd0aCkgLyBNYXRoLmxvZygyKSkpO1xuICAgIGZvciAoaSA9IG91dHB1dC5sZW5ndGg7IGkgPCBmdWxsX2xlbmd0aDsgaSArPSAxKSB7XG4gICAgICBvdXRwdXQgPSBlbmNvZGluZ1swXSArIG91dHB1dDtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgcmF3IHN0cmluZyB0byBhIGJhc2UtNjQgc3RyaW5nXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJzdHIyYjY0KGlucHV0LCBiNjRwYWQpIHtcbiAgICB2YXIgdGFiID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nLFxuICAgICAgb3V0cHV0ID0gJycsXG4gICAgICBsZW4gPSBpbnB1dC5sZW5ndGgsXG4gICAgICBpLCBqLCB0cmlwbGV0O1xuICAgIGI2NHBhZCA9IGI2NHBhZCB8fCAnPSc7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSAzKSB7XG4gICAgICB0cmlwbGV0ID0gKGlucHV0LmNoYXJDb2RlQXQoaSkgPDwgMTYpIHwgKGkgKyAxIDwgbGVuID8gaW5wdXQuY2hhckNvZGVBdChpICsgMSkgPDwgOCA6IDApIHwgKGkgKyAyIDwgbGVuID8gaW5wdXQuY2hhckNvZGVBdChpICsgMikgOiAwKTtcbiAgICAgIGZvciAoaiA9IDA7IGogPCA0OyBqICs9IDEpIHtcbiAgICAgICAgaWYgKGkgKiA4ICsgaiAqIDYgPiBpbnB1dC5sZW5ndGggKiA4KSB7XG4gICAgICAgICAgb3V0cHV0ICs9IGI2NHBhZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXRwdXQgKz0gdGFiLmNoYXJBdCgodHJpcGxldCA+Pj4gNiAqICgzIC0gaikpICYgMHgzRik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIEhhc2hlcyA9IHtcbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkge1N0cmluZ30gdmVyc2lvblxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIFZFUlNJT046ICcxLjAuNScsXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBIYXNoZXNcbiAgICAgKiBAY2xhc3MgQmFzZTY0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgQmFzZTY0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIHByaXZhdGUgcHJvcGVydGllc1xuICAgICAgdmFyIHRhYiA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJyxcbiAgICAgICAgcGFkID0gJz0nLCAvLyBkZWZhdWx0IHBhZCBhY2NvcmRpbmcgd2l0aCB0aGUgUkZDIHN0YW5kYXJkXG4gICAgICAgIHVybCA9IGZhbHNlLCAvLyBVUkwgZW5jb2Rpbmcgc3VwcG9ydCBAdG9kb1xuICAgICAgICB1dGY4ID0gdHJ1ZTsgLy8gYnkgZGVmYXVsdCBlbmFibGUgVVRGLTggc3VwcG9ydCBlbmNvZGluZ1xuXG4gICAgICAvLyBwdWJsaWMgbWV0aG9kIGZvciBlbmNvZGluZ1xuICAgICAgdGhpcy5lbmNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgaSwgaiwgdHJpcGxldCxcbiAgICAgICAgICBvdXRwdXQgPSAnJyxcbiAgICAgICAgICBsZW4gPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgICAgcGFkID0gcGFkIHx8ICc9JztcbiAgICAgICAgaW5wdXQgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGlucHV0KSA6IGlucHV0O1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykge1xuICAgICAgICAgIHRyaXBsZXQgPSAoaW5wdXQuY2hhckNvZGVBdChpKSA8PCAxNikgfCAoaSArIDEgPCBsZW4gPyBpbnB1dC5jaGFyQ29kZUF0KGkgKyAxKSA8PCA4IDogMCkgfCAoaSArIDIgPCBsZW4gPyBpbnB1dC5jaGFyQ29kZUF0KGkgKyAyKSA6IDApO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCA0OyBqICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChpICogOCArIGogKiA2ID4gbGVuICogOCkge1xuICAgICAgICAgICAgICBvdXRwdXQgKz0gcGFkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb3V0cHV0ICs9IHRhYi5jaGFyQXQoKHRyaXBsZXQgPj4+IDYgKiAoMyAtIGopKSAmIDB4M0YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfTtcblxuICAgICAgLy8gcHVibGljIG1ldGhvZCBmb3IgZGVjb2RpbmdcbiAgICAgIHRoaXMuZGVjb2RlID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgLy8gdmFyIGI2NCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSc7XG4gICAgICAgIHZhciBpLCBvMSwgbzIsIG8zLCBoMSwgaDIsIGgzLCBoNCwgYml0cywgYWMsXG4gICAgICAgICAgZGVjID0gJycsXG4gICAgICAgICAgYXJyID0gW107XG4gICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpID0gYWMgPSAwO1xuICAgICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXCcgKyBwYWQsICdnaScpLCAnJyk7IC8vIHVzZSAnPSdcbiAgICAgICAgLy9pbnB1dCArPSAnJztcblxuICAgICAgICBkbyB7IC8vIHVucGFjayBmb3VyIGhleGV0cyBpbnRvIHRocmVlIG9jdGV0cyB1c2luZyBpbmRleCBwb2ludHMgaW4gYjY0XG4gICAgICAgICAgaDEgPSB0YWIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSArPSAxKSk7XG4gICAgICAgICAgaDIgPSB0YWIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSArPSAxKSk7XG4gICAgICAgICAgaDMgPSB0YWIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSArPSAxKSk7XG4gICAgICAgICAgaDQgPSB0YWIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSArPSAxKSk7XG5cbiAgICAgICAgICBiaXRzID0gaDEgPDwgMTggfCBoMiA8PCAxMiB8IGgzIDw8IDYgfCBoNDtcblxuICAgICAgICAgIG8xID0gYml0cyA+PiAxNiAmIDB4ZmY7XG4gICAgICAgICAgbzIgPSBiaXRzID4+IDggJiAweGZmO1xuICAgICAgICAgIG8zID0gYml0cyAmIDB4ZmY7XG4gICAgICAgICAgYWMgKz0gMTtcblxuICAgICAgICAgIGlmIChoMyA9PT0gNjQpIHtcbiAgICAgICAgICAgIGFyclthY10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG8xKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGg0ID09PSA2NCkge1xuICAgICAgICAgICAgYXJyW2FjXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUobzEsIG8yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyW2FjXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUobzEsIG8yLCBvMyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChpIDwgaW5wdXQubGVuZ3RoKTtcblxuICAgICAgICBkZWMgPSBhcnIuam9pbignJyk7XG4gICAgICAgIGRlYyA9ICh1dGY4KSA/IHV0ZjhEZWNvZGUoZGVjKSA6IGRlYztcblxuICAgICAgICByZXR1cm4gZGVjO1xuICAgICAgfTtcblxuICAgICAgLy8gc2V0IGN1c3RvbSBwYWQgc3RyaW5nXG4gICAgICB0aGlzLnNldFBhZCA9IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICBwYWQgPSBzdHIgfHwgcGFkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvLyBzZXQgY3VzdG9tIHRhYiBzdHJpbmcgY2hhcmFjdGVyc1xuICAgICAgdGhpcy5zZXRUYWIgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGFiID0gc3RyIHx8IHRhYjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYm9vbCkge1xuICAgICAgICBpZiAodHlwZW9mIGJvb2wgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBib29sO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ1JDLTMyIGNhbGN1bGF0aW9uXG4gICAgICogQG1lbWJlciBIYXNoZXNcbiAgICAgKiBAbWV0aG9kIENSQzMyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgSW5wdXQgU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIENSQzMyOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBjcmMgPSAwLFxuICAgICAgICB4ID0gMCxcbiAgICAgICAgeSA9IDAsXG4gICAgICAgIHRhYmxlLCBpLCBpVG9wO1xuICAgICAgc3RyID0gdXRmOEVuY29kZShzdHIpO1xuXG4gICAgICB0YWJsZSA9IFtcbiAgICAgICAgJzAwMDAwMDAwIDc3MDczMDk2IEVFMEU2MTJDIDk5MDk1MUJBIDA3NkRDNDE5IDcwNkFGNDhGIEU5NjNBNTM1IDlFNjQ5NUEzIDBFREI4ODMyICcsXG4gICAgICAgICc3OURDQjhBNCBFMEQ1RTkxRSA5N0QyRDk4OCAwOUI2NEMyQiA3RUIxN0NCRCBFN0I4MkQwNyA5MEJGMUQ5MSAxREI3MTA2NCA2QUIwMjBGMiBGM0I5NzE0OCAnLFxuICAgICAgICAnODRCRTQxREUgMUFEQUQ0N0QgNkREREU0RUIgRjRENEI1NTEgODNEMzg1QzcgMTM2Qzk4NTYgNjQ2QkE4QzAgRkQ2MkY5N0EgOEE2NUM5RUMgMTQwMTVDNEYgJyxcbiAgICAgICAgJzYzMDY2Q0Q5IEZBMEYzRDYzIDhEMDgwREY1IDNCNkUyMEM4IDRDNjkxMDVFIEQ1NjA0MUU0IEEyNjc3MTcyIDNDMDNFNEQxIDRCMDRENDQ3IEQyMEQ4NUZEICcsXG4gICAgICAgICdBNTBBQjU2QiAzNUI1QThGQSA0MkIyOTg2QyBEQkJCQzlENiBBQ0JDRjk0MCAzMkQ4NkNFMyA0NURGNUM3NSBEQ0Q2MERDRiBBQkQxM0Q1OSAyNkQ5MzBBQyAnLFxuICAgICAgICAnNTFERTAwM0EgQzhENzUxODAgQkZEMDYxMTYgMjFCNEY0QjUgNTZCM0M0MjMgQ0ZCQTk1OTkgQjhCREE1MEYgMjgwMkI4OUUgNUYwNTg4MDggQzYwQ0Q5QjIgJyxcbiAgICAgICAgJ0IxMEJFOTI0IDJGNkY3Qzg3IDU4Njg0QzExIEMxNjExREFCIEI2NjYyRDNEIDc2REM0MTkwIDAxREI3MTA2IDk4RDIyMEJDIEVGRDUxMDJBIDcxQjE4NTg5ICcsXG4gICAgICAgICcwNkI2QjUxRiA5RkJGRTRBNSBFOEI4RDQzMyA3ODA3QzlBMiAwRjAwRjkzNCA5NjA5QTg4RSBFMTBFOTgxOCA3RjZBMERCQiAwODZEM0QyRCA5MTY0NkM5NyAnLFxuICAgICAgICAnRTY2MzVDMDEgNkI2QjUxRjQgMUM2QzYxNjIgODU2NTMwRDggRjI2MjAwNEUgNkMwNjk1RUQgMUIwMUE1N0IgODIwOEY0QzEgRjUwRkM0NTcgNjVCMEQ5QzYgJyxcbiAgICAgICAgJzEyQjdFOTUwIDhCQkVCOEVBIEZDQjk4ODdDIDYyREQxRERGIDE1REEyRDQ5IDhDRDM3Q0YzIEZCRDQ0QzY1IDREQjI2MTU4IDNBQjU1MUNFIEEzQkMwMDc0ICcsXG4gICAgICAgICdENEJCMzBFMiA0QURGQTU0MSAzREQ4OTVENyBBNEQxQzQ2RCBEM0Q2RjRGQiA0MzY5RTk2QSAzNDZFRDlGQyBBRDY3ODg0NiBEQTYwQjhEMCA0NDA0MkQ3MyAnLFxuICAgICAgICAnMzMwMzFERTUgQUEwQTRDNUYgREQwRDdDQzkgNTAwNTcxM0MgMjcwMjQxQUEgQkUwQjEwMTAgQzkwQzIwODYgNTc2OEI1MjUgMjA2Rjg1QjMgQjk2NkQ0MDkgJyxcbiAgICAgICAgJ0NFNjFFNDlGIDVFREVGOTBFIDI5RDlDOTk4IEIwRDA5ODIyIEM3RDdBOEI0IDU5QjMzRDE3IDJFQjQwRDgxIEI3QkQ1QzNCIEMwQkE2Q0FEIEVEQjg4MzIwICcsXG4gICAgICAgICc5QUJGQjNCNiAwM0I2RTIwQyA3NEIxRDI5QSBFQUQ1NDczOSA5REQyNzdBRiAwNERCMjYxNSA3M0RDMTY4MyBFMzYzMEIxMiA5NDY0M0I4NCAwRDZENkEzRSAnLFxuICAgICAgICAnN0E2QTVBQTggRTQwRUNGMEIgOTMwOUZGOUQgMEEwMEFFMjcgN0QwNzlFQjEgRjAwRjkzNDQgODcwOEEzRDIgMUUwMUYyNjggNjkwNkMyRkUgRjc2MjU3NUQgJyxcbiAgICAgICAgJzgwNjU2N0NCIDE5NkMzNjcxIDZFNkIwNkU3IEZFRDQxQjc2IDg5RDMyQkUwIDEwREE3QTVBIDY3REQ0QUNDIEY5QjlERjZGIDhFQkVFRkY5IDE3QjdCRTQzICcsXG4gICAgICAgICc2MEIwOEVENSBENkQ2QTNFOCBBMUQxOTM3RSAzOEQ4QzJDNCA0RkRGRjI1MiBEMUJCNjdGMSBBNkJDNTc2NyAzRkI1MDZERCA0OEIyMzY0QiBEODBEMkJEQSAnLFxuICAgICAgICAnQUYwQTFCNEMgMzYwMzRBRjYgNDEwNDdBNjAgREY2MEVGQzMgQTg2N0RGNTUgMzE2RThFRUYgNDY2OUJFNzkgQ0I2MUIzOEMgQkM2NjgzMUEgMjU2RkQyQTAgJyxcbiAgICAgICAgJzUyNjhFMjM2IENDMEM3Nzk1IEJCMEI0NzAzIDIyMDIxNkI5IDU1MDUyNjJGIEM1QkEzQkJFIEIyQkQwQjI4IDJCQjQ1QTkyIDVDQjM2QTA0IEMyRDdGRkE3ICcsXG4gICAgICAgICdCNUQwQ0YzMSAyQ0Q5OUU4QiA1QkRFQUUxRCA5QjY0QzJCMCBFQzYzRjIyNiA3NTZBQTM5QyAwMjZEOTMwQSA5QzA5MDZBOSBFQjBFMzYzRiA3MjA3Njc4NSAnLFxuICAgICAgICAnMDUwMDU3MTMgOTVCRjRBODIgRTJCODdBMTQgN0JCMTJCQUUgMENCNjFCMzggOTJEMjhFOUIgRTVENUJFMEQgN0NEQ0VGQjcgMEJEQkRGMjEgODZEM0QyRDQgJyxcbiAgICAgICAgJ0YxRDRFMjQyIDY4RERCM0Y4IDFGREE4MzZFIDgxQkUxNkNEIEY2QjkyNjVCIDZGQjA3N0UxIDE4Qjc0Nzc3IDg4MDg1QUU2IEZGMEY2QTcwIDY2MDYzQkNBICcsXG4gICAgICAgICcxMTAxMEI1QyA4RjY1OUVGRiBGODYyQUU2OSA2MTZCRkZEMyAxNjZDQ0Y0NSBBMDBBRTI3OCBENzBERDJFRSA0RTA0ODM1NCAzOTAzQjNDMiBBNzY3MjY2MSAnLFxuICAgICAgICAnRDA2MDE2RjcgNDk2OTQ3NEQgM0U2RTc3REIgQUVEMTZBNEEgRDlENjVBREMgNDBERjBCNjYgMzdEODNCRjAgQTlCQ0FFNTMgREVCQjlFQzUgNDdCMkNGN0YgJyxcbiAgICAgICAgJzMwQjVGRkU5IEJEQkRGMjFDIENBQkFDMjhBIDUzQjM5MzMwIDI0QjRBM0E2IEJBRDAzNjA1IENERDcwNjkzIDU0REU1NzI5IDIzRDk2N0JGIEIzNjY3QTJFICcsXG4gICAgICAgICdDNDYxNEFCOCA1RDY4MUIwMiAyQTZGMkI5NCBCNDBCQkUzNyBDMzBDOEVBMSA1QTA1REYxQiAyRDAyRUY4RCdcbiAgICAgIF0uam9pbignJyk7XG5cbiAgICAgIGNyYyA9IGNyYyBeICgtMSk7XG4gICAgICBmb3IgKGkgPSAwLCBpVG9wID0gc3RyLmxlbmd0aDsgaSA8IGlUb3A7IGkgKz0gMSkge1xuICAgICAgICB5ID0gKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkY7XG4gICAgICAgIHggPSAnMHgnICsgdGFibGUuc3Vic3RyKHkgKiA5LCA4KTtcbiAgICAgICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB4O1xuICAgICAgfVxuICAgICAgLy8gYWx3YXlzIHJldHVybiBhIHBvc2l0aXZlIG51bWJlciAodGhhdCdzIHdoYXQgPj4+IDAgZG9lcylcbiAgICAgIHJldHVybiAoY3JjIF4gKC0xKSkgPj4+IDA7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEhhc2hlc1xuICAgICAqIEBjbGFzcyBNRDVcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbmZpZ11cbiAgICAgKlxuICAgICAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgUlNBIERhdGEgU2VjdXJpdHksIEluYy4gTUQ1IE1lc3NhZ2VcbiAgICAgKiBEaWdlc3QgQWxnb3JpdGhtLCBhcyBkZWZpbmVkIGluIFJGQyAxMzIxLlxuICAgICAqIFZlcnNpb24gMi4yIENvcHlyaWdodCAoQykgUGF1bCBKb2huc3RvbiAxOTk5IC0gMjAwOVxuICAgICAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAgICAgKiBTZWUgPGh0dHA6Ly9wYWpob21lLm9yZy51ay9jcnlwdC9tZDU+IGZvciBtb3JlIGluZkhhc2hlcy5cbiAgICAgKi9cbiAgICBNRDU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIC8qKlxuICAgICAgICogUHJpdmF0ZSBjb25maWcgcHJvcGVydGllcy4gWW91IG1heSBuZWVkIHRvIHR3ZWFrIHRoZXNlIHRvIGJlIGNvbXBhdGlibGUgd2l0aFxuICAgICAgICogdGhlIHNlcnZlci1zaWRlLCBidXQgdGhlIGRlZmF1bHRzIHdvcmsgaW4gbW9zdCBjYXNlcy5cbiAgICAgICAqIFNlZSB7QGxpbmsgSGFzaGVzLk1ENSNtZXRob2Qtc2V0VXBwZXJDYXNlfSBhbmQge0BsaW5rIEhhc2hlcy5TSEExI21ldGhvZC1zZXRVcHBlckNhc2V9XG4gICAgICAgKi9cbiAgICAgIHZhciBoZXhjYXNlID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXBwZXJjYXNlID09PSAnYm9vbGVhbicpID8gb3B0aW9ucy51cHBlcmNhc2UgOiBmYWxzZSwgLy8gaGV4YWRlY2ltYWwgb3V0cHV0IGNhc2UgZm9ybWF0LiBmYWxzZSAtIGxvd2VyY2FzZTsgdHJ1ZSAtIHVwcGVyY2FzZVxuICAgICAgICBiNjRwYWQgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5wYWQgPT09ICdzdHJpbmcnKSA/IG9wdGlvbnMucGRhIDogJz0nLCAvLyBiYXNlLTY0IHBhZCBjaGFyYWN0ZXIuIERlZmF1bHRzIHRvICc9JyBmb3Igc3RyaWN0IFJGQyBjb21wbGlhbmNlXG4gICAgICAgIHV0ZjggPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51dGY4ID09PSAnYm9vbGVhbicpID8gb3B0aW9ucy51dGY4IDogdHJ1ZTsgLy8gZW5hYmxlL2Rpc2FibGUgdXRmOCBlbmNvZGluZ1xuXG4gICAgICAvLyBwcml2aWxlZ2VkIChwdWJsaWMpIG1ldGhvZHNcbiAgICAgIHRoaXMuaGV4ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cihzLCB1dGY4KSwgaGV4Y2FzZSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5iNjQgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyKHMpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55ID0gZnVuY3Rpb24ocywgZSkge1xuICAgICAgICByZXR1cm4gcnN0cjJhbnkocnN0cihzLCB1dGY4KSwgZSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5yYXcgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyKHMsIHV0ZjgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuaGV4X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmhleChyc3RyX2htYWMoaywgZCksIGhleGNhc2UpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyX2htYWMoaywgZCksIGI2NHBhZCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hbnlfaG1hYyA9IGZ1bmN0aW9uKGssIGQsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHJfaG1hYyhrLCBkKSwgZSk7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBQZXJmb3JtIGEgc2ltcGxlIHNlbGYtdGVzdCB0byBzZWUgaWYgdGhlIFZNIGlzIHdvcmtpbmdcbiAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gSGV4YWRlY2ltYWwgaGFzaCBzYW1wbGVcbiAgICAgICAqL1xuICAgICAgdGhpcy52bV90ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBoZXgoJ2FiYycpLnRvTG93ZXJDYXNlKCkgPT09ICc5MDAxNTA5ODNjZDI0ZmIwZDY5NjNmN2QyOGUxN2Y3Mic7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUvZGlzYWJsZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgcmV0dXJuZWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVcHBlckNhc2UgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGV4Y2FzZSA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBEZWZpbmVzIGEgYmFzZTY0IHBhZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBQYWRcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFBhZCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgYjY0cGFkID0gYSB8fCBiNjRwYWQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFt0aGlzXVxuICAgICAgICovXG4gICAgICB0aGlzLnNldFVURjggPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdXRmOCA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuXG4gICAgICAvLyBwcml2YXRlIG1ldGhvZHNcblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIE1ENSBvZiBhIHJhdyBzdHJpbmdcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyKHMpIHtcbiAgICAgICAgcyA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUocykgOiBzO1xuICAgICAgICByZXR1cm4gYmlubDJyc3RyKGJpbmwocnN0cjJiaW5sKHMpLCBzLmxlbmd0aCAqIDgpKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIEhNQUMtTUQ1LCBvZiBhIGtleSBhbmQgc29tZSBkYXRhIChyYXcgc3RyaW5ncylcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyX2htYWMoa2V5LCBkYXRhKSB7XG4gICAgICAgIHZhciBia2V5LCBpcGFkLCBvcGFkLCBoYXNoLCBpO1xuXG4gICAgICAgIGtleSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoa2V5KSA6IGtleTtcbiAgICAgICAgZGF0YSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoZGF0YSkgOiBkYXRhO1xuICAgICAgICBia2V5ID0gcnN0cjJiaW5sKGtleSk7XG4gICAgICAgIGlmIChia2V5Lmxlbmd0aCA+IDE2KSB7XG4gICAgICAgICAgYmtleSA9IGJpbmwoYmtleSwga2V5Lmxlbmd0aCAqIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaXBhZCA9IEFycmF5KDE2KSwgb3BhZCA9IEFycmF5KDE2KTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE2OyBpICs9IDEpIHtcbiAgICAgICAgICBpcGFkW2ldID0gYmtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgICAgb3BhZFtpXSA9IGJrZXlbaV0gXiAweDVDNUM1QzVDO1xuICAgICAgICB9XG4gICAgICAgIGhhc2ggPSBiaW5sKGlwYWQuY29uY2F0KHJzdHIyYmlubChkYXRhKSksIDUxMiArIGRhdGEubGVuZ3RoICogOCk7XG4gICAgICAgIHJldHVybiBiaW5sMnJzdHIoYmlubChvcGFkLmNvbmNhdChoYXNoKSwgNTEyICsgMTI4KSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBNRDUgb2YgYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aC5cbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBiaW5sKHgsIGxlbikge1xuICAgICAgICB2YXIgaSwgb2xkYSwgb2xkYiwgb2xkYywgb2xkZCxcbiAgICAgICAgICBhID0gMTczMjU4NDE5MyxcbiAgICAgICAgICBiID0gLTI3MTczMzg3OSxcbiAgICAgICAgICBjID0gLTE3MzI1ODQxOTQsXG4gICAgICAgICAgZCA9IDI3MTczMzg3ODtcblxuICAgICAgICAvKiBhcHBlbmQgcGFkZGluZyAqL1xuICAgICAgICB4W2xlbiA+PiA1XSB8PSAweDgwIDw8ICgobGVuKSAlIDMyKTtcbiAgICAgICAgeFsoKChsZW4gKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gbGVuO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSArPSAxNikge1xuICAgICAgICAgIG9sZGEgPSBhO1xuICAgICAgICAgIG9sZGIgPSBiO1xuICAgICAgICAgIG9sZGMgPSBjO1xuICAgICAgICAgIG9sZGQgPSBkO1xuXG4gICAgICAgICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2kgKyAwXSwgNywgLTY4MDg3NjkzNik7XG4gICAgICAgICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2kgKyAxXSwgMTIsIC0zODk1NjQ1ODYpO1xuICAgICAgICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpICsgMl0sIDE3LCA2MDYxMDU4MTkpO1xuICAgICAgICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpICsgM10sIDIyLCAtMTA0NDUyNTMzMCk7XG4gICAgICAgICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2kgKyA0XSwgNywgLTE3NjQxODg5Nyk7XG4gICAgICAgICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2kgKyA1XSwgMTIsIDEyMDAwODA0MjYpO1xuICAgICAgICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpICsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XG4gICAgICAgICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2kgKyA3XSwgMjIsIC00NTcwNTk4Myk7XG4gICAgICAgICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2kgKyA4XSwgNywgMTc3MDAzNTQxNik7XG4gICAgICAgICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2kgKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcbiAgICAgICAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSArIDEwXSwgMTcsIC00MjA2Myk7XG4gICAgICAgICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2kgKyAxMV0sIDIyLCAtMTk5MDQwNDE2Mik7XG4gICAgICAgICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDcsIDE4MDQ2MDM2ODIpO1xuICAgICAgICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpICsgMTNdLCAxMiwgLTQwMzQxMTAxKTtcbiAgICAgICAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSArIDE0XSwgMTcsIC0xNTAyMDAyMjkwKTtcbiAgICAgICAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSArIDE1XSwgMjIsIDEyMzY1MzUzMjkpO1xuXG4gICAgICAgICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNSwgLTE2NTc5NjUxMCk7XG4gICAgICAgICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2kgKyA2XSwgOSwgLTEwNjk1MDE2MzIpO1xuICAgICAgICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpICsgMTFdLCAxNCwgNjQzNzE3NzEzKTtcbiAgICAgICAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSArIDBdLCAyMCwgLTM3Mzg5NzMwMik7XG4gICAgICAgICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2kgKyA1XSwgNSwgLTcwMTU1ODY5MSk7XG4gICAgICAgICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2kgKyAxMF0sIDksIDM4MDE2MDgzKTtcbiAgICAgICAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSArIDE1XSwgMTQsIC02NjA0NzgzMzUpO1xuICAgICAgICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpICsgNF0sIDIwLCAtNDA1NTM3ODQ4KTtcbiAgICAgICAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSArIDldLCA1LCA1Njg0NDY0MzgpO1xuICAgICAgICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpICsgMTRdLCA5LCAtMTAxOTgwMzY5MCk7XG4gICAgICAgICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2kgKyAzXSwgMTQsIC0xODczNjM5NjEpO1xuICAgICAgICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpICsgOF0sIDIwLCAxMTYzNTMxNTAxKTtcbiAgICAgICAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSArIDEzXSwgNSwgLTE0NDQ2ODE0NjcpO1xuICAgICAgICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpICsgMl0sIDksIC01MTQwMzc4NCk7XG4gICAgICAgICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTQsIDE3MzUzMjg0NzMpO1xuICAgICAgICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpICsgMTJdLCAyMCwgLTE5MjY2MDc3MzQpO1xuXG4gICAgICAgICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2kgKyA1XSwgNCwgLTM3ODU1OCk7XG4gICAgICAgICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2kgKyA4XSwgMTEsIC0yMDIyNTc0NDYzKTtcbiAgICAgICAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTYsIDE4MzkwMzA1NjIpO1xuICAgICAgICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpICsgMTRdLCAyMywgLTM1MzA5NTU2KTtcbiAgICAgICAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSArIDFdLCA0LCAtMTUzMDk5MjA2MCk7XG4gICAgICAgICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2kgKyA0XSwgMTEsIDEyNzI4OTMzNTMpO1xuICAgICAgICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpICsgN10sIDE2LCAtMTU1NDk3NjMyKTtcbiAgICAgICAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSArIDEwXSwgMjMsIC0xMDk0NzMwNjQwKTtcbiAgICAgICAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSArIDEzXSwgNCwgNjgxMjc5MTc0KTtcbiAgICAgICAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSArIDBdLCAxMSwgLTM1ODUzNzIyMik7XG4gICAgICAgICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2kgKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xuICAgICAgICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpICsgNl0sIDIzLCA3NjAyOTE4OSk7XG4gICAgICAgICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2kgKyA5XSwgNCwgLTY0MDM2NDQ4Nyk7XG4gICAgICAgICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2kgKyAxMl0sIDExLCAtNDIxODE1ODM1KTtcbiAgICAgICAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSArIDE1XSwgMTYsIDUzMDc0MjUyMCk7XG4gICAgICAgICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2kgKyAyXSwgMjMsIC05OTUzMzg2NTEpO1xuXG4gICAgICAgICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2kgKyAwXSwgNiwgLTE5ODYzMDg0NCk7XG4gICAgICAgICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2kgKyA3XSwgMTAsIDExMjY4OTE0MTUpO1xuICAgICAgICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpICsgMTRdLCAxNSwgLTE0MTYzNTQ5MDUpO1xuICAgICAgICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpICsgNV0sIDIxLCAtNTc0MzQwNTUpO1xuICAgICAgICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpICsgMTJdLCA2LCAxNzAwNDg1NTcxKTtcbiAgICAgICAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSArIDNdLCAxMCwgLTE4OTQ5ODY2MDYpO1xuICAgICAgICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNSwgLTEwNTE1MjMpO1xuICAgICAgICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpICsgMV0sIDIxLCAtMjA1NDkyMjc5OSk7XG4gICAgICAgICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2kgKyA4XSwgNiwgMTg3MzMxMzM1OSk7XG4gICAgICAgICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2kgKyAxNV0sIDEwLCAtMzA2MTE3NDQpO1xuICAgICAgICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpICsgNl0sIDE1LCAtMTU2MDE5ODM4MCk7XG4gICAgICAgICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2kgKyAxM10sIDIxLCAxMzA5MTUxNjQ5KTtcbiAgICAgICAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA2LCAtMTQ1NTIzMDcwKTtcbiAgICAgICAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSArIDExXSwgMTAsIC0xMTIwMjEwMzc5KTtcbiAgICAgICAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSArIDJdLCAxNSwgNzE4Nzg3MjU5KTtcbiAgICAgICAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSArIDldLCAyMSwgLTM0MzQ4NTU1MSk7XG5cbiAgICAgICAgICBhID0gc2FmZV9hZGQoYSwgb2xkYSk7XG4gICAgICAgICAgYiA9IHNhZmVfYWRkKGIsIG9sZGIpO1xuICAgICAgICAgIGMgPSBzYWZlX2FkZChjLCBvbGRjKTtcbiAgICAgICAgICBkID0gc2FmZV9hZGQoZCwgb2xkZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFycmF5KGEsIGIsIGMsIGQpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZXNlIGZ1bmN0aW9ucyBpbXBsZW1lbnQgdGhlIGZvdXIgYmFzaWMgb3BlcmF0aW9ucyB0aGUgYWxnb3JpdGhtIHVzZXMuXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gbWQ1X2NtbihxLCBhLCBiLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBzYWZlX2FkZChiaXRfcm9sKHNhZmVfYWRkKHNhZmVfYWRkKGEsIHEpLCBzYWZlX2FkZCh4LCB0KSksIHMpLCBiKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbWQ1X2ZmKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgICAgICAgcmV0dXJuIG1kNV9jbW4oKGIgJiBjKSB8ICgofmIpICYgZCksIGEsIGIsIHgsIHMsIHQpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtZDVfZ2coYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICAgICAgICByZXR1cm4gbWQ1X2NtbigoYiAmIGQpIHwgKGMgJiAofmQpKSwgYSwgYiwgeCwgcywgdCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1kNV9oaChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBtZDVfY21uKGIgXiBjIF4gZCwgYSwgYiwgeCwgcywgdCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1kNV9paShhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBtZDVfY21uKGMgXiAoYiB8ICh+ZCkpLCBhLCBiLCB4LCBzLCB0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgSGFzaGVzXG4gICAgICogQGNsYXNzIEhhc2hlcy5TSEExXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjb25maWddXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNlY3VyZSBIYXNoIEFsZ29yaXRobSwgU0hBLTEsIGFzIGRlZmluZWQgaW4gRklQUyAxODAtMVxuICAgICAqIFZlcnNpb24gMi4yIENvcHlyaWdodCBQYXVsIEpvaG5zdG9uIDIwMDAgLSAyMDA5LlxuICAgICAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAgICAgKiBTZWUgaHR0cDovL3BhamhvbWUub3JnLnVrL2NyeXB0L21kNSBmb3IgZGV0YWlscy5cbiAgICAgKi9cbiAgICBTSEExOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAvKipcbiAgICAgICAqIFByaXZhdGUgY29uZmlnIHByb3BlcnRpZXMuIFlvdSBtYXkgbmVlZCB0byB0d2VhayB0aGVzZSB0byBiZSBjb21wYXRpYmxlIHdpdGhcbiAgICAgICAqIHRoZSBzZXJ2ZXItc2lkZSwgYnV0IHRoZSBkZWZhdWx0cyB3b3JrIGluIG1vc3QgY2FzZXMuXG4gICAgICAgKiBTZWUge0BsaW5rIEhhc2hlcy5NRDUjbWV0aG9kLXNldFVwcGVyQ2FzZX0gYW5kIHtAbGluayBIYXNoZXMuU0hBMSNtZXRob2Qtc2V0VXBwZXJDYXNlfVxuICAgICAgICovXG4gICAgICB2YXIgaGV4Y2FzZSA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnVwcGVyY2FzZSA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXBwZXJjYXNlIDogZmFsc2UsIC8vIGhleGFkZWNpbWFsIG91dHB1dCBjYXNlIGZvcm1hdC4gZmFsc2UgLSBsb3dlcmNhc2U7IHRydWUgLSB1cHBlcmNhc2VcbiAgICAgICAgYjY0cGFkID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMucGFkID09PSAnc3RyaW5nJykgPyBvcHRpb25zLnBkYSA6ICc9JywgLy8gYmFzZS02NCBwYWQgY2hhcmFjdGVyLiBEZWZhdWx0cyB0byAnPScgZm9yIHN0cmljdCBSRkMgY29tcGxpYW5jZVxuICAgICAgICB1dGY4ID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXRmOCA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXRmOCA6IHRydWU7IC8vIGVuYWJsZS9kaXNhYmxlIHV0ZjggZW5jb2RpbmdcblxuICAgICAgLy8gcHVibGljIG1ldGhvZHNcbiAgICAgIHRoaXMuaGV4ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cihzLCB1dGY4KSwgaGV4Y2FzZSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5iNjQgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyKHMsIHV0ZjgpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55ID0gZnVuY3Rpb24ocywgZSkge1xuICAgICAgICByZXR1cm4gcnN0cjJhbnkocnN0cihzLCB1dGY4KSwgZSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5yYXcgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyKHMsIHV0ZjgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuaGV4X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmhleChyc3RyX2htYWMoaywgZCkpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0X2htYWMgPSBmdW5jdGlvbihrLCBkKSB7XG4gICAgICAgIHJldHVybiByc3RyMmI2NChyc3RyX2htYWMoaywgZCksIGI2NHBhZCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hbnlfaG1hYyA9IGZ1bmN0aW9uKGssIGQsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHJfaG1hYyhrLCBkKSwgZSk7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBQZXJmb3JtIGEgc2ltcGxlIHNlbGYtdGVzdCB0byBzZWUgaWYgdGhlIFZNIGlzIHdvcmtpbmdcbiAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gSGV4YWRlY2ltYWwgaGFzaCBzYW1wbGVcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy52bV90ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBoZXgoJ2FiYycpLnRvTG93ZXJDYXNlKCkgPT09ICc5MDAxNTA5ODNjZDI0ZmIwZDY5NjNmN2QyOGUxN2Y3Mic7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRW5hYmxlL2Rpc2FibGUgdXBwZXJjYXNlIGhleGFkZWNpbWFsIHJldHVybmVkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtib29sZWFufVxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0VXBwZXJDYXNlID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGhleGNhc2UgPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQGRlc2NyaXB0aW9uIERlZmluZXMgYSBiYXNlNjQgcGFkIHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFBhZFxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSB0aGlzXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMuc2V0UGFkID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBiNjRwYWQgPSBhIHx8IGI2NHBhZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBTSEEtNTEyIG9mIGEgcmF3IHN0cmluZ1xuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHJzdHIocykge1xuICAgICAgICBzID0gKHV0ZjgpID8gdXRmOEVuY29kZShzKSA6IHM7XG4gICAgICAgIHJldHVybiBiaW5iMnJzdHIoYmluYihyc3RyMmJpbmIocyksIHMubGVuZ3RoICogOCkpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgSE1BQy1TSEExIG9mIGEga2V5IGFuZCBzb21lIGRhdGEgKHJhdyBzdHJpbmdzKVxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHJzdHJfaG1hYyhrZXksIGRhdGEpIHtcbiAgICAgICAgdmFyIGJrZXksIGlwYWQsIG9wYWQsIGksIGhhc2g7XG4gICAgICAgIGtleSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoa2V5KSA6IGtleTtcbiAgICAgICAgZGF0YSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoZGF0YSkgOiBkYXRhO1xuICAgICAgICBia2V5ID0gcnN0cjJiaW5iKGtleSk7XG5cbiAgICAgICAgaWYgKGJrZXkubGVuZ3RoID4gMTYpIHtcbiAgICAgICAgICBia2V5ID0gYmluYihia2V5LCBrZXkubGVuZ3RoICogOCk7XG4gICAgICAgIH1cbiAgICAgICAgaXBhZCA9IEFycmF5KDE2KSwgb3BhZCA9IEFycmF5KDE2KTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE2OyBpICs9IDEpIHtcbiAgICAgICAgICBpcGFkW2ldID0gYmtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgICAgb3BhZFtpXSA9IGJrZXlbaV0gXiAweDVDNUM1QzVDO1xuICAgICAgICB9XG4gICAgICAgIGhhc2ggPSBiaW5iKGlwYWQuY29uY2F0KHJzdHIyYmluYihkYXRhKSksIDUxMiArIGRhdGEubGVuZ3RoICogOCk7XG4gICAgICAgIHJldHVybiBiaW5iMnJzdHIoYmluYihvcGFkLmNvbmNhdChoYXNoKSwgNTEyICsgMTYwKSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBTSEEtMSBvZiBhbiBhcnJheSBvZiBiaWctZW5kaWFuIHdvcmRzLCBhbmQgYSBiaXQgbGVuZ3RoXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gYmluYih4LCBsZW4pIHtcbiAgICAgICAgdmFyIGksIGosIHQsIG9sZGEsIG9sZGIsIG9sZGMsIG9sZGQsIG9sZGUsXG4gICAgICAgICAgdyA9IEFycmF5KDgwKSxcbiAgICAgICAgICBhID0gMTczMjU4NDE5MyxcbiAgICAgICAgICBiID0gLTI3MTczMzg3OSxcbiAgICAgICAgICBjID0gLTE3MzI1ODQxOTQsXG4gICAgICAgICAgZCA9IDI3MTczMzg3OCxcbiAgICAgICAgICBlID0gLTEwMDk1ODk3NzY7XG5cbiAgICAgICAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgICAgICAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBsZW4gJSAzMik7XG4gICAgICAgIHhbKChsZW4gKyA2NCA+PiA5KSA8PCA0KSArIDE1XSA9IGxlbjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICAgICAgICBvbGRhID0gYSxcbiAgICAgICAgICBvbGRiID0gYjtcbiAgICAgICAgICBvbGRjID0gYztcbiAgICAgICAgICBvbGRkID0gZDtcbiAgICAgICAgICBvbGRlID0gZTtcblxuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCA4MDsgaiArPSAxKSB7XG4gICAgICAgICAgICBpZiAoaiA8IDE2KSB7XG4gICAgICAgICAgICAgIHdbal0gPSB4W2kgKyBqXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdbal0gPSBiaXRfcm9sKHdbaiAtIDNdIF4gd1tqIC0gOF0gXiB3W2ogLSAxNF0gXiB3W2ogLSAxNl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdCA9IHNhZmVfYWRkKHNhZmVfYWRkKGJpdF9yb2woYSwgNSksIHNoYTFfZnQoaiwgYiwgYywgZCkpLFxuICAgICAgICAgICAgICBzYWZlX2FkZChzYWZlX2FkZChlLCB3W2pdKSwgc2hhMV9rdChqKSkpO1xuICAgICAgICAgICAgZSA9IGQ7XG4gICAgICAgICAgICBkID0gYztcbiAgICAgICAgICAgIGMgPSBiaXRfcm9sKGIsIDMwKTtcbiAgICAgICAgICAgIGIgPSBhO1xuICAgICAgICAgICAgYSA9IHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYSA9IHNhZmVfYWRkKGEsIG9sZGEpO1xuICAgICAgICAgIGIgPSBzYWZlX2FkZChiLCBvbGRiKTtcbiAgICAgICAgICBjID0gc2FmZV9hZGQoYywgb2xkYyk7XG4gICAgICAgICAgZCA9IHNhZmVfYWRkKGQsIG9sZGQpO1xuICAgICAgICAgIGUgPSBzYWZlX2FkZChlLCBvbGRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXkoYSwgYiwgYywgZCwgZSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUGVyZm9ybSB0aGUgYXBwcm9wcmlhdGUgdHJpcGxldCBjb21iaW5hdGlvbiBmdW5jdGlvbiBmb3IgdGhlIGN1cnJlbnRcbiAgICAgICAqIGl0ZXJhdGlvblxuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHNoYTFfZnQodCwgYiwgYywgZCkge1xuICAgICAgICBpZiAodCA8IDIwKSB7XG4gICAgICAgICAgcmV0dXJuIChiICYgYykgfCAoKH5iKSAmIGQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0IDwgNDApIHtcbiAgICAgICAgICByZXR1cm4gYiBeIGMgXiBkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0IDwgNjApIHtcbiAgICAgICAgICByZXR1cm4gKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiIF4gYyBeIGQ7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGV0ZXJtaW5lIHRoZSBhcHByb3ByaWF0ZSBhZGRpdGl2ZSBjb25zdGFudCBmb3IgdGhlIGN1cnJlbnQgaXRlcmF0aW9uXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gc2hhMV9rdCh0KSB7XG4gICAgICAgIHJldHVybiAodCA8IDIwKSA/IDE1MTg1MDAyNDkgOiAodCA8IDQwKSA/IDE4NTk3NzUzOTMgOlxuICAgICAgICAgICh0IDwgNjApID8gLTE4OTQwMDc1ODggOiAtODk5NDk3NTE0O1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQGNsYXNzIEhhc2hlcy5TSEEyNTZcbiAgICAgKiBAcGFyYW0ge2NvbmZpZ31cbiAgICAgKlxuICAgICAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2VjdXJlIEhhc2ggQWxnb3JpdGhtLCBTSEEtMjU2LCBhcyBkZWZpbmVkIGluIEZJUFMgMTgwLTJcbiAgICAgKiBWZXJzaW9uIDIuMiBDb3B5cmlnaHQgQW5nZWwgTWFyaW4sIFBhdWwgSm9obnN0b24gMjAwMCAtIDIwMDkuXG4gICAgICogT3RoZXIgY29udHJpYnV0b3JzOiBHcmVnIEhvbHQsIEFuZHJldyBLZXBlcnQsIFlkbmFyLCBMb3N0aW5ldFxuICAgICAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBkZXRhaWxzLlxuICAgICAqIEFsc28gaHR0cDovL2FubWFyLmV1Lm9yZy9wcm9qZWN0cy9qc3NoYTIvXG4gICAgICovXG4gICAgU0hBMjU2OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAvKipcbiAgICAgICAqIFByaXZhdGUgcHJvcGVydGllcyBjb25maWd1cmF0aW9uIHZhcmlhYmxlcy4gWW91IG1heSBuZWVkIHRvIHR3ZWFrIHRoZXNlIHRvIGJlIGNvbXBhdGlibGUgd2l0aFxuICAgICAgICogdGhlIHNlcnZlci1zaWRlLCBidXQgdGhlIGRlZmF1bHRzIHdvcmsgaW4gbW9zdCBjYXNlcy5cbiAgICAgICAqIEBzZWUgdGhpcy5zZXRVcHBlckNhc2UoKSBtZXRob2RcbiAgICAgICAqIEBzZWUgdGhpcy5zZXRQYWQoKSBtZXRob2RcbiAgICAgICAqL1xuICAgICAgdmFyIGhleGNhc2UgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51cHBlcmNhc2UgPT09ICdib29sZWFuJykgPyBvcHRpb25zLnVwcGVyY2FzZSA6IGZhbHNlLCAvLyBoZXhhZGVjaW1hbCBvdXRwdXQgY2FzZSBmb3JtYXQuIGZhbHNlIC0gbG93ZXJjYXNlOyB0cnVlIC0gdXBwZXJjYXNlICAqL1xuICAgICAgICBiNjRwYWQgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5wYWQgPT09ICdzdHJpbmcnKSA/IG9wdGlvbnMucGRhIDogJz0nLFxuICAgICAgICAvKiBiYXNlLTY0IHBhZCBjaGFyYWN0ZXIuIERlZmF1bHQgJz0nIGZvciBzdHJpY3QgUkZDIGNvbXBsaWFuY2UgICAqL1xuICAgICAgICB1dGY4ID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXRmOCA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXRmOCA6IHRydWUsXG4gICAgICAgIC8qIGVuYWJsZS9kaXNhYmxlIHV0ZjggZW5jb2RpbmcgKi9cbiAgICAgICAgc2hhMjU2X0s7XG5cbiAgICAgIC8qIHByaXZpbGVnZWQgKHB1YmxpYykgbWV0aG9kcyAqL1xuICAgICAgdGhpcy5oZXggPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyMmhleChyc3RyKHMsIHV0ZjgpKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmI2NCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYjY0KHJzdHIocywgdXRmOCksIGI2NHBhZCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hbnkgPSBmdW5jdGlvbihzLCBlKSB7XG4gICAgICAgIHJldHVybiByc3RyMmFueShyc3RyKHMsIHV0ZjgpLCBlKTtcbiAgICAgIH07XG4gICAgICB0aGlzLnJhdyA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIocywgdXRmOCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5oZXhfaG1hYyA9IGZ1bmN0aW9uKGssIGQpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyaGV4KHJzdHJfaG1hYyhrLCBkKSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5iNjRfaG1hYyA9IGZ1bmN0aW9uKGssIGQpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYjY0KHJzdHJfaG1hYyhrLCBkKSwgYjY0cGFkKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFueV9obWFjID0gZnVuY3Rpb24oaywgZCwgZSkge1xuICAgICAgICByZXR1cm4gcnN0cjJhbnkocnN0cl9obWFjKGssIGQpLCBlKTtcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIFBlcmZvcm0gYSBzaW1wbGUgc2VsZi10ZXN0IHRvIHNlZSBpZiB0aGUgVk0gaXMgd29ya2luZ1xuICAgICAgICogQHJldHVybiB7U3RyaW5nfSBIZXhhZGVjaW1hbCBoYXNoIHNhbXBsZVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnZtX3Rlc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGhleCgnYWJjJykudG9Mb3dlckNhc2UoKSA9PT0gJzkwMDE1MDk4M2NkMjRmYjBkNjk2M2Y3ZDI4ZTE3ZjcyJztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEVuYWJsZS9kaXNhYmxlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCByZXR1cm5lZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn1cbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFVwcGVyQ2FzZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoZXhjYXNlID0gYTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEBkZXNjcmlwdGlvbiBEZWZpbmVzIGEgYmFzZTY0IHBhZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBQYWRcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFBhZCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgYjY0cGFkID0gYSB8fCBiNjRwYWQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBTSEEtNTEyIG9mIGEgcmF3IHN0cmluZ1xuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHJzdHIocywgdXRmOCkge1xuICAgICAgICBzID0gKHV0ZjgpID8gdXRmOEVuY29kZShzKSA6IHM7XG4gICAgICAgIHJldHVybiBiaW5iMnJzdHIoYmluYihyc3RyMmJpbmIocyksIHMubGVuZ3RoICogOCkpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZSB0aGUgSE1BQy1zaGEyNTYgb2YgYSBrZXkgYW5kIHNvbWUgZGF0YSAocmF3IHN0cmluZ3MpXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cl9obWFjKGtleSwgZGF0YSkge1xuICAgICAgICBrZXkgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGtleSkgOiBrZXk7XG4gICAgICAgIGRhdGEgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGRhdGEpIDogZGF0YTtcbiAgICAgICAgdmFyIGhhc2gsIGkgPSAwLFxuICAgICAgICAgIGJrZXkgPSByc3RyMmJpbmIoa2V5KSxcbiAgICAgICAgICBpcGFkID0gQXJyYXkoMTYpLFxuICAgICAgICAgIG9wYWQgPSBBcnJheSgxNik7XG5cbiAgICAgICAgaWYgKGJrZXkubGVuZ3RoID4gMTYpIHtcbiAgICAgICAgICBia2V5ID0gYmluYihia2V5LCBrZXkubGVuZ3RoICogOCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDsgaSA8IDE2OyBpICs9IDEpIHtcbiAgICAgICAgICBpcGFkW2ldID0gYmtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgICAgb3BhZFtpXSA9IGJrZXlbaV0gXiAweDVDNUM1QzVDO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzaCA9IGJpbmIoaXBhZC5jb25jYXQocnN0cjJiaW5iKGRhdGEpKSwgNTEyICsgZGF0YS5sZW5ndGggKiA4KTtcbiAgICAgICAgcmV0dXJuIGJpbmIycnN0cihiaW5iKG9wYWQuY29uY2F0KGhhc2gpLCA1MTIgKyAyNTYpKTtcbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqIE1haW4gc2hhMjU2IGZ1bmN0aW9uLCB3aXRoIGl0cyBzdXBwb3J0IGZ1bmN0aW9uc1xuICAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHNoYTI1Nl9TKFgsIG4pIHtcbiAgICAgICAgcmV0dXJuIChYID4+PiBuKSB8IChYIDw8ICgzMiAtIG4pKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X1IoWCwgbikge1xuICAgICAgICByZXR1cm4gKFggPj4+IG4pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfQ2goeCwgeSwgeikge1xuICAgICAgICByZXR1cm4gKCh4ICYgeSkgXiAoKH54KSAmIHopKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X01haih4LCB5LCB6KSB7XG4gICAgICAgIHJldHVybiAoKHggJiB5KSBeICh4ICYgeikgXiAoeSAmIHopKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hhMjU2X1NpZ21hMDI1Nih4KSB7XG4gICAgICAgIHJldHVybiAoc2hhMjU2X1MoeCwgMikgXiBzaGEyNTZfUyh4LCAxMykgXiBzaGEyNTZfUyh4LCAyMikpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfU2lnbWExMjU2KHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCA2KSBeIHNoYTI1Nl9TKHgsIDExKSBeIHNoYTI1Nl9TKHgsIDI1KSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNoYTI1Nl9HYW1tYTAyNTYoeCkge1xuICAgICAgICByZXR1cm4gKHNoYTI1Nl9TKHgsIDcpIF4gc2hhMjU2X1MoeCwgMTgpIF4gc2hhMjU2X1IoeCwgMykpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfR2FtbWExMjU2KHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCAxNykgXiBzaGEyNTZfUyh4LCAxOSkgXiBzaGEyNTZfUih4LCAxMCkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfU2lnbWEwNTEyKHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCAyOCkgXiBzaGEyNTZfUyh4LCAzNCkgXiBzaGEyNTZfUyh4LCAzOSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfU2lnbWExNTEyKHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCAxNCkgXiBzaGEyNTZfUyh4LCAxOCkgXiBzaGEyNTZfUyh4LCA0MSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfR2FtbWEwNTEyKHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCAxKSBeIHNoYTI1Nl9TKHgsIDgpIF4gc2hhMjU2X1IoeCwgNykpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGEyNTZfR2FtbWExNTEyKHgpIHtcbiAgICAgICAgcmV0dXJuIChzaGEyNTZfUyh4LCAxOSkgXiBzaGEyNTZfUyh4LCA2MSkgXiBzaGEyNTZfUih4LCA2KSk7XG4gICAgICB9XG5cbiAgICAgIHNoYTI1Nl9LID0gW1xuICAgICAgICAxMTE2MzUyNDA4LCAxODk5NDQ3NDQxLCAtMTI0NTY0MzgyNSwgLTM3Mzk1NzcyMywgOTYxOTg3MTYzLCAxNTA4OTcwOTkzLCAtMTg0MTMzMTU0OCwgLTE0MjQyMDQwNzUsIC02NzA1ODYyMTYsIDMxMDU5ODQwMSwgNjA3MjI1Mjc4LCAxNDI2ODgxOTg3LFxuICAgICAgICAxOTI1MDc4Mzg4LCAtMjEzMjg4OTA5MCwgLTE2ODAwNzkxOTMsIC0xMDQ2NzQ0NzE2LCAtNDU5NTc2ODk1LCAtMjcyNzQyNTIyLFxuICAgICAgICAyNjQzNDcwNzgsIDYwNDgwNzYyOCwgNzcwMjU1OTgzLCAxMjQ5MTUwMTIyLCAxNTU1MDgxNjkyLCAxOTk2MDY0OTg2LCAtMTc0MDc0NjQxNCwgLTE0NzMxMzI5NDcsIC0xMzQxOTcwNDg4LCAtMTA4NDY1MzYyNSwgLTk1ODM5NTQwNSwgLTcxMDQzODU4NSxcbiAgICAgICAgMTEzOTI2OTkzLCAzMzgyNDE4OTUsIDY2NjMwNzIwNSwgNzczNTI5OTEyLCAxMjk0NzU3MzcyLCAxMzk2MTgyMjkxLFxuICAgICAgICAxNjk1MTgzNzAwLCAxOTg2NjYxMDUxLCAtMjExNzk0MDk0NiwgLTE4MzgwMTEyNTksIC0xNTY0NDgxMzc1LCAtMTQ3NDY2NDg4NSwgLTEwMzUyMzY0OTYsIC05NDkyMDI1MjUsIC03Nzg5MDE0NzksIC02OTQ2MTQ0OTIsIC0yMDAzOTUzODcsIDI3NTQyMzM0NCxcbiAgICAgICAgNDMwMjI3NzM0LCA1MDY5NDg2MTYsIDY1OTA2MDU1NiwgODgzOTk3ODc3LCA5NTgxMzk1NzEsIDEzMjI4MjIyMTgsXG4gICAgICAgIDE1MzcwMDIwNjMsIDE3NDc4NzM3NzksIDE5NTU1NjIyMjIsIDIwMjQxMDQ4MTUsIC0yMDY3MjM2ODQ0LCAtMTkzMzExNDg3MiwgLTE4NjY1MzA4MjIsIC0xNTM4MjMzMTA5LCAtMTA5MDkzNTgxNywgLTk2NTY0MTk5OFxuICAgICAgXTtcblxuICAgICAgZnVuY3Rpb24gYmluYihtLCBsKSB7XG4gICAgICAgIHZhciBIQVNIID0gWzE3NzkwMzM3MDMsIC0xMTUwODMzMDE5LCAxMDEzOTA0MjQyLCAtMTUyMTQ4NjUzNCxcbiAgICAgICAgICAxMzU5ODkzMTE5LCAtMTY5NDE0NDM3MiwgNTI4NzM0NjM1LCAxNTQxNDU5MjI1XG4gICAgICAgIF07XG4gICAgICAgIHZhciBXID0gbmV3IEFycmF5KDY0KTtcbiAgICAgICAgdmFyIGEsIGIsIGMsIGQsIGUsIGYsIGcsIGg7XG4gICAgICAgIHZhciBpLCBqLCBUMSwgVDI7XG5cbiAgICAgICAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgICAgICAgbVtsID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbCAlIDMyKTtcbiAgICAgICAgbVsoKGwgKyA2NCA+PiA5KSA8PCA0KSArIDE1XSA9IGw7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG0ubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgICAgICAgYSA9IEhBU0hbMF07XG4gICAgICAgICAgYiA9IEhBU0hbMV07XG4gICAgICAgICAgYyA9IEhBU0hbMl07XG4gICAgICAgICAgZCA9IEhBU0hbM107XG4gICAgICAgICAgZSA9IEhBU0hbNF07XG4gICAgICAgICAgZiA9IEhBU0hbNV07XG4gICAgICAgICAgZyA9IEhBU0hbNl07XG4gICAgICAgICAgaCA9IEhBU0hbN107XG5cbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgNjQ7IGogKz0gMSkge1xuICAgICAgICAgICAgaWYgKGogPCAxNikge1xuICAgICAgICAgICAgICBXW2pdID0gbVtqICsgaV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBXW2pdID0gc2FmZV9hZGQoc2FmZV9hZGQoc2FmZV9hZGQoc2hhMjU2X0dhbW1hMTI1NihXW2ogLSAyXSksIFdbaiAtIDddKSxcbiAgICAgICAgICAgICAgICBzaGEyNTZfR2FtbWEwMjU2KFdbaiAtIDE1XSkpLCBXW2ogLSAxNl0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBUMSA9IHNhZmVfYWRkKHNhZmVfYWRkKHNhZmVfYWRkKHNhZmVfYWRkKGgsIHNoYTI1Nl9TaWdtYTEyNTYoZSkpLCBzaGEyNTZfQ2goZSwgZiwgZykpLFxuICAgICAgICAgICAgICBzaGEyNTZfS1tqXSksIFdbal0pO1xuICAgICAgICAgICAgVDIgPSBzYWZlX2FkZChzaGEyNTZfU2lnbWEwMjU2KGEpLCBzaGEyNTZfTWFqKGEsIGIsIGMpKTtcbiAgICAgICAgICAgIGggPSBnO1xuICAgICAgICAgICAgZyA9IGY7XG4gICAgICAgICAgICBmID0gZTtcbiAgICAgICAgICAgIGUgPSBzYWZlX2FkZChkLCBUMSk7XG4gICAgICAgICAgICBkID0gYztcbiAgICAgICAgICAgIGMgPSBiO1xuICAgICAgICAgICAgYiA9IGE7XG4gICAgICAgICAgICBhID0gc2FmZV9hZGQoVDEsIFQyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBIQVNIWzBdID0gc2FmZV9hZGQoYSwgSEFTSFswXSk7XG4gICAgICAgICAgSEFTSFsxXSA9IHNhZmVfYWRkKGIsIEhBU0hbMV0pO1xuICAgICAgICAgIEhBU0hbMl0gPSBzYWZlX2FkZChjLCBIQVNIWzJdKTtcbiAgICAgICAgICBIQVNIWzNdID0gc2FmZV9hZGQoZCwgSEFTSFszXSk7XG4gICAgICAgICAgSEFTSFs0XSA9IHNhZmVfYWRkKGUsIEhBU0hbNF0pO1xuICAgICAgICAgIEhBU0hbNV0gPSBzYWZlX2FkZChmLCBIQVNIWzVdKTtcbiAgICAgICAgICBIQVNIWzZdID0gc2FmZV9hZGQoZywgSEFTSFs2XSk7XG4gICAgICAgICAgSEFTSFs3XSA9IHNhZmVfYWRkKGgsIEhBU0hbN10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBIQVNIO1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBjbGFzcyBIYXNoZXMuU0hBNTEyXG4gICAgICogQHBhcmFtIHtjb25maWd9XG4gICAgICpcbiAgICAgKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNlY3VyZSBIYXNoIEFsZ29yaXRobSwgU0hBLTUxMiwgYXMgZGVmaW5lZCBpbiBGSVBTIDE4MC0yXG4gICAgICogVmVyc2lvbiAyLjIgQ29weXJpZ2h0IEFub255bW91cyBDb250cmlidXRvciwgUGF1bCBKb2huc3RvbiAyMDAwIC0gMjAwOS5cbiAgICAgKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gICAgICogU2VlIGh0dHA6Ly9wYWpob21lLm9yZy51ay9jcnlwdC9tZDUgZm9yIGRldGFpbHMuXG4gICAgICovXG4gICAgU0hBNTEyOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAvKipcbiAgICAgICAqIFByaXZhdGUgcHJvcGVydGllcyBjb25maWd1cmF0aW9uIHZhcmlhYmxlcy4gWW91IG1heSBuZWVkIHRvIHR3ZWFrIHRoZXNlIHRvIGJlIGNvbXBhdGlibGUgd2l0aFxuICAgICAgICogdGhlIHNlcnZlci1zaWRlLCBidXQgdGhlIGRlZmF1bHRzIHdvcmsgaW4gbW9zdCBjYXNlcy5cbiAgICAgICAqIEBzZWUgdGhpcy5zZXRVcHBlckNhc2UoKSBtZXRob2RcbiAgICAgICAqIEBzZWUgdGhpcy5zZXRQYWQoKSBtZXRob2RcbiAgICAgICAqL1xuICAgICAgdmFyIGhleGNhc2UgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51cHBlcmNhc2UgPT09ICdib29sZWFuJykgPyBvcHRpb25zLnVwcGVyY2FzZSA6IGZhbHNlLFxuICAgICAgICAvKiBoZXhhZGVjaW1hbCBvdXRwdXQgY2FzZSBmb3JtYXQuIGZhbHNlIC0gbG93ZXJjYXNlOyB0cnVlIC0gdXBwZXJjYXNlICAqL1xuICAgICAgICBiNjRwYWQgPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5wYWQgPT09ICdzdHJpbmcnKSA/IG9wdGlvbnMucGRhIDogJz0nLFxuICAgICAgICAvKiBiYXNlLTY0IHBhZCBjaGFyYWN0ZXIuIERlZmF1bHQgJz0nIGZvciBzdHJpY3QgUkZDIGNvbXBsaWFuY2UgICAqL1xuICAgICAgICB1dGY4ID0gKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudXRmOCA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXRmOCA6IHRydWUsXG4gICAgICAgIC8qIGVuYWJsZS9kaXNhYmxlIHV0ZjggZW5jb2RpbmcgKi9cbiAgICAgICAgc2hhNTEyX2s7XG5cbiAgICAgIC8qIHByaXZpbGVnZWQgKHB1YmxpYykgbWV0aG9kcyAqL1xuICAgICAgdGhpcy5oZXggPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiByc3RyMmhleChyc3RyKHMpKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmI2NCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYjY0KHJzdHIocyksIGI2NHBhZCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hbnkgPSBmdW5jdGlvbihzLCBlKSB7XG4gICAgICAgIHJldHVybiByc3RyMmFueShyc3RyKHMpLCBlKTtcbiAgICAgIH07XG4gICAgICB0aGlzLnJhdyA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIocywgdXRmOCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5oZXhfaG1hYyA9IGZ1bmN0aW9uKGssIGQpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyaGV4KHJzdHJfaG1hYyhrLCBkKSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5iNjRfaG1hYyA9IGZ1bmN0aW9uKGssIGQpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYjY0KHJzdHJfaG1hYyhrLCBkKSwgYjY0cGFkKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFueV9obWFjID0gZnVuY3Rpb24oaywgZCwgZSkge1xuICAgICAgICByZXR1cm4gcnN0cjJhbnkocnN0cl9obWFjKGssIGQpLCBlKTtcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIFBlcmZvcm0gYSBzaW1wbGUgc2VsZi10ZXN0IHRvIHNlZSBpZiB0aGUgVk0gaXMgd29ya2luZ1xuICAgICAgICogQHJldHVybiB7U3RyaW5nfSBIZXhhZGVjaW1hbCBoYXNoIHNhbXBsZVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnZtX3Rlc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGhleCgnYWJjJykudG9Mb3dlckNhc2UoKSA9PT0gJzkwMDE1MDk4M2NkMjRmYjBkNjk2M2Y3ZDI4ZTE3ZjcyJztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEBkZXNjcmlwdGlvbiBFbmFibGUvZGlzYWJsZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgcmV0dXJuZWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVcHBlckNhc2UgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGV4Y2FzZSA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gUGFkXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRQYWQgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGI2NHBhZCA9IGEgfHwgYjY0cGFkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEBkZXNjcmlwdGlvbiBEZWZpbmVzIGEgYmFzZTY0IHBhZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn1cbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFVURjggPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdXRmOCA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuXG4gICAgICAvKiBwcml2YXRlIG1ldGhvZHMgKi9cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIFNIQS01MTIgb2YgYSByYXcgc3RyaW5nXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cihzKSB7XG4gICAgICAgIHMgPSAodXRmOCkgPyB1dGY4RW5jb2RlKHMpIDogcztcbiAgICAgICAgcmV0dXJuIGJpbmIycnN0cihiaW5iKHJzdHIyYmluYihzKSwgcy5sZW5ndGggKiA4KSk7XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBITUFDLVNIQS01MTIgb2YgYSBrZXkgYW5kIHNvbWUgZGF0YSAocmF3IHN0cmluZ3MpXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cl9obWFjKGtleSwgZGF0YSkge1xuICAgICAgICBrZXkgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGtleSkgOiBrZXk7XG4gICAgICAgIGRhdGEgPSAodXRmOCkgPyB1dGY4RW5jb2RlKGRhdGEpIDogZGF0YTtcblxuICAgICAgICB2YXIgaGFzaCwgaSA9IDAsXG4gICAgICAgICAgYmtleSA9IHJzdHIyYmluYihrZXkpLFxuICAgICAgICAgIGlwYWQgPSBBcnJheSgzMiksXG4gICAgICAgICAgb3BhZCA9IEFycmF5KDMyKTtcblxuICAgICAgICBpZiAoYmtleS5sZW5ndGggPiAzMikge1xuICAgICAgICAgIGJrZXkgPSBiaW5iKGJrZXksIGtleS5sZW5ndGggKiA4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoOyBpIDwgMzI7IGkgKz0gMSkge1xuICAgICAgICAgIGlwYWRbaV0gPSBia2V5W2ldIF4gMHgzNjM2MzYzNjtcbiAgICAgICAgICBvcGFkW2ldID0gYmtleVtpXSBeIDB4NUM1QzVDNUM7XG4gICAgICAgIH1cblxuICAgICAgICBoYXNoID0gYmluYihpcGFkLmNvbmNhdChyc3RyMmJpbmIoZGF0YSkpLCAxMDI0ICsgZGF0YS5sZW5ndGggKiA4KTtcbiAgICAgICAgcmV0dXJuIGJpbmIycnN0cihiaW5iKG9wYWQuY29uY2F0KGhhc2gpLCAxMDI0ICsgNTEyKSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBTSEEtNTEyIG9mIGFuIGFycmF5IG9mIGJpZy1lbmRpYW4gZHdvcmRzLCBhbmQgYSBiaXQgbGVuZ3RoXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gYmluYih4LCBsZW4pIHtcbiAgICAgICAgdmFyIGosIGksIGwsXG4gICAgICAgICAgVyA9IG5ldyBBcnJheSg4MCksXG4gICAgICAgICAgaGFzaCA9IG5ldyBBcnJheSgxNiksXG4gICAgICAgICAgLy9Jbml0aWFsIGhhc2ggdmFsdWVzXG4gICAgICAgICAgSCA9IFtcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDZhMDllNjY3LCAtMjA1NzMxNTc2KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTE1MDgzMzAxOSwgLTIwNjcwOTM3MDEpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4M2M2ZWYzNzIsIC0yMzc5MTU3MyksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTE1MjE0ODY1MzQsIDB4NWYxZDM2ZjEpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NTEwZTUyN2YsIC0xMzc3NDAyMTU5KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTY5NDE0NDM3MiwgMHgyYjNlNmMxZiksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgxZjgzZDlhYiwgLTc5NTc3NzQ5KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDViZTBjZDE5LCAweDEzN2UyMTc5KVxuICAgICAgICAgIF0sXG4gICAgICAgICAgVDEgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgVDIgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgYSA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBiID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIGMgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgZCA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBlID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIGYgPSBuZXcgaW50NjQoMCwgMCksXG4gICAgICAgICAgZyA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICBoID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIC8vVGVtcG9yYXJ5IHZhcmlhYmxlcyBub3Qgc3BlY2lmaWVkIGJ5IHRoZSBkb2N1bWVudFxuICAgICAgICAgIHMwID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIHMxID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIENoID0gbmV3IGludDY0KDAsIDApLFxuICAgICAgICAgIE1haiA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICByMSA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICByMiA9IG5ldyBpbnQ2NCgwLCAwKSxcbiAgICAgICAgICByMyA9IG5ldyBpbnQ2NCgwLCAwKTtcblxuICAgICAgICBpZiAoc2hhNTEyX2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vU0hBNTEyIGNvbnN0YW50c1xuICAgICAgICAgIHNoYTUxMl9rID0gW1xuICAgICAgICAgICAgbmV3IGludDY0KDB4NDI4YTJmOTgsIC02ODUxOTk4MzgpLCBuZXcgaW50NjQoMHg3MTM3NDQ5MSwgMHgyM2VmNjVjZCksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTEyNDU2NDM4MjUsIC0zMzA0ODI4OTcpLCBuZXcgaW50NjQoLTM3Mzk1NzcyMywgLTIxMjE2NzE3NDgpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4Mzk1NmMyNWIsIC0yMTMzMzg4MjQpLCBuZXcgaW50NjQoMHg1OWYxMTFmMSwgLTEyNDExMzMwMzEpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xODQxMzMxNTQ4LCAtMTM1NzI5NTcxNyksIG5ldyBpbnQ2NCgtMTQyNDIwNDA3NSwgLTYzMDM1NzczNiksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTY3MDU4NjIxNiwgLTE1NjAwODM5MDIpLCBuZXcgaW50NjQoMHgxMjgzNWIwMSwgMHg0NTcwNmZiZSksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgyNDMxODViZSwgMHg0ZWU0YjI4YyksIG5ldyBpbnQ2NCgweDU1MGM3ZGMzLCAtNzA0NjYyMzAyKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDcyYmU1ZDc0LCAtMjI2Nzg0OTEzKSwgbmV3IGludDY0KC0yMTMyODg5MDkwLCAweDNiMTY5NmIxKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTY4MDA3OTE5MywgMHgyNWM3MTIzNSksIG5ldyBpbnQ2NCgtMTA0Njc0NDcxNiwgLTgxNTE5MjQyOCksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTQ1OTU3Njg5NSwgLTE2MjgzNTM4MzgpLCBuZXcgaW50NjQoLTI3Mjc0MjUyMiwgMHgzODRmMjVlMyksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHhmYzE5ZGM2LCAtMTk1MzcwNDUyMyksIG5ldyBpbnQ2NCgweDI0MGNhMWNjLCAweDc3YWM5YzY1KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDJkZTkyYzZmLCAweDU5MmIwMjc1KSwgbmV3IGludDY0KDB4NGE3NDg0YWEsIDB4NmVhNmU0ODMpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NWNiMGE5ZGMsIC0xMTE5NzQ5MTY0KSwgbmV3IGludDY0KDB4NzZmOTg4ZGEsIC0yMDk2MDE2NDU5KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTc0MDc0NjQxNCwgLTI5NTI0Nzk1NyksIG5ldyBpbnQ2NCgtMTQ3MzEzMjk0NywgMHgyZGI0MzIxMCksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTEzNDE5NzA0ODgsIC0xNzI4MzcyNDE3KSwgbmV3IGludDY0KC0xMDg0NjUzNjI1LCAtMTA5MTYyOTM0MCksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTk1ODM5NTQwNSwgMHgzZGE4OGZjMiksIG5ldyBpbnQ2NCgtNzEwNDM4NTg1LCAtMTgyODAxODM5NSksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg2Y2E2MzUxLCAtNTM2NjQwOTEzKSwgbmV3IGludDY0KDB4MTQyOTI5NjcsIDB4YTBlNmU3MCksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgyN2I3MGE4NSwgMHg0NmQyMmZmYyksIG5ldyBpbnQ2NCgweDJlMWIyMTM4LCAweDVjMjZjOTI2KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDRkMmM2ZGZjLCAweDVhYzQyYWVkKSwgbmV3IGludDY0KDB4NTMzODBkMTMsIC0xNjUxMTMzNDczKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDY1MGE3MzU0LCAtMTk1MTQzOTkwNiksIG5ldyBpbnQ2NCgweDc2NmEwYWJiLCAweDNjNzdiMmE4KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMjExNzk0MDk0NiwgMHg0N2VkYWVlNiksIG5ldyBpbnQ2NCgtMTgzODAxMTI1OSwgMHgxNDgyMzUzYiksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTE1NjQ0ODEzNzUsIDB4NGNmMTAzNjQpLCBuZXcgaW50NjQoLTE0NzQ2NjQ4ODUsIC0xMTM2NTEzMDIzKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtMTAzNTIzNjQ5NiwgLTc4OTAxNDYzOSksIG5ldyBpbnQ2NCgtOTQ5MjAyNTI1LCAweDY1NGJlMzApLFxuICAgICAgICAgICAgbmV3IGludDY0KC03Nzg5MDE0NzksIC02ODg5NTg5NTIpLCBuZXcgaW50NjQoLTY5NDYxNDQ5MiwgMHg1NTY1YTkxMCksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTIwMDM5NTM4NywgMHg1NzcxMjAyYSksIG5ldyBpbnQ2NCgweDEwNmFhMDcwLCAweDMyYmJkMWI4KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDE5YTRjMTE2LCAtMTE5NDE0MzU0NCksIG5ldyBpbnQ2NCgweDFlMzc2YzA4LCAweDUxNDFhYjUzKSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDI3NDg3NzRjLCAtNTQ0MjgxNzAzKSwgbmV3IGludDY0KDB4MzRiMGJjYjUsIC01MDk5MTcwMTYpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4MzkxYzBjYjMsIC05NzY2NTk4NjkpLCBuZXcgaW50NjQoMHg0ZWQ4YWE0YSwgLTQ4MjI0Mzg5MyksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg1YjljY2E0ZiwgMHg3NzYzZTM3MyksIG5ldyBpbnQ2NCgweDY4MmU2ZmYzLCAtNjkyOTMwMzk3KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgweDc0OGY4MmVlLCAweDVkZWZiMmZjKSwgbmV3IGludDY0KDB4NzhhNTYzNmYsIDB4NDMxNzJmNjApLFxuICAgICAgICAgICAgbmV3IGludDY0KC0yMDY3MjM2ODQ0LCAtMTU3ODA2Mjk5MCksIG5ldyBpbnQ2NCgtMTkzMzExNDg3MiwgMHgxYTY0MzllYyksXG4gICAgICAgICAgICBuZXcgaW50NjQoLTE4NjY1MzA4MjIsIDB4MjM2MzFlMjgpLCBuZXcgaW50NjQoLTE1MzgyMzMxMDksIC01NjE4NTcwNDcpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0xMDkwOTM1ODE3LCAtMTI5NTYxNTcyMyksIG5ldyBpbnQ2NCgtOTY1NjQxOTk4LCAtNDc5MDQ2ODY5KSxcbiAgICAgICAgICAgIG5ldyBpbnQ2NCgtOTAzMzk3NjgyLCAtMzY2NTgzMzk2KSwgbmV3IGludDY0KC03Nzk3MDAwMjUsIDB4MjFjMGMyMDcpLFxuICAgICAgICAgICAgbmV3IGludDY0KC0zNTQ3Nzk2OTAsIC04NDA4OTc3NjIpLCBuZXcgaW50NjQoLTE3NjMzNzAyNSwgLTI5NDcyNzMwNCksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg2ZjA2N2FhLCAweDcyMTc2ZmJhKSwgbmV3IGludDY0KDB4YTYzN2RjNSwgLTE1NjM5MTIwMjYpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4MTEzZjk4MDQsIC0xMDkwOTc0MjkwKSwgbmV3IGludDY0KDB4MWI3MTBiMzUsIDB4MTMxYzQ3MWIpLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4MjhkYjc3ZjUsIDB4MjMwNDdkODQpLCBuZXcgaW50NjQoMHgzMmNhYWI3YiwgMHg0MGM3MjQ5MyksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHgzYzllYmUwYSwgMHgxNWM5YmViYyksIG5ldyBpbnQ2NCgweDQzMWQ2N2M0LCAtMTY3NjY2OTYyMCksXG4gICAgICAgICAgICBuZXcgaW50NjQoMHg0Y2M1ZDRiZSwgLTg4NTExMjEzOCksIG5ldyBpbnQ2NCgweDU5N2YyOTljLCAtNjA0NTc0MzApLFxuICAgICAgICAgICAgbmV3IGludDY0KDB4NWZjYjZmYWIsIDB4M2FkNmZhZWMpLCBuZXcgaW50NjQoMHg2YzQ0MTk4YywgMHg0YTQ3NTgxNylcbiAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDgwOyBpICs9IDEpIHtcbiAgICAgICAgICBXW2ldID0gbmV3IGludDY0KDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXBwZW5kIHBhZGRpbmcgdG8gdGhlIHNvdXJjZSBzdHJpbmcuIFRoZSBmb3JtYXQgaXMgZGVzY3JpYmVkIGluIHRoZSBGSVBTLlxuICAgICAgICB4W2xlbiA+PiA1XSB8PSAweDgwIDw8ICgyNCAtIChsZW4gJiAweDFmKSk7XG4gICAgICAgIHhbKChsZW4gKyAxMjggPj4gMTApIDw8IDUpICsgMzFdID0gbGVuO1xuICAgICAgICBsID0geC5sZW5ndGg7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDMyKSB7IC8vMzIgZHdvcmRzIGlzIHRoZSBibG9jayBzaXplXG4gICAgICAgICAgaW50NjRjb3B5KGEsIEhbMF0pO1xuICAgICAgICAgIGludDY0Y29weShiLCBIWzFdKTtcbiAgICAgICAgICBpbnQ2NGNvcHkoYywgSFsyXSk7XG4gICAgICAgICAgaW50NjRjb3B5KGQsIEhbM10pO1xuICAgICAgICAgIGludDY0Y29weShlLCBIWzRdKTtcbiAgICAgICAgICBpbnQ2NGNvcHkoZiwgSFs1XSk7XG4gICAgICAgICAgaW50NjRjb3B5KGcsIEhbNl0pO1xuICAgICAgICAgIGludDY0Y29weShoLCBIWzddKTtcblxuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCAxNjsgaiArPSAxKSB7XG4gICAgICAgICAgICBXW2pdLmggPSB4W2kgKyAyICogal07XG4gICAgICAgICAgICBXW2pdLmwgPSB4W2kgKyAyICogaiArIDFdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAoaiA9IDE2OyBqIDwgODA7IGogKz0gMSkge1xuICAgICAgICAgICAgLy9zaWdtYTFcbiAgICAgICAgICAgIGludDY0cnJvdChyMSwgV1tqIC0gMl0sIDE5KTtcbiAgICAgICAgICAgIGludDY0cmV2cnJvdChyMiwgV1tqIC0gMl0sIDI5KTtcbiAgICAgICAgICAgIGludDY0c2hyKHIzLCBXW2ogLSAyXSwgNik7XG4gICAgICAgICAgICBzMS5sID0gcjEubCBeIHIyLmwgXiByMy5sO1xuICAgICAgICAgICAgczEuaCA9IHIxLmggXiByMi5oIF4gcjMuaDtcbiAgICAgICAgICAgIC8vc2lnbWEwXG4gICAgICAgICAgICBpbnQ2NHJyb3QocjEsIFdbaiAtIDE1XSwgMSk7XG4gICAgICAgICAgICBpbnQ2NHJyb3QocjIsIFdbaiAtIDE1XSwgOCk7XG4gICAgICAgICAgICBpbnQ2NHNocihyMywgV1tqIC0gMTVdLCA3KTtcbiAgICAgICAgICAgIHMwLmwgPSByMS5sIF4gcjIubCBeIHIzLmw7XG4gICAgICAgICAgICBzMC5oID0gcjEuaCBeIHIyLmggXiByMy5oO1xuXG4gICAgICAgICAgICBpbnQ2NGFkZDQoV1tqXSwgczEsIFdbaiAtIDddLCBzMCwgV1tqIC0gMTZdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgODA7IGogKz0gMSkge1xuICAgICAgICAgICAgLy9DaFxuICAgICAgICAgICAgQ2gubCA9IChlLmwgJiBmLmwpIF4gKH5lLmwgJiBnLmwpO1xuICAgICAgICAgICAgQ2guaCA9IChlLmggJiBmLmgpIF4gKH5lLmggJiBnLmgpO1xuXG4gICAgICAgICAgICAvL1NpZ21hMVxuICAgICAgICAgICAgaW50NjRycm90KHIxLCBlLCAxNCk7XG4gICAgICAgICAgICBpbnQ2NHJyb3QocjIsIGUsIDE4KTtcbiAgICAgICAgICAgIGludDY0cmV2cnJvdChyMywgZSwgOSk7XG4gICAgICAgICAgICBzMS5sID0gcjEubCBeIHIyLmwgXiByMy5sO1xuICAgICAgICAgICAgczEuaCA9IHIxLmggXiByMi5oIF4gcjMuaDtcblxuICAgICAgICAgICAgLy9TaWdtYTBcbiAgICAgICAgICAgIGludDY0cnJvdChyMSwgYSwgMjgpO1xuICAgICAgICAgICAgaW50NjRyZXZycm90KHIyLCBhLCAyKTtcbiAgICAgICAgICAgIGludDY0cmV2cnJvdChyMywgYSwgNyk7XG4gICAgICAgICAgICBzMC5sID0gcjEubCBeIHIyLmwgXiByMy5sO1xuICAgICAgICAgICAgczAuaCA9IHIxLmggXiByMi5oIF4gcjMuaDtcblxuICAgICAgICAgICAgLy9NYWpcbiAgICAgICAgICAgIE1hai5sID0gKGEubCAmIGIubCkgXiAoYS5sICYgYy5sKSBeIChiLmwgJiBjLmwpO1xuICAgICAgICAgICAgTWFqLmggPSAoYS5oICYgYi5oKSBeIChhLmggJiBjLmgpIF4gKGIuaCAmIGMuaCk7XG5cbiAgICAgICAgICAgIGludDY0YWRkNShUMSwgaCwgczEsIENoLCBzaGE1MTJfa1tqXSwgV1tqXSk7XG4gICAgICAgICAgICBpbnQ2NGFkZChUMiwgczAsIE1haik7XG5cbiAgICAgICAgICAgIGludDY0Y29weShoLCBnKTtcbiAgICAgICAgICAgIGludDY0Y29weShnLCBmKTtcbiAgICAgICAgICAgIGludDY0Y29weShmLCBlKTtcbiAgICAgICAgICAgIGludDY0YWRkKGUsIGQsIFQxKTtcbiAgICAgICAgICAgIGludDY0Y29weShkLCBjKTtcbiAgICAgICAgICAgIGludDY0Y29weShjLCBiKTtcbiAgICAgICAgICAgIGludDY0Y29weShiLCBhKTtcbiAgICAgICAgICAgIGludDY0YWRkKGEsIFQxLCBUMik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGludDY0YWRkKEhbMF0sIEhbMF0sIGEpO1xuICAgICAgICAgIGludDY0YWRkKEhbMV0sIEhbMV0sIGIpO1xuICAgICAgICAgIGludDY0YWRkKEhbMl0sIEhbMl0sIGMpO1xuICAgICAgICAgIGludDY0YWRkKEhbM10sIEhbM10sIGQpO1xuICAgICAgICAgIGludDY0YWRkKEhbNF0sIEhbNF0sIGUpO1xuICAgICAgICAgIGludDY0YWRkKEhbNV0sIEhbNV0sIGYpO1xuICAgICAgICAgIGludDY0YWRkKEhbNl0sIEhbNl0sIGcpO1xuICAgICAgICAgIGludDY0YWRkKEhbN10sIEhbN10sIGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9yZXByZXNlbnQgdGhlIGhhc2ggYXMgYW4gYXJyYXkgb2YgMzItYml0IGR3b3Jkc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgODsgaSArPSAxKSB7XG4gICAgICAgICAgaGFzaFsyICogaV0gPSBIW2ldLmg7XG4gICAgICAgICAgaGFzaFsyICogaSArIDFdID0gSFtpXS5sO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoO1xuICAgICAgfVxuXG4gICAgICAvL0EgY29uc3RydWN0b3IgZm9yIDY0LWJpdCBudW1iZXJzXG5cbiAgICAgIGZ1bmN0aW9uIGludDY0KGgsIGwpIHtcbiAgICAgICAgdGhpcy5oID0gaDtcbiAgICAgICAgdGhpcy5sID0gbDtcbiAgICAgICAgLy90aGlzLnRvU3RyaW5nID0gaW50NjR0b1N0cmluZztcbiAgICAgIH1cblxuICAgICAgLy9Db3BpZXMgc3JjIGludG8gZHN0LCBhc3N1bWluZyBib3RoIGFyZSA2NC1iaXQgbnVtYmVyc1xuXG4gICAgICBmdW5jdGlvbiBpbnQ2NGNvcHkoZHN0LCBzcmMpIHtcbiAgICAgICAgZHN0LmggPSBzcmMuaDtcbiAgICAgICAgZHN0LmwgPSBzcmMubDtcbiAgICAgIH1cblxuICAgICAgLy9SaWdodC1yb3RhdGVzIGEgNjQtYml0IG51bWJlciBieSBzaGlmdFxuICAgICAgLy9Xb24ndCBoYW5kbGUgY2FzZXMgb2Ygc2hpZnQ+PTMyXG4gICAgICAvL1RoZSBmdW5jdGlvbiByZXZycm90KCkgaXMgZm9yIHRoYXRcblxuICAgICAgZnVuY3Rpb24gaW50NjRycm90KGRzdCwgeCwgc2hpZnQpIHtcbiAgICAgICAgZHN0LmwgPSAoeC5sID4+PiBzaGlmdCkgfCAoeC5oIDw8ICgzMiAtIHNoaWZ0KSk7XG4gICAgICAgIGRzdC5oID0gKHguaCA+Pj4gc2hpZnQpIHwgKHgubCA8PCAoMzIgLSBzaGlmdCkpO1xuICAgICAgfVxuXG4gICAgICAvL1JldmVyc2VzIHRoZSBkd29yZHMgb2YgdGhlIHNvdXJjZSBhbmQgdGhlbiByb3RhdGVzIHJpZ2h0IGJ5IHNoaWZ0LlxuICAgICAgLy9UaGlzIGlzIGVxdWl2YWxlbnQgdG8gcm90YXRpb24gYnkgMzIrc2hpZnRcblxuICAgICAgZnVuY3Rpb24gaW50NjRyZXZycm90KGRzdCwgeCwgc2hpZnQpIHtcbiAgICAgICAgZHN0LmwgPSAoeC5oID4+PiBzaGlmdCkgfCAoeC5sIDw8ICgzMiAtIHNoaWZ0KSk7XG4gICAgICAgIGRzdC5oID0gKHgubCA+Pj4gc2hpZnQpIHwgKHguaCA8PCAoMzIgLSBzaGlmdCkpO1xuICAgICAgfVxuXG4gICAgICAvL0JpdHdpc2Utc2hpZnRzIHJpZ2h0IGEgNjQtYml0IG51bWJlciBieSBzaGlmdFxuICAgICAgLy9Xb24ndCBoYW5kbGUgc2hpZnQ+PTMyLCBidXQgaXQncyBuZXZlciBuZWVkZWQgaW4gU0hBNTEyXG5cbiAgICAgIGZ1bmN0aW9uIGludDY0c2hyKGRzdCwgeCwgc2hpZnQpIHtcbiAgICAgICAgZHN0LmwgPSAoeC5sID4+PiBzaGlmdCkgfCAoeC5oIDw8ICgzMiAtIHNoaWZ0KSk7XG4gICAgICAgIGRzdC5oID0gKHguaCA+Pj4gc2hpZnQpO1xuICAgICAgfVxuXG4gICAgICAvL0FkZHMgdHdvIDY0LWJpdCBudW1iZXJzXG4gICAgICAvL0xpa2UgdGhlIG9yaWdpbmFsIGltcGxlbWVudGF0aW9uLCBkb2VzIG5vdCByZWx5IG9uIDMyLWJpdCBvcGVyYXRpb25zXG5cbiAgICAgIGZ1bmN0aW9uIGludDY0YWRkKGRzdCwgeCwgeSkge1xuICAgICAgICB2YXIgdzAgPSAoeC5sICYgMHhmZmZmKSArICh5LmwgJiAweGZmZmYpO1xuICAgICAgICB2YXIgdzEgPSAoeC5sID4+PiAxNikgKyAoeS5sID4+PiAxNikgKyAodzAgPj4+IDE2KTtcbiAgICAgICAgdmFyIHcyID0gKHguaCAmIDB4ZmZmZikgKyAoeS5oICYgMHhmZmZmKSArICh3MSA+Pj4gMTYpO1xuICAgICAgICB2YXIgdzMgPSAoeC5oID4+PiAxNikgKyAoeS5oID4+PiAxNikgKyAodzIgPj4+IDE2KTtcbiAgICAgICAgZHN0LmwgPSAodzAgJiAweGZmZmYpIHwgKHcxIDw8IDE2KTtcbiAgICAgICAgZHN0LmggPSAodzIgJiAweGZmZmYpIHwgKHczIDw8IDE2KTtcbiAgICAgIH1cblxuICAgICAgLy9TYW1lLCBleGNlcHQgd2l0aCA0IGFkZGVuZHMuIFdvcmtzIGZhc3RlciB0aGFuIGFkZGluZyB0aGVtIG9uZSBieSBvbmUuXG5cbiAgICAgIGZ1bmN0aW9uIGludDY0YWRkNChkc3QsIGEsIGIsIGMsIGQpIHtcbiAgICAgICAgdmFyIHcwID0gKGEubCAmIDB4ZmZmZikgKyAoYi5sICYgMHhmZmZmKSArIChjLmwgJiAweGZmZmYpICsgKGQubCAmIDB4ZmZmZik7XG4gICAgICAgIHZhciB3MSA9IChhLmwgPj4+IDE2KSArIChiLmwgPj4+IDE2KSArIChjLmwgPj4+IDE2KSArIChkLmwgPj4+IDE2KSArICh3MCA+Pj4gMTYpO1xuICAgICAgICB2YXIgdzIgPSAoYS5oICYgMHhmZmZmKSArIChiLmggJiAweGZmZmYpICsgKGMuaCAmIDB4ZmZmZikgKyAoZC5oICYgMHhmZmZmKSArICh3MSA+Pj4gMTYpO1xuICAgICAgICB2YXIgdzMgPSAoYS5oID4+PiAxNikgKyAoYi5oID4+PiAxNikgKyAoYy5oID4+PiAxNikgKyAoZC5oID4+PiAxNikgKyAodzIgPj4+IDE2KTtcbiAgICAgICAgZHN0LmwgPSAodzAgJiAweGZmZmYpIHwgKHcxIDw8IDE2KTtcbiAgICAgICAgZHN0LmggPSAodzIgJiAweGZmZmYpIHwgKHczIDw8IDE2KTtcbiAgICAgIH1cblxuICAgICAgLy9TYW1lLCBleGNlcHQgd2l0aCA1IGFkZGVuZHNcblxuICAgICAgZnVuY3Rpb24gaW50NjRhZGQ1KGRzdCwgYSwgYiwgYywgZCwgZSkge1xuICAgICAgICB2YXIgdzAgPSAoYS5sICYgMHhmZmZmKSArIChiLmwgJiAweGZmZmYpICsgKGMubCAmIDB4ZmZmZikgKyAoZC5sICYgMHhmZmZmKSArIChlLmwgJiAweGZmZmYpLFxuICAgICAgICAgIHcxID0gKGEubCA+Pj4gMTYpICsgKGIubCA+Pj4gMTYpICsgKGMubCA+Pj4gMTYpICsgKGQubCA+Pj4gMTYpICsgKGUubCA+Pj4gMTYpICsgKHcwID4+PiAxNiksXG4gICAgICAgICAgdzIgPSAoYS5oICYgMHhmZmZmKSArIChiLmggJiAweGZmZmYpICsgKGMuaCAmIDB4ZmZmZikgKyAoZC5oICYgMHhmZmZmKSArIChlLmggJiAweGZmZmYpICsgKHcxID4+PiAxNiksXG4gICAgICAgICAgdzMgPSAoYS5oID4+PiAxNikgKyAoYi5oID4+PiAxNikgKyAoYy5oID4+PiAxNikgKyAoZC5oID4+PiAxNikgKyAoZS5oID4+PiAxNikgKyAodzIgPj4+IDE2KTtcbiAgICAgICAgZHN0LmwgPSAodzAgJiAweGZmZmYpIHwgKHcxIDw8IDE2KTtcbiAgICAgICAgZHN0LmggPSAodzIgJiAweGZmZmYpIHwgKHczIDw8IDE2KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBjbGFzcyBIYXNoZXMuUk1EMTYwXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjb25maWddXG4gICAgICpcbiAgICAgKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJJUEVNRC0xNjAgQWxnb3JpdGhtXG4gICAgICogVmVyc2lvbiAyLjIgQ29weXJpZ2h0IEplcmVteSBMaW4sIFBhdWwgSm9obnN0b24gMjAwMCAtIDIwMDkuXG4gICAgICogT3RoZXIgY29udHJpYnV0b3JzOiBHcmVnIEhvbHQsIEFuZHJldyBLZXBlcnQsIFlkbmFyLCBMb3N0aW5ldFxuICAgICAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBkZXRhaWxzLlxuICAgICAqIEFsc28gaHR0cDovL3d3dy5vY2YuYmVya2VsZXkuZWR1L35qamxpbi9qc290cC9cbiAgICAgKi9cbiAgICBSTUQxNjA6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIC8qKlxuICAgICAgICogUHJpdmF0ZSBwcm9wZXJ0aWVzIGNvbmZpZ3VyYXRpb24gdmFyaWFibGVzLiBZb3UgbWF5IG5lZWQgdG8gdHdlYWsgdGhlc2UgdG8gYmUgY29tcGF0aWJsZSB3aXRoXG4gICAgICAgKiB0aGUgc2VydmVyLXNpZGUsIGJ1dCB0aGUgZGVmYXVsdHMgd29yayBpbiBtb3N0IGNhc2VzLlxuICAgICAgICogQHNlZSB0aGlzLnNldFVwcGVyQ2FzZSgpIG1ldGhvZFxuICAgICAgICogQHNlZSB0aGlzLnNldFBhZCgpIG1ldGhvZFxuICAgICAgICovXG4gICAgICB2YXIgaGV4Y2FzZSA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnVwcGVyY2FzZSA9PT0gJ2Jvb2xlYW4nKSA/IG9wdGlvbnMudXBwZXJjYXNlIDogZmFsc2UsXG4gICAgICAgIC8qIGhleGFkZWNpbWFsIG91dHB1dCBjYXNlIGZvcm1hdC4gZmFsc2UgLSBsb3dlcmNhc2U7IHRydWUgLSB1cHBlcmNhc2UgICovXG4gICAgICAgIGI2NHBhZCA9IChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnBhZCA9PT0gJ3N0cmluZycpID8gb3B0aW9ucy5wZGEgOiAnPScsXG4gICAgICAgIC8qIGJhc2UtNjQgcGFkIGNoYXJhY3Rlci4gRGVmYXVsdCAnPScgZm9yIHN0cmljdCBSRkMgY29tcGxpYW5jZSAgICovXG4gICAgICAgIHV0ZjggPSAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy51dGY4ID09PSAnYm9vbGVhbicpID8gb3B0aW9ucy51dGY4IDogdHJ1ZSxcbiAgICAgICAgLyogZW5hYmxlL2Rpc2FibGUgdXRmOCBlbmNvZGluZyAqL1xuICAgICAgICBybWQxNjBfcjEgPSBbXG4gICAgICAgICAgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSxcbiAgICAgICAgICA3LCA0LCAxMywgMSwgMTAsIDYsIDE1LCAzLCAxMiwgMCwgOSwgNSwgMiwgMTQsIDExLCA4LFxuICAgICAgICAgIDMsIDEwLCAxNCwgNCwgOSwgMTUsIDgsIDEsIDIsIDcsIDAsIDYsIDEzLCAxMSwgNSwgMTIsXG4gICAgICAgICAgMSwgOSwgMTEsIDEwLCAwLCA4LCAxMiwgNCwgMTMsIDMsIDcsIDE1LCAxNCwgNSwgNiwgMixcbiAgICAgICAgICA0LCAwLCA1LCA5LCA3LCAxMiwgMiwgMTAsIDE0LCAxLCAzLCA4LCAxMSwgNiwgMTUsIDEzXG4gICAgICAgIF0sXG4gICAgICAgIHJtZDE2MF9yMiA9IFtcbiAgICAgICAgICA1LCAxNCwgNywgMCwgOSwgMiwgMTEsIDQsIDEzLCA2LCAxNSwgOCwgMSwgMTAsIDMsIDEyLFxuICAgICAgICAgIDYsIDExLCAzLCA3LCAwLCAxMywgNSwgMTAsIDE0LCAxNSwgOCwgMTIsIDQsIDksIDEsIDIsXG4gICAgICAgICAgMTUsIDUsIDEsIDMsIDcsIDE0LCA2LCA5LCAxMSwgOCwgMTIsIDIsIDEwLCAwLCA0LCAxMyxcbiAgICAgICAgICA4LCA2LCA0LCAxLCAzLCAxMSwgMTUsIDAsIDUsIDEyLCAyLCAxMywgOSwgNywgMTAsIDE0LFxuICAgICAgICAgIDEyLCAxNSwgMTAsIDQsIDEsIDUsIDgsIDcsIDYsIDIsIDEzLCAxNCwgMCwgMywgOSwgMTFcbiAgICAgICAgXSxcbiAgICAgICAgcm1kMTYwX3MxID0gW1xuICAgICAgICAgIDExLCAxNCwgMTUsIDEyLCA1LCA4LCA3LCA5LCAxMSwgMTMsIDE0LCAxNSwgNiwgNywgOSwgOCxcbiAgICAgICAgICA3LCA2LCA4LCAxMywgMTEsIDksIDcsIDE1LCA3LCAxMiwgMTUsIDksIDExLCA3LCAxMywgMTIsXG4gICAgICAgICAgMTEsIDEzLCA2LCA3LCAxNCwgOSwgMTMsIDE1LCAxNCwgOCwgMTMsIDYsIDUsIDEyLCA3LCA1LFxuICAgICAgICAgIDExLCAxMiwgMTQsIDE1LCAxNCwgMTUsIDksIDgsIDksIDE0LCA1LCA2LCA4LCA2LCA1LCAxMixcbiAgICAgICAgICA5LCAxNSwgNSwgMTEsIDYsIDgsIDEzLCAxMiwgNSwgMTIsIDEzLCAxNCwgMTEsIDgsIDUsIDZcbiAgICAgICAgXSxcbiAgICAgICAgcm1kMTYwX3MyID0gW1xuICAgICAgICAgIDgsIDksIDksIDExLCAxMywgMTUsIDE1LCA1LCA3LCA3LCA4LCAxMSwgMTQsIDE0LCAxMiwgNixcbiAgICAgICAgICA5LCAxMywgMTUsIDcsIDEyLCA4LCA5LCAxMSwgNywgNywgMTIsIDcsIDYsIDE1LCAxMywgMTEsXG4gICAgICAgICAgOSwgNywgMTUsIDExLCA4LCA2LCA2LCAxNCwgMTIsIDEzLCA1LCAxNCwgMTMsIDEzLCA3LCA1LFxuICAgICAgICAgIDE1LCA1LCA4LCAxMSwgMTQsIDE0LCA2LCAxNCwgNiwgOSwgMTIsIDksIDEyLCA1LCAxNSwgOCxcbiAgICAgICAgICA4LCA1LCAxMiwgOSwgMTIsIDUsIDE0LCA2LCA4LCAxMywgNiwgNSwgMTUsIDEzLCAxMSwgMTFcbiAgICAgICAgXTtcblxuICAgICAgLyogcHJpdmlsZWdlZCAocHVibGljKSBtZXRob2RzICovXG4gICAgICB0aGlzLmhleCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyaGV4KHJzdHIocywgdXRmOCkpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYjY0ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cihzLCB1dGY4KSwgYjY0cGFkKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFueSA9IGZ1bmN0aW9uKHMsIGUpIHtcbiAgICAgICAgcmV0dXJuIHJzdHIyYW55KHJzdHIocywgdXRmOCksIGUpO1xuICAgICAgfTtcbiAgICAgIHRoaXMucmF3ID0gZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcnN0cihzLCB1dGY4KTtcbiAgICAgIH07XG4gICAgICB0aGlzLmhleF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJoZXgocnN0cl9obWFjKGssIGQpKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmI2NF9obWFjID0gZnVuY3Rpb24oaywgZCkge1xuICAgICAgICByZXR1cm4gcnN0cjJiNjQocnN0cl9obWFjKGssIGQpLCBiNjRwYWQpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYW55X2htYWMgPSBmdW5jdGlvbihrLCBkLCBlKSB7XG4gICAgICAgIHJldHVybiByc3RyMmFueShyc3RyX2htYWMoaywgZCksIGUpO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogUGVyZm9ybSBhIHNpbXBsZSBzZWxmLXRlc3QgdG8gc2VlIGlmIHRoZSBWTSBpcyB3b3JraW5nXG4gICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IEhleGFkZWNpbWFsIGhhc2ggc2FtcGxlXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIHRoaXMudm1fdGVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaGV4KCdhYmMnKS50b0xvd2VyQ2FzZSgpID09PSAnOTAwMTUwOTgzY2QyNGZiMGQ2OTYzZjdkMjhlMTdmNzInO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQGRlc2NyaXB0aW9uIEVuYWJsZS9kaXNhYmxlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCByZXR1cm5lZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn1cbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFVwcGVyQ2FzZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoZXhjYXNlID0gYTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIEBkZXNjcmlwdGlvbiBEZWZpbmVzIGEgYmFzZTY0IHBhZCBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBQYWRcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gdGhpc1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICB0aGlzLnNldFBhZCA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGI2NHBhZCA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGJhc2U2NCBwYWQgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59XG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoaXNcbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqL1xuICAgICAgdGhpcy5zZXRVVEY4ID0gZnVuY3Rpb24oYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHV0ZjggPSBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLyogcHJpdmF0ZSBtZXRob2RzICovXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBybWQxNjAgb2YgYSByYXcgc3RyaW5nXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gcnN0cihzKSB7XG4gICAgICAgIHMgPSAodXRmOCkgPyB1dGY4RW5jb2RlKHMpIDogcztcbiAgICAgICAgcmV0dXJuIGJpbmwycnN0cihiaW5sKHJzdHIyYmlubChzKSwgcy5sZW5ndGggKiA4KSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBITUFDLXJtZDE2MCBvZiBhIGtleSBhbmQgc29tZSBkYXRhIChyYXcgc3RyaW5ncylcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiByc3RyX2htYWMoa2V5LCBkYXRhKSB7XG4gICAgICAgIGtleSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoa2V5KSA6IGtleTtcbiAgICAgICAgZGF0YSA9ICh1dGY4KSA/IHV0ZjhFbmNvZGUoZGF0YSkgOiBkYXRhO1xuICAgICAgICB2YXIgaSwgaGFzaCxcbiAgICAgICAgICBia2V5ID0gcnN0cjJiaW5sKGtleSksXG4gICAgICAgICAgaXBhZCA9IEFycmF5KDE2KSxcbiAgICAgICAgICBvcGFkID0gQXJyYXkoMTYpO1xuXG4gICAgICAgIGlmIChia2V5Lmxlbmd0aCA+IDE2KSB7XG4gICAgICAgICAgYmtleSA9IGJpbmwoYmtleSwga2V5Lmxlbmd0aCAqIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE2OyBpICs9IDEpIHtcbiAgICAgICAgICBpcGFkW2ldID0gYmtleVtpXSBeIDB4MzYzNjM2MzY7XG4gICAgICAgICAgb3BhZFtpXSA9IGJrZXlbaV0gXiAweDVDNUM1QzVDO1xuICAgICAgICB9XG4gICAgICAgIGhhc2ggPSBiaW5sKGlwYWQuY29uY2F0KHJzdHIyYmlubChkYXRhKSksIDUxMiArIGRhdGEubGVuZ3RoICogOCk7XG4gICAgICAgIHJldHVybiBiaW5sMnJzdHIoYmlubChvcGFkLmNvbmNhdChoYXNoKSwgNTEyICsgMTYwKSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29udmVydCBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzIHRvIGEgc3RyaW5nXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gYmlubDJyc3RyKGlucHV0KSB7XG4gICAgICAgIHZhciBpLCBvdXRwdXQgPSAnJyxcbiAgICAgICAgICBsID0gaW5wdXQubGVuZ3RoICogMzI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDgpIHtcbiAgICAgICAgICBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoaW5wdXRbaSA+PiA1XSA+Pj4gKGkgJSAzMikpICYgMHhGRik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDYWxjdWxhdGUgdGhlIFJJUEUtTUQxNjAgb2YgYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aC5cbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBiaW5sKHgsIGxlbikge1xuICAgICAgICB2YXIgVCwgaiwgaSwgbCxcbiAgICAgICAgICBoMCA9IDB4Njc0NTIzMDEsXG4gICAgICAgICAgaDEgPSAweGVmY2RhYjg5LFxuICAgICAgICAgIGgyID0gMHg5OGJhZGNmZSxcbiAgICAgICAgICBoMyA9IDB4MTAzMjU0NzYsXG4gICAgICAgICAgaDQgPSAweGMzZDJlMWYwLFxuICAgICAgICAgIEExLCBCMSwgQzEsIEQxLCBFMSxcbiAgICAgICAgICBBMiwgQjIsIEMyLCBEMiwgRTI7XG5cbiAgICAgICAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgICAgICAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAobGVuICUgMzIpO1xuICAgICAgICB4WygoKGxlbiArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBsZW47XG4gICAgICAgIGwgPSB4Lmxlbmd0aDtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxNikge1xuICAgICAgICAgIEExID0gQTIgPSBoMDtcbiAgICAgICAgICBCMSA9IEIyID0gaDE7XG4gICAgICAgICAgQzEgPSBDMiA9IGgyO1xuICAgICAgICAgIEQxID0gRDIgPSBoMztcbiAgICAgICAgICBFMSA9IEUyID0gaDQ7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8PSA3OTsgaiArPSAxKSB7XG4gICAgICAgICAgICBUID0gc2FmZV9hZGQoQTEsIHJtZDE2MF9mKGosIEIxLCBDMSwgRDEpKTtcbiAgICAgICAgICAgIFQgPSBzYWZlX2FkZChULCB4W2kgKyBybWQxNjBfcjFbal1dKTtcbiAgICAgICAgICAgIFQgPSBzYWZlX2FkZChULCBybWQxNjBfSzEoaikpO1xuICAgICAgICAgICAgVCA9IHNhZmVfYWRkKGJpdF9yb2woVCwgcm1kMTYwX3MxW2pdKSwgRTEpO1xuICAgICAgICAgICAgQTEgPSBFMTtcbiAgICAgICAgICAgIEUxID0gRDE7XG4gICAgICAgICAgICBEMSA9IGJpdF9yb2woQzEsIDEwKTtcbiAgICAgICAgICAgIEMxID0gQjE7XG4gICAgICAgICAgICBCMSA9IFQ7XG4gICAgICAgICAgICBUID0gc2FmZV9hZGQoQTIsIHJtZDE2MF9mKDc5IC0gaiwgQjIsIEMyLCBEMikpO1xuICAgICAgICAgICAgVCA9IHNhZmVfYWRkKFQsIHhbaSArIHJtZDE2MF9yMltqXV0pO1xuICAgICAgICAgICAgVCA9IHNhZmVfYWRkKFQsIHJtZDE2MF9LMihqKSk7XG4gICAgICAgICAgICBUID0gc2FmZV9hZGQoYml0X3JvbChULCBybWQxNjBfczJbal0pLCBFMik7XG4gICAgICAgICAgICBBMiA9IEUyO1xuICAgICAgICAgICAgRTIgPSBEMjtcbiAgICAgICAgICAgIEQyID0gYml0X3JvbChDMiwgMTApO1xuICAgICAgICAgICAgQzIgPSBCMjtcbiAgICAgICAgICAgIEIyID0gVDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBUID0gc2FmZV9hZGQoaDEsIHNhZmVfYWRkKEMxLCBEMikpO1xuICAgICAgICAgIGgxID0gc2FmZV9hZGQoaDIsIHNhZmVfYWRkKEQxLCBFMikpO1xuICAgICAgICAgIGgyID0gc2FmZV9hZGQoaDMsIHNhZmVfYWRkKEUxLCBBMikpO1xuICAgICAgICAgIGgzID0gc2FmZV9hZGQoaDQsIHNhZmVfYWRkKEExLCBCMikpO1xuICAgICAgICAgIGg0ID0gc2FmZV9hZGQoaDAsIHNhZmVfYWRkKEIxLCBDMikpO1xuICAgICAgICAgIGgwID0gVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW2gwLCBoMSwgaDIsIGgzLCBoNF07XG4gICAgICB9XG5cbiAgICAgIC8vIHNwZWNpZmljIGFsZ29yaXRobSBtZXRob2RzXG5cbiAgICAgIGZ1bmN0aW9uIHJtZDE2MF9mKGosIHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuICgwIDw9IGogJiYgaiA8PSAxNSkgPyAoeCBeIHkgXiB6KSA6XG4gICAgICAgICAgKDE2IDw9IGogJiYgaiA8PSAzMSkgPyAoeCAmIHkpIHwgKH54ICYgeikgOlxuICAgICAgICAgICgzMiA8PSBqICYmIGogPD0gNDcpID8gKHggfCB+eSkgXiB6IDpcbiAgICAgICAgICAoNDggPD0gaiAmJiBqIDw9IDYzKSA/ICh4ICYgeikgfCAoeSAmIH56KSA6XG4gICAgICAgICAgKDY0IDw9IGogJiYgaiA8PSA3OSkgPyB4IF4gKHkgfCB+eikgOlxuICAgICAgICAgICdybWQxNjBfZjogaiBvdXQgb2YgcmFuZ2UnO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBybWQxNjBfSzEoaikge1xuICAgICAgICByZXR1cm4gKDAgPD0gaiAmJiBqIDw9IDE1KSA/IDB4MDAwMDAwMDAgOlxuICAgICAgICAgICgxNiA8PSBqICYmIGogPD0gMzEpID8gMHg1YTgyNzk5OSA6XG4gICAgICAgICAgKDMyIDw9IGogJiYgaiA8PSA0NykgPyAweDZlZDllYmExIDpcbiAgICAgICAgICAoNDggPD0gaiAmJiBqIDw9IDYzKSA/IDB4OGYxYmJjZGMgOlxuICAgICAgICAgICg2NCA8PSBqICYmIGogPD0gNzkpID8gMHhhOTUzZmQ0ZSA6XG4gICAgICAgICAgJ3JtZDE2MF9LMTogaiBvdXQgb2YgcmFuZ2UnO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBybWQxNjBfSzIoaikge1xuICAgICAgICByZXR1cm4gKDAgPD0gaiAmJiBqIDw9IDE1KSA/IDB4NTBhMjhiZTYgOlxuICAgICAgICAgICgxNiA8PSBqICYmIGogPD0gMzEpID8gMHg1YzRkZDEyNCA6XG4gICAgICAgICAgKDMyIDw9IGogJiYgaiA8PSA0NykgPyAweDZkNzAzZWYzIDpcbiAgICAgICAgICAoNDggPD0gaiAmJiBqIDw9IDYzKSA/IDB4N2E2ZDc2ZTkgOlxuICAgICAgICAgICg2NCA8PSBqICYmIGogPD0gNzkpID8gMHgwMDAwMDAwMCA6XG4gICAgICAgICAgJ3JtZDE2MF9LMjogaiBvdXQgb2YgcmFuZ2UnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBleHBvc2VzIEhhc2hlc1xuICAoZnVuY3Rpb24od2luZG93LCB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnJlZUV4cG9ydHMgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICBmcmVlRXhwb3J0cyA9IGV4cG9ydHM7XG4gICAgICBpZiAoZXhwb3J0cyAmJiB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsID09PSBnbG9iYWwuZ2xvYmFsKSB7XG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgLy8gZGVmaW5lIGFzIGFuIGFub255bW91cyBtb2R1bGUsIHNvLCB0aHJvdWdoIHBhdGggbWFwcGluZywgaXQgY2FuIGJlIGFsaWFzZWRcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEhhc2hlcztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMpIHtcbiAgICAgIC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG4gICAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEhhc2hlcztcbiAgICAgIH1cbiAgICAgIC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG4gICAgICBlbHNlIHtcbiAgICAgICAgZnJlZUV4cG9ydHMuSGFzaGVzID0gSGFzaGVzO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbiBhIGJyb3dzZXIgb3IgUmhpbm9cbiAgICAgIHdpbmRvdy5IYXNoZXMgPSBIYXNoZXM7XG4gICAgfVxuICB9KHRoaXMpKTtcbn0oKSk7IC8vIElJRkVcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiXX0=
