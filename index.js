//1
var http = require('http'),
			express = require('express'),
			path = require('path');

//Here you include the MongoClient and Server objects from 
//the MongoDB module along with your newly created CollectionDriver.			
MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;			

//2 			
var app = express();
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
app.set('port', port);
app.set('views', path.join(__dirname, 'views')); // where the view templates live
app.set('view engine', 'jade'); // sets the view engine to jade

// Putting this call first makes sure that the body parsing will be called before the other route handlers.
// Now req.body can be passed directly to the driver code as a JavaScript object
app.use(express.bodyParser()); // tells express to parse the incoming body data; if it's JSON, then create a JSON object

var mongoHost = '127.0.0.1'; //A - assume MongoDB instance is running locally on 27017. Modify these values
//	we are planning on running it elsewhere...
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(ip, mongoPort)); //B - creates a new MongoClient
mongoClient.open(function(err, mongoClient) { //C - calls open to attempt to establish a connection, if it fails prob haven't started the MongoDB server
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D - ... if connection is absent
  }
  var db = mongoClient.db("MyDatabase");  //E - opens database if connection is successful
  collectionDriver = new CollectionDriver(db); //F - create CollectionDriver object and pass in a handle to the MongoDB client
});

app.use(express.static(path.join(__dirname, 'public'))); // for use with the "public" folder, contains resume HTML

app.get('/:collection', function(req, res) { //A - will match any first-lvel path store in B due to ":"
   var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C - defines endpoint to match any URL to a MongoDB collection
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E - if successful, check that the request accepts an HTML result in the header
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F - store the rendered HTML from data.jade in response (presents contents of collection in an HTML table)
              } else {
	          res.set('Content-Type','application/json'); //G - if other things, like iOS or Android apps request the data, return success
                  res.send(200, objs); //H - send as JSON object
              }
         }
   	});
});
 
app.get('/:collection/:entity', function(req, res) { //I - in the case where a 2-lvl URL path is specified, treat as collection name and entity _id
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J - request specific entity using the get() collectionDriver method
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K - return as JSON if found
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.post('/:collection', function(req, res) { //A - route which insert the body as an object into the specified collection by calling save()
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B - returns success code 201 when the resource is created
     });
});

// put follows the same pattern as the single entity get 
app.put('/:collection/:entity', function(req, res) { //A - match on collection name and _id 
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B - Like the post route, put passes the JSON object from the body to the new collectionDriver‘s update() method
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C - update object is returns so the client can resolve any fields updated by the server...such as "updated_at"
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});

//similar to put, except that it doesn't require a body
app.delete('/:collection/:entity', function(req, res) { //A - similar to put...
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) { //B - doesnt require body param
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C 200 b/c includes the original doc - update obj is return so client can resolve any fields updated by the server such as updated_at
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error); // return the appropriate code if anything goes wrong
   }
});

//This is basically for 404 error - in the case of none of the other routes being used "catch-all"
//"Jade" comes in handy here - it's a templating engine
app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
 
console.log('Server running on port 8080.');