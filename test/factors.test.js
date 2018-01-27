const Factors = require('../src/factors');

describe('Factors', () => {
  test('parse factor', () => {
    const input = `
---
A: userId
  1. 正しい値
  2- 入力なし
  3- 100文字
  5.    105文字
---
`;
    const expectData = [
      ['1', '正しい値', true],
      ['2', '入力なし', false],
      ['3', '100文字', false],
      ['5', '105文字', true]
    ];

    const f = new Factors();
    input.split('\n').forEach(function(line) {
      f.add(line);
    });
    fs = f.getFactor('A');

    expect(fs.items.length).toBe(expectData.length);
    expectData.forEach((ed, index) => {
      const t = fs.getItem(ed[0]);
      expect(t.no).toBe(ed[0]);
      expect(t.label).toBe(ed[1]);
      expect(t.normal).toBe(ed[2]);
    });
  });
});
