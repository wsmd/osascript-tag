import { spawn } from 'child_process';
import osascript from '../lib';

jest.mock('child_process');

describe('osascript.jxa', () => {
  it('calls osascript with correct arguments', async () => {
    await osascript.jxa`test`;
    const expectedArgs = ['-l', 'JavaScript', '-e', '(function(...argv){test})()'];
    expect(spawn).toHaveBeenCalledWith('osascript', expectedArgs);
  });

  it('calls osascript with custom options', async () => {
    await osascript.jxa({ flags: 'oe', argv: ['foo', 1] })`test`;
    const expectedArgs = ['-l', 'JavaScript', '-s', 'oe', '-e', '(function(...argv){test})("foo",1)'];
    expect(spawn).toHaveBeenCalledWith('osascript', expectedArgs);
  });

  test('returns parsed result', async () => {
    spawn.__setOutput('{ "foo": 1, "bar": true, "baz": "baz"}');
    const result = await osascript.jxa({ parse: true })`test`;
    const expectedArgs = ['-l', 'JavaScript', '-s', 's', '-e', '(function(...argv){test})()'];
    expect(spawn).toHaveBeenCalledWith('osascript', expectedArgs);
    expect(result).toEqual({ foo: 1, bar: true, baz: 'baz' });
  });

  test('rejects when parsing fails', async () => {
    spawn.__setOutput('not_valid_json');
    try {
      await osascript.jxa({ parse: true })``;
    } catch (error) {
      expect(error.message).toBe('Unexpected token o in JSON at position 1');
    }
  });
});
