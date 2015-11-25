"use strict";

var mongoose = require('mongoose');
var idexists = require('../');
var expect = require('chai').expect;

var Schema = mongoose.Schema;

var url = 'mongodb://127.0.0.1:27017/mongoose-id-validator';

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

describe("[mongoose-idexists] default mongoose connection and messages", function () {

    var Story;
    var Person;



    describe("forPath method", function () {

        before(function (done) {
            idexists.forPath(storySchema.path("fans"));
            idexists.forPath(storySchema.path("_creator"));
            Story = mongoose.model('Story', storySchema);
            Person = mongoose.model('Person', personSchema);
            mongoose.connect(url, done);
        });

        after(function (done) {
            mongoose.disconnect(done);
        });

        _innerItTests();

    });

    describe("forSchema method", function () {


        before(function (done) {
            idexists.forSchema(storySchema);
            Story = mongoose.model('Story', storySchema);
            Person = mongoose.model('Person', personSchema);
            mongoose.connect(url, done);
        });

        after(function (done) {
            mongoose.disconnect(done);
        });

        _innerItTests();

    });

    describe("forSchema used ad plugin", function () {


        before(function (done) {
            storySchema.plugin(idexists.forSchema);
            Story = mongoose.model('Story', storySchema);
            Person = mongoose.model('Person', personSchema);
            mongoose.connect(url, done);
        });

        after(function (done) {
            mongoose.disconnect(done);
        });

        _innerItTests();

    });

    function _innerItTests() {

        it('should pass validation for null _creator and empty fans array', function (done) {
            new Person({
                    name: "Andrea"
                }).save()
                .then(function (ps) {
                    return new Story({}).save();
                })
                .then(function (ss) {
                    done();
                }, function (err) {
                    done(err);
                });
        });

        it('should pass validation for valid _creator id and empty fans array', function (done) {

            new Person({
                    name: "Andrea"
                }).save()
                .then(function (ps) {
                    return new Story({
                        _creator: ps._id
                    }).save();
                })
                .then(function (ss) {
                    done();
                }, function (err) {
                    done(err);
                });

        });

        it('should pass validation for valid stories array ids and null _creator', function (done) {

            var p_id = [];

            new Person({
                name: "Andrea"
            }).save().
            then(function (p0) {
                p_id[0] = p0._id;
                return new Person({
                    name: "Mario"
                }).save();
            }).
            then(function (p1) {
                p_id[1] = p1._id;
                return new Story({
                    fans: p_id
                }).save();
            }).
            then(function (ss) {
                done();
            }, function (err) {
                done(err);
            });

        });

        it('should pass validation for valid stories array ids and valid _creator', function (done) {

            var p_id = [];

            new Person({
                name: "Andrea"
            }).save().
            then(function (p0) {
                p_id[0] = p0._id;
                return new Person({
                    name: "Mario"
                }).save();
            }).
            then(function (p1) {
                p_id[1] = p1._id;
                return new Story({
                    _creator: p_id[0],
                    fans: p_id
                }).save();
            }).
            then(function (ss) {
                done();
            }, function (err) {
                done(err);
            });

        });

        it('should not pass validation for invalid _creator id and empty fans array', function (done) {

            new Story({
                _creator: mongoose.Types.ObjectId()
            }).save(function (err, s) {
                expect(err).to.exist;
                expect(err.name).to.equal("ValidationError");
                expect(err.errors._creator.message).to.equal("_creator document not found in Person collection");
                done();
            });

        });

        it('should not pass validation for stories array with not existent id and null _creator', function (done) {

            var p_id = [];

            new Person({
                name: "Andrea"
            }).save().
            then(function (p0) {
                p_id[0] = p0._id;
                return new Person({
                    name: "Mario"
                }).save();
            }).
            then(function (p1) {
                p_id[1] = p1._id;
                p_id[2] = mongoose.Types.ObjectId();
                return new Story({
                    fans: p_id
                }).save();
            }).
            then(function (ss) {
                done();
            }, function (err) {
                expect(err).to.exist;
                expect(err.name).to.equal("ValidationError");
                expect(err.errors.fans.message).to.equal("fans document not found in Person collection");
                done();
            });

        });

        it('should not pass validation for stories array with not existent id and not existent _creator', function (done) {

            var p_id = [];

            new Person({
                name: "Andrea"
            }).save().
            then(function (p0) {
                p_id[0] = p0._id;
                return new Person({
                    name: "Mario"
                }).save();
            }).
            then(function (p1) {
                p_id[1] = p1._id;
                p_id[2] = mongoose.Types.ObjectId();
                return new Story({
                    _creator: mongoose.Types.ObjectId(),
                    fans: p_id
                }).save();
            }).
            then(function (ss) {
                done();
            }, function (err) {
                expect(err).to.exist;
                expect(err.name).to.equal("ValidationError");
                expect(err.errors._creator.message).to.equal("_creator document not found in Person collection");
                expect(err.errors.fans.message).to.equal("fans document not found in Person collection");
                done();
            });

        });

    }

});

