define(['lib/news_special/bootstrap', 'lib/news_special/template_engine', 'dataController', 'lib/vendors/bind-polyfill'], function (news, tmpl, DataController) {

    'use strict';

    var GroupChartController = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.$el = news.$('.group-chart--items');
        this.dataController = new DataController();
        this.dataCollection = null;
        this.totalDeaths = 0;
        this.unknownAndOtherText = null;
        this.chartTmpl = 'group_chart_tmpl';
        this.chartColors = ['#C3D699', '#95BA4D', '#689C00', '#50762C', '#374D1F'];
        this.chartHeight = 485;


        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    GroupChartController.prototype = {

        init: function () {
            /***************************
                * VARS
            ***************************/
            this.unknownAndOtherText = this.dataController.getUnknownAndOtherText();

        },

        setData: function (totalDeaths, dataCollection) {
            this.totalDeaths = totalDeaths;
            this.dataCollection = dataCollection;

            return this;
        },

        getPercentageFor: function (noKillings) {
            return Math.round(noKillings / this.totalDeaths * 100);
        },

        groupSmallGroups: function (data) {
            var self = this,
                returnData = {};

            news.$.each(data, function (groupName, noKillings) {
                if (self.getPercentageFor(noKillings) <= 5) {
                    if (!returnData[self.unknownAndOtherText.other]) {
                        returnData[self.unknownAndOtherText.other] = 0;
                    }
                    returnData[self.unknownAndOtherText.other] += noKillings;
                } else {
                    returnData[groupName] = noKillings;
                }
            });

            return returnData;
        },

        orderGroups: function (data) {
            var orderedData = [],
                self = this;
            for (var groupName in data) {
                var percent = self.getPercentageFor(data[groupName]);
                if (percent !== 0){
                    orderedData.push({name: groupName, percent: percent});
                }
            }
            orderedData.sort(function (a, b) {
                /* Order Unknown last, and other second to last */
                if (a.name === self.unknownAndOtherText.unknown) {
                    return 1;
                }
                if (a.name === self.unknownAndOtherText.other) {
                    if (b.name === self.unknownAndOtherText.unknown) {
                        return -1;
                    } else {
                        return 1;
                    }
                }

                /* Order rest by their no killings */
                return b.percent - a.percent;
            });
            
            return orderedData;
        },

        draw: function () {

            var self = this,
                count = 0,
                combindedData = this.groupSmallGroups(this.dataCollection),
                orderedData = this.orderGroups(combindedData);

            this.$el.empty();

            /* Count the number of groups */
            var groupCount = 0;
            for (var k in orderedData) {
                ++groupCount;
            }

            /* Calculate the size of the chart without whitespace */
            var chartsHeight = this.chartHeight - (groupCount * 20);

            //news.$.each(orderedData, function (groupName, noKillings) {

            for (var x = 0; x < orderedData.length; x++) {

                var rowData = orderedData[x];

                self.$el.append(tmpl(self.chartTmpl, rowData));

                var $thisRow = self.$el.find('.group-chart--row').last(),
                    $thisBar = $thisRow.find('.group-chart--bar'),
                    $thisLabel = $thisRow.find('.group-chart--label'),
                    color = self.chartColors[count % self.chartColors.length],
                    barHeight = (rowData.percent / 100 * chartsHeight),
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
            }

            news.pubsub.emit('groupChart:drawn');

            this.animate();
        },

        animate: function () {

            $('.group-chart--row').each(function () {

                var $chartLabel = news.$(this).find('.group-chart--label'),
                    $bar = news.$(this).find('.group-chart--bar');

                var labelTopMargin = parseInt($chartLabel.css('margin-top'), 10),
                    labelBottomMargin = parseInt($chartLabel.css('margin-bottom'), 10),
                    barTopMargin = parseInt($bar.css('margin-top'), 10),
                    barBottomMargin = parseInt($bar.css('margin-bottom'), 10);

                $chartLabel.hide();
                $chartLabel.css('margin-top', 0);
                $chartLabel.css('margin-bottom', 0);
                $bar.css('margin-top', 0);
                $bar.css('margin-bottom', 0);

                $bar.animate({ marginTop: barTopMargin, marginBottom: barBottomMargin}, 600);
                $chartLabel.animate({ marginTop: labelTopMargin, marginBottom: labelBottomMargin}, 600);

                $chartLabel.fadeIn(1200);



            });

                
        }

    };

    return GroupChartController;

});