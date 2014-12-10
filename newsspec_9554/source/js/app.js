define(['lib/news_special/bootstrap', 'countrySelectController'], function (news, CountrySelectController) {

    return {
        init: function () {
            news.$('.main').show();
            new CountrySelectController();
            news.sendMessageToremoveLoadingImage();

        }
    };

});
