"use strict";
var mongoose = require('mongoose');

var options = {};
options.message = "{PATH} document not found in {MODEL} collection";
options.connection = mongoose;

function setOptions(_options) {

    ['message', 'connection'].forEach(function (field) {
        if (_options[field])
            options[field] = _options[field];
    });

}


function forSchema(schema, _options) {
    schema.eachPath(function (pathName, pathSchema) {

        if (pathSchema.schema) {
            return forSchema(pathSchema.schema, _options);
        }

        forPath(pathSchema, _options);
    });
}

function forPath(path, _options) {

    _options = _options || {};

    if (!(path && typeof path === 'object' && path.options && path.path))
        throw new Error("Invalid Mongoose Schema Path");

    var modelName;
    var validateFn;
    if (typeof path.options.ref === "string") {

        // this is an single object reference
        modelName = path.options.ref;
        validateFn = validateSingleDocument;

    } else if ((path.options.type instanceof Array) && (path.options.type.length !== 0) && (typeof path.options.type[0].ref === "string")) {

        // this is an array of references
        //
        modelName = path.options.type[0].ref;
        validateFn = validateArray;

    }

    if (validateFn) {
        var message = _options.message || options.message;
        message = message.replace("{MODEL}", modelName);
        var connection = _options.connection || options.connection;

        path.validate(function (value, respond) {
            validateFn(connection, modelName, value, respond);
        }, message);

    }

}


function validateSingleDocument(connection, modelName, value, respond, message) {
    if (value === null) {
        return respond(true);
    }
    var Model = connection.model(modelName);
    Model.count({
        _id: value
    }).exec(function (err, count) {
        if (err) {
            return respond(false);
        }
        return respond(count === 1);
    });
}

function validateArray(connection, modelName, values, respond, message) {
    if (values === null || values.length === 0) {
        return respond(true);
    }
    var Model = connection.model(modelName);
    Model.count({
        _id: {
            $in: values
        }
    }).exec(function (err, count) {
        if (err) {
            return respond(false);
        }
        return respond(count === values.length);
    });

}


module.exports.setOptions = setOptions;
module.exports.forPath = forPath;
module.exports.forSchema = forSchema;
