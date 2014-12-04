define(['lib/news_special/bootstrap', 'text!../assets/countries_data.json'], function (news, data) {

    'use strict';


    var DataController = function () {
        this.data = null;
        this.vocabs = null;
        this.loadVocabs();

        this.missingArray = [];
    };

    DataController.prototype = {

        loadVocabs: function () {
            this.vocabs = window.vocbas;
        },

        getUnknownAndOtherText: function () {
            return {
                unknown: this.vocabs['group_unknown'],
                other: this.vocabs['group_other']
            };
        },

        translateCountry: function (country) {
            return (country !== 'overview') ? this.vocabs[country] : 'overview';
        },

        translateMethods: function (methods) {
            var self = this,
                translateMethods = {};

            news.$.each(methods, function (method, total) {
                var translatedMethodName = self.vocabs[method];
                if (translatedMethodName === undefined) {
                    translateMethods[method] = total;

                    if (self.missingArray.indexOf(method) === -1) {
                        console.log('Missing translation for ' + method);
                        self.missingArray.push(method);
                    }
                } else {
                    translateMethods[translatedMethodName] = total;
                }
            });

            return translateMethods;
        },

        translateGroups: function (groups) {
            var self = this,
                translateGroups = {};

            news.$.each(groups, function (group, total) {
                var translatedGroupName = self.vocabs[group];
                if (translatedGroupName === undefined) {
                    translateGroups[group] = total;

                    if (self.missingArray.indexOf(group) === -1) {
                        console.log('Missing translation for ' + group);
                        self.missingArray.push(group);
                    }
                } else {
                    translateGroups[translatedGroupName] = total;
                }
            });

            return translateGroups;
        },

        getTranslated: function () {
            var self = this,
                translatedData = {};

            this.data = JSON.parse(data).countries;

            news.$.each(this.data, function (country, countryData) {
                var translatedCountryData = countryData;

                translatedCountryData.method_totals = self.translateMethods(countryData.method_totals);

                translatedCountryData.group_totals = self.translateGroups(countryData.group_totals);

                translatedData[self.translateCountry(country)] = translatedCountryData;
            });


            return translatedData;
        }

    };

    return DataController;


});