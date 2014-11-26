define(['lib/news_special/bootstrap'], function (news) {

    'use strict';

    var TopMethodsController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.model = null;

        this.$el = news.$('.top-methods');
        this.$methodsList = this.$el.find('.top-methods--list li');

    };

    TopMethodsController.prototype = {

        setData: function (dataModel) {
            this.model = dataModel;

            return this;
        },

        updateTopMethods: function (data, totalMethodCount) {
            this.$methodsList.hide();

            for (var i = 0; (i < data.length && i < 3); i++) {
                var $methodItem = news.$(this.$methodsList[i]),
                    method = data[i],
                    percentage = Math.round(method.count / totalMethodCount * 100);
                    
                $methodItem.html('<strong>' + percentage + '% </strong>' + method.method);

                $methodItem.show();

            }
        },

        order: function (data) {
            var orderedData = [];
            for (var method in data) {
                orderedData.push({method: method, count: data[method]});
            }
            orderedData.sort(function (a, b) {
                return b.count - a.count;
            });
            
            return orderedData;
        },

        draw: function () {

            /* Calculate the total number of methods */
            var totalMethodCount = 0;
            for (var method in this.model) {
                totalMethodCount += this.model[method];
            }

            var orderedData = this.order(this.model);

            this.updateTopMethods(orderedData, totalMethodCount);

        }

    };

    return TopMethodsController;

});