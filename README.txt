
// To start mongodb
C:\mongodb\bin\mongod.exe --dbpath C:\mongodb\data

//Then open mongo.exe
mongo.exe



// start web service
node index.js
**Note: JSON object in dir defines necessary packages, npm install/npm refresh will install them for you

//Don't forget to intall cURL if you are on windows....



//NOTE FOR WINDOWS and cURL
If you are executing the curl command in windows you need to do things a little differently. There are two options that I have verified which work:
Option 1) Escape the double-quotes in your json data, and surround the json with double quotes:
Ex>curl -H "Content-Type: application/json" -X POST -d "{\"title\":\"Hello World\"}" http://localhost:3000/items
Option 2) Put the json in a text file called 'data.txt' or whatever you want to name it
Ex.>curl -H "Content-Type: application/json" -X POST -d @data.txt http://localhost:3000/items
data.txt file looks like:
{
"title": "Hello World"
}

//GET - will return a very literal response...
curl -H "Content-Type: application/json" -X GET http://localhost:3000/items/

//POST
curl -H "Content-Type: application/json" -X POST -d "{\"title\":\"Hello World\"}" http://localhost:3000/items

//PUT
//id is the _id of whats in the table...
curl -H "Content-Type: application/json" -X PUT -d "{\"title\":\"Good Golly Miss Molly\"}" http://localhost:3000/items/{_id}

//DELETE
//id is the _id of whats in the table...
curl -H "Content-Type: application/json" -X DELETE  http://localhost:3000/items/{_id}

// NOTE - POSTman app for Chrom can do what cURL does...

//Deploying...
Creating an OpenSHIFT account
user: eannelson2010@gmail.com
pass: #0166Emn
domain: EanProjects
http://noderesume-eanprojects.rhcloud.com/

