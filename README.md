# WIX UI TPA Connected Generator

This is part of _Wix UI TPA Connected_ project.

This module is capable of generating wrapper components on top of _WIX UI TPA_. Connected components use styles from application settings by simply using connection configuration passed via props.

## CLI usage

Print usage help:

```
wutc-generator help
```

Generate wrapper components in CWD:

```
wutc-generator generate
```

Generate wrapper components in provided path:

```
wutc-generator -p /custom/path generate
```

**Supported arguments:**

- **targetPath (p)** - location where to generate wrappers. This should be root directory of a library.
- **tmp (t)** - location where to store temporary files during generation.

**Target project has to have following dev dependencies installed in order for generation to work:**

- @stylable/webpack-plugin
- react
- react-dom
- webpack
- webpack-cli
- wix-ui-tpa
- svg-inline-loader

Intended target during development of this module was root directory of _wix-ui-tpa-connected_ module.

## Documentation

More detailed documentation is available under _./dist/docs_.

## Next Steps for Contributors

### Progress Logging

Currently there is no output into console which would reflect progress of component generation.
Intention was to implement it in a similar way like here: https://github.com/vytenisu/npm-dts/blob/master/lib/log.ts/

Winston (or similar library) would allow to format and direct log wherever it would be needed going forward.

Also, the way WebPack is currently integrated - it does not forward its output to "stdout" and "stderr". This needs to be investigated and improved.

### Error Handling

In case of errors - there is currently not enough information about what happened. Errors commonly indicate things like unhandled promise rejections and similar situations not carrying enough information for debugging.

**Temporary work-arounds would be:**

- run tests and look for any failures
- build module using "npm run buildDev" to get more output
- run WebPack manually to see WebPack issues in more detail. This can be done by executing "./node_modules/.bin/webpack --config ./cache/......../webpack.config.js"

### Declaration Files

There were several attempts to generate declaration files which were temporarily abandoned in order to save time to produce working e2e solution:

- Currently wrappers are being generated from JS - not from TS files. Tried generating from TS which would in theory allow generating declaration files together with output. However, this requires using component prop types from inside "wix-ui-tpa". These types did not seem to be exported. As a result - props become of type "any" and declaration file cannot generate useful type information from that.
- Considered copying and altering original typing files. However, there are imports and structure of typings may vary. This makes it difficult to implement.
- Considered parsing original typings and generating new ones from scratch. During brief investigation did not find a suitable tool to generate AST for declaration files.

Ideal approach would be to export property types from "wix-ui-tpa". Then, it would become possible to generate wrappers using TypeScript. This would allow generating declaration files without using hacks.

### Timeouts during tests

Sometimes tests hang for a long time - then fail due to timeout. Tests are performing actual builds and verifying outputs. It looks like WebPack is sometimes not finishing operation for a long time. When tests are re-run, it seems as if WebPack is using some cache and builds execute quickly.

Actual build seems to work well every time. Issue seems to only be happening on tests.

Temporary work-around is implemented to restart tests several times until they succeed.
