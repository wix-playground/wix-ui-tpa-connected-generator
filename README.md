# WIX UI TPA Connected Generator

This is part of _Wix UI TPA Connected_ project.

This module is capable of generating wrapper components on top of _WIX UI TPA_. These components are capable of connecting to application settings by simply providing connection configuration via props.

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

### Supported arguments

- **targetPath (p)** - location where to generate wrappers. This should be directory inside a Node.JS library which has wix-ui-tpa under _node_modules_.
- **tmp (t)** - location where to store temporary files during generation.

## Documentation

More detailed documentation is available under _./dist/docs_.
