var crc32 = (function(){
	var c, table = [], n, k, hl = [], i;

	for(n = 0; n < 256; n++){
		c = n;
		for(k = 0; k < 8; k++){
			c = ((c&1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)) >>> 0;
		}
		table[n] = c;
	}

	for(i=0; i < 256; i++){
		hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
	}

	function _crc32_utf8(str) {
		var crc = -1, i, L = str.length, c, d;
		for(i = 0; i < L; i++) {
			c = str.charCodeAt(i);
			if(c < 0x80) {
				crc = (crc >>> 8) ^ table[(crc ^ c) & 255];
			} else if(c < 0x800) {
				crc = (crc >>> 8) ^ table[(crc ^ (192|((c>>6)&31))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 255];
			} else if(((c & 0xfc00) == 0xd800) && (i + 1) < str.length &&
					  ((str.charCodeAt(i + 1) & 0xfc00) == 0xdc00)) {
				c = (c&1023)+64; d = str.charCodeAt(++i) & 1023;
				crc = (crc >>> 8) ^ table[(crc ^ (240|((c>>8)&7))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>2)&63))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((d>>6)&15)|((c&3)<<4))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(d&63))) & 255];
			} else {
				crc = (crc >>> 8) ^ table[(crc ^ (224|((c>>12)&15))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>6)&63))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 255];
			}
		}
		return (crc ^ (-1))>>>0;
	}

	function _crc32_bs(str) {
		var crc = -1, i, L = str.length - 3;
		for(i = 0; i < L; i) {
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
		}
		while(i<L+3){
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
		}
		return (crc ^ (-1))>>>0;
	}

	function _crc32_arr(arr) {
		var crc = -1, i, L = arr.length - 3;
		for(i = 0; i < L; i) {
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
		}
		while(i<L+3){
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
		}
		return (crc ^ (-1))>>>0;
	}

	function _crc32_utf8_hex(str) {
		var crc = -1, i, L = str.length, c, d;
		for(i = 0; i < L; i++) {
			c = str.charCodeAt(i);
			if(c < 0x80) {
				crc = (crc >>> 8) ^ table[(crc ^ c) & 255];
			} else if(c < 0x800) {
				crc = (crc >>> 8) ^ table[(crc ^ (192|((c>>6)&31))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 255];
			} else if(((c & 0xfc00) == 0xd800) && (i + 1) < str.length &&
					  ((str.charCodeAt(i + 1) & 0xfc00) == 0xdc00)) {
				c = (c&1023)+64; d = str.charCodeAt(i++) & 1023;
				crc = (crc >>> 8) ^ table[(crc ^ (240|((c>>8)&7))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>2)&63))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((d>>6)&15)|((c&3)<<4))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(d&63))) & 255];
			} else {
				crc = (crc >>> 8) ^ table[(crc ^ (224|((c>>12)&15))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>6)&63))) & 255];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 255];
			}
		}
		crc = (crc ^ (-1))>>>0;
		return hl[crc>>>24]+hl[(crc>>>16)&255]+hl[(crc>>>8)&255]+hl[crc&255];
	}

	function _crc32_bs_hex(str) {
		var crc = -1, i, L = str.length - 3;
		for(i = 0; i < L; i) {
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
		}
		while(i<L+3){
			crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i++)) & 255];
		}
		crc = (crc ^ (-1))>>>0;
		return hl[crc>>>24]+hl[(crc>>>16)&255]+hl[(crc>>>8)&255]+hl[crc&255];
	}

	function _crc32_arr_hex(arr) {
		var crc = -1, i, L = arr.length - 3;
		for(i = 0; i < L; i) {
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
		}
		while(i<L+3){
			crc = (crc >>> 8) ^ table[(crc ^ arr[i++]) & 255];
		}
		crc = (crc ^ (-1))>>>0;
		return hl[crc>>>24]+hl[(crc>>>16)&255]+hl[(crc>>>8)&255]+hl[crc&255];
	}

	return {
		utf: _crc32_utf8,
		str: _crc32_bs,
		arr: _crc32_arr,
		utfHex: _crc32_utf8_hex,
		strHex: _crc32_bs_hex,
		arrHex: _crc32_arr_hex
	};
})();

if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = crc32;
