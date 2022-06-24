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

const main = async () => {
  const inputSignals = {"claim":["180410020913331409885634153623124536270","0","25","0","0","0","328613907243889777235018884535160632327","0"],"sigR8x":"13692340849919074629431384397504503745238970557428973719013760553241945274451","sigR8y":"18066895302190271072509218697462294016350129302467595054878773027470753683267","sigS":"238898180964301975640138172772451490757586081215817420470161945050687067203","pubKeyX":"9582165609074695838007712438814613121302719752874385708394134542816240804696","pubKeyY":"18271435592817415588213874506882839610978320325722319742324814767882756910515","claimSchema":"180410020913331409885634153623124536270","slotIndex":2,"operator":3,"value":[18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]} // replace with your signals
  await generateWitness(inputSignals)
  const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_path, witness_path);

  const vKey = JSON.parse(fs.readFileSync("build/verify/verification_key.json"));

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (res === true) {
      console.log("Verification OK");
  } else {
      console.log("Invalid proof");
  }
}

main()