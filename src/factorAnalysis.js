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
    }
    const matchItem = line.match(/^\s+(\d+)([.-])\s+(.*)$/);
    if (matchItem) {
      this.factor.addItem(matchItem[1], matchItem[2], matchItem[3]);
    }
  }

  out() {
    this.factorlist.forEach(function(factor) {
      factor.out();
    });
  }
}

class FactorAnalysis {
  constructor(filepath, options = {}) {
    var contents = fs.readFileSync(filepath);
    var factor = undefined;
    contents
      .toString()
      .split('\n')
      .forEach(function(line) {
        if (line == '[factor]') {
          factor = new Factors();
        } else {
          if (factor) {
            if (factor.add(line)) {
              factor.out();
              factor = undefined;
            }
          }
        }
      });
  }
}
module.exports = FactorAnalysis;
