import { spawn } from 'child_process';

type Language = 'AppleScript' | 'JavaScript';

interface SharedOptions {
  /**
   * Modify the output style.  The flags argument is a string consisting of any
   * of the modifier characters e, h, o, and s. Multiple modifiers can be
   * concatenated in the same string.
   *
   * The meanings of the modifier characters are as follows:
   *  - (h) Print values in human-readable form (default).
   *  - (s) Print values in recompilable source form.
   */
  flags?: string;
}

interface Options extends SharedOptions {
  /**
   * Override the language for any plain text files.  Normally, plain
   * text files are compiled as AppleScript.
   */
  language?: Language;
}

interface JXAOptions extends SharedOptions {
  /**
   * Parse the output result as JSON
   */
  json?: boolean;
}

interface TemplateStringFn<T> {
  (strings: TemplateStringsArray, ...values: any[]): Promise<T>;
}

function isTemplateString(value: any): value is TemplateStringsArray {
  return Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, 'raw');
}

function buildString(strings: ReadonlyArray<string>, values: ReadonlyArray<any>): string {
  let result = '';

  const totalStrings = strings.length;
  for (let i = 0; i < totalStrings; i++) {
    const value = i < totalStrings - 1 ? values[i] : '';
    result += strings[i] + value;
  }

  return result;
}

async function runScript<T>(strings: TemplateStringsArray, values: any[], options: Options & JXAOptions): Promise<T> {
  const script = buildString(strings, values);
  return new Promise((resolve, reject) => {
    let language: Language = 'AppleScript';
    if (options.language === 'JavaScript') {
      language = options.language;
    }

    const flags: string[] = [];
    if (typeof options.flags === 'string') {
      flags.push('-s', options.flags);
    }

    const child = spawn('osascript', ['-l', language, ...flags, '-e', script]);

    let errorString = '';
    child.stderr.on('data', error => {
      errorString += error.toString();
    });

    child.stderr.on('close', () => {
      reject(errorString);
    });

    child.stdout.on('data', data => {
      let output = data.toString().trim();
      console.log(output);
      if (options.json) {
        try {
          output = JSON.parse(output);
        } catch (error) {
          reject(error);
        }
      }
      resolve(output);
    });
  });
}

function osascript<T extends any = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T>;
function osascript<T extends any = any>(options: Options): TemplateStringFn<T>;
function osascript<T>(
  stringOrOptions: TemplateStringsArray | Options,
  ...valuesArray: any[]
): TemplateStringFn<T> | Promise<T> {
  if (isTemplateString(stringOrOptions)) {
    return runScript<T>(stringOrOptions, valuesArray, {});
  }

  return (strings: TemplateStringsArray, ...values: any[]) => {
    return runScript<T>(strings, values, stringOrOptions || {});
  };
}

function jxa<T extends any = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T>;
function jxa<T extends any = any>(options: JXAOptions): TemplateStringFn<T>;
function jxa<T>(
  stringOrOptions: TemplateStringsArray | JXAOptions,
  ...valuesArray: any[]
): TemplateStringFn<T> | Promise<T> {
  if (isTemplateString(stringOrOptions)) {
    return runScript<T>(stringOrOptions, valuesArray, {
      language: 'JavaScript',
    });
  }

  return (strings: TemplateStringsArray, ...values: any[]) => {
    return runScript<T>(strings, values, {
      language: 'JavaScript',
      ...stringOrOptions,
    });
  };
}

osascript.jxa = jxa;

export default osascript;
