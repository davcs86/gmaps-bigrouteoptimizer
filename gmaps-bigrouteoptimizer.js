/*
* ClassName: GMaps v3, Big Route Optimizer
* Calculates an optimal route based on a Google Big Distance Matrix (http://www.jsclasses.org/package/362-JavaScript-Get-Google-Maps-distance-matrix-for-many-locations.html). 
* Optimization Algorithm: Ant Colony System. 
* Based on code by Jason Brownlee (http://www.cleveralgorithms.com/nature-inspired/swarm/ant_colony_system.html)
* Class Author: David Castillo Sanchez - davcs86@gmail.com  
* Hire me on: https://www.freelancer.com/u/DrAKkareS.html
*/
var Route_Optimizer = function(){
	var RP_Matrix = {};
	var RP_MatrixPoints = {};
	var OptimizeBy = 1; // 1 = distance, 2 = time, 3 = speed
	var ConsoleDIV = false;
	var RP_MatrixLen = 0;
	var RP_MatrixKeys = {};
	var init = function(matrixPoints, optimizeBy, console_div){
		if (typeof(optimizeBy)!="undefined"){
			OptimizeBy = optimizeBy;
		}
		if (typeof(console_div)!="undefined"){
			ConsoleDIV = "#"+console_div;
		}
		// * Rescaling values
		if (ConsoleDIV){
			$(ConsoleDIV).append("<p>Rescaling values...</p>");
		}
		// ** 1) Find min & max
		var minValue = Infinity;
		var maxValue = 0;
		RP_MatrixLen = 0;
		RP_MatrixPoints = matrixPoints;
		for (var row in matrixPoints){
			RP_Matrix[row] = {};
			RP_MatrixKeys[RP_MatrixLen]=row;
			RP_MatrixLen++;
			for (var col in matrixPoints[row]){
				var X = 0;
				if (matrixPoints[row][col]){
					switch(OptimizeBy){
						case 1:
							X = matrixPoints[row][col]["distanceValue"];
							break;
						case 2:
							X = matrixPoints[row][col]["timeValue"];
							break;
						case 3:
							// inverse speed, due to the algorithm optimizes the minimal value.
							X = matrixPoints[row][col]["timeValue"]/matrixPoints[row][col]["distanceValue"];
							break;
					}
				}
				RP_Matrix[row][col] = X;
				if (minValue>X){
					minValue = X;
				}
				if (maxValue<X){
					maxValue = X;
				}
			}
		}
		// ** 2) Rescale
		var deltaValue = maxValue-minValue;
		for (var row in RP_Matrix){
			for (var col in RP_Matrix[row]){
				var X = RP_Matrix[row][col];
				RP_Matrix[row][col] = 1.0+((X-minValue)/deltaValue);
			}
		}
		if (ConsoleDIV){
			$(ConsoleDIV).append("<p>Values rescaled...</p>");
		}
	};
	var randomPermutations = function(routeLocations){
		var r = 0;
		var temp = 0.0;
		for (var i=0; i<RP_MatrixLen-1; i++){
			//random number between i+1 and #locations-1
			var r = Math.floor((Math.random() * (RP_MatrixLen-(1*i+1))) + (1*i+1));
			var temp = routeLocations[i];
			routeLocations[i] = routeLocations[r];
			routeLocations[r] = temp;
		}
		return routeLocations;
	};
	var linearDistance = function(A, B){
		return RP_Matrix[A][B];
	}
	var calculateCost = function(vectorRoute){
		var distance = 0.0;
		for (var i in vectorRoute){
			var c1 = vectorRoute[i];
			var c2 = (i == (RP_MatrixLen-1))?0:(1*i+1);
			distance += linearDistance(c1,vectorRoute[c2]);
		}
		return distance;
	};
	var pheromoneMatrixInit = function(routeLocations, approxScore){
		var v = (1.0*RP_MatrixLen)/approxScore;
		var pheromones = {};
		for (var i in routeLocations){
			pheromones[routeLocations[i]] = {};
			for (var j in routeLocations){
				pheromones[routeLocations[i]][routeLocations[j]]=v;
			}
		}
		return pheromones;
	};
	var inArray = function(needle, harsh){
		var rt = false;
		for (var i in harsh){
			if (harsh[i]==needle){
				rt = true;
				break;
			}
		}
		return rt;
	};
	var calculateOptions = function(routeLocations, prevLocation, permutations, pheromones, cHeur, cHist){
		var options = [];
		for (var i in routeLocations){
			var coord = routeLocations[i];
			if (inArray(coord, permutations) || coord==prevLocation){continue;};
			var probability = {};
			probability["location"] = i;
			probability["history"] = Math.pow(pheromones[prevLocation][coord], cHist);
			probability["distance"] = linearDistance(prevLocation, coord);
			probability["heuristics"] = Math.pow((1.0/probability["distance"]), cHeur);
			probability["probability"] = probability["history"] * probability["heuristics"];
			options.push(probability);
		}
		return options;
	};
	var selectNextLocation = function(options, routeLocations){
		var sum = 0.0;
		for(var i in options){
			sum += options[i]["probability"];
		}
		if (sum==0.0){
			var iO = Math.floor((Math.random() * (options.length-1)) + 0);
			return routeLocations[options[iO]["location"]];
		} else {
			var v = 1.0*(Math.random() * (options.length*2));
			for(var i in options){
				v -= options[i]["probability"]/sum;
				if (v<=0.0){
					return routeLocations[options[i]["location"]];
				}
			}
			return routeLocations[options[(options.length-1)]["location"]];
		}
	};
	var doStep = function(routeLocations, pheromones, cHeur, cHist){
		var permutations = [];
		var iP = Math.floor((Math.random() * (RP_MatrixLen-1)) + 0);
		permutations.push(routeLocations[iP]);
		var nextLocation = permutations[0];
		while(permutations.length<RP_MatrixLen){
			var options = calculateOptions(routeLocations, nextLocation, permutations, pheromones, cHeur, cHist);
			nextLocation = selectNextLocation(options, routeLocations);
			permutations.push(nextLocation);
		}
		return permutations;
	};
	var decayPheromones = function(pheromones, decayFactor){
		for (var i in pheromones){
			for (var j in pheromones[i]){
				pheromones[i][j] = (1.0-decayFactor) * pheromones[i][j];
			}
		}
		return pheromones;
	};

	var updatePheromones = function(pheromones, solutions) {
		for(var i in solutions){
			for (var j in solutions[i]["vector"]){
				var x = solutions[i]["vector"][j];
				var y = (i==(RP_MatrixLen-1))?solutions[i]["vector"][0]:solutions[i]["vector"][(j+1)];
				pheromones[x][y] += (1.0/solutions[i]["cost"]);
				pheromones[x][y] += (1.0/solutions[i]["cost"]);
			}
		}
		return pheromones;
	};

	var convertToHuman = function(route){
		var results = "";
		for (var i in route["vector"]){
			var j = (i==(RP_MatrixLen-1))?0:(1*i+1);
			results = results+(1*i+1)+": "+route["vector"][i]+" to "+route["vector"][j];
			var row = route["vector"][i];
			var col = route["vector"][j];
			switch(OptimizeBy){
				case 1:
					X = RP_MatrixPoints[row][col]["distanceText"];
					Y = RP_MatrixPoints[row][col]["timeText"];
					results = results+" (Distance: "+X+", Time: "+Y+")\n";
					break;
				case 2:
					X = RP_MatrixPoints[row][col]["distanceText"];
					Y = RP_MatrixPoints[row][col]["timeText"];
					results = results+" (Time: "+X+", Distance: "+Y+")\n";
					break;
				case 3:
					X = RP_MatrixPoints[row][col]["distanceText"];
					Y = RP_MatrixPoints[row][col]["timeText"];
					results = results+" (Distance: "+X+", Time: "+Y+")\n";
					break;
			}
		}
		return results;
	};

	var optimize = function(maxIter, numAnts, decayFactor, cHeur, cHist){
		var routeLocations = RP_MatrixKeys;
		var bestRoute = {};
		bestRoute["vector"] = randomPermutations(routeLocations);
		bestRoute["cost"] = calculateCost(bestRoute["vector"]);
		var pheromones = pheromoneMatrixInit(routeLocations, bestRoute["cost"]);
		if (ConsoleDIV){
			$(ConsoleDIV).append("<div style='margin-top:6px'>Initial route:<p><pre>"+convertToHuman(bestRoute)+"</pre></p></div>");
		}
		var nIter = maxIter+1;
		while(--nIter){
			var solutions = [];
			var nAnts = numAnts+1;
			while (--nAnts){
				var candidate = {};
				candidate["vector"] = doStep(routeLocations, pheromones, cHeur, cHist);
				candidate["cost"] = calculateCost(candidate["vector"]);
				if (candidate["cost"]<bestRoute["cost"]){
					bestRoute = candidate;
					if (ConsoleDIV){
						$(ConsoleDIV).append("<div style='margin-top:6px'>Iteration: "+(maxIter-nIter+1)+", Ant: "+(numAnts-nAnts+1)+"<p>Solution:</p><p><pre>"+convertToHuman(bestRoute)+"</pre></p></div>");
					}
				}
				solutions.push(candidate);
			}
			pheromones = decayPheromones(pheromones, decayFactor);
			pheromones = updatePheromones(pheromones, solutions);
		}
		if (ConsoleDIV){
			$(ConsoleDIV).append("<div style='margin-top:6px'><p>Final Solution:<p><pre>"+convertToHuman(bestRoute)+"</pre></p></div>");
		}
		return bestRoute["vector"];
	};
	return {
		init: function(matrixPoints, optimizeBy, console_div){
			init(matrixPoints, optimizeBy, console_div);
		},
		doOptimize: function(maxIter, numAnts, decayFactor, cHeur, cHist){
			if (typeof(numAnts)=="undefined"){
				var numAnts = Math.ceil(RP_MatrixLen/2)+1;
			}
			if (typeof(maxIter)=="undefined"){
				var maxIter = numAnts * (Math.floor((Math.random() * (300)) + 200));
			}
			if (typeof(decayFactor)=="undefined"){
				var decayFactor = (Math.random() * 0.4) + 0.1;
			}
			if (typeof(cHeur)=="undefined"){
				var cHeur = (Math.random() * 3) + 2;
			}
			if (typeof(cHist)=="undefined"){
				var cHist = (Math.random() * 0.5) + 0.8;
			}
			return optimize(maxIter, numAnts, decayFactor, cHeur, cHist);
		},
		convertToHuman: function(route){
			return convertToHuman(route);
		}
	}
}();
