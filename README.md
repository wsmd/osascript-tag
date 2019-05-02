<h1 align="center">
  <img src="https://user-images.githubusercontent.com/2100222/57056048-ddcdd500-6c6d-11e9-8f69-e4c1d3eb4f24.png" width="84" alt="osascript-tag logo" />

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

`osascript-tag` is a JavaScript template literal tag that executes AppleScript and other OSA languages.

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

```js
const osascript = require('osascript-tag');

async function main() {
  try {
    const result = await osascript`
      tell application "iTunes"
        get properties of current track
      end tell
    `;
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
```

### Running JXA (JavaScript for Automation)

```js
const osascript = require('osascript-tag');

async function main() {
  try {
    const result = await osascript.jxa({ flags: 's', json: true })`
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      const lang = app.chooseFromList(
        ["applescript", "javascript", "typescript"],
        {
          withPrompt: "What is your favorite language?",
          multipleSelectionsAllowed: true
        }
      );
      lang;
    `;
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
```

## API

## Licence

MIT
