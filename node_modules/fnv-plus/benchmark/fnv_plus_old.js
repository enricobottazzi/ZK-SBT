/**
 * FNV-1a Hash implementation (32, 64, 128, 256, 512, and 1024 bit)
 * @author Travis Webb <me@traviswebb.com>
 * @see http://tools.ietf.org/html/draft-eastlake-fnv-06
 */
var fnvplus = exports;

var BigInteger = require('jsbn').BigInteger;
var version = '1a';
var referenceSeed = 'chongo <Landon Curt Noll> /\\../\\';
var defaultKeyspace = 52;
var fnvConstants = {
  32: {
    prime:  Math.pow(2, 24) + Math.pow(2, 8) + 0x93,
    offset: 0,
  },
  52: {
    // the 52-bit FNV prime happens to be the same as the 64-bit prime,
    // since it only uses 40 bits.
    prime:  bn(2).pow(bn(40)).add(bn(2).pow(bn(8))).add(bn('b3', 16)),
    offset: 0,
    mask:   bn('FFFFFFFFFFFFF', 16)
  },
  64: {
    prime:  bn(2).pow(bn(40)).add(bn(2).pow(bn(8))).add(bn('b3', 16)),
    offset: 0,
    mask:   bn('FFFFFFFFFFFFFFFF', 16)
  },
  128: {
    prime:  bn(2).pow(bn(88)).add(bn(2).pow(bn(8))).add(bn('3b', 16)),
    offset: 0,
    mask:   bn('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)
  },
  256: {
    prime:  bn(2).pow(bn(168)).add(bn(2).pow(bn(8))).add(bn('63', 16)),
    offset: 0,
    mask:   bn('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)
  },
  512: {
    prime:  bn(2).pow(bn(344)).add(bn(2).pow(bn(8))).add(bn('57', 16)),
    offset: 0,
    mask:   bn('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)
  },
  1024: {
    prime:  bn(2).pow(bn(680)).add(bn(2).pow(bn(8))).add(bn('8d', 16)),
    offset: 0,
    mask:   bn('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)
  }
};

fnvplus.const = fnvConstants;

/**
  * @private
  */
function bn (v, r) {
  return new BigInteger((v).toString(), r);
}

function FnvHash (value, keyspace) {
  return {
    bits: keyspace,
    value: value,
    dec: function () {
      return value.toString();
    },
    hex: function () {
      return hexpad(value, keyspace);
    },
    str: function () {
      return value.toString(36);
    }
  };
}

function hexpad (value, keyspace) {
  var str = value.toString(16),
    pad = '';
  for (var i = 0; i < ((keyspace / 4) - str.length); i++) pad += '0';
  return pad + str;
}

function hashGeneric (str, keyspace) {
  keyspace = (keyspace || defaultKeyspace);

  var prime = fnvConstants[keyspace].prime,
    hash = fnvConstants[keyspace].offset,
    mask = fnvConstants[keyspace].mask;

  for (var i = 0; i < str.length; i++) {
    if (version === '1a') {
      hash = hash.xor(bn(str.charCodeAt(i)))
                 .multiply(prime)
                 .and(mask);
    }
    else if (version === '1') {
      hash = hash.multiply(prime)
                 .xor(bn(str.charCodeAt(i)))
                 .and(mask);
    }
  }
  return new FnvHash(hash, keyspace);
}

/**
 * Optimized 32bit-specific implementation. Executes about 5x faster in
 * practice, due to reduced reliance on the BigInteger class and a more clever
 * prime multiplication strategy.
 */
function hash32 (str) {
  var hash = fnvConstants[32].offset;

  for (var i = 0; i < str.length; i++) {
    if (version === '1a') {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    else if (version === '1') {
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash ^= str.charCodeAt(i);
    }
  }
  return new FnvHash(hash >>> 0, 32);
}

/**
 * Optimized 52bit-specific implementation. Javascript integer space is 2^53,
 * so this is the largest FNV hash space available that can take direct
 * advantage of hardware integer ops.
 */
function hash52 (str) {
  var prime = fnvConstants[52].prime,
    hash = fnvConstants[52].offset,
    mask = fnvConstants[52].mask;

  for (var i = 0; i < str.length; i++) {
    if (version === '1a') {
      hash ^= Math.pow(str.charCodeAt(i), 2);
      hash *= prime;
    }
    else if (version === '1') {
      hash *= prime;
      hash ^= Math.pow(str.charCodeAt(i), 2);
    }
  }

  return new FnvHash(bn(hash).and(mask), 52);
}

/**
 * Compute the hash of a given value.
 * @param message the value to hash
 * @public
 */
fnvplus.hash = function (message, keyspace) {
  var str = (typeof message === 'object') ? JSON.stringify(message) : message;

  if ((keyspace || defaultKeyspace) === 32) {
    return hash32(str);
  }
  else if ((keyspace || defaultKeyspace) === 52) {
    return hash52(str);
  }
  else {
    return hashGeneric(str, keyspace);
  }
};

/**
 * @public
 */
fnvplus.setKeyspace = function (keyspace) {
  defaultKeyspace = keyspace;
};

/**
 * Seed the hash algorithm with some value; this determines the offset that
 * is used.
 * @public
 */
fnvplus.seed = function (seed) {
  seed = (seed || seed === 0) ? seed : referenceSeed;
  var oldVersion = version;
  if (seed === referenceSeed) {
    fnvplus.version('1');
  }

  for (var keysize in fnvConstants) {
    fnvConstants[keysize].offset = keysize >= 64 ? bn(0, 10) : 0;

    var offset = fnvplus.hash(seed, parseInt(keysize, 10)).dec();
    fnvConstants[keysize].offset = keysize >= 64 ? bn(offset, 10) : offset;
  }
  fnvplus.version(oldVersion);
};

/**
 * Set the version to use when hashing. Can be either 1 or 1a.
 * @default 1a
 */
fnvplus.version = function (_version) {
  if (_version === '1a' || _version === '1') {
    version = _version;
  }
  else {
    throw new Error('Supported FNV versions: 1, 1a');
  }
};

fnvplus.version('1');
fnvplus.seed();
fnvplus.version('1a');
