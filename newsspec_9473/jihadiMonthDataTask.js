(function () {
	var csvParse = require('csv-parse'), fs = require('fs');

	var csvProperHeaders = ['report_number',
							'date_of_incident',
							'local_time_of_incident',
							'location_of incident',
							'country',
							'province',
							'city',
							'latitude',
							'longitude',
							'type_of_attack',
							'total_killed',
							'jihadis_killed',
							'civilians_killed',
							'military_killed',
							'police_killed',
							'officials_killed',
							'children_killed',
							'target',
							'type_of_target',
							'group_responsible',
							'method_for_determining_group',
							'source',
							'notable_aspects',
							'headline',
							'bbc_link'];

	var parentProjectDirectoryPath = __dirname.split('/');
	parentProjectDirectoryPath.pop();
	parentProjectDirectoryPath = parentProjectDirectoryPath.join('/');

	/**********************
		* Check the csv file path has been passed
	**********************/
	if (process.argv[2]) {
		parseCSV(process.argv[2]);
	}
	else {
		showError('Error:\n-----\nTo use this task parse the path to the csv file as an argument.\n\nExample:\n-------\nnode jihadiMonthDataTask.js ~/Desktop/data.csv');
	}

	/**********************
		* load and parse the csv file
	**********************/
	function parseCSV (filePath) {
		fs.readFile(filePath, {encoding:'utf8'}, function (err, fileStr) {
			if (err)  {
				throw err;
			}
			csvParse(fileStr, {comment: '#'}, function(err, output){
				if (err) {
					console.log('csv parse Error: ', err);
				}

				/**********************
					* validate the csv headers!
				**********************/
				var a, headerLength = csvProperHeaders.length;
				for (a = 0; a < headerLength; a++) {
					if (csvProperHeaders[a] != output[0][a]) {
						showError('Error:\n-----\nThe csv file you supplied doesn\'t have the correct headers. The headers should be exactly the same as the following in exactly the same order:\n\n' + csvProperHeaders);
						return;
					}
				}

				/**********************
					* if we've got this far then the csv has been validated :)
					*
					* lets create the giant json format from the csv
				**********************/
				var outputJSON = {}, rowsLength = output.length;
				for (a = 1; a < rowsLength; a++) {
					var rowArr = output[a];
					var incidentNum = parseInt(rowArr[0], 10);
					if (!isNaN(incidentNum)) {
						outputJSON[incidentNum] = {};
						var rowOutputObj = outputJSON[incidentNum];
						var b, collumsLength = csvProperHeaders.length;
						for (b = 1; b < collumsLength; b++) {
							rowOutputObj[output[0][b]] = rowArr[b];
						}
					}
				}

				/**********************
					* output the global map to json!
					*
					* lets construct the global map object with only the properties that it needs
					*
					* then we'll output the results to a json file locally
				**********************/
				var globalMapDataObj = {};
				for (a = 1; a < rowsLength; a++) {
					var rowArr = output[a];
					var incidentNum = parseInt(rowArr[0], 10);
					if (!isNaN(incidentNum)) {
						globalMapDataObj[incidentNum] = {};
						var rowOutputObj = globalMapDataObj[incidentNum];
						var b, collumsLength = csvProperHeaders.length;
						for (b = 1; b < collumsLength; b++) {
							if (b == 7 || b == 8 || b == 10) {
								/**********************
									* only add the following preoperties the row object:
										* latitude (7)
										* longitude (8)
										* total_killed (10)
								**********************/
								// rowOutputObj[output[0][b]] = rowArr[b];
								rowOutputObj[output[0][b]] = rowArr[b].replace(/[^0-9.-]/g, '');
							}
						}
					}
				}
				/**********************
					* output the global map object to json!
				**********************/
				// fs.writeFile('./globalMapData.json', JSON.stringify(globalMapDataObj), {encoding:'utf8'}, function (err) {
				// 	if (err) {
				// 		throw err;
				// 	}
				// 	console.log('saved the globalMapData json file');
				// });

				var globalMapDatesObj = {};
				for (var key in outputJSON) {
					var rowObj = outputJSON[key];
					globalMapDatesObj[rowObj.date_of_incident] = globalMapDatesObj[rowObj.date_of_incident] || [];
					var dateObj = globalMapDatesObj[rowObj.date_of_incident];
						
					dateObj.push({
						report_number: key,
						latitude: outputJSON[key].latitude.replace(/[^0-9.-]/g, ''),
						longitude: outputJSON[key].longitude.replace(/[^0-9.-]/g, ''),
						total_killed: outputJSON[key].total_killed
					});
				}
				/**********************
					* output the global map object to json!
				**********************/
				fs.writeFile(parentProjectDirectoryPath + '/newsspec_9474/source/assets' + '/global_map_data.json', JSON.stringify(globalMapDatesObj), {encoding:'utf8'}, function (err) {
					if (err) {
						throw err;
					}
					console.log('saved the global_map_data sorted by date json file');
				});



				/*********************
					* output the countries data
				*********************/
				var countriesObj = {}, countryLookup = [], worldKilledTotal = 0, worldAttacksTotal = 0;
				for (a = 1; a < rowsLength; a++) {
					var rowArr = output[a];
					var incidentNum = parseInt(rowArr[0], 10);
					if (!isNaN(incidentNum)) {
						var countryName = rowArr[4].trim();
						countriesObj[countryName] = countriesObj[countryName] || {
							total_killed:		0,
							jihadis_killed:		0,
							civilians_killed:	0,
							military_killed:	0,
							police_killed:		0,
							officials_killed:	0,
							children_killed:	0,
							unknown_killed:  	0,
							attacks_number: 	0, 
							report_numbers:		[],
							group_totals: {}
						};

						countriesObj['overview'] = countriesObj['overview'] || {
							total_killed:		0,
							jihadis_killed:		0,
							civilians_killed:	0,
							military_killed:	0,
							police_killed:		0,
							officials_killed:	0,
							children_killed:	0,
							unknown_killed:  	0,
							attacks_number: 	0, 
							report_numbers:		[],
							group_totals: {}
						};

						var totalKilled = parseInt(rowArr[10], 10) || 0,
							jihadisKilled = parseInt(rowArr[11], 10) || 0,
							civiliansKilled = parseInt(rowArr[12], 10) || 0,
							militaryKilled = parseInt(rowArr[13], 10) || 0,
							policeKilled = parseInt(rowArr[14], 10) || 0,
							officialsKilled = parseInt(rowArr[15], 10) || 0;

						countriesObj[countryName].total_killed += totalKilled;
						countriesObj[countryName].jihadis_killed += jihadisKilled;
						countriesObj[countryName].civilians_killed += civiliansKilled;
						countriesObj[countryName].military_killed += militaryKilled;
						countriesObj[countryName].police_killed += policeKilled;
						countriesObj[countryName].officials_killed += officialsKilled;
						countriesObj[countryName].children_killed += parseInt(rowArr[16], 10) || 0;

						countriesObj['overview'].total_killed += totalKilled;
						countriesObj['overview'].jihadis_killed += jihadisKilled;
						countriesObj['overview'].civilians_killed += civiliansKilled;
						countriesObj['overview'].military_killed += militaryKilled;
						countriesObj['overview'].police_killed += policeKilled;
						countriesObj['overview'].officials_killed += officialsKilled;
						countriesObj['overview'].children_killed += parseInt(rowArr[16], 10) || 0;



						/* Calculate how many unkown deaths */
						var unknownKilled =  totalKilled - jihadisKilled - civiliansKilled - militaryKilled;
						unknownKilled = unknownKilled - policeKilled - officialsKilled;
						/* If less than 0, be 0 */
						unknownKilled = (unknownKilled<0) ? 0 : unknownKilled;

						countriesObj[countryName].unknown_killed += unknownKilled;
						countriesObj['overview'].unknown_killed += unknownKilled;

						var groupName = (rowArr[19]!=='') ? rowArr[19].trim() : 'Unknown';

						/* If this is the first time the group appeared, init total to 0 */
						if(!countriesObj[countryName].group_totals[groupName]){
							countriesObj[countryName].group_totals[groupName] = 0;
						}
						if(!countriesObj['overview'].group_totals[groupName]){
							countriesObj['overview'].group_totals[groupName] = 0;
						}
						/* Add the groups total */
						countriesObj[countryName].group_totals[groupName] += parseInt(rowArr[10], 10);
						countriesObj['overview'].group_totals[groupName] += parseInt(rowArr[10], 10);

						countriesObj[countryName].attacks_number += 1;
						countriesObj[countryName].report_numbers.push(parseInt(rowArr[0], 10));

						countriesObj['overview'].attacks_number += 1;
						countriesObj['overview'].report_numbers.push(parseInt(rowArr[0], 10));

						worldKilledTotal += parseInt(rowArr[10], 10);
						worldAttacksTotal += 1;

						countryLookup[parseInt(rowArr[0], 10)] = countryName;
					}
				}

				for (var key in countriesObj) {
					var countryTotalKilled = countriesObj[key].total_killed;
					countriesObj[key].total_world_killed_percent = (countryTotalKilled / worldKilledTotal) * 100;
					var countryTotalAttacks = countriesObj[key].attacks_number;
					countriesObj[key].total_world_attacks_percent = (countryTotalAttacks / worldAttacksTotal) * 100;
				}

				var countriesOutputObj = {};
				countriesOutputObj.countries = countriesObj;
				countriesOutputObj.incidentLookup = countryLookup;
				/**********************
					* output the global map object to json (newsspec_9474)!
				**********************/
				var outputString = JSON.stringify(countriesOutputObj);
				fs.writeFile(parentProjectDirectoryPath + '/newsspec_9474/source/assets' + '/countries_data.json', outputString, {encoding:'utf8'}, function (err) {
					if (err) {
						throw err;
					}
					console.log('saved the countries_data json file');
				});

				/**********************
					* output the global map object to json (newsspec_9554)!
				**********************/
				var outputString = JSON.stringify(countriesOutputObj);
				fs.writeFile(parentProjectDirectoryPath + '/newsspec_9554/source/assets' + '/countries_data.json', outputString, {encoding:'utf8'}, function (err) {
					if (err) {
						throw err;
					}
					console.log('saved the countries_data json file');
				});

			});
		});
	}

	/**********************
		* Error handling
	**********************/
	function showError (msg) {
		console.log(msg);
		return 1;
	}
	
}());