var started = Date.now(),
	crc32 = require('./crc32.js'),
	crypto = require ('crypto');

var i, hexes256 = [], hexes16 = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
for (i = 0; i < 256; i++) {hexes256[i] = hexes16[(i>>4)&15] + hexes16[i&15];}

function hexToBase(hex, base){
	base = 33;

	var alphabet = 'ёйцукенгшщзхъфывапролджэячсмитьбю',
		digits = [0], carry, i, j, string = '';

	for(i = 0; i < hex.length; i+=2){
		carry = parseInt(hex.substr(i,2),16);
		for(j = 0; j < digits.length; j++){
			carry += digits[j] << 8;
			digits[j] = carry % base;
			carry = (carry / base) | 0;
		}
		while (carry > 0) {
			digits.push(carry % base);
			carry = (carry / base) | 0;
		}
	}

	for (i = digits.length - 1; i >= 0; --i){
		string += alphabet[digits[i]];
	}

	return string;
}

function genStr(i){
	var id = hexToBase(('00000000000000000' + i.toString(16)).substr(-16),66);
	return '{value:"' + id + '"}';
}

function BigBitMap(size){
	this.size = size;
	this.arr = new Uint32Array(Math.ceil(size/32));
	this.arr.fill(0);
}

BigBitMap.prototype.get = function(addr){
	var bitSet = 1<<(addr&31),
		pos = addr >>> 5;

	if(this.arr[pos]&bitSet){
		return 1;
	}

	return 0;
};

BigBitMap.prototype.set = function(addr, val){
	var bitSet = 1<<(addr&31),
		pos = addr >>> 5;

	if(val){
		this.arr[pos] |= bitSet;
	}else{
		this.arr[pos] &= ~bitSet;
	}
};

BigBitMap.prototype.checkSet = function(addr){
	var bitSet = 1<<(addr&31),
		pos = addr >>> 5;

	if(this.arr[pos]&bitSet){
		return true;
	}

	this.arr[pos] |= bitSet;
	return false;
};

BigBitMap.prototype.reset = function(){
	this.arr.fill(0);
};

function BigBloom(){
	this.bbs = [
		new BigBitMap(4294967296),
		new BigBitMap(4294967296),
		new BigBitMap(4294967296),
		new BigBitMap(4294967296)
	];
}

BigBloom.prototype._addr = function(val){
	var h = crypto.createHash('sha256').update(val.toString()).digest();

	return[
		[16777216*h[ 0]+65536*h[ 1]+256*h[ 2]+h[ 3], h[24]&3],
		[16777216*h[ 4]+65536*h[ 5]+256*h[ 6]+h[ 7], h[25]&3],
		[16777216*h[ 8]+65536*h[ 9]+256*h[10]+h[11], h[26]&3],
		[16777216*h[12]+65536*h[13]+256*h[14]+h[15], h[27]&3],
		[16777216*h[16]+65536*h[17]+256*h[18]+h[19], h[28]&3],
		[16777216*h[20]+65536*h[21]+256*h[22]+h[23], h[29]&3]
	];
};

BigBloom.prototype.check = function(val, adr){
	var a = adr || this._addr(val);

	if(this.bbs[a[0][1]].get(a[0][0]) === 0) return false;
	if(this.bbs[a[1][1]].get(a[1][0]) === 0) return false;
	if(this.bbs[a[2][1]].get(a[2][0]) === 0) return false;
	if(this.bbs[a[3][1]].get(a[3][0]) === 0) return false;
	if(this.bbs[a[4][1]].get(a[4][0]) === 0) return false;
	if(this.bbs[a[5][1]].get(a[5][0]) === 0) return false;

	return true;
};

BigBloom.prototype.add = function(val, adr){
	var a = adr || this._addr(val);

	this.bbs[a[0][1]].set(a[0][0], 1);
	this.bbs[a[1][1]].set(a[1][0], 1);
	this.bbs[a[2][1]].set(a[2][0], 1);
	this.bbs[a[3][1]].set(a[3][0], 1);
	this.bbs[a[4][1]].set(a[4][0], 1);
	this.bbs[a[5][1]].set(a[5][0], 1);
};

