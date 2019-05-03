import * as ChildProcess from 'child_process';

type Language = 'AppleScript' | 'JavaScript';

interface SharedOptions {
  /**
   * Modify the output style.  The flags argument is a string consisting of any
   * of the modifier characters e, h, o, and s. Multiple modifiers can be
   * concatenated in the same string.
   *
   * The meanings of the modifier characters are as follows:
   *  - (h) Return values in human-readable form (default).
   *  - (s) Return values in recompilable source form.
   *  - (e) Redirect script errors to stderr (default)
   *  - (o) Redirect script errors to stdout.
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
  parse?: boolean;
  /**
   * The arguments to pass to the JXA script
   */
  argv?: any[];
}

interface TemplateStringFn<T> {
  (strings: TemplateStringsArray, ...values: any[]): Promise<T>;
}

function isTemplateString(value: any): value is TemplateStringsArray {
  return Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, 'raw');
}

function buildString(strings: ReadonlyArray<string>, replacements: ReadonlyArray<any>): string {
  let result = '';

  const totalStrings = strings.length;
  for (let i = 0; i < totalStrings; i++) {
    const value = i < totalStrings - 1 ? replacements[i] : '';
    result += strings[i] + value;
  }

  return result.trim();
}

function runScript<T>(strings: TemplateStringsArray, replacements: any[], options: Options & JXAOptions): Promise<T> {
  if (process.platform !== 'darwin') {
    return Promise.reject(new Error('osascript-tag requires MacOS'));
  }
  return new Promise((resolve, reject) => {
    const argv: any[] = options.argv || [];
    let flags: ['-s', string] = [] as any;
    let script = buildString(strings, replacements);
    let language: Language = 'AppleScript';

    if (options.language === 'JavaScript') {
      language = options.language;
      script = `
        (function(...argv){
          ${script}
        })(${argv.map(value => JSON.stringify(value))})
      `;
    }

    if (options.parse) {
      flags = ['-s', 's'];
    }

    if (typeof options.flags === 'string') {
      flags = ['-s', options.flags];
    }

    const child = ChildProcess.spawn('osascript', ['-l', language, ...flags, '-e', script]);

    let errorString = '';
    child.stderr.on('data', error => {
      errorString += error.toString();
    });

    let dataString = '';
    child.stdout.on('data', data => {
      dataString += data.toString();
    });

    child.on('close', () => {
      if (errorString) {
        reject(errorString);
      } else {
        let result = dataString;
        if (options.parse) {
          try {
            result = JSON.parse(dataString);
          } catch (error) {
            reject(error);
          }
        }
        resolve(result as any);
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

function osascript<T extends any = any>(script: TemplateStringsArray, ...replacements: any[]): Promise<T>;
function osascript<T extends any = any>(options: Options): TemplateStringFn<T>;
function osascript<T>(
  scriptOrOptions: TemplateStringsArray | Options,
  ...replacementsArray: any[]
): TemplateStringFn<T> | Promise<T> {
  if (isTemplateString(scriptOrOptions)) {
    return runScript<T>(scriptOrOptions, replacementsArray, {});
  }
  return (script: TemplateStringsArray, ...replacements: any[]) => {
    return runScript<T>(script, replacements, scriptOrOptions || {});
  };
}

export function jxa<T extends any = any>(script: TemplateStringsArray, ...replacements: any[]): Promise<T>;
export function jxa<T extends any = any>(options: JXAOptions): TemplateStringFn<T>;
export function jxa<T>(
  scriptOrOptions: TemplateStringsArray | JXAOptions,
  ...replacementsArray: any[]
): TemplateStringFn<T> | Promise<T> {
  if (isTemplateString(scriptOrOptions)) {
    return runScript<T>(scriptOrOptions, replacementsArray, {
      language: 'JavaScript',
    });
  }

  return (strings: TemplateStringsArray, ...replacements: any[]) => {
    return runScript<T>(strings, replacements, {
      language: 'JavaScript',
      ...scriptOrOptions,
    });
  };
}

osascript.jxa = jxa;

export default osascript;
