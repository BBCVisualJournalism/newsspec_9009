define(['lib/news_special/bootstrap', 'lib/news_special/template_engine'], function (news, tmpl) {

    'use strict';

    var DeathsChartController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.$el = news.$('.deaths-chart');
        this.$axis = this.$el.find('.deaths-chart--axis li');
        this.model = null;
        this.isOverview = false;

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
            console.log('init');

        },

        setAxisScale: function () {
            console.log(this.isOverview);
            var scale = (this.isOverview) ? [0, 200, 400, 600, 800] : [0, 100, 200, 300, 400];
            console.log(scale);
            for (var i = 0; i < scale.length; i++) {
                var $axisItem = news.$(this.$axis[i]);
                console.log($axisItem);
                $axisItem.text(scale[i]);
            }
        },

        setData: function (dataModel, dataIsOverview) {
            console.log('setting data');
            console.log(dataIsOverview);
            this.model = dataModel;
            this.isOverview = dataIsOverview;
            console.log(this.isOverview);


            return this;
        },

        draw: function (object) {
            this.setAxisScale();

            this.$el.show();
        }

    };

    return DeathsChartController;

});