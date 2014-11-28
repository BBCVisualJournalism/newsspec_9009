define(['lib/news_special/bootstrap', 'lib/news_special/template_engine'], function (news, tmpl) {

    'use strict';

    var DeathsChartController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.model = null;
        this.isOverview = false;

        this.animationTime = 1200;

        this.$el = news.$('.deaths-chart');
        this.$groupChartEl = news.$('.group-chart');
        this.$groupChartItemsEl = this.$groupChartEl.find('.group-chart--items');
        this.$topMethodsEl = news.$('.top-methods');
        this.$totalDeaths = this.$el.find('.deaths-chart--total-deaths');
        this.$chartArea = this.$el.find('.deaths-chart--chart-area');
        this.$axis = this.$el.find('.deaths-chart--axis li');
        this.$barsHolderEl = this.$el.find('.deaths-chart--bars');
        this.$barEls = this.$el.find('.deaths-chart--bars .deaths-chart--bar');
        this.$barLabelEls = this.$el.find('.deaths-chart--bars .deaths-chart--bar-label');
        this.$labelEls = this.$el.find('.deaths-chart--labels li');

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    DeathsChartController.prototype = {

        init: function () {

            news.$.fn.percWidth = function () {
                return this.outerWidth() / this.parent().outerWidth() * 100;
            };

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

        getBarValues: function () {
            return [this.model['civilians_killed'], this.model['military_killed'], this.model['police_killed'],
                    this.model['officials_killed'], this.model['jihadis_killed'], this.model['unknown_killed']];
        },

        setTotalDeaths: function () {
            var barValues = this.getBarValues(),
                total = 0;

            for (var i = 0; i < barValues.length; i++) {
                total += barValues[i];
            }

            this.$totalDeaths.text(total);
        },

        setBarValues: function (maxAxis) {
            var barValues = this.getBarValues();
            var barAmimationTime = this.animationTime / 2;


            for (var i = 0; i < barValues.length; i++) {
                var $bar = news.$(this.$barEls[i]),
                    $label = news.$(this.$barLabelEls[i]),
                    widthPercent = (barValues[i] / maxAxis * 100);

                $bar.animate({ width: widthPercent + '%'}, barAmimationTime);

                /* If bar value is greater than 0, show the label */
                var labelText = (barValues[i] > 0) ? barValues[i] : '';
                $label.text(labelText);
            }


        },

        /* 
            Do to the unkowns of the data, it has been decided to make the deaths chart scale vertically
            to fit along side the group, therefore we have to change the charts height depending on the
            group chart. 

            This method sets the charts height and bar heights
            
         */
        setDimensions: function () {
            var chartAreaHeight = 0;

            /* If we're on a larger device, calculate the chart height from groupschart */
            if (this.$groupChartEl.css('position') === 'absolute') {
                var fullElementHeight = this.$groupChartItemsEl.height();
                chartAreaHeight = fullElementHeight - this.$topMethodsEl.outerHeight(true) + 40;
            } else {
                chartAreaHeight = 210;
            }

            this.$chartArea.height(chartAreaHeight);

            var barsHolderHeight = this.$barsHolderEl.outerHeight(true),
                barMargins = parseInt(news.$(this.$barEls[0]).css('margin-bottom'), 10) + parseInt(news.$(this.$barEls[0]).css('margin-top'), 10),
                barHeight = (this.$barsHolderEl.height() - (barMargins * this.$barEls.length)) / this.$barEls.length;

            this.$barEls.height(barHeight);
            this.$labelEls.height(barHeight);

            var self = this;
            var barAmimationTime = this.animationTime / 2,
                labelAnimationTime = this.animationTime - barAmimationTime;

            setTimeout(function () {
                /* Position bar labels */
                self.$barLabelEls.each(function (index) {
                    var $label = news.$(this),
                        $bar = $label.prev('.deaths-chart--bar'),
                        yPos = (index * (barHeight + barMargins)) + (barHeight / 2) - 5,
                        xPos = $bar.percWidth() + '%';

                    $label.css('top', yPos);
                    $label.css('left', xPos);
                });

                self.$barLabelEls.fadeIn(labelAnimationTime);

            }, barAmimationTime);

        },

        draw: function (object) {
            var scale = this.setAxisScale(),
                maxAxis = scale[scale.length - 1];

            this.$barLabelEls.hide();

            this.setTotalDeaths();
                
            this.setBarValues(maxAxis);

            this.$el.show();

            this.setDimensions();


        }

    };

    return DeathsChartController;

});