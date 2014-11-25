define(['lib/news_special/bootstrap', 'countrySelectController'], function (news, CountrySelectController) {

    return {
        init: function () {

            new CountrySelectController();
            news.sendMessageToremoveLoadingImage();

        }
    };

});
