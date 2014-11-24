define(['lib/news_special/bootstrap', 'lib/news_special/template_engine', 'lib/vendors/bind-polyfill'], function (news, tmpl) {

    'use strict';

    var GroupChartController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.$el = news.$('.group-chart--items');
        this.dataCollection = null;
        this.totalDeaths = 0;
        this.chartTmpl = 'group_chart_tmpl';
        this.chartColors = ['#C3D699', '#95BA4D', '#689C00', '#50762C', '#374D1F'];
        this.chartHeight = 365;


        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    GroupChartController.prototype = {

        init: function () {

			/***************************
                * LISTENERS
            ***************************/
            news.pubsub.on('groupChart:drawWith', this.drawWith.bind(this));
        },

        setData: function (totalDeaths, dataCollection) {
            this.totalDeaths = totalDeaths;
            this.dataCollection = dataCollection;

            return this;
        },

        getPercentageFor: function (noKillings) {
            return Math.round(noKillings / this.totalDeaths * 100);
        },

        draw: function () {
            var self = this,
                count = 0;

            this.$el.empty();

            /* Count the number of groups */
            var groupCount = 0;
            for (var k in this.dataCollection) {
                ++groupCount;
            }

            /* Calculate the size of the chart without whitespace */
            var chartsHeight = this.chartHeight - (groupCount * 20);

            $.each(this.dataCollection, function (groupName, noKillings) {
                var percent = self.getPercentageFor(noKillings),
                    rowData = {
                        percent: percent,
                        name: groupName
                    };

                self.$el.append(tmpl(self.chartTmpl, rowData));

                var $thisRow = self.$el.find('.group-chart--row').last(),
                    $thisBar = $thisRow.find('.group-chart--bar'),
                    $thisLabel = $thisRow.find('.group-chart--label'),
                    color = self.chartColors[count % self.chartColors.length],
                    barHeight = (percent / 100 * chartsHeight),
                    barHeightWithMargin = (barHeight + 20),
                    labelHeight = $thisLabel.height(),
                    labelHeightWithMargin = (labelHeight + 10);

                /* Make the bar atleast 1px, so it displays. */
                barHeight = (barHeight >= 1) ? barHeight : 1;

                $thisBar.height(barHeight);
                $thisBar.css('background-color', color);

                /* Check what padding we need to add to the label
                 to position it in the middle */
                if (barHeightWithMargin > labelHeightWithMargin) {
                    var marginToCenterLabel = (barHeightWithMargin - labelHeightWithMargin) / 2;
                    $thisLabel.css('margin-top', (5 + marginToCenterLabel) + 'px');
                } else {
                    var marginToCenterBar = (labelHeightWithMargin - barHeightWithMargin) / 2;
                    $thisBar.css('margin-top', (10 + marginToCenterBar) + 'px');
                }

                count++;
            });

        },

        drawWith: function (data) {
            this.setData(data.totalDeaths, data.collection);
            this.draw();
        }

    };

    return GroupChartController;

});