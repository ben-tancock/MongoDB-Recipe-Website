// Benjamin Tancock 100942165

var express = require('express');
var app = express();
var mongo= require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');

var DBURL="mongodb://localhost:27017/recipeDB";
console.log(DBURL);

app.set('views','./views');
app.set('view engine','pug');

app.use(function(req,res,next){
	console.log(req.method+" request for "+req.url);
	next();
});

app.get(["/","/index"],function(req,res){
	mongo.connect(DBURL,function(err,db){
		if(err)
			res.sendStatus(500);
		else
			res.render('index');
		db.close();
	});
});
		
app.get(['/recipes'], function(req,res){
	mongo.connect(DBURL,function(err,db){
		if(err)
			res.sendStatus(500);
		else{
			var collection = db.collection("recipes");
			var recipes = fs.readdirSync('./recipes');
			var recipeNames = {names : []}

			// if the collection is empty, fill it with the recipes in the folder.
			collection.count(function(err, count){
				if(count === 0){
					for(var i = 0; i < recipes.length; i++){
						var recObj = getFileContents("recipes/" + recipes[i]).toString();
						recObj = JSON.parse(recObj);
						recipeNames.names.push(recObj.name);
						collection.insertOne(recObj, function(err, result){
						if(err){
							console.log('insert failed ', err);
							res.sendStatus(500);
						}else{
							console.log("insert success!");
						}
						db.close();
						});
				}
				res.send(recipeNames);
				}
				else{ // fill an array with all the recipe names in collection and send
					var cursor = collection.find({});
					cursor.forEach(function(doc){
						console.log(doc.name);
						recipeNames.names.push(doc.name);
						if(recipeNames.names.length === count){
							res.send(recipeNames);
							db.close();
						}
					});
					db.close();
				}
			});
			
		}
		
	});

});	



app.use('recipe/', bodyParser.urlencoded({extended: true}));
app.get(['/recipe/*'], function(req,res){
	mongo.connect(DBURL,function(err,db){
		if(err)
			res.sendStatus(500);
		else{
			var collection = db.collection("recipes");
			collection.findOne({"name" : req.params[0]}, function(err, doc){
				if(err){
					console.log("error");
				}
				else{
					res.send(doc);
				}
				db.close();
			});
		}
		
	});
});

app.use('/recipe', bodyParser.urlencoded({extended: true}));
app.post("/recipe", function(req, res){
	mongo.connect(DBURL,function(err,db){
		if(err){
			res.sendStatus(500);
		}
		else{
			var collection = db.collection("recipes");			
			collection.replaceOne({"name": req.body.name}, req.body, {upsert:true}, function(){
				res.sendStatus(200);

			});
		}
		db.close();
	});
});

//read a file and returns its contents
function getFileContents(filename){
	
	var contents;
	
	//handle good requests
	console.log("Getting file");
	contents = fs.readFileSync(filename);
	console.log("typeof: "+typeof(contents));
	return contents;
}

app.use(express.static("./public"));
app.listen(2406,function(){console.log("server online (port 2406)");});