describe("[mongoose-idexists] custom connection with custom messages", function () {

    var Story;
    var Person;
    var connection;


    before(function (done) {
        connection = mongoose.createConnection(url + "-other");
        idexists.setOptions({
            connection: connection
        });
        connection.on('connected', done);
    });


    before(function (done) {
        idexists.setOptions({
            message: "custom Message {MODEL}"
        });
        idexists.forPath(storySchema.path("fans"));
        idexists.forPath(storySchema.path("_creator"));
        Story = connection.model('Story', storySchema);
        Person = connection.model('Person', personSchema);
        done();
    });

    after(function (done) {
        connection.close(done);
    });

    it('should not pass validation for stories array with not existent id and not existent _creator', function (done) {

        var p_id = [];

        new Person({
            name: "Andrea"
        }).save().
        then(function (p0) {
            p_id[0] = p0._id;
            return new Person({
                name: "Mario"
            }).save();
        }).
        then(function (p1) {
            p_id[1] = p1._id;
            p_id[2] = mongoose.Types.ObjectId();
            return new Story({
                _creator: mongoose.Types.ObjectId(),
                fans: p_id
            }).save();
        }).
        then(function (ss) {
            done();
        }, function (err) {
            expect(err).to.exist;
            expect(err.name).to.equal("ValidationError");
            expect(err.errors._creator.message).to.equal("custom Message Person");
            expect(err.errors.fans.message).to.equal("custom Message Person");
            done();
        });

    });


});

describe("[mongoose-idexists] optional connection with optional messages", function () {

    var Story;
    var Person;
    var connection;


    before(function (done) {
        connection = mongoose.createConnection(url + "-other2");
        connection.on('connected', done);
    });


    before(function (done) {
        idexists.forPath(storySchema.path("fans"), {
            message: "another custom Message {MODEL}",
            connection: connection
        });
        idexists.forPath(storySchema.path("_creator"), {
            connection: connection
        });
        Story = connection.model('Story', storySchema);
        Person = connection.model('Person', personSchema);
        done();
    });

    after(function (done) {
        connection.close(done);
    });

    it('should not pass validation for stories array with not existent id and not existent _creator', function (done) {

        var p_id = [];

        new Person({
            name: "Andrea"
        }).save().
        then(function (p0) {
            p_id[0] = p0._id;
            return new Person({
                name: "Mario"
            }).save();
        }).
        then(function (p1) {
            p_id[1] = p1._id;
            p_id[2] = mongoose.Types.ObjectId();
            return new Story({
                _creator: mongoose.Types.ObjectId(),
                fans: p_id
            }).save();
        }).
        then(function (ss) {
            done();
        }, function (err) {
            expect(err).to.exist;
            expect(err.name).to.equal("ValidationError");
            expect(err.errors.fans.message).to.equal("another custom Message Person");
            done();
        });

    });

});

describe("[mongoose-idexists] path error", function () {

    it("shoudl throw an Exception when the path is invalid", function (done) {

        try {
            idexists.forPath("invalid_path");
            done(new Error("it should throw an Invalid Mongoose Schema Path"));
        } catch (err) {
            expect(err.message).to.equal("Invalid Mongoose Schema Path");
        }

        try {
            idexists.forPath();
            done(new Error("it should throw an Invalid Mongoose Schema Path"));
        } catch (err) {
            expect(err.message).to.equal("Invalid Mongoose Schema Path");
        }

        try {
            idexists.forPath({});
            done(new Error("it should throw an Invalid Mongoose Schema Path"));
        } catch (err) {
            expect(err.message).to.equal("Invalid Mongoose Schema Path");
            done();
        }

    });

});
