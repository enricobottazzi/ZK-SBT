// Utils massively borrowed from https://github.com/vplasencia/zkSudoku/blob/5cec0250a23778c873012db06dfa360fef3045d1/contracts/test/utils/utils.js#L3

const snarkjs = require('snarkjs')
const fs = require('fs')

const wc = require('../build/verify/verify_js/witness_calculator')
const wasm_path = 'build/verify/circuit.wasm'
const zkey_path = 'build/verify/circuit_final.zkey'
const witness_path = 'build/verify/verify_js/witness2.wtns'

const generateWitness = async (inputs) => {
  const buffer = fs.readFileSync(wasm_path);
  const witnessCalculator = await wc(buffer)
  const buff = await witnessCalculator.calculateWTNSBin(inputs, 0);
  fs.writeFileSync(witness_path, buff)
}

const genProof = async (input) => {

  await generateWitness(input)
  const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_path, witness_path);

  solidityCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

  const argv = solidityCallData
    .replace(/["[\]\s]/g, "")
    .split(",")

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const PubSignals = [];

  for (let i = 8; i < argv.length; i++) {
    PubSignals.push(argv[i]);
  }

  return { a, b, c, PubSignals };
}

module.exports = {
    genProof
}