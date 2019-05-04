/* tslint:disable variable-name */

import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

const spawn: jest.Mock<ChildProcess> & typeof mockMethods = jest.fn() as any;

beforeEach(() => spawn.__setOutput('default_stdout'));
afterEach(() => spawn.mockReset());

function createStream(value?: string | null) {
  return new Readable({
    read() {
      if (value != null) {
        this.push(Buffer.from(value));
        this.destroy();
      }
    },
  });
}

const mockMethods = {
  __emitError(error?: any) {
    const child = new EventEmitter() as ChildProcess;
    spawn.mockImplementation(() => {
      child.stdout = createStream();
      child.stderr = createStream();
      process.nextTick(() => child.emit('error', error));
      return child;
    });
  },
  __setOutput(stdoutData: string | null, stderrData?: string) {
    const child = new EventEmitter() as ChildProcess;
    const close = () => child.emit('close');
    spawn.mockImplementation(() => {
      child.stdout = createStream(stdoutData).on('close', close);
      child.stderr = createStream(stderrData).on('close', close);
      return child;
    });
  },
};

declare module 'child_process' {
  namespace spawn {
    export const __setOutput: typeof mockMethods['__setOutput'];
    export const __emitError: typeof mockMethods['__emitError'];
  }
}

Object.assign(spawn, mockMethods);

export { spawn };
