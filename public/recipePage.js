//Client-side interaction controller for Recipe Display page
//Made for Comp2406 Fall 2016 - Assignment 5 


$(document).ready(function(){
	//register two buttons
	$("#view").click(viewRecipe);
	$("#submit").click(sendRecipe);
	
	getRecipeList();
});


	//populate the recipe list dropdown by requesting data from the server
	//adds a bunch of: <option value="recipe_name.json">recipe name</option>	
function getRecipeList(){
	console.log("Requesting all recipe names");
	
	//request list of names
	$.ajax({method: "GET", 
				url: "/recipes",
				dataType:"json",
				success:function(data){
					//data is expected to an object like...
					//{names: [name1, name2, ...]}
					console.log(data);
								
					if(data.names && data.names.length>0){  //non empty list?
						
						var $dropdown = $("#recipeSelect");
						$dropdown.html('');//clear dropdown
						
						//populate dropdown
						for(var i=0;i<data.names.length;i++){
							console.log(data.names[i]);
							$dropdown.append("<option value='"+data.names[i]+"'>"
															+data.names[i].split("_").join(" ")/*.slice(0, -5)*/
															+"</option>");
						}
					}
				}
	});
}

//Sends a request to the server for the currently selected recipe (in the recipeSelect dropdown)
//If successfull will populate the other fields on the page with the recipe data
function viewRecipe(){
	
	var name = $("#recipeSelect option:selected").val();  //get the value of the selected option from recipeSelect
	console.log("Requesting recipe: "+name);
	//fetch and load the recipe
	$.ajax({method:"GET",
				url: "/recipe/"+name,
				dataType:"json",
				success: function(data){
					console.log("Loading recipe into form: ",data);
					
					//fill in form		
					$("#name").text(data.name.split("_").join(" "));
					$("#duration").text(data.duration);
					$("#ingredients").text(data.ingredients.join("\n"));
					$("#steps").text(data.directions.join("\n"));
					$("#notes").text(data.notes);
				},
				cache:false
	});
}


//Sends a POST request to the server to add/update a recipe to the 
//database. Note: contents are not checked for safety!
//Note: recipe names are stored with underscores in place of spaces.
//			but this is done transparently to the client.
function sendRecipe(){
	console.log("Sending new recipe");
	
	//get recipe from page
	var recipe = {
		
		name: $("#name").text().split("_").join(" "),
		duration: $("#duration").text(),
		ingredients: $("#ingredients").text().split("\n"),
		directions: $("#steps").text().split("\n"),
		notes: $("#notes").text()
	}
	//console.log(recipe);
	
	//send recipe
	$.ajax({method:"POST",
				url:"/recipe",
				data:recipe,
				success:function(data){
					console.log("SUCCESS");
					//show/hide checkmark div
					/*document.querySelector("#confirmed").style.display="inline";
					setTimeout(function(){
						document.querySelector("#confirmed").style.display="none";
					},3000);*/
					getRecipeList();  //refresh dropdown
				}
	});
}