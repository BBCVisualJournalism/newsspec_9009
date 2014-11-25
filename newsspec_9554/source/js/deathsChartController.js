define(['lib/news_special/bootstrap', 'lib/news_special/template_engine'], function (news, tmpl) {

    'use strict';

    var DeathsChartController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.model = null;
        this.isOverview = false;

        this.$el = news.$('.deaths-chart');
        this.$groupChartEl = news.$('.group-chart .group-chart--items');
        this.$topMethodsEl = news.$('.top-methods');
        this.$chartArea = this.$el.find('.deaths-chart--chart-area');
        this.$axis = this.$el.find('.deaths-chart--axis li');
        this.$barsHolderEl = this.$el.find('.deaths-chart--bars');
        this.$barEls = this.$el.find('.deaths-chart--bars .deaths-chart--bar');
        this.$labelEls = this.$el.find('.deaths-chart--labels li');

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    DeathsChartController.prototype = {

        init: function () {

			/***************************
                * LISTENERS
            ***************************/
            news.pubsub.on('groupChart:drawn', this.draw.bind(this));

        },

        setAxisScale: function () {
            var scale = (this.isOverview) ? [0, 250, 500, 750, 1000] : [0, 100, 200, 300, 400];
            for (var i = 0; i < scale.length; i++) {
                var $axisItem = news.$(this.$axis[i]);
                $axisItem.text(scale[i]);
            }

            return scale;
        },

        setData: function (dataModel, dataIsOverview) {
            this.model = dataModel;
            this.isOverview = dataIsOverview;

            return this;
        },

        setBarValues: function (maxAxis) {
            var barValues = [this.model['civilians_killed'], this.model['military_killed'], this.model['police_killed'],
                            this.model['officials_killed'], this.model['jihadis_killed'], this.model['unknown_killed']];
            
            for (var i = 0; i < barValues.length; i++) {
                var $bar = news.$(this.$barEls[i]),
                    widthPercent = (barValues[i] / maxAxis * 100);

                $bar.animate({ width: widthPercent + '%'}, 500);
            }


        },

        /* 
            Do to the unkowns of the data, it has been decided to make the deaths chart scale vertically
            to fit along side the group, therefore we have to change the charts height depending on the
            group chart. 

            This method sets the charts height and bar heights
            
         */
        setDimensions: function () {
            var fullElementHeight = this.$groupChartEl.height() - 30,
                chartAreaHeight = fullElementHeight - this.$topMethodsEl.outerHeight(true);

            this.$chartArea.height(chartAreaHeight);

            var barsHolderHeight = this.$barsHolderEl.outerHeight(true),
                barMargins = parseInt(news.$(this.$barEls[0]).css('margin-bottom'), 10),
                barHeight = (this.$barsHolderEl.height() - (barMargins * this.$barEls.length)) / this.$barEls.length;

            this.$barEls.height(barHeight);
            this.$labelEls.height(barHeight);
        },

        draw: function (object) {
            var scale = this.setAxisScale(),
                maxAxis = scale[scale.length - 1];
                
            this.setBarValues(maxAxis);

            this.$el.show();

            this.setDimensions();


        }

    };

    return DeathsChartController;

});