<h1 align="center">
  <img src="https://user-images.githubusercontent.com/2100222/57056048-ddcdd500-6c6d-11e9-8f69-e4c1d3eb4f24.png" width="76" alt="osascript-tag logo" />
  <br />
  osascript-tag
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/osascript-tag">
    <img src="https://img.shields.io/npm/v/osascript-tag.svg" alt="Current Release" />
  </a>
  <a href="https://travis-ci.org/wsmd/osascript-tag">
    <img src="https://travis-ci.org/wsmd/osascript-tag.svg?branch=master" alt="CI Build">
  </a>
  <a href="https://coveralls.io/github/wsmd/osascript-tag?branch=master">
    <img src="https://coveralls.io/repos/github/wsmd/osascript-tag/badge.svg?branch=master" alt="Coverage Status">
  </a>
  <a href="https://github.com/wsmd/osascript-tag/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/wsmd/osascript-tag.svg" alt="Licence">
  </a>
</p>

A JavaScript template literal tag that executes AppleScript and other OSA (Open Scripting Architecture) scripts.

Compatible with JXA (JavaScript for Automation).

## Why?

> Every time I get a script it's a matter of trying to know what I could do with it. I see colors, imagery. It has to have a smell. It's like falling in love. You can't give a reason why.
>
> — Paul Newman

## Installation

To get started, add `osascript-tag` to your project:

```
npm i --save osascript-tag
```

## Usage

### Running AppleScript

It can be used as template literal tag to asynchronously run an AppleScript within your code. It returns a promise that resolves with the output of the script, and rejects with an error if running the script was not successful.

```js
const osascript = require('osascript-tag');

async function main() {
  const result = await osascript`
    tell application "iTunes"
      get { artist, name } of current track
    end tell
  `;

  console.log(result); // "King Gizzard & The Lizard Wizard, This Thing"
}
```

### Running JXA (JavaScript for Automation)

To run a JXA (JavaScript for Automation) script, use the `osascript.jxa` template tag (also available as the named export: `jxa`) . Please note that `osascript.jxa` requires macOS 10.10 or greater.

```js
const osascript = require('osascript-tag');

async function main() {
  await osascript.jxa`
    const app = Application.currentApplication();

    app.includeStandardAdditions = true;

    app.displayNotification("All graphics have been converted.", {
      withTitle: "My Graphic Processing Script",
      subtitle: "Processing is complete.",
      soundName: "Glass",
    });
  `;
}
```

### Parsing Values Returned from JXA Scripts

By default all calls to `osascript.jxa` will resolve with the stdout result as a string.

If your script, however, is expected to return parsable values, you can pass a `parse` option to `osascript.jxa` to return parsed values ready for consumption in your JavaScript code.

```js
const osascript = require('osascript-tag');

async function main() {
  const { artist, title } = await osascript.jxa({ parse: true })`
    const iTunes = Application('iTunes');
    return {
      artist: iTunes.currentTrack.artist(),
      title: iTunes.currentTrack.name(),
    }
  `;

  console.log(artist); // "King Gizzard & The Lizard Wizard"
  console.log(title); // "This Thing"
}
```

## API

The `osascript-tag` can be used in one of the following ways:

- [`osascript`](#osascript)
- [`osascript(options: Options)`](#osascriptoptions-options)
- [`osascript.jxa`](#osascriptjxa)
- [`osascript.jxa(options: JXAOptions)`](#osascriptjxaoptions-jxaoptions)

### `osascript`

Executes an AppleScript.

##### Example

```js
osascript`
  tell application "Finder"
    name of every file of the desktop
  end tell
`;
```

##### Arguments

1. `script: string` - A string repressing the AppleScript code to execute
2. `...replacements: any[]` - The replacements values

##### Returns

A `Promise` that resolves with the script's standard output, or rejects with an error if the scripts was not successful.

### `osascript(options: Options)`

Executes an AppleScript with custom options.

##### Example

```js
osascript({ flags: 'so' })`
  tell application "Finder"
    name of every file of the desktop
  end tell
`;
```

##### Arguments

1. `options: Options` - An object with the following keys:
   - `flags?: string` - The flags used to modify the output of the script. It is a string consisting of any of the of the modifier characters `e`, `h`, `o`, and `s`. Defaults to `"eh"`. The meanings of the modifier characters are as follows:
     - `h` Return values in human-readable form (default).
     - `s` Return values in recompilable source form.
     - `e` Redirect script errors to stderr (default)
     - `o` Redirect script errors to stdout.
   - `language?: string` - The language of the OSA script to be executed. Defaults to `"AppleScript"`.

##### Returns

An instance of [`osascript`](#osascript) configured with the provided options.

### `osascript.jxa`

A convenient wrapper for `osascript` pre-configured to run JXA.

##### Example

```js
osascript.jxa`
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  app.displayAlert('This is a message');
`;
```

##### Returns

An instance of [`osascript`](#osascript) configured to run JXA.

### `osascript.jxa(options: JXAOptions)`

Executes a JXA script with custom options.

##### Example

```js
osascript.jxa({ parse: true })`
  const app = Application('iTunes');
  return {
    artist: app.currentTrack.artist(),
    title: app.currentTrack.name(),
  };
`;
```

##### Arguments

1. `options: JXAOptions` - An object with the following keys:
   - `flags?: string` - The flags used to modify the output of the script. It is a string consisting of any of the of the modifier characters `e`, `h`, `o`, and `s`. Defaults to `"eh"`. The meanings of the modifier characters are as follows:
     - `h` Return values in human-readable form (default).
     - `s` Return values in recompilable source form.
     - `e` Redirect script errors to stderr (default)
     - `o` Redirect script errors to stdout.
   - `parse?: boolean` - A boolean indicating whether the standard output of the script is parsed for consumption in JavaScript. This uses `JSON.parse` under the hood. **Note that setting this option to true, will automatically set the `flags` option to `"se"`**. Defaults to `false`.
   - `argv?: any[]` - An array of arguments to be passed to the script. This array will be available in the JXA script text as a global variable `argv`. Please note that all values will be serialized to strings.

##### Returns

An instance of [`osascript`](#osascript) configured to run JXA with custom options.

## Licence

MIT
