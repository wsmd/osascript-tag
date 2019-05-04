import { spawn } from 'child_process';
import osascript from '../lib';

jest.mock('child_process');

beforeEach(() => {
  Object.defineProperty(process, 'platform', { value: 'darwin' });
});

describe('osascript', () => {
  it('throws when not using macOS', () => {
    const original = process.platform;
    Object.defineProperty(process, 'platform', { value: 'lcars' });
    expect(osascript``).rejects.toThrowError('osascript-tag requires macOS');
  });

  it('calls osascript', async () => {
    try {
      await osascript`test`;
    } finally {
      expect(spawn).toHaveBeenCalledTimes(1);
    }
  });

  it('calls osascript with the default argument', async () => {
    await osascript`test`;
    // @ts-ignore
    await osascript()`test`;
    const expectedArgs = ['-l', 'AppleScript', '-e', 'test'];
    expect(spawn).toHaveBeenNthCalledWith(1, 'osascript', expectedArgs);
    expect(spawn).toHaveBeenNthCalledWith(2, 'osascript', expectedArgs);
  });

  it('calls osascript with custom argument', async () => {
    await osascript({ flags: 'eh', language: 'JavaScript' })`test`;
    const expectedArgs = ['-l', 'JavaScript', '-s', 'eh', '-e', expect.stringContaining('test')];
    expect(spawn).toHaveBeenCalledWith('osascript', expectedArgs);
  });

  it('resolves with the script stdout', () => {
    spawn.__setOutput('result');
    expect(osascript`test`).resolves.toBe('result');
  });

  it('rejects with the script stderr', () => {
    spawn.__setOutput(null, 'error');
    expect(osascript`test`).rejects.toBe('error');
  });

  it('rejects with on child process error', () => {
    spawn.__emitError('error');
    expect(osascript`test`).rejects.toBe('error');
  });

  it('builds template strings', async () => {
    await osascript`foo ${'bar'}`;
    expect(spawn).toHaveBeenCalledWith('osascript', expect.arrayContaining(['foo bar']));
  });
});
