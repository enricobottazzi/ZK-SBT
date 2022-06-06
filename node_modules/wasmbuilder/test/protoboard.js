const assert = require("assert");

const buildProtoboard = require("../index.js").buildProtoboard;

describe("Basic protoboard test", () => {
    it("Should generate a basic protoboard", async () => {
        const pb = await buildProtoboard(function(module) {

            buildTest1();
            buildTest2();

            function buildTest1() {
                const f = module.addFunction("test1");

                const c = f.getCodeBuilder();
                f.addCode(c.call("log32", c.i32_const(44)));


                module.exportFunction("test1");

            }

            function buildTest2() {
                const f = module.addFunction("test2");

                const c = f.getCodeBuilder();
                f.addCode(c.call("log64", c.i64_const(66)));


                module.exportFunction("test2");

            }


        });

        const logs = [];
        pb.log = function(S) {
            logs.push(S);
        };

        pb.test1();
        pb.test2();

        assert.equal(logs[0], "0000002c: 44");
        assert.equal(logs[1], "0000000000000042: 66");
    });
});
