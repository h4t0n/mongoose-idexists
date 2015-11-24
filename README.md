# mongoose-idexists

[![NPM Version][npm-image]][npm-url]

> Mongoose plugin that checks if referenced documents actually exist.



## Usage

Install the plugin via npm:
```
$ npm install mongoose-idexists
```

Then you can add a `idexists` validator for the Schema paths want.

```javascript
// require the idexists plugin
var idexists = require('mongoose-idexists');

// Let's define some schemas with ref fields
var personSchema = new Schema({
    name: String,
});

var storySchema = new Schema({
    _creator: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
    },
    fans: [{
        type: Schema.Types.ObjectId,
        ref: 'Person'
    }]
});

// Let's add the validator only to the _creator path
idexists.forPath(storySchema.path("_creator"));

```

You can also recursively add a validator to all the Schema paths (that has reference to other documents).
```javascript
// Let's add the validator to _creator and fans at the same time
idexists.forSchema(storySchema);

// You can also use the mongoose plugin notation
storySchema.plugin(idexists.forSchema)

```

## Test
Tests require a local mongodb database running with default configuration.

```
$ npm test
```

## License

MIT © [Andrea Tarquini](https://blog.h4t0n.com)

[npm-image]: https://img.shields.io/npm/v/mongoose-idexists.svg
[npm-url]: https://www.npmjs.com/package/mongoose-idexists
