const { ParseException } = require('./exceptions');

class CombinationScenario {
  constructor(index) {
    this.index = index;
    this.factors = [];
  }

  addFactor(factor) {
    this.factors.push({ factor: factor, target: [] });
  }

  addItem(targetItem) {
    const f = this.factors[this.factors.length - 1];
    f.target.push(targetItem);
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
    this.factors = factors;
    this.lineNo = 0;
    this.scenarios = [];
  }

  parse(line) {
    this.lineNo++;

    var idx = 0;
    let state = C_STATE.PARSE_FACTOR_KEY;
    let str = '';
    let scenario = new CombinationScenario(this.lineNo);
    this.scenarios.push(scenario);
    let _factors = this.factors;
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
              const factor = _factors.getFactor(str);
              scenario.addFactor(factor);
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
              scenario.addItem(str);
              str = '';
              state = C_STATE.PARSE_FACTOR_KEY;
              break;
            } else {
              str += ch;
              if (idx == line.length - 1) {
                scenario.addItem(str);
              }
            }
          } while ((ch = line[++idx]));
          break;
        case C_STATE.PARSE_FACTORS_MULTI:
          do {
            if (ch == ']') {
              scenario.addItem(str);
              str = '';
              state++;
              break;
            } else if (ch == ',') {
              scenario.addItem(str);
              str = '';
            } else {
              str += ch;
            }
          } while ((ch = line[++idx]));
          break;
        case C_STATE.FINISHED_PARSE_FACTORS_MULTI:
          if (ch == ',') {
            state = C_STATE.PARSE_FACTOR_KEY;
          } else {
            throw new ParseException();
          }
        default:
          break;
      }
      idx++;
    }
  }

  add(line) {
    const matchSeparator = line.match(/^-+/);
    const blankLine = line.match(/^\s*$/);
    if (matchSeparator) {
      if (this.started) {
        return this;
      } else {
        this.started = true;
      }
      return;
    } else if (blankLine) {
      return;
    }
    this.parse(line);
  }
}

module.exports = Combinations;
