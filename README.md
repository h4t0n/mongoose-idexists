# mongoose-idexists

[![NPM Version][npm-image]][npm-url] [![Travis Build][travis-image]][travis-url]

> Mongoose plugin that checks if referenced documents actually exist.



## Usage

### Install
Simply run:
```
$ npm install mongoose-idexists --save
```

Then require it in your project
```javascript
var idexists = require('mongoose-idexists');
```

### Basic Usage (default mongoose connection)

If you use `idexists` without any further configuration, it uses the default mongoose connection.

You can add an `idexists` validator for each Schema paths you want by using `idexists.forPath(_the_mongose_path_object)`

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

Array of references are supported. So you can use.
```javascript
// Add the validator also to fans array
idexists.forPath(storySchema.path("fans"));

```

You can also recursively add a validator to all the Schema paths (that have references to other documents).
```javascript
// Let's add the validator to _creator and fans at the same time
idexists.forSchema(storySchema);

// As an alternative you can also use the mongoose plugin notation
storySchema.plugin(idexists.forSchema)

// both previous notation produce the same effects of
idexists.forPath(storySchema.path("_creator"));
idexists.forPath(storySchema.path("fans"));

```

After the Schema definition as usual you can create the mongoose model. The previous code works for default mongoose connection, so somewhere after configuration you have to use
```javascript
Story = mongoose.model('Story', storySchema);
Person = mongoose.model('Person', personSchema);
```

### Custom Connection
If you want to use a mongoose custom connection, you have to configure `idexists` options.

The easies and comfortable way is to setup the connection as a global `ìdexists` option, so it is used each time you use `forSchema` or `forPath` methods.

```javascript
// Let's configure ìdexists in order to use a custom configuration
// require the idexists plugin
var idexists = require('mongoose-idexists');

// during init phase
var connection = mongoose.createConnection(_url_);
idexists.setOptions({
    connection: connection
});

// after initialization you can use forPath and forSchema, that now use the custom connection
idexists.forPath(storySchema.path("_creator"));
```

You can also specify a custom connection exclusively for some paths.
```javascript
// during init phase
var connection = mongoose.createConnection(_url_);

// validator for _creator path uses the custom connection
idexists.forPath(storySchema.path("_creator",{
  connection: connection
});

// validator for fans path uses the default mongoose connection
// (or the one specified by init setOptions configuration)
idexists.forPath(storySchema.path("fans"));
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
[travis-image]: https://img.shields.io/travis/h4t0n/mongoose-idexists.svg
[travis-url]: https://travis-ci.org/h4t0n/mongoose-idexists
