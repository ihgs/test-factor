const fs = require('fs');

class FactorAnalysis {
  constructor(filepath, options = {}) {
    var contents = fs.readFileSync(filepath);
    console.log(contents.toString());
  }
}
module.exports = FactorAnalysis;
