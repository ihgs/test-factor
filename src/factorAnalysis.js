const Factors = require('../src/factors');
const Combinations = require('../src/combinations');

const fs = require('fs');

class FactorAnalysis {
  constructor(filepath, options = {}) {
    var contents = fs.readFileSync(filepath);
    var factor = undefined;
    var combinations = undefined;
    contents
      .toString()
      .split('\n')
      .forEach(function(line) {
        if (line == '[factor]') {
          factor = new Factors();
        } else if (line == '[combination]') {
          combinations = new Combinations(factor);
          factor = undefined;
        } else {
          if (factor) {
            if (factor.add(line)) {
            }
          }
          if (combinations) {
            if (combinations.add(line)) {
            }
          }
        }
      });
    combinations.outputTable();
  }
}
module.exports = FactorAnalysis;
