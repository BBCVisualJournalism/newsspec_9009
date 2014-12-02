define(['lib/news_special/bootstrap', 'text!../assets/countries_data.json', 'text!../assets/incidents.json', 'text!../assets/global_map_data.json'],
    function (news, countriesJson, incidentsJson, globalMapJson) {

    'use strict';


    var DataController = function () {
        this.vocabs = null;
        this.loadVocabs();
    };

    DataController.prototype = {

        loadVocabs: function () {
            this.vocabs = window.vocbas;
        },

        getVocabs: function () {
            return this.vocabs;
        },

        translateCountry: function (country) {
            return (country !== 'overview') ? this.vocabs[country] : 'overview';
        },

        translateMethods: function (methods) {
            var self = this,
                translateMethods = {};

            news.$.each(methods, function (method, total) {
                var translatedMethodName = self.vocabs[method];
                translateMethods[translatedMethodName] = total;
            });

            return translateMethods;
        },

        translateGroups: function (groups) {
            var self = this,
                translateGroups = {};

            news.$.each(groups, function (group, total) {
                var translatedGroupName = self.vocabs[group];
                translateGroups[translatedGroupName] = total;
            });

            return translateGroups;
        },

        getTranslatedCountries: function () {
            var self = this,
                translatedData = {};

            translatedData.countries = {};

            var countriesData = JSON.parse(countriesJson);

            news.$.each(countriesData.countries, function (country, countryData) {
                var translatedCountryData = countryData;
                translatedCountryData.method_totals = self.translateMethods(countryData.method_totals);
                translatedCountryData.group_totals = self.translateGroups(countryData.group_totals);
                translatedData.countries[self.translateCountry(country)] = translatedCountryData;
            });

            translatedData.incidentLookup = countriesData.incidentLookup;

            news.$.each(countriesData.incidentLookup, function (index, countryName) {
                translatedData.incidentLookup[index] = self.translateCountry(countryName);
            });


            return translatedData;
        },

        getTranslatedIncidents: function () {
            var self = this,
                translatedData = {};


            var incidentsData = JSON.parse(incidentsJson);


            news.$.each(incidentsData, function (index, incident) {
                var translatedIncident = {};

                translatedIncident.date = self.vocabs[incident.date];
                translatedIncident.group_responsible = self.vocabs[incident.group_responsible];
                translatedIncident.total_killed = incident.total_killed;
                translatedIncident.type_of_attack = self.vocabs[incident.type_of_attack];

                translatedData[index] = translatedIncident;
            });

            return translatedData;
        },

        getTranslatedGlobalMap: function () {
            var self = this,
                translatedData = {};


            var globalMapData = JSON.parse(globalMapJson);
            console.log(globalMapData);

            news.$.each(globalMapData, function (date, globalMapItems) {
                var translatedGlobalMapItems = [];
                for (var i = 0; i < globalMapItems.length; i++) {
                    var mapItem = globalMapItems[i],
                        translatedItem = news.$.extend({}, mapItem);

                    translatedItem.country = self.vocabs[mapItem.country];
                    translatedGlobalMapItems.push(translatedItem);
                }

                var translatedDate = self.vocabs[date];

                translatedData[translatedDate] = translatedGlobalMapItems;
            });

            return translatedData;
        }

    };

    return DataController;


});