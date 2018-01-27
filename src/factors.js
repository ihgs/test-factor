class Item {
  constructor(no, type, label) {
    this.no = no;
    this.normal = type == '.';
    this.label = label;
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
  getItem(no) {
    return this.items.find(function(o) {
      return o.no == no;
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

  getFactor(key) {
    return this.factorlist.find(function(o) {
      return o.key == key;
    });
  }
}

module.exports = Factors;
