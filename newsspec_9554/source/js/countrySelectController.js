define(['lib/news_special/bootstrap', 'groupChartController', 'deathsChartController', 'text!../assets/countries_data.json', 'lib/vendors/bind-polyfill'], function (news, GroupChartController, DeathsChartController, data) {

    'use strict';

    var CountrySelectController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.$el = news.$('.county-select');
        this.groupChartController = new GroupChartController();
        this.deathsChartController = new DeathsChartController();
        this.countryData = null;

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    CountrySelectController.prototype = {

        init: function () {
            this.countryData = JSON.parse(data).countries;
            this.loadCountryList();
            this.updateCountry();

			/***************************
                * LISTENERS
            ***************************/
            this.$el.on('change', this.updateCountry.bind(this));
        },

        orderCountries: function (countries) {
            var orderedCountries = [];
            for (var country in countries){
                orderedCountries.push(country);
            }
            orderedCountries.sort();
                        
            return orderedCountries;
        },

        loadCountryList: function () {
            var self = this,
                sortedCountries = this.orderCountries(this.countryData);
            this.$el.empty();
            this.$el.append('<option value="overview" selected="selected">All ' + (sortedCountries.length - 1) + ' countries</option>');



            news.$.each(sortedCountries, function (index, countryName) {
                if (countryName !== 'overview') {
                    self.$el.append('<option>' + countryName + '</option>');
                }
            });
        },

        updateCountry: function () {
            var selectedCountry = this.countryData[this.$el.val()];
            
            this.groupChartController.setData(selectedCountry.total_killed, selectedCountry.group_totals);
            this.deathsChartController.setData(selectedCountry, (this.$el.val() === 'overview'));


            this.groupChartController.draw();
            /* Death chart will be drawn automatically after the group has been drawn, via a pubsub */
        }
    };

    return CountrySelectController;

});