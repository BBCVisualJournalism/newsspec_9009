define(['lib/news_special/bootstrap'], function (news) {

    'use strict';

    return {
        init: function () {

            alert('Hello shitty IE');
            /***************************
                mediator store
            ***************************/

            // news.$('.main').removeClass('hideMe');
            news.sendMessageToremoveLoadingImage();

            // this.mapMediator = new MapMediator();
            // this.mapTooltipMediator = new MapTooltipMediator();
            // this.miniMapTooltipMediator = new MiniMapTooltipMediator();

        }
    };

});
