



//The drop-down menu
let select = document.getElementById("restaurant-select");
//Stores the currently selected restaurant index to allow it to be set back when switching restaurants is cancelled by user
let currentSelectIndex = select.selectedIndex
//Stores the current restaurant to easily retrieve data. The assumption is that this object is following the same format as the data included above. If you retrieve the restaurant data from the server and assign it to this variable, the client order form code should work automatically.
let currentRestaurant;
//Stored the order data. Will have a key with each item ID that is in the order, with the associated value being the number of that item in the order.
let order = {};
let ordertotal = 0;


//Called on page load. Initialize the drop-down list, add event handlers, and default to the first restaurant.
function orderformpage(){
	var request = require("request");

	request("/orderform", function(error, response, body) {
		console.log(body);
	});
}

function homepage(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		}
	}
	xhttp.open("GET", "/homepage.html", true);
	xhttp.send();
}


function init(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let res = JSON.parse(this.responseText);
			for(let p in res){
				console.log(p);
				if(res[p].id == window.location.search){
					currentRestaurant = p;
					break;
				}
			}
			let rest = res[currentRestaurant];
			document.getElementById("left").innerHTML = getCategoryHTML(rest);
			document.getElementById("middle").innerHTML = getMenuHTML(rest);

			let nametext = "";
			nametext += "Name:"+ res[currentRestaurant].name+'<input type="text" id="nametext">'
			let feetext = "";
			feetext += "Delivery Fee:"+ res[currentRestaurant].delivery_fee+"$"+'<input type="text" id="feetext">'
			let minimumtext ="";
			minimumtext += "Minimum order:"+ res[currentRestaurant].min_order+"$"+'<input type="text" id="minimumtext">'
			let categorytext="";
			categorytext += "Add Category:"+ '<input type="text" id="categorytext">'



			document.getElementById("right").innerHTML +=  nametext +"<br>" + feetext + "<br>" + minimumtext +"<br>"+ categorytext;

		}
	}
	xhttp.open("GET", window.location.search, true);
	xhttp.send();
}

//Generate new HTML for a drop-down list containing all restaurants.
//For A2, you will likely have to make an XMLHttpRequest from here to retrieve the array of restaurant names.


//Called when drop-down list item is changed.
//For A2, you will likely have to make an XMLHttpRequest here to retrieve the menu data for the selected restaurant
function selectRestaurant(){
	let result = true;
	let selected = select.options[select.selectedIndex].value;
	currentSelectIndex = select.selectedIndex;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if(!isEmpty(order)){
				result = confirm("Are you sure you want to clear your order and switch menus?");
			}

			//If switch is confirmed, load the new restaurant data
			if(result){
				//Get the selected index and set the current restaurant
				//In A2, current restaurant will be data you received from the server

				currentRestaurant = JSON.parse(this.responseText);

				//Update the page contents to contain the new menu
				document.getElementById("left").innerHTML = getCategoryHTML(currentRestaurant);
				document.getElementById("middle").innerHTML = getMenuHTML(currentRestaurant);

				order = {};
				updateOrder();

				let info = document.getElementById("info");
				info.innerHTML = currentRestaurant.name + "<br>Minimum Order: $" + currentRestaurant.min_order + "<br>Delivery Fee: $" + currentRestaurant.delivery_fee + "<br><br>";
			}else{
				let select = document.getElementById("restaurant-select");
				select.selectedIndex = currentSelectIndex;
			}
		}
	};
	xhttp.open("POST", "/selected", true);
	xhttp.setRequestHeader("Content-type", "text/HTML");
	xhttp.send(selected);


}

//Given a restaurant object, produces HTML for the left column
function getCategoryHTML(rest){
	let menu = rest.menu;
	let result = "<b>Categories<b><br>";
	Object.keys(menu).forEach(key =>{
		result += `${key}<br>`;
	});
	return result;
}

//Given a restaurant object, produces the menu HTML for the middle column
function getMenuHTML(rest){

	let menu = rest.menu;
	let result = "";
	//For each category in the menu
	Object.keys(menu).forEach(key =>{
		result += `<b>${key}</b><a name="${key}"></a><br>`;
		//For each menu item in the category
		Object.keys(menu[key]).forEach(id => {
			item = menu[key][id];
			result += `${item.name} (\$${item.price}) <br>`;
			result += item.description + "<br><br>";
		});
	});
	return result;
}


//Reproduces new HTML containing the order summary and updates the page
//This is called whenever an item is added/removed in the order
function updateOrder(){
	let result = "";
	let subtotal = 0;
	
	//For each item ID currently in the order
	Object.keys(order).forEach(id =>{
		//Retrieve the item from the menu data using helper function
		//Then update the subtotal and result HTML
		let item = getItemById(id);
		subtotal += (item.price * order[id]);
		result += `${item.name} x ${order[id]} (${(item.price * order[id]).toFixed(2)}) <img src='remove.jpg' style='height:15px;vertical-align:bottom;' onclick='removeItem(${id})'/><br>`;
	});
	
	//Add the summary fields to the result HTML, rounding to two decimal places
	result += `Subtotal: \$${subtotal.toFixed(2)}<br>`;
	result += `Tax: \$${(subtotal*0.1).toFixed(2)}<br>`;
	result += `Delivery Fee: \$${currentRestaurant.delivery_fee.toFixed(2)}<br>`;
	let total = subtotal + (subtotal*0.1) + currentRestaurant.delivery_fee;
	result += `Total: \$${total.toFixed(2)}<br>`;
	
	//Decide whether to show the Submit Order button or the Order X more label
	if(subtotal >= currentRestaurant.min_order){
		result += `<button type="button" id="submit" onclick="submitOrder()">Submit Order</button>`
	}else{
		result += `Add \$${(currentRestaurant.min_order - subtotal).toFixed(2)} more to your order.`;
	}
	
	document.getElementById("right").innerHTML = result;
}

//Simulated submitting the order
//For A2, you will likely make an XMLHttpRequest here
function submitOrder(){
	alert("Order placed!");
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {

		}
	};
	xhttp.open("POST", "/order", true);
	xhttp.setRequestHeader("Content-type", "text/HTML");
	xhttp.send(JSON.stringify(order));
	order = {}
	selectRestaurant();
}

//Helper function. Given an ID of an item in the current restaurant's menu, returns that item object if it exists.
function getItemById(id){
	let categories = Object.keys(currentRestaurant.menu);
	for(let i = 0; i < categories.length; i++){
		if(currentRestaurant.menu[categories[i]].hasOwnProperty(id)){
			return currentRestaurant.menu[categories[i]][id];
		}
	}
	return null;
}

//Helper function. Returns true if object is empty, false otherwise.
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


function creatrestaurant(){
	alert("SUBMITTED!");
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.response);
		}
	};
	xhttp.open("POST", "/restaurants", true);
	xhttp.setRequestHeader("Content-type", "text/HTML");
	let dataa = {"name":document.getElementById("restaurantname").value,"delivery_fee":document.getElementById("deliveryfee").value,"min_Order":document.getElementById("minimumorder").value};
	xhttp.send(JSON.stringify(dataa));
}