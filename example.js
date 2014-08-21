/*
//Cities

var Route_Points = {
	"Monterrey, MX": [25.6667, -100.3000],
	"Mexico City, MX": [19.4333, -99.1333],
	"Veracruz, MX": [19.1903, -96.1533],
	"Guadalajara, MX": [20.6667, -103.3500], 
	"Tijuana, MX": [32.5250, -117.0333], 
	"Acapulco, MX": [16.8636, -99.8825], 
	"Cancun, MX": [21.1606, -86.8475] 
};
*/

// Places in NY.
var Route_Points = {
	"Times Square": [40.758673, -73.985281],
	"St Patrick's Cathedral": [40.758196, -73.975347],
	"Grand Central Terminal": [40.752105, -73.977686],
	"New York Public Library": [40.752617, -73.982793], 
	"Washington Park, NJ": [40.751890, -74.041414],
	"Battery Park": [40.704506, -74.014206], 
	"Liberty State Park": [40.708865, -74.042745], 
	"Radio City Music Hall": [40.759770, -73.980134], 
	"Grand Army Plaza": [40.763742, -73.973689],
	"Metropolitan Museum of Art": [40.778437, -73.962668],
	"Museum of Natural History": [40.780736, -73.972635], 
	"Madison Square Garden": [40.749524, -73.993016],
	"United Nations Headquarters": [40.748807, -73.968089],
	"Bellevue Hospital Center": [40.738496, -73.976469],
	"New York City Hall": [40.712672, -74.006134],
	"9/11 Memorial and Museum": [40.711583, -74.012196],
	"Newport Green Park": [40.731766, -74.034086],
	"Yankee Stadium": [40.829271, -73.928536],
	"Federal Reserve": [40.708372, -74.008390],
	"Woolworth Building": [40.712190, -74.008505],
	"Brooklyn Botanic Garden": [40.666095, -73.961542],
	"JFK Airport": [40.646113, -73.783744],
	"LaGuardia Airport": [40.771814, -73.874552],
	"Newark Airport": [40.693034, -74.186161],
	"New York Times Co.": [40.777208, -73.827689],
	"42 st Manhattan": [40.757554, -73.990587],
	"Little Italy": [40.718680, -73.997613],
	"Bronx Zoo": [40.848611, -73.882631],
	"New York Botanical Garden": [40.861748, -73.880145],
	"Washington Square Park": [40.731371, -73.996997]
};


(function($){
	/*
	** GMaps Big Distance Matrix functions, see package 
	** http://www.jsclasses.org/package/362-JavaScript-Get-Google-Maps-distance-matrix-for-many-locations.html
	*/
	Route_DistanceMatrix.init(Route_Points);
	Route_DistanceMatrix.displayTable("table_route_matrix");
	Route_DistanceMatrix.startRouting(3000);

	$("body").on("click","#btnOptimize",function(evt){
		evt.preventDefault();

		/*
		** Initialize the class.
		** 
		** Route_Optimizer.init(distanceMatrix, optimizeBy, consoleDivId);
		**
		** Parameters:
		** -- distanceMatrix: Object returned by the "GMaps Big Distance Matrix" (Required).
		** -- optimizeBy: Select variable to optimize (Required, Possible values: 1 = distance, 2 = time, 3 = speed, distance/time).
		** -- consoleDivId: DOM id of the container where the log information will be written. (Optional, Default value: false).
		**
		*/

		/*
		** Do Route Optimization.
		** 
		** Route_Optimizer.doOptimize(maxIterations, numAnts, decayFactor, heuristicCoeff, greedinessFactor);
		**
		** Parameters:
		** -- maxIterations: Number of iterations for find the solution. (Optional, typically a value between 200 and 500 times the numAnts value).
		** -- numAnts: Number of ants (cars) that run the trials (Optional, a typical value is the half of locations plus one)
		** -- decayFactor: Rate at which historic information is lost. (Optional, recommended values: 0.1-0.5, default value: random number between 0.1 & 0.5).
		** -- heuristicCoeff: Controls the amount of contribution problem-specific heuristic information plays in a components probability of selection. (Optional, recommended values: 2-5, default value: random number between 2 & 5).
		** -- greedinessFactor: Controls the amount of contribution problem-specific heuristic information plays in a components probability of selection. (Optional, recommended values: 0.8-1.3, default value: random number between 0.8 & 1.3).
		**
		*/

		// Optimize by distance
		$("#console_route_matrix").append("<p><strong>Optimizing route by distance...</strong></p>");
		Route_Optimizer.init(Route_DistanceMatrix.exportResults(), 1, "console_route_matrix");
		setTimeout(function(){
			var OptimalRoute = Route_Optimizer.doOptimize();
		},10);

		/*
		// Optimize by time
		$("#console_route_matrix").append("<p><strong>Optimizing route by time...</strong></p>");
		Route_Optimizer.init(Route_DistanceMatrix.exportResults(), 2, "console_route_matrix");
		setTimeout(function(){
			var OptimalRoute = Route_Optimizer.doOptimize();
		},10);
		*/

		/*
		// Optimize by speed
		$("#console_route_matrix").append("<p><strong>Optimizing route by speed...</strong></p>");
		Route_Optimizer.init(Route_DistanceMatrix.exportResults(), 3, "console_route_matrix");
		setTimeout(function(){
			var OptimalRoute = Route_Optimizer.doOptimize();
		},10);
		*/

	});
	$("body").on("click","#btnExport",function(evt){
		evt.preventDefault();
		var distanceMatrix = Route_DistanceMatrix.exportResults(true);
		$("#export_data_div").html(distanceMatrix);
	});
})(jQuery);