const Factors = require('../src/factors');
const Combinations = require('../src/combinations');

const fs = require('fs');
const path = require('path');

class FactorAnalysis {
  constructor(filepath, options = {}) {
    const contents = fs.readFileSync(filepath);
    let idx = 0;
    let factor;
    let combinations;
    try {
      const lines = contents.toString().split(/\r?\n/);
      while (idx < lines.length) {
        let line = lines[idx];
        if (line.match(/^\[factor\]\s*$/)) {
          factor = new Factors();
          while ((line = lines[++idx])) {
            if (factor.add(line)) {
              break;
            }
          }
        } else if (line.match(/^\[combination\]\s*$/)) {
          combinations = new Combinations(factor);
          while ((line = lines[++idx])) {
            if (combinations.add(line)) {
              break;
            }
          }
        }
        idx++;
      }
    } catch (e) {
      console.error(`Parse Error:(${idx + 1}) ${e.message}`);
      return;
    }

    if (options.dir) {
      if (!fs.existsSync(options.dir)) {
        console.error(`${options.dir} does not exist.`);
        process.exit(1);
      }
      const filename = path.basename(filepath);
      const outputFile = path.join(options.dir, filename);
      combinations.save(outputFile);
    } else {
      combinations.outputTable();
    }
  }
}
module.exports = FactorAnalysis;
