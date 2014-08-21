/*
* Class: GMaps Big Distance Matrix
* Get Google Maps distance matrix for 25+ locations. 
* Author: David Castillo Sanchez - davcs86@gmail.com  
* Hire me on: https://www.freelancer.com/u/DrAKkareS.html
*/
var Route_DistanceMatrix = function(){
	var RP = {};
	var RP_results = {};
	var RP_keys = {};
	var RP_Len = 0;
	var console_div = false;
	var table = false;
	var requestDelay = 1500; //ms to wait before the next google request
	var googleTravelMode = google.maps.TravelMode.DRIVING;
	var googleUnitSystem = google.maps.UnitSystem.METRIC;
	var googleAvoidHighways = false;
	var googleAvoidTolls = false;
	var itemsPerRequest = 5;
	var displayTable = function(tableDomId){
		var tableContent = $("<thead><tr><th>&nbsp;</th></tr></thead><tbody></tbody>");
		if (console_div){
			$(console_div).append("<p>Generating table...</p>");
		}
		if (typeof(tableDomId)!=="undefined"){
			table = "#"+tableDomId;
		} else {
			alert("The table ID is required");
			return;
		}
		for (point in RP){
			tableContent.find("th").last().after("<th class='text-center'>"+point+"</th>");
			var emptyRow = $("<tr>&nbsp;</tr>");
			emptyRow.append("<td class='text-center'>"+point+"<br>Latitude: "+RP[point][0]+"°<br>Longitude: "+RP[point][1]+"°</td>");
			for (var i = 0; i < RP_Len; i++){
				RP_results[point]=RP_keys;
				emptyRow.append("<td class='text-center'>--</td>")
			}
			emptyRow.append("<td class='text-center'><button style='margin-top:6px;display:' class='btn btn-xs btn-primary btn-dorequest' data-point='"+point+"'>Retry</button></td>");
			$(tableContent[1]).append(emptyRow);
		}
		tableContent.find("th").last().after("<th class='text-center'><em>Options</em></th>");
		$(table).html(tableContent);
		if (console_div){
			$(console_div).append("<p>Table generated...</p>");
		}
	};
	var startRouting = function(delay){
		if (typeof(delay)!=="undefined"){
			requestDelay = delay;
		}
		var i = 0;
		for (point in RP){
			(function(iPoint, iI){
				setTimeout(function(){
					Route_DistanceMatrix.doRouting(iPoint, Route_DistanceMatrix.updateRow);
				},iI*Route_DistanceMatrix.getRequestDelay());
			})(point,i);
			i++;
		}
	};
	var getRequestDelay = function(){
		return requestDelay;
	};
	var doRouting = function(point, callback){
		var i = 0;
		var origin = [];
		var destinations = [];
		var originPoints = [point];
		var destinationsPoints = [];
		var newLatLng  = new google.maps.LatLng(RP[point][0],RP[point][1]);
		origin.push(newLatLng);
		for (thisPoint in RP){
			var newLatLng  = new google.maps.LatLng(RP[thisPoint][0],RP[thisPoint][1]);
			if (thisPoint!=point){
				destinations.push(newLatLng);
				destinationsPoints.push(thisPoint);
				i++;
			}
			if (i==itemsPerRequest){
				(function(gOrigin,gDestinations,gOriginPoints,gDestinationsPoints, gTravelMode, gUnitSystem, gAvoidHighways, gAvoidTolls, gCallback){
					var service = new google.maps.DistanceMatrixService();
					service.getDistanceMatrix(
						{
			      		origins: gOrigin,
			      		destinations: gDestinations,
			      		travelMode: gTravelMode,
			      		unitSystem: gUnitSystem,
			      		avoidHighways: gAvoidHighways,
			      		avoidTolls: gAvoidTolls
			    	}, 
			    	function(response, status){
		    			gCallback(response, status, gOriginPoints, gDestinationsPoints);
			    	});
				})(origin,destinations,originPoints,destinationsPoints, googleTravelMode, googleUnitSystem, googleAvoidHighways, googleAvoidTolls, callback);
			    destinations = [];
			    destinationsPoints = [];
			    i=0;
			}
		}
		if (i>0){
			//do the remaining requests
			(function(gOrigin,gDestinations,gOriginPoints,gDestinationsPoints, gTravelMode, gUnitSystem, gAvoidHighways, gAvoidTolls, gCallback){
				var service = new google.maps.DistanceMatrixService();
				service.getDistanceMatrix(
					{
		      		origins: gOrigin,
		      		destinations: gDestinations,
		      		travelMode: gTravelMode,
		      		unitSystem: gUnitSystem,
		      		avoidHighways: gAvoidHighways,
		      		avoidTolls: gAvoidTolls
		    	}, 
		    	function(response, status){
	    			gCallback(response, status, gOriginPoints, gDestinationsPoints);
		    	});
			})(origin,destinations,originPoints,destinationsPoints, googleTravelMode, googleUnitSystem, googleAvoidHighways, googleAvoidTolls, callback);
		    destinations = [];
		    destinationsPoints = [];
		    i=0;
		}
	};
	var updateRow = function(response, status, originPoints, destinationsPoints){
		var thisResults = {};
		var cellData = "";

		for (var i in originPoints){
			for (var j in destinationsPoints){
				origin = originPoints[i];
				destination = destinationsPoints[j];
				if (status=="OK" && origin!=destination){
					if (typeof(thisResults[origin])=="undefined"){
						thisResults[origin]={};
					}
					cellData = "OK / "+JSON.stringify(response.rows[i].elements[j]);
					thisResults[origin][destination] = {
						timeText : response.rows[i].elements[j].duration.text,
						timeValue : response.rows[i].elements[j].duration.value,
						distanceText : response.rows[i].elements[j].distance.text,
						distanceValue : response.rows[i].elements[j].distance.value
					};
				} else {
					cellData = "Error";
					thisResults[origin][destination] = false;
				}
				if (console_div){
					$(console_div).append("<p>** Data for "+origin+" => "+destination + "... "+cellData+"</p>");
				}
			}
			RP_results[origin] = $.extend({}, RP_results[origin], thisResults[origin]);
		}

		if (table){
			updateTable();
		}
	};
	var updateTable = function(){
		if (table){
			var i = 1;
			var j = 2;
			for(var row in RP_results){
				j = 2;
				for(var column in RP_results[row]){
					var cellContent = "--";
					if (typeof(RP_results[row][column]["timeText"])!="undefined"){
						cellContent = RP_results[row][column]["distanceText"]+"<br>"+RP_results[row][column]["timeText"];
					}
					$(table+" > tbody > tr:nth-child("+i+") > td:nth-child("+j+")").html(cellContent);
					j++;
				}
				i++;
			}
		}
	};
	var exportResults = function(asString){
		return (asString)?JSON.stringify(RP_results):RP_results;
	};
	return {
		init : function(routePoints, consoleDivId, itemsPerReq, gTravelMode, gUnitSystem, gAvoidHighways, gAvoidTolls){
			/*
			**
			** Parameters:
			** -- routePoints: Object with the GPS latitude and longitude of the places (Mandatory).
			** -- consoleDivId: DOM id of the container where the log information will be written. (Optional, Default value: false).
			** -- itemsPerReq: Number of items to include per request to Google. (Optional, Default Value: 5,  Max Value 25);
			** -- gTravelMode: Google parameter, view reference (Optional, Default: google.maps.TravelMode.DRIVING).
			** -- gUnitSystem: Google parameter, view reference (Optional, Default: google.maps.TravelMode.METRIC).
			** -- gAvoidHighways: Google parameter, view reference (Optional, Default: false).
			** -- gAvoidTolls: Google parameter, view reference (Optional, Default: false).
			**
			** Google API Reference: https://developers.google.com/maps/documentation/javascript/distancematrix#distance_matrix_requests
			**
			*/
			RP = routePoints;
			for (point in RP){
				RP_keys[point]=false;
				RP_Len++;
			}
			if (typeof(consoleDivId)!=="undefined" && consoleDivId!=false){
				console_div = "#"+consoleDivId;
			}
			if (typeof(gTravelMode)!=="undefined"){
				googleTravelMode = gTravelMode;
			}
			if (typeof(gUnitSystem)!=="undefined"){
				googleUnitSystem = gUnitSystem;
			}
			if (typeof(gAvoidHighways)!=="undefined"){
				googleAvoidHighways = gAvoidHighways;
			}
			if (typeof(gAvoidTolls)!=="undefined"){
				googleAvoidTolls = gAvoidTolls;
			}
			if (typeof(itemsPerReq)!=="undefined"){
				if (1*itemsPerReq>24){
					itemsPerRequest = itemsPerReq;
				}
			}
			// activate jquery buttons
			$("body").on("click",".btn-dorequest",function(){
				var point = $(this).attr("data-point");
				$(this).hide();
				var that = this;
				Route_DistanceMatrix.doRouting(point,Route_DistanceMatrix.updateRow);
				setTimeout(function(){
					$(that).show();
				},5000);
			});
		},
		displayTable : function(tableDomId){
			displayTable(tableDomId);
		},
		startRouting: function(delay){
			startRouting(delay);
		},
		doRouting: function(point, callback){
			doRouting(point, callback);
		},
		updateRow: function(response, status, originPoints, destinationsPoints){
			updateRow(response, status, originPoints, destinationsPoints);
		},
		updateTable: function(){
			updateTable();
		},
		exportResults: function(asString){
			if (typeof(asString)==="undefined"){
				var asString = false;
			}
			return exportResults(asString);
		},
		getRequestDelay: function(){
			return getRequestDelay();
		}
	}
}();
