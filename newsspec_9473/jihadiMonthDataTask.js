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
						var countryName = rowArr[4];
						countriesObj[countryName] = countriesObj[countryName] || {
							total_killed:		0,
							jihadis_killed:		0,
							civilians_killed:	0,
							military_killed:	0,
							police_killed:		0,
							officials_killed:	0,
							children_killed:	0,
							attacks_number: 	0, 
							report_numbers:		[]
						};
						countriesObj[countryName].total_killed += parseInt(rowArr[10], 10);
						countriesObj[countryName].jihadis_killed += parseInt(rowArr[11], 10);
						countriesObj[countryName].civilians_killed += parseInt(rowArr[12], 10);
						countriesObj[countryName].military_killed += parseInt(rowArr[13], 10);
						countriesObj[countryName].police_killed += parseInt(rowArr[14], 10);
						countriesObj[countryName].officials_killed += parseInt(rowArr[15], 10);
						countriesObj[countryName].children_killed += parseInt(rowArr[16], 10);

						countriesObj[countryName].attacks_number += 1;
						countriesObj[countryName].report_numbers.push(parseInt(rowArr[0], 10));

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
					* output the global map object to json!
				**********************/
				var outputString = JSON.stringify(countriesOutputObj);
				fs.writeFile(parentProjectDirectoryPath + '/newsspec_9474/source/assets' + '/countries_data.json', outputString, {encoding:'utf8'}, function (err) {
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