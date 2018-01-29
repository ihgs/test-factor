const { ParseException } = require('./exceptions');
const _ = require('lodash');
require('lodash.product');

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
    const item = f.factor.getItem(targetItem);
    if (item == undefined) {
      throw new ParseException(`Not found item:${targetItem}`);
    }
    f.target.push(item);
  }

  addItems(start, end) {
    const f = this.factors[this.factors.length - 1];
    let ok = false;
    f.factor.items.forEach(function(item, index) {
      if (item.no == start) {
        f.target.push(item);
        ok = true;
      } else if (item.no == end) {
        f.target.push(item);
        ok = false;
      } else {
        if (ok) {
          f.target.push(item);
        }
      }
    });
  }

  combinationList() {
    const fKey = [];
    const list = [];
    this.factors.forEach(function(fac) {
      fKey.push(fac.factor.key);
      list.push(fac.target);
    });
    return { keys: fKey, list: _.product(...list) };
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
              if (factor == undefined) {
                throw new ParseException(`Not found factor:${str}`);
              }
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
            } else if (ch == ',') {
              scenario.addItem(str);
              str = '';
            } else if (ch == '-') {
              const start = str;
              let end;
              str = '';
              while ((ch = line[++idx])) {
                if (ch == ']') {
                  state++;
                  end = str;
                  str = '';
                  scenario.addItems(start, end);
                  break;
                } else if (ch == ',') {
                  end = str;
                  str = '';
                  scenario.addItems(start, end);
                  break;
                } else {
                  str += ch;
                }
              }
            } else {
              str += ch;
            }
          } while (C_STATE.PARSE_FACTORS_MULTI == state && (ch = line[++idx]));
          break;
        case C_STATE.FINISHED_PARSE_FACTORS_MULTI:
          if (ch == ',') {
            state = C_STATE.PARSE_FACTOR_KEY;
          } else {
            throw new ParseException(`Invalid charactor:${ch}`);
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

  outputTable() {
    console.log('[cols="2,10,2,2,2,10"]');
    console.log('|===');
    console.log('| No. |  | Expected | Date | OK | Memo');

    this.scenarios.forEach(function(sce, secIndex) {
      const { keys, list } = sce.combinationList();
      list.forEach(function(l, factIndex) {
        console.log('');
        console.log(`|${secIndex + 1}-${factIndex + 1}`);
        console.log('a|');
        for (let i in keys) {
          console.log(`* ${keys[i]}: ${l[i].no} ${l[i].label}`);
        }
        console.log('|');
        console.log('|');
        console.log('|');
        console.log('|');

        console.log('');
      });
    });

    console.log('|===');
  }
}

module.exports = Combinations;
