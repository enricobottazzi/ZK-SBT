var microtime = require('microtime'),
	crypto = require ('crypto'),
	YaMD5 = require('yamd5.js').YaMD5,
	FNV_LITE = require('fnv-lite'),
	FNV = require("fnv").FNV,
	fnv_plus = require('../'),
	fnv_old = require('./fnv_plus_old.js'),
	crc32 = require('./crc32.js'),
	fnv32 = require('fnv32'),
	dding_fnv = require('dding-fnv'),
	fnv1a = require('fnv1a'),
	node_hashes = require('node-hashes');

function fnum(x) {
	var t;
	if(x<100){
		t = ('          '+x.toFixed(2)).substr(-13);
	}else{
		t = Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		if(t.length < 10) t = ('          '+t).substr(-10)+'   ';
	}
    return t;
}

var mt, test_str, t;

var runSecs = 5;

function run32Hex() {
	var fc = 0, fn = 'null', mts, cnt, h;
	console.log('Benchmarking: fnv_1a 32bit hashes as HEX (in ops/sec)');

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		t = crc32.strHex(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    crc32         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'crc32';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		t = node_hashes.FNVHash(test_str).toString(16);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    node-hashes   : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'node-hashes';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		h = new FNV();h.update(Buffer(test_str));t = h.digest("hex");
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv           : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		t = fnv32.fnv_1a(test_str).toString(16);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv32         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv32';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		t = dding_fnv.hash32(test_str, '1a').toHex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    dding-fnv     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'dding-fnv';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		t = fnv1a(test_str).toString(16);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv1a         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv1a';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv_old.hash(test_str,32).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		t = fnv_plus.hash(test_str,32).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		t = fnv_plus.fast1a32hex(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ fast     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ fast';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

function run32Int() {
	var fc = 0, fn = 'null', mts, cnt, h;
	console.log('Benchmarking: fnv_1a 32bit hashes as INT (in ops/sec)');

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    crc32         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'crc32';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		t = node_hashes.FNVHash(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    node-hashes   : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'node-hashes';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		h = new FNV();h.update(Buffer(test_str));t = parseInt(h.digest("hex"), 16);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv           : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		t = fnv32.fnv_1a(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv32         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv32';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		t = dding_fnv.hash32(test_str, '1a').value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    dding-fnv     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'dding-fnv';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,32).hex();
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		t = fnv1a(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv1a         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv1a';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		t = fnv_old.hash(test_str,32).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		t = fnv_plus.hash(test_str,32).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ fast     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ fast';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

function run64Hex(noSlow) {
	var fc = 0, fn = 'null', mts, cnt;
	console.log('Benchmarking: fnv_1a 64bit hashes (in ops/sec)');

	if(noSlow){
		console.log('    dding-fnv     : disabled due to very bad performance.');
	}else{
		mts=0;cnt=0;
		while (mts < runSecs * 1e6) {
			mt = microtime.now();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			t = dding_fnv.hash64(test_str, '1a').toHex();
			mts += microtime.now() - mt;cnt++;
		}
		console.log('    dding-fnv     : %s', fnum(cnt * 10000000/mts));
		if(fc <= cnt){fc = cnt; fn = 'dding-fnv';}
	}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		t = fnv_old.hash(test_str,64).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		t = fnv_plus.hash(test_str,64).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		t = fnv_plus.fast1a64(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ fast     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ fast';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		t = fnv_old.hash(test_str,52).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old 52   : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old 52';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new 52   : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new 52';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ fast 52  : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ fast 52';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

function run128Hex() {
	var fc = 0, fn = 'null', mts, cnt;
	console.log('Benchmarking: fnv_1a 128bit hashes (in ops/sec)');

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		t = crypto.createHash('md5').update(test_str).digest('hex');
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    md5 C         : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'md5 C';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		t = YaMD5.hashStr(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    YaMD5.js      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'YaMD5.js';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		t = FNV_LITE.hex(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv-lite      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv-lite';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		t = fnv_old.hash(test_str,128).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		t = fnv_plus.hash(test_str,128).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

function runBig() {
	var fc = 0, fn = 'null', mts, cnt;
	console.log('Benchmarking: fnv_1a 256+ bits hashes (in ops/sec)');

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		t = crypto.createHash('sha256').update(test_str).digest('hex');
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    sha256 C      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'sha256 C';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		t = crypto.createHash('sha512').update(test_str).digest('hex');
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    sha512 C      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'sha512 C';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		t = fnv_old.hash(test_str,256).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old 256  : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old 256';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		t = fnv_plus.hash(test_str,256).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new 256  : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new 256';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		t = fnv_old.hash(test_str,512).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old 512  : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old 512';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		t = fnv_plus.hash(test_str,512).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new 512  : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new 512';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		t = fnv_old.hash(test_str,1024).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ old 1024 : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ old 1024';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		t = fnv_plus.hash(test_str,1024).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ new 1024 : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ new 1024';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

function runOverhead() {
	var fc = 0, fn = 'null', mts, cnt;
	console.log('Benchmarking: fnv+ 1a 52bit hash (in ops/sec)');

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		t = fnv_plus.hash(test_str,52).hex();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    hex convert   : %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'hex convert';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		t = fnv_plus.hash(test_str,52).str();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    str convert   : %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'str convert';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		t = fnv_plus.hash(test_str,52).dec();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    dec value     : %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'dec value';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		t = fnv_plus.hash(test_str,52).value.toString();
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    value.toString: %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'value.toString';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		t = fnv_plus.hash(test_str,52).value;
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    direct value  : %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'direct value';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		t = fnv_plus.fast1a52hex(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ fast hex : %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ fast hex';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		t = fnv_plus.fast1a52(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ fast     : %s   value: %s', fnum(cnt * 10000000/mts),JSON.stringify(t));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ fast';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

function runUtf() {
	var fc = 0, fn = 'null', mts, cnt;
	console.log('Benchmarking: bytestring vs utf-8 (in ops/sec)');

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		t = crc32.str(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    crc32 byte    : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'crc32 byte';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		t = crc32.utf(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    crc32 utf     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'crc32 utf';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		t = fnv_plus.fast1a32(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ byte     : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ byte';}

	mts=0;cnt=0;
	while (mts < runSecs * 1e6) {
		mt = microtime.now();
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		t = fnv_plus.fast1a32utf(test_str);
		mts += microtime.now() - mt;cnt++;
	}
	console.log('    fnv+ utf      : %s', fnum(cnt * 10000000/mts));
	if(fc <= cnt){fc = cnt; fn = 'fnv+ utf';}

	console.log('---------------------------------\nFastest is "%s".\n', fn);
}

test_str = 'Hardardcwojgre12345!@#$%  TESU';

console.log('\nRUNING BENCHMARKS ON SHORT STRING. ('+test_str.length+' chars)');
console.log('==================================================\n');
// run32Hex();
// run32Int();
// run64Hex();
// run128Hex();
// runBig();
// runOverhead();
runUtf();

test_str = 'hardardcwojgre12345!)(><-=....  '.repeat(32768);
console.log('\nRUNING BENCHMARKS ON HUGE STRING. ('+test_str.length+' chars)');
console.log('==================================================\n');
// run32Hex();
// run32Int();
// run64Hex(true);
// run128Hex();
// runBig();
// runOverhead();
runUtf();
