var ObjectID = require('mongodb').ObjectID //equivalent of "primary key"

// Constructor method, store a MongoDB client instance for later use.
CollectionDriver = function(db) {
	this.db = db;
};

//defines helper method getCollection
//you can define class methods by adding functions to "prototype"
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};

//gets the collection, and calls find() on it if there is no error
//find() returns a data cursor that can be used to iterate over the matching objects
//toArray() organizes all the results in an array and passes it to the callback
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

//A "get" obtains a single item from a collection by its _id.
//C ObjectID() takes a string and turns it into a BSON ObjectID to match against the collection
//B Regex check up front, because ObjectID() is "persnickety"
// The selector {'_id':ObjectID(id)} matches the _id field exactly against the supplied id.
CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) { 
    this.getCollection(collectionName, function(error, the_collection) { //A - retrieves the collection object
      if( error ) callback(error)
      else {
        obj.created_at = new Date(); //B - takes the supplied entity and adds a field to record the date it was created
        the_collection.insert(obj, function() { //C - insert modified object into the collection. auto adds _id to the object
          callback(null, obj);
        });
      }
    });
};

//update a specific object. 
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            obj._id = ObjectID(entityId); //A convert to a real obj id - assume body's _id is the same as specified in the route
            obj.updated_at = new Date(); //B - add updated_at field with the time the object is modified (good idea for understanding how data changes later in app lifecycle)
            the_collection.save(obj, function(error,doc) { //C - takes an object and updates it in the collection using collectionDriver's save() method
                if (error) callback(error);
                else callback(null, obj);
            });
        }
    });
};

//delete a specific object - operates the same way, fetches collection object in line A then calls remove() with supplied id in line B.
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error);
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { //B
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};


// Declares the exposed, or exported, entities to other applications that list 
//collectionDriver.js as a required module

exports.CollectionDriver = CollectionDriver;