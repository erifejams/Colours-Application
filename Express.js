var express = require("express");
var http = require("http");
var app = express();
const fs = require('fs');
const path = require('path')
var cookieParser = require('cookie-parser');
var session = require('express-session');

// Create the Express-powered HTTP server and have it listen on port 8080
http.createServer(app).listen(8080);


//loads the folder “data.json” and save it in an object called colours
let colour = fs.readFileSync('data.json');
var coloursDetails = JSON.parse(colour);


// before any routes are defined:	
app.use(express.json()); 
// parses text as JSON and exposes the object on req.body. 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); //for access to css file
app.use(cookieParser()); // for cookies
app.use(session({secret: "secret"}));

//Gets the list of all colours and their details
var colours = function (req, res) {
	res.send(coloursDetails); 
};


//sends the details of colour id and puts in coloursId123
var coloursId123 =  function (req, res) {
	res.send(coloursDetails[req.params.colorId]);  
}; 


//Creates a new colour with the details provided. 
//Response contains the URI for this newly created resource.
var createNewColour =  function (req, res) {
	const colorId = req.body.ColourId;
	const hexString = req.body.hexString;
	const rgb = req.body.RGB;
	const hsl = req.body.HSL;
	const name = req.body.Name;

	//if (error) res.json(error);

	// adds the data entered by the user at the end of the data file, so if button show colour is clicked, the new colour entered by the user is in the file
	coloursDetails.push(req.body); 

	//adds the new colour to the current data file
	fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(coloursDetails));
	
	//to get the url of the new colour`
	res.redirect("/colours/");
	
	/*res.send({
		"colorId": colorId,
		"hexString": hexString,
		"rgb": rgb,
		"hsl": hsl,
		"name": name,
		//"post1": "Received, the new URL is http://localhost:8080/colours/" + req.body.ColourId
	})*/

};

//to let the data for modifying show
function showForm() {
	var modifyButton = document.getElementById('modifyButton')
	var HideDeleteForm = document.getElementById('HideDeleteForm')
		
	//waits for the modify button to be clicked
	modifyButton.addEventListener('click', () => {
		
	
		if (HideDeleteForm.style.display === 'none') {
			//  allows the form to show
			HideDeleteForm.style.display = 'block';
		} else {
			//  hides the form
			HideDeleteForm.style.display = 'none';
		}
	});
}


//Modifies colour id 123 (creates one if it doesn't already exist). 
//Response contains the URI for this newly created resource.
var ModifyOrNew = function (req, res) {

	console.log('PUT request received...');

	//finds the index of the id
	const itemIndex = coloursDetails.findIndex(({ colorId }) => colorId === req.params.colorId);

	//return res.json(coloursDetails[req.params.colorId]); 
	
	if (itemIndex != -1) {//means data exists
		//modifies data
		coloursDetails.colorId = req.body.ColourId;
		coloursDetails.hexString = req.body.hexString;
		coloursDetails.rgb = req.body.deal.RGB;
		coloursDetails.hsl = req.body.HSL;
		coloursDetails.name = req.body.Name;
		
		coloursDetails.push(req.body); 
		res.send("Received, the new URL is http://localhost:8080/colours/:colorId");

	}else{ //sends error message that it does exist

		//adds new data entered by the user if not found in colour details
		const colorId = req.body.ColourId;
		const hexString = req.body.hexString;
		const rgb = req.body.RGB;
		const hsl = req.body.HSL;
		const name = req.body.Name;
		coloursDetails.push(req.body); 

		//adds the new colour to the current data file
		fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(coloursDetails));
		return res.status(404).send("colour ID already exists");

	}
	

	res.send({
		"colorId": colorId,
		"hexString": hexString,
		"rgb": rgb,
		"hsl": hsl,
		"name": name,
		//"post1": "Received, the new URL is http://localhost:8080/colours/" + req.body.ColourId
	})

	//to get the url of the new colour`
	res.redirect("/colours/123");
};


//Colour id 123 should be deleted, if it exists. 
// Response should contain the status of the request.
app.delete('/colours/:colorId', function (req, res) {
	let getIDToDelete = coloursDetails.filter(coloursDetails => coloursDetails.colorId !== req.body.deleteID);
	console.log(getIDToDelete)


	const deleteId = Number(req.body.deleteID);
	console.log(deleteId)

	// i is the index and element is the specific colour detail
	for (let [i, element] of coloursDetails.entries()) { //goes through the colours details array
		if (element.colorId === deleteId) {
			//removes the delete id from the array
			coloursDetails.splice(i, 1); 

			//save
			coloursDetails.push(req.body);
			
			//removes the deleted object from the file
			fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(coloursDetails));

			res.send(200); //sends status 200 because of success

			//to get the url of the new colour`
			res.redirect("/colours/");
		}
	}
	//res.json({ok:false}); 
	res.send(500); //for failure of not being able to delete id
});


//Should be invalid. DELETE and PUT should specify which resource they are working on.
var WhichResource =  function (req, res) {
	res.send("The resource that its currently on is http://localhost:8080/colours/");

};


//If the users type a wrong address, send them a message indicating that an error has been made 
//displaying a link to access the main page
var WrongURL = function(req, res){
	res.json({ err : "This is an invalid URL. The URL to the main page is", link : "http://localhost:8080/colours/123"})
};


/*
$.ajax({
	url: 'index.html',
	type: 'DELETE',
	success: function(result) {
		// Do something with the result
		$( "button" ).click(function() {
			$( "p" ).remove();
		});
	}
*/

//for the pagination
var Pagination = function (req, res) {

	//gets the page num
	const pagNum = req.body.pagNum;

	if(pagNum == req.body.colorId){
		//res.send("This is the resouce being worked on " + coloursDetails[req.body.colorId]);  
		res.send(coloursDetails[req.body.colorId]);  
		return res.status(200).json(coloursDetails);
	}else{
		return res.status(500).send("There is an error")
	}

};


//cookies
function getColor() 
{
	var value = document.cookie;

	if(value == "")
		document.body.style.backgroundColor = "white";
	else{
		var NewBGColor = value.split("=");
		document.body.style.backgroundColor = NewBGColor[1];
	}
}

function setColor() 
{
	var c;
	with(document.forms.BGForm){
		c = NewBGColor.options[NewBGColor.selectedIndex].value;
		document.cookie = "NewBGColor=" + c + ";";
		getColor();
	}
}


app.get('/', function(req, res){
	if(req.session.page_views){
	   req.session.page_views++;
	   res.send("You visited this page " + req.session.page_views + " times");
	} else {
	   req.session.page_views = 1;
	   document.body.style.backgroundColor = "white";
	   res.send("Your background colour is white");
	}
 });


//sends to the index.html file, that's what the user will see
app.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html"); //to go to the path where the html is located
});


//lets the function called to be seen in the browser
app.get('/colours', [colours]); 


//Gets the details of colour ids, so when any of the colours id is called, the number is put after colour e.g. /colours/123
app.get('/colours/:colorId', [coloursId123]); 


//adds the new colour to the file
app.post('/colours', [createNewColour])


//modifies data or creates new one if doesn't exist
app.put('/colours/:colorId', [ModifyOrNew])


//this is to get the message and link for the user writing the wrong url
app.get('*', [WrongURL]);


//this gets the pages
//app.get('/colours?limit=238&offset=0', [Pagination])
app.get('/colours/:colorId', [Pagination])


//which resource is being worked on
app.delete('/colours/', [WhichResource])