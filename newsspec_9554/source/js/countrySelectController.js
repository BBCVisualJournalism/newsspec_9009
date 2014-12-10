define(['lib/news_special/bootstrap', 'topMethodsController', 'groupChartController', 'deathsChartController', 'dataController', 'lib/vendors/bind-polyfill'], function (news, TopMethodsController, GroupChartController, DeathsChartController, DataController) {

    'use strict';

    var CountrySelectController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.$el = news.$('.county-select');
        this.dataController = new DataController();
        this.topMethodsController = new TopMethodsController();
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
            this.countryData = this.dataController.getTranslated();
            this.loadCountryList();
            this.updateCountry();

			/***************************
                * LISTENERS
            ***************************/
            this.$el.on('change', this.updateCountry.bind(this));
        },

        orderCountries: function (countries) {
            var orderedCountries = [];
            for (var country in countries) {
                orderedCountries.push(country);
            }
            orderedCountries.sort();
                        
            return orderedCountries;
        },

        loadCountryList: function () {
            var self = this,
                sortedCountries = this.orderCountries(this.countryData);

            news.$.each(sortedCountries, function (index, countryName) {
                if (countryName !== 'overview') {
                    self.$el.append('<option>' + countryName + '</option>');
                }
            });
        },

        updateCountry: function () {
            var selectedCountry = this.countryData[this.$el.val()];

            news.pubsub.emit('istats', ['interactive-show-country', 'newsspec-interaction', this.$el.val()]);

            this.topMethodsController.setData(selectedCountry.attacks_number, selectedCountry.method_totals);
            this.groupChartController.setData(selectedCountry.total_killed, selectedCountry.group_totals);
            this.deathsChartController.setData(selectedCountry, (this.$el.val() === 'overview'));


            this.topMethodsController.draw();
            this.groupChartController.draw();
            /* Death chart will be drawn automatically after the group has been drawn, via a pubsub */
        }
    };

    return CountrySelectController;

});