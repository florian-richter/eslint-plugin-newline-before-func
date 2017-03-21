# eslint-plugin-newline-before-func

[![npm version](https://img.shields.io/npm/v/eslint-plugin-newline-before-func.svg)](https://www.npmjs.com/package/eslint-plugin-newline-before-func)
[![Downloads/month](https://img.shields.io/npm/dm/eslint-plugin-newline-before-func.svg)](http://www.npmtrends.com/eslint-plugin-newline-before-func)

Enforce putting an empty line before a line containing a named function

## Install & Usage

```
> npm install eslint eslint-plugin-newline-before-func --save-dev
```

**.eslintrc.json** (An example)

```json
{
    "plugins": [
        "newline-before-func"
    ],
    "extends": [
        "eslint:recommended"
    ],
    "rules": {
        "newline-before-func/newline-before-func": "warn",
    }
}
```

## Rules
| Fixable  | Rule ID                                | Description                                   |
|:--------:|:---------------------------------------|:----------------------------------------------|
| ✅ | newline-before-func                    | Functions should be seperated by a newline.   |


## :muscle: Contributing

Feel free to open issues or create PRs.
