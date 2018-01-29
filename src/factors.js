class Item {
  constructor(no, type, label) {
    this.no = no;
    this.normal = type == '.';
    this.label = label;
    this.memo = [];
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
    return this.items.find(o => {
      return o.no == no;
    });
  }
  addMemo(memo) {
    this.items[this.items.length - 1].memo.push(memo);
  }
}

class Factors {
  constructor() {
    this.factorlist = [];
    this.maxItemSize = 0;
    this.factorIndent = 0;
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
      this.factorIndent = 0;
      return;
    }
    if (this.factorIndent != 0) {
      const matchIndent = line.match(/^(\s+).*$/);
      if (matchIndent) {
        if (matchIndent[1].length > this.factorIndent) {
          this.factor.addMemo(line.slice(this.factorIndent));
          return;
        }
      }
    }
    const matchItem = line.match(/^(\s+)(\d+)([.-])\s+(.*)$/);
    if (matchItem) {
      this.factor.addItem(matchItem[2], matchItem[3], matchItem[4]);
      this.factorIndent = matchItem[1].length;
      return;
    }
  }

  getFactor(key) {
    return this.factorlist.find(o => {
      return o.key == key;
    });
  }
}

module.exports = Factors;
