define(['lib/news_special/bootstrap', 'groupChartController'], function (news, GroupChartController) {

    return {
        init: function () {
            news.sendMessageToremoveLoadingImage();

            var testTotalDeaths = 479,
                testCollection = {'IS': 423, 'Unknown': 31, 'Jabhat Al-Nusra': 9, 'Some group name': 5, 'Another group here': 5, 'Bang bang': 5,  'Group namess': 1};

            var groupChartController = new GroupChartController();
            groupChartController.setData(testTotalDeaths, testCollection).draw();

        }
    };

});
