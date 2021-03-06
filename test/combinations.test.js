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
  4- とてもながい
  5- 全角文字
C: onlyNormal
  1. 数字
  2. アルファベット
D: onlyAbnormal
  1- 数字
  2- アルファベット
`;
  const f = new Factors();
  input.split('\n').forEach(function(line) {
    f.add(line);
  });
  return f;
}

function factorData2() {
  const input = `
A: userId
  1- 入力なし
  2. 正しい値
  3- 100文字
B: password
  1. 正しい値
  2- 入力なし
  3- 間違った値
  4- とてもながい
  5- 全角文字
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
A:[1-3],B:1
A:[2-3],B:[1-3,5]
A:*,B:1
---
`;

    const expectData = [
      [2, { A: ['1'], B: ['1'] }],
      [2, { A: ['1'], B: ['2', '3'] }],
      [2, { A: ['2', '3'], B: ['1'] }],
      [2, { A: ['1', '2', '3'], B: ['1'] }],
      [2, { A: ['2', '3'], B: ['1', '2', '3', '5'] }],
      [2, { A: ['1', '2', '3'], B: ['1'] }]
    ];

    const c = new Combinations(factorData());
    input.split('\n').forEach(function(line) {
      c.add(line);
    });

    expect(c.scenarios.length).toBe(expectData.length);
    expectData.forEach((ed, index) => {
      const sce = c.scenarios[index];
      expect(sce.factors.length).toBe(ed[0]);
      sce.factors.forEach(function(fac, index) {
        const nos = fac.target.map(function(t) {
          return t.no;
        });
        expect(nos).toEqual(ed[1][fac.factor.key]);
      });
    });
  });

  test('parse error line', () => {
    const input = `A:[1,2]a,B:1
A:[1,4],B:1
A:[1,2],Z:1
A:[1-100]
B:[0-3]
B:*1
B:1*
A:1.
A:.1
A:1-
A:-1
C:-
D:.`;
    const c = new Combinations(factorData());
    input.split('\n').forEach(function(line) {
      expect(() => {
        c.add(line);
      }).toThrowError(ParseException);
    });
  });

  test('show output table', () => {
    const input = `
    ---
    A:1,B:1
    A:1, B:[2,3]
    A:[2,3],B:1
    ---
    `;
    const c = new Combinations(factorData());
    input.split('\n').forEach(function(line) {
      c.add(line);
    });
    c.outputTable();
  });

  test('parse combination with special character', () => {
    const input = `
---
A:.,B:.
A:-,B:-
---
`;
    const expectData = [
      [2, { A: ['2'], B: ['1'] }],
      [2, { A: ['1'], B: ['2'] }]
    ];

    const c = new Combinations(factorData2());
    input.split('\n').forEach(function(line) {
      c.add(line);
    });

    expect(c.scenarios.length).toBe(expectData.length);
    expectData.forEach((ed, index) => {
      const sce = c.scenarios[index];
      expect(sce.factors.length).toBe(ed[0]);
      sce.factors.forEach(function(fac, index) {
        const nos = fac.target.map(function(t) {
          return t.no;
        });
        expect(nos).toEqual(ed[1][fac.factor.key]);
      });
    });
  });
});
