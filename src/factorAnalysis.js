const fs = require('fs');

class Item {
  constructor(no, type, label) {
    this.no = no;
    if (type == '.') {
      this.normal = true;
    }
    this.label = label;
  }

  out() {
    if (this.normal) {
      console.log(`| ${this.no} ${this.label}`);
    } else {
      console.log(`| E ${this.no} ${this.label}`);
    }
  }
}

class Factor {
  constructor(key, description) {
    this.key = key;
    this.description = description;

    this.items = [];
  }

  addItem(no, type, label) {
    this.items.push(new Item(no, type, label));
  }
  out() {
    console.log(this.key);
    this.items.forEach(function(item) {
      item.out();
    });
  }
}

class Factors {
  constructor() {
    this.factorlist = [];
    this.maxItemSize = 0;
  }

  add(line) {
    const matchSeparator = line.match(/^-+/);
    if (matchSeparator) {
      if (this.started) {
        return this;
      } else {
        this.started = true;
      }
      return;
    }
    const matchFactor = line.match(/^(\w+):\s*(.*)$/);
    if (matchFactor) {
      this.factor = new Factor(matchFactor[1], matchFactor[2]);
      this.factorlist.push(this.factor);
      return;
    }
    const matchItem = line.match(/^\s+(\d+)([.-])\s+(.*)$/);
    if (matchItem) {
      this.factor.addItem(matchItem[1], matchItem[2], matchItem[3]);
      return;
    }
  }

  out() {
    this.factorlist.forEach(function(factor) {
      factor.out();
    });
  }
}

class CombinationSeries {
  constructor(factorKey) {
    this.factorKey = factorKey;
    this.factors = [];
  }
}

const C_STATE = {
  PARSE_FACTOR_KEY: 0,
  PARSE_FACTORS: 1,
  PARSE_FACTORS_MULTI: 2,
  FINISHED_PARSE_FACTORS_MULTI: 3
};
class Combinations {
  constructor(factors) {
    this.factors;
  }

  parse(line) {
    var idx = 0;
    let state = C_STATE.PARSE_FACTOR_KEY;
    let str = '';
    while (idx < line.length) {
      let ch = line[idx];
      if (ch == ' ') {
        idx++;
        continue;
      }
      switch (state) {
        case C_STATE.PARSE_FACTOR_KEY:
          do {
            if (ch == ':') {
              // TODO
              console.log(str);
              str = '';
              state++;
              break;
            } else {
              str += ch;
            }
          } while ((ch = line[++idx]));
          break;
        case C_STATE.PARSE_FACTORS:
          if (ch == '[') {
            state++;
            break;
          }
          do {
            if (ch == ',') {
              //TODO
              console.log(str);
              str = '';
              state = C_STATE.PARSE_FACTOR_KEY;
              break;
            } else {
              str += ch;
              if (idx == line.length - 1) {
                //TODO
                console.log(str);
              }
            }
          } while ((ch = line[++idx]));
          break;
        case C_STATE.PARSE_FACTORS_MULTI:
          do {
            if (ch == ']') {
              //TODO
              console.log(str);
              str = '';
              state++;
              break;
            } else if (ch == ',') {
              // TODO
              console.log(str);
              str = '';
            } else {
              str += ch;
            }
          } while ((ch = line[++idx]));
          break;
        case C_STATE.FINISHED_PARSE_FACTORS_MULTI:
          if (ch == ',') {
            state = C_STATE.PARSE_FACTOR_KEY;
          }
        default:
          break;
      }
      idx++;
    }
  }

  add(line) {
    const matchSeparator = line.match(/^-+/);
    if (matchSeparator) {
      if (this.started) {
        return this;
      } else {
        this.started = true;
      }
      return;
    }
    this.parse(line);
  }

  out() {}
}

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
              //factor.out();
            }
          }
          if (combinations) {
            if (combinations.add(line)) {
              combinations.out();
            }
          }
        }
      });
  }
}
module.exports = FactorAnalysis;
