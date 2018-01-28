const Factors = require('../src/factors');
const Combinations = require('../src/combinations');

const fs = require('fs');

class FactorAnalysis {
  constructor(filepath, options = {}) {
    const contents = fs.readFileSync(filepath);
    let factor = undefined;
    let combinations = undefined;
    let lineNo;
    try {
      contents
        .toString()
        .split('\n')
        .forEach(function(line, index) {
          lineNo = index + 1;
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
    } catch (e) {
      console.error(`Parse Error:(${lineNo}) ${e.message}`);
      return;
    }

    combinations.outputTable();
  }
}
module.exports = FactorAnalysis;