BigBloom.prototype.checkSet = function(val){
	var adr = this._addr(val);

	if(this.check(null, adr)) return true;

	this.add(null, adr);

	return false;
};

BigBloom.prototype.reset = function(){
	this.bbs[0].reset();
	this.bbs[1].reset();
	this.bbs[2].reset();
	this.bbs[3].reset();
};

function collisionRate(hfnc, mlt) {
    var text, hash, collisions = 0, i;

	for (i = 0; i < sample; i++) {
		text = genStr(i+sample*(mlt-1));
	    hash = hfnc(text);

	    if (bf.checkSet(hash)) {
	        collisions++;
	    }
	}

    console.log('%d: collisions: %s% (%s/%s)', mlt, (collisions/sample * 100).toFixed(3), collisions, sample);

    return collisions;
}

function fnv1a_32(str) {
	var i, l = str.length|0, hash = 2166136261;

	for (i = 0; i < l; i++) {
		hash ^= str.charCodeAt(i);
		hash += hash * 402 + (hash << 24);
	}

	return hash>>>0;
}

function fnv1a_utf_32(str) {
	var c, i, l = str.length|0, hash = 2166136261;

	for (i = 0; i < l; i++) {
		c = str.charCodeAt(i);
		if (c < 128) {
			hash ^= c;
			hash += hash * 402 + (hash << 24);
		} else if (c < 2048) {
			hash ^= (c >> 6) | 192;
			hash += hash * 402 + (hash << 24);
			hash ^= (c & 63) | 128;
			hash += hash * 402 + (hash << 24);
		} else if (
			((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
			((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
			// Surrogate Pair
			c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
			hash ^=  (c >> 18) | 240;
			hash += hash * 402 + (hash << 24);
			hash ^=  ((c >> 12) & 63) | 128;
			hash += hash * 402 + (hash << 24);
			hash ^=  ((c >> 6) & 63) | 128;
			hash += hash * 402 + (hash << 24);
			hash ^=  (c & 63) | 128;
			hash += hash * 402 + (hash << 24);
		} else {
			hash ^=  (c >> 12) | 224;
			hash += hash * 402 + (hash << 24);
			hash ^=  ((c >> 6) & 63) | 128;
			hash += hash * 402 + (hash << 24);
			hash ^=  (c & 63) | 128;
			hash += hash * 402 + (hash << 24);
		}
	}

	return hash>>>0;
}

function fnv1a_64_hex(str){
	var a = 0x2325, b = 0x8422, c = 0x9ce4, d = 0xcbf2,
		w = 0, x = 0, y = 0, z = 0,
		i, l = str.length|0;

	for(i = 0; i < l; i++){
		/* xor the bottom with the current octet */
		a ^= str.charCodeAt(i);
		/* multiply by the lowest order digit base 2^16 */
		w = a * 435;
		x = b * 435;
		y = c * 435;
		z = d * 435;
		/* multiply by the other non-zero digit */
		y += a << 8;
		z += b << 8;
		/* propagate carries */
		x += (w >>> 16);
		a = w & 65535;
		y += (x >>> 16);
		b = x & 65535;
		d = (z + (y >>> 16)) & 65535;
		c = y & 65535;
	}

	return hexes256[d>>8]+
		   hexes256[d&255]+
		   hexes256[c>>8]+
		   hexes256[c&255]+
		   hexes256[b>>8]+
		   hexes256[b&255]+
		   hexes256[a>>8]+
		   hexes256[a&255];
}

function fnv1a_utf_64_hex(str) {
	var t, i, l = str.length|0,
		a = 0x2325, b = 0x8422, c = 0x9ce4, d = 0xcbf2,
		w = 0, x = 0, y = 0, z = 0;

	for (i = 0; i < l; i++) {
		t = str.charCodeAt(i);
		if (t < 128) {
			a ^= t;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		} else if (t < 2048) {
			a ^= (t >> 6) | 192;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^= (t & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		} else if (
			((t & 0xfc00) == 0xd800) && (i + 1) < str.length &&
			((str.charCodeAt(i + 1) & 0xfc00) == 0xdc00)) {
			t = 0x10000 + ((t & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
			a ^=  (t >> 18) | 240;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  ((t >> 12) & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  ((t >> 6) & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  (t & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		} else {
			a ^=  (t >> 12) | 224;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  ((t >> 6) & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  (t & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		}
	}

	return hexes256[d>>8]+
		   hexes256[d&255]+
		   hexes256[c>>8]+
		   hexes256[c&255]+
		   hexes256[b>>8]+
		   hexes256[b&255]+
		   hexes256[a>>8]+
		   hexes256[a&255];
}

function fnv1a_52(str){
	var a = 0x2325, b = 0x8422, c = 0x9ce4, d = 0xcbf2,
		w = 0, x = 0, y = 0, z = 0,
		i, l = str.length|0;

	for(i = 0; i < l; i++){
		/* xor the bottom with the current octet */
		a ^= str.charCodeAt(i);
		/* multiply by the lowest order digit base 2^16 */
		w = a * 435;
		x = b * 435;
		y = c * 435;
		z = d * 435;
		/* multiply by the other non-zero digit */
		y += a << 8;
		z += b << 8;
		/* propagate carries */
		x += (w >>> 16);
		a = w & 65535;
		y += (x >>> 16);
		b = x & 65535;
		d = (z + (y >>> 16)) & 65535;
		c = y & 65535;
	}

	return (a&15) * 281474976710656 + b * 4294967296 + c * 65536 + (d^(a>>4));
}

function fnv1a_utf_52(str) {
	var t, i, l = str.length|0,
		a = 0x2325, b = 0x8422, c = 0x9ce4, d = 0xcbf2,
		w = 0, x = 0, y = 0, z = 0;

	for (i = 0; i < l; i++) {
		t = str.charCodeAt(i);
		if (t < 128) {
			a ^= t;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		} else if (t < 2048) {
			a ^= (t >> 6) | 192;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^= (t & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		} else if (
			((t & 0xfc00) == 0xd800) && (i + 1) < str.length &&
			((str.charCodeAt(i + 1) & 0xfc00) == 0xdc00)) {
			t = 0x10000 + ((t & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
			a ^=  (t >> 18) | 240;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  ((t >> 12) & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  ((t >> 6) & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  (t & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		} else {
			a ^=  (t >> 12) | 224;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  ((t >> 6) & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
			a ^=  (t & 63) | 128;
			w=a*435;x=b*435;y=c*435;z=d*435;y+=a<<8;z+=b<<8;x+=(w>>>16);a=w&65535;
			y+=(x>>>16);b=x&65535;d=(z+(y>>>16))&65535;c=y&65535;
		}
	}

	return (a&15) * 281474976710656 + b * 4294967296 + c * 65536 + (d^(a>>4));
}

console.log('\nRUNING COLLISIONS BENCHMARKS');
console.log('==================================================\n');

var	bf = new BigBloom(), sample = 4e6, runs = 50, s, y;
console.log('%d runs, %d samples per run. Samples like: %s', runs, sample, genStr(156000000));

console.log('\nCRC32.');
console.log('Testing bytestring version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(crc32.str, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nTesting UTF-8 version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(crc32.utf, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nFNV-1a 32bit.');
console.log('Testing bytestring version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(fnv1a_32, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nTesting UTF-8 version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(fnv1a_utf_32, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nFNV-1a 52bit.');

console.log('Testing bytestring version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(fnv1a_52, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nTesting UTF-8 version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(fnv1a_utf_52, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));


console.log('\nFNV-1a 64bit.');

console.log('Testing bytestring version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(fnv1a_64_hex, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nTesting UTF-8 version');
s = 0; bf.reset();
for (y = 0; y < runs; y++) {
	s += collisionRate(fnv1a_utf_64_hex, y+1);
}
console.log('TOTAL: %d collisions (%s%)', s, (100*s/runs/sample).toFixed(3));

console.log('\nRunnin time: %dmin', ((Date.now()-started)/60000).toFixed(1));