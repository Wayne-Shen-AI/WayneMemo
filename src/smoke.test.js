/**
 * Smoke Test - 验证测试环境能跑通
 */

describe('Smoke Test', () => {
  test('environment is working', () => {
    expect(true).toBe(true);
  });

  test('basic math works', () => {
    expect(1 + 1).toBe(2);
  });
});
