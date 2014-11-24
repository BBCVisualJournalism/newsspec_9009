define(['lib/news_special/bootstrap', 'groupChartController', 'deathsChartController'], function (news, GroupChartController, DeathsChartController) {

    return {
        init: function () {
            news.sendMessageToremoveLoadingImage();

            var testTotalDeaths = 479,
                testCollection = {'IS': 423, 'Unknown': 31, 'Jabhat Al-Nusra': 9, 'Some group name': 5, 'Another group here': 5, 'Bang bang': 5,  'Group namess': 1},
                testCountryInfo = {'total_killed': 209, 'jihadis_killed': 76, 'civilians_killed': 82, 'military_killed': 25, 'police_killed': 8, 'officials_killed': 11, 'children_killed': 4, 'unknown_killed': 240};



            var groupChartController = new GroupChartController(),
                deathsChartController = new DeathsChartController();

            /* SET THE DATA */
            groupChartController.setData(testTotalDeaths, testCollection);
            deathsChartController.setData(testCountryInfo, true);

            groupChartController.draw();
            /* Death chart will be drawn automatically after the group has been drawn, via a pubsub */

        }
    };

});
