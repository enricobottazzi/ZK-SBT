/* jshint expr:true */
var fnv = require('..');
var assert = require('assert');

describe('fnv-plus', function () {
  beforeEach(function () {
    fnv.seed('https://github.com/tjwebb/fnv-plus');
  });
  describe('sanity', function () {
    it('should make public api functions available', function () {
      assert.ok(fnv);
    });
  });

  var hash1 = 'hello world',
    hash2 = 'the quick brown fox jumps over the lazy dog',
    hashObject1 = { a: 1, foo: 'bar', test: 'yes' },
    hashObject2 = {
      id: 1,
      cid: 'c82',
      changed: { },
      attributes: {
        name: 'tjwebb',
        password: 'passwordlol',
        posts: 273,
        favoriteBooks: [
          'the social animal',
          'infinite jest',
          'nineteen eighty-four',
          'the 7 habits of highly effective people'
        ]
      }
    };

  describe('#seed', function () {
    it('seed(0) implies that hash(0) = 0', function () {
      fnv.seed(0);
      assert.equal(fnv.hash(0, 32).dec(), 0);
    });
  });

  describe('#hash', function () {
    beforeEach(function () {
      fnv.seed('https://github.com/tjwebb/fnv-plus');
    });
    var K = 1024,
        M = K * K,
      generate = function () {
        return JSON.stringify({
          foo: 'bar',
          hello: {
            bar: 'world',
            baz: [1,2,3,4],
            random: Math.random() * 100000
          },
          '0x123': {
            makes: 'no sense !@#$%^&*()_+'
          },
          alice: function () {
            return 'bob';
          },
          text: 'the quick '+ (Math.random() * 10).toString(36) + 'brown fox',
          moretext: 'lorem ipsum total random junk 23i2jnlkwjbflksdbf'
        });
      },
      generations = [ 1, 1*K, 2*K, 4*K, 8*K, 16*K, 32*K, 128*K ],
      gentime,
      ascii = { },

      /**
      * Max allowable time in ms to hash 1kb of data with 32-bit fnv. Used to
      * compute derivative benchmarks for other payload sizes and bitlengths.
      */
      t = 2,

      performant = function (g, bitlen) {
        var a = 50, // overhead,
          r = (generations[g] / generations[1]),
          x = Math.pow((bitlen / 32), 2) * t * Math.max(r, 1);
        return x + a;
      };

    // generate a bunch of ascii data
    before(function () {
      var data = { },
        t1 = new Date().valueOf();

      for (var g = 0; g < generations.length; g++) {
        data[g] || (data[g] = [ ]);
        ascii[g] = '';

        while (ascii[g].length <= generations[g]) {
          data[g].push(generate());
          ascii[g] += JSON.stringify(data[g]);
        }
        ascii[g].slice(0, generations[g] - 1);
        assert(ascii[g].length >= generations[g], 'test data of insufficient size');
      }
      gentime = new Date().valueOf() - t1;
    });

    for (var g = 0; g < generations.length; g++) {
      it('generated '+ (generations[g] / K).toFixed(0) +'k of test data');
    }

    /**
     * http://tools.ietf.org/html/draft-eastlake-fnv-07#appendix-C
     */
    describe('draft-eastlake Appendix C examples', function () {
      beforeEach(function () {
        fnv.seed('chongo <Landon Curt Noll> /\\../\\');
      });
      describe('without null termination', function () {
        it('example 1', function () {
          assert.equal(fnv.hash('', 32).hex(), '811c9dc5');
          assert.equal(fnv.hash('', 64).hex(), 'cbf29ce484222325');
        });
        it('example 2', function () {
          assert.equal(fnv.hash('a', 32).hex(), 'e40c292c');
          assert.equal(fnv.hash('a', 64).hex(), 'af63dc4c8601ec8c');
        });
        it('example 3', function () {
          assert.equal(fnv.hash('foobar', 32).hex(), 'bf9cf968');
          assert.equal(fnv.hash('foobar', 64).hex(), '85944171f73967e8');
        });
      });
      describe('with null termination', function () {
        it('example 1', function () {
          assert.equal(fnv.hash('\0', 32).hex(), '050c5d1f');
          assert.equal(fnv.hash('\0', 64).hex(), 'af63bd4c8601b7df');
        });
        it('example 2', function () {
          assert.equal(fnv.hash('a\0', 32).hex(), '2b24d044');
          assert.equal(fnv.hash('a\0', 64).hex(), '089be207b544f1e4');
        });
        it('example 3', function () {
          assert.equal(fnv.hash('foobar\0', 32).hex(), '0c1c9eb8');
          assert.equal(fnv.hash('foobar\0', 64).hex(), '34531ca7168b8f38');
        });
      });
    });

    describe('()', function () {
      it('should generate a 52-bit hash by default', function () {
        var h1 = fnv.hash(hash1),
            h2 = fnv.hash(hash2),
            h3 = fnv.hash(generate());

        assert.equal(h1.hex(), 'a410bc777a59c');
        assert.equal(h2.hex(), 'c6e1a37123b9d');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 13);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 1234 foobar');
        var h1 = fnv.hash(hash1),
            h2 = fnv.hash(hash2),
            h3 = fnv.hash(generate());

        assert.equal(h1.hex(), '67d7054c515b7');
        assert.equal(h2.hex(), '4b3a6d8f94de9');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 13);
      });
      it('should generate distinct hashes for objects', function () {
        var h1 = fnv.hash(hashObject1),
          h2 = fnv.hash(hashObject2);

        assert.equal(h1.hex(), '454094ad09212');
        assert.equal(h2.hex(), '9b41cd5627fb2');
      });
      it.skip('should be performant (52)', function () {
        for (var g = 0; g < generations.length; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g], 52);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 52);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });

    describe('(32)', function () {
      it('should generate a 32-bit hash if specified', function () {
        var h1 = fnv.hash(hash1, 32),
            h2 = fnv.hash(hash2, 32),
            h3 = fnv.hash(generate(), 32);

        assert.equal(h1.hex(), 'f4b1d0d6');
        assert.equal(h2.hex(), 'c28fc5b1');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 8);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 0001 foobar');
        var h1 = fnv.hash(hash1, 32),
            h2 = fnv.hash(hash2, 32),
            h3 = fnv.hash(generate(), 32);

        assert.equal(h1.hex(), '3be94b72');
        assert.equal(h2.hex(), '161a0105');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 8);
      });
      it('should generate distinct hashes for objects', function () {
        var h1 = fnv.hash(hashObject1, 32),
          h2 = fnv.hash(hashObject2, 32);

        assert.equal(h1.hex(), '7416acb6');
        assert.equal(h2.hex(), 'f13b4e99');
      });
      it.skip('should be performant', function () {
        for (var g = 0; g < generations.length; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g]);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 32);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });

    describe('(64)', function () {
      it('should generate a 64-bit hash if specified', function () {
        var h1 = fnv.hash(hash1, 64),
            h2 = fnv.hash(hash2, 64),
            h3 = fnv.hash(generate(), 64);

        assert.equal(h1.hex(), '20aa410bc777a796');
        assert.equal(h2.hex(), '46cc6e1a37123ff1');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 16);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 5678 foobar');
        var h1 = fnv.hash(hash1, 64),
            h2 = fnv.hash(hash2, 64),
            h3 = fnv.hash(generate(), 64);

        assert.equal(h1.hex(), '9f00040c255e9c85');
        assert.equal(h2.hex(), 'cb82f5943330d922');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 16);
      });
      it.skip('should be performant (64)', function () {
        for (var g = 0; g < generations.length; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g], 64);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 64);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });

    describe('(128)', function () {
      it('should generate a 128-bit hash', function () {
        var h1 = fnv.hash(hash1, 128),
            h2 = fnv.hash(hash2, 128),
            h3 = fnv.hash(generate(), 128);

        assert.equal(h1.hex(), '354cf5c68f2e7717c7f1b1125cd4bc26');
        assert.equal(h2.hex(), 'f7b16111d098493afbccf971f25388a1');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 32);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 4208 tjwebb');
        var h1 = fnv.hash(hash1, 128),
            h2 = fnv.hash(hash2, 128),
            h3 = fnv.hash(generate(), 128);

        assert.equal(h1.hex(), '9828b44e3c8c859b84d682d46ade2c56');
        assert.equal(h2.hex(), 'd1641ee5f8e3e9177a82c28d79844ed1');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 32);
      });
      it.skip('should be performant (128)', function () {
        for (var g = 0; g < generations.length; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g], 128);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 128);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });
    describe('(256)', function () {
      it('should generate a 256-bit hash', function () {
        var h1 = fnv.hash(hash1, 256),
            h2 = fnv.hash(hash2, 256),
            h3 = fnv.hash(generate(), 256);

        assert.equal(h1.hex(), 'b871cdb1531c52cf7ff715bb6049a127630376ddce36a5639a6cfa6629dc2556');
        assert.equal(h2.hex(), 'f21986b06f30d84b3e980b3ba5929869a3f9238c34635cb64411b56f504a72b1');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 64);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 5678 alicebob');
        var h1 = fnv.hash(hash1, 256),
            h2 = fnv.hash(hash2, 256),
            h3 = fnv.hash(generate(), 256);

        assert.equal(h1.hex(), '88975b19f3be6589d96f9ca5de32a038ac579e550ccdddc8863d7914909ea48b');
        assert.equal(h2.hex(), 'adadc3d09ca3484d51629cc288d9ef06a10751c55e200c32039f18ff1ec9a2fc');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 64);
      });
      it.skip('should be performant', function () {
        for (var g = 0; g < generations.length; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g], 256);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 256);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });
    describe('(512)', function () {
      it('should generate a 512-bit hash if specified', function () {
        var h1 = fnv.hash(hash1, 512),
            h2 = fnv.hash(hash2, 512),
            h3 = fnv.hash(generate(), 512);

        assert.equal(h1.hex(), '40062fa080039ae19def139eb6b75aaeea84b7e7e12f908cdc7a28fa7eebd33192f266862ff8e5ac8240f50d7b1f6506f14b2401a7c4ede17c1f1eebf76b2096');
        assert.equal(h2.hex(), '775268ebea84417415a4b75d2936f67fce5db06ad5f9181bcf2321e2c8ccb97072bfef637fb5c121acb8fa2e10e1a858af5b54cf82e656149b786b54cf08be71');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 128);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 5432 barfoo');
        var h1 = fnv.hash(hash1, 512),
            h2 = fnv.hash(hash2, 512),
            h3 = fnv.hash(generate(), 512);

        assert.equal(h1.hex(), 'bb89a616218c49a2d743126a992d7cbe12996e3d3a8a6f6a9c739bcdd964bf00b44fb3ff6258e1acacbd6cd47194c910b6bdddb4514b7a00e18a30fec97b4323');
        assert.equal(h2.hex(), 'eb58c9b70c219569b2e68b8b2559a869551ae510eafbbfe8170616548324246321d3dd330707f58623f7b1babcaacd41d7d68fe38d8fdce546f20c33d58e2824');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 128);
      });
      it.skip('should be performant', function () {
        for (var g = 0; g < generations.length; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g], 512);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 512);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });
    describe('(1024)', function () {
      it('should generate a 1024-bit hash if specified', function () {
        var h1 = fnv.hash(hash1, 1024),
            h2 = fnv.hash(hash2, 1024),
            h3 = fnv.hash(generate(), 1024);

        assert.equal(h1.hex(), '4ef71a2b641f5bfd4b1861209eb33f1a26e725cd148e8f1de12c6b6e4713856aba111a215e87b5931339c000000000000000000000000000000000000000000000000000000000000000000000000917e68e5a6fc89c0014ac05563f653c65d3260f7bee0c4b8ae34aad713924060445e233686cb4337767592a465724557a8e');
        assert.equal(h2.hex(), '69b6977eda2db3a7b528664ee8c37833eec66cc3ee66a066482bc3e780561ffff8c9cc933a987d593607c400adb98da6adc997a8fc82f25809e641d409934a9d3c16a834d0201e090678c6df5daa245b583fb58fb35069014c83b67b76290f5fc8996506777ffcb2075fbd6052d5f18ccf3972f3bfa22bd62a30fe0a9d4be4c1');
        assert.ok(h3.hex());

        assert.equal(h1.hex().length, 256);
        assert.equal(h2.hex().length, 256);
        assert.equal(h3.hex().length, 256);
      });
      it('should generate a distinct hash when using a custom seed', function () {
        fnv.seed('custom seed fnvplus 8080 lalala');
        var h1 = fnv.hash(hash1, 1024),
            h2 = fnv.hash(hash2, 1024),
            h3 = fnv.hash(generate(), 1024);

        assert.equal(h1.hex(), 'aece2c9e28355cbc122c700cae0928fd018b6a153b8465b8f4311d6dad8f4ed7912c14e6ad2b88f69d544700000000000000000000000000000000000000000000000000000000000000000000000000000253f62d071d9a6183c3925bc1cf076e55dc2ee4af48a6f6328ad5710674bd94b7b150d61eab89037e1a4b308d4699');
        assert.equal(h2.hex(), '1c137db6a73f8d408b5157885958c4f0227cf847e0de970ca1a7e1b3becb9c2a3dfeb5d59e4e81fa3a8763000000002c79980ce49cfae9928bd8c49818d965611b5b171c39bc4949765fab944eca30898ee0bcbd793751f4cc8f11c0f3b2902e370c51aec864d9631facccc7637a1233f7b18a3c84cf49c9191768d1b4028956');
        assert.ok(h3.hex());
        assert.equal(h3.hex().length, 256);
      });
      it.skip('should be performant (1024)', function () {
        for (var g = 0; g < generations.length - 1; g++) {
          var t1 = new Date().valueOf(),
            t2, max;

          fnv.hash(ascii[g], 1024);
          t2 = new Date().valueOf();
          actual = t2 - t1;
          max = performant(g, 1024);

          assert(actual < max, 'actual time in ms: '+ actual +' ; max allowed: '+ max);
        }
      });
    });
  });
  describe('FnvHash', function () {
    var h1, h2;

    before(function () {
      fnv.seed('https://github.com/tjwebb/fnv-plus');
      h1 = fnv.hash(hash1),
      h2 = fnv.hash(hash2);
      h3 = fnv.hash(hash1, 64),
      h4 = fnv.hash(hash2, 64);
    });

    it('#str()', function () {
      var h1 = fnv.hash(hash1);
      assert.equal(h1.str(), 'sf3hhvkal8');
      assert.equal(h2.str(), 'yg7fiat40t');

      assert.equal(h3.str(), 'hvs45jc5k7fa');
      assert.equal(h4.str(), '12rc4w0lr3yep');
    });
    it('#hex()', function () {
      assert.equal(h1.hex(), 'a410bc777a59c');
      assert.equal(h2.hex(), 'c6e1a37123b9d');

      assert.equal(h3.hex(), '20aa410bc777a796');
      assert.equal(h4.hex(), '46cc6e1a37123ff1');
    });
    it('#dec()', function () {
      assert.equal(h1.dec(), '2886268614059420');
      assert.equal(h2.dec(), '3498758592674717');

      assert.equal(h3.dec(), '2353765274101458838');
      assert.equal(h4.dec(), '5101573536776077297');
    });
  });
});
