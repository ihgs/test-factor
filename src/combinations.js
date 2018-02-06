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

  addAll() {
    const f = this.factors[this.factors.length - 1];
    f.factor.items.forEach(item => {
      f.target.push(item);
    });
  }

  addFirstNormal() {
    return this.addFirst(true);
  }

  addFirstAbnormal() {
    return this.addFirst(false);
  }

  addFirst(type) {
    const f = this.factors[this.factors.length - 1];
    const find = f.factor.items.find(item => {
      return item.normal == type;
    });
    if (!find) {
      const typeStr = type ? 'normal' : 'abnormal';
      throw new ParseException(`Not found ${typeStr} item:`);
    }
    f.target.push(find);
  }

  addItems(start, end) {
    const f = this.factors[this.factors.length - 1];
    let ok = false;
    const find = f.factor.items.some((item, index) => {
      if (item.no == start) {
        f.target.push(item);
        ok = true;
      } else if (ok && item.no == end) {
        f.target.push(item);
        return true;
      } else {
        if (ok) {
          f.target.push(item);
        }
      }
    });
    if (!find) {
      throw new ParseException(`Not found item:${start} or ${end}`);
    }
  }

  combinationList() {
    const fKey = [];
    const list = [];
    this.factors.forEach(fac => {
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
            } else if (ch == '*') {
              if (str != '') {
                throw new ParseException(`Invalid charactor:${str}${ch}`);
              }
              scenario.addAll();
              ch = line[++idx];
              if (ch == ',' || ch == undefined) {
                str = '';
                state = C_STATE.PARSE_FACTOR_KEY;
                break;
              }
              throw new ParseException(`Invalid charactor:${ch}`);
            } else if (ch == '.') {
              if (str != '') {
                throw new ParseException(`Invalid charactor:${str}${ch}`);
              }
              scenario.addFirstNormal();
              ch = line[++idx];
              if (ch == ',' || ch == undefined) {
                str = '';
                state = C_STATE.PARSE_FACTOR_KEY;
                break;
              }
              throw new ParseException(`Invalid charactor:${ch}`);
            } else if (ch == '-') {
              if (str != '') {
                throw new ParseException(`Invalid charactor:${str}${ch}`);
              }
              scenario.addFirstAbnormal();
              ch = line[++idx];
              if (ch == ',' || ch == undefined) {
                str = '';
                state = C_STATE.PARSE_FACTOR_KEY;
                break;
              }
              throw new ParseException(`Invalid charactor:${ch}`);
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
    const eol = require('os').EOL;
    let output = '';
    const addLine = str => {
      output += str + eol;
    };
    addLine('[cols="2,10,2,2,2,10"]');
    addLine('|===');
    addLine('| No. |  | Expected | Date | OK | Memo');

    this.scenarios.forEach((sce, secIndex) => {
      const { keys, list } = sce.combinationList();
      list.forEach((l, factIndex) => {
        addLine('');
        addLine(`|${secIndex + 1}-${factIndex + 1}`);
        addLine('a|');
        for (let i in keys) {
          addLine(`* ${keys[i]}: ${l[i].no} ${l[i].label}`);
          l[i].memo.forEach(m => {
            addLine(`${m}`);
          });
        }
        addLine('|');
        addLine('|');
        addLine('|');
        addLine('|');

        addLine('');
      });
    });
    addLine('|===');
    console.log(output);
  }
}

module.exports = Combinations;
