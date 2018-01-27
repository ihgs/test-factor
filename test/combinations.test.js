const Factors = require('../src/factors');
const Combinations = require('../src/combinations');
const { ParseException } = require('../src/exceptions');

function factorData() {
  const input = `
A: userId
  1. 正しい値
  2- 入力なし
  3- 100文字
B: password
  1. 正しい値
  2- 入力なし
  3- 間違った値
`;
  const f = new Factors();
  input.split('\n').forEach(function(line) {
    f.add(line);
  });
  return f;
}

describe('Combinations', () => {
  test('parse combination', () => {
    const input = `
---
A:1,B:1
A:1, B:[2,3]
A:[2,3],B:1
---
`;

    const expectData = [
      [2, { A: ['1'], B: ['1'] }],
      [2, { A: ['1'], B: ['2', '3'] }],
      [2, { A: ['2', '3'], B: ['1'] }]
    ];

    const c = new Combinations(factorData());
    input.split('\n').forEach(function(line) {
      c.add(line);
    });

    expect(c.scenarios.length).toBe(3);
    expectData.forEach((ed, index) => {
      const sce = c.scenarios[index];
      expect(sce.factors.length).toBe(ed[0]);
      sce.factors.forEach(function(fac, index) {
        expect(fac.target).toEqual(ed[1][fac.factor.key]);
      });
    });
  });

  test('parse error line', () => {
    const testFunc = function() {
      const input = `
---
A:[1,2]a,B:1
---`;
      const c = new Combinations(factorData());
      input.split('\n').forEach(function(line) {
        c.add(line);
      });
    };

    expect(testFunc).toThrowError(ParseException);
  });
});
