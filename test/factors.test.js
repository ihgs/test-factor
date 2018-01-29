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
  6. have memo
    * memo1
    * memo2
  7. have memo2
    * memo1
      * memo2
---
`;
    const expectData = [
      ['1', '正しい値', true],
      ['2', '入力なし', false],
      ['3', '100文字', false],
      ['5', '105文字', true],
      ['6', 'have memo', true, ['  * memo1', '  * memo2']],
      ['7', 'have memo2', true, ['  * memo1', '    * memo2']]
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
      if (ed[3]) {
        expect(t.memo).toEqual(ed[3]);
      }
    });
  });
});
