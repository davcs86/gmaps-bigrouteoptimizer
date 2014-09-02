Route Optimizer for Big Distance Matrix for Google Maps
=======================

Javascript object for find optimal routes for Big Distance Matrices for Google Maps.

It takes a distance matrix between given locations obtained using Google Maps API using the <a href="https://github.com/davcs86/gmaps-bigdistancematrix" target="_blank">Big Distance Matrix for Google Maps</a> and computes the shortest route to travel through all the locations.

This object implements the Ant Colony Algorithm to get the shortest path using distance, time or speed (distance/time) as optimization variables.

It can display the optimal route on a HTML div or export it as an array in JSON format.

__Known issue__: When It's executed on a webbrowser, It blocks the screen until the optimization ends. It's highly recommended to use it in server-side with NodeJS.

## Links

* Homepage: <http://d-castillo.info/projects/gmaps-bigrouteoptimizer>
* Source: <https://github.com/davcs86/gmaps-bigrouteoptimizer>
* Bugs:   <https://github.com/davcs86/gmaps-bigrouteoptimizer/issues>
* **DEMO:** <http://d-castillo.info/gmaps-bigrouteoptimizer/example.html>
* Other: <http://www.jsclasses.org/package/364>

## Requirements:

1. jQuery 1.8+ <http://jquery.com/>
2. JSON3 <http://bestiejs.github.io/json3/>
3. Big Distance Matrix for Google Maps <https://github.com/davcs86/gmaps-bigdistancematrix>

## Instructions:

1. Use "Big Distance Matrix for Google Maps" to generate a object with the distance and time between locations.

	```javascript
	//from example.js
	var Route_Points = {
		"Times Square": [40.758673, -73.985281],
		"St Patrick's Cathedral": [40.758196, -73.975347],
		"Grand Central Terminal": [40.752105, -73.977686],
		//...
		"Bronx Zoo": [40.848611, -73.882631],
		"New York Botanical Garden": [40.861748, -73.880145],
		"Washington Square Park": [40.731371, -73.996997]
	};
	Route_DistanceMatrix.init(Route_Points);
	Route_DistanceMatrix.displayTable("table_route_matrix");
	Route_DistanceMatrix.startRouting(3000);
	```

2. Initialize the object.

	```javascript
	Route_Optimizer.init(distanceMatrix, optimizeBy, consoleDivId);
	//from example.js
	Route_Optimizer.init(Route_DistanceMatrix.exportResults(), 1, "console_route_matrix"); // 1 for use time as optimization variable
	Route_Optimizer.init(Route_DistanceMatrix.exportResults(), 2, "console_route_matrix"); // 2 for use distance as optimization variable
	Route_Optimizer.init(Route_DistanceMatrix.exportResults(), 3, "console_route_matrix"); // 3 for use speed as optimization variable
	```

	| Parameter | Description |
	| ------------- | ----------- |
	|distanceMatrix | Object returned by the "Big Distance Matrix for Google Maps". <br>**Mandatory**.|
	|optimizeBy | Select variable to optimize. <br>**Mandatory**.<br>Possible Values:<br>1, distance.<br>2, time.<br>3, speed (correlation: distance/time)|
	|consoleDivId | DOM id of the container where the log information will be written. <br>**Optional**. _Default value_: false.|

3. Do Route Optimization.

	```javascript
	Route_Optimizer.doOptimize(maxIterations, numAnts, decayFactor, heuristicCoeff, greedinessFactor);
	//from example.js
	var OptimalRoute = Route_Optimizer.doOptimize();


		
