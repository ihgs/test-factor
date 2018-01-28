const FactorAnalysis = require('../src/factorAnalysis');

describe('FactorAnalysis', () => {
  test('load test', () => {
    const fa = new FactorAnalysis('./test/data/test1.adoc');
  });

  test('load error file', () => {
    const fa = new FactorAnalysis('./test/data/test1E.adoc');
  });
});
