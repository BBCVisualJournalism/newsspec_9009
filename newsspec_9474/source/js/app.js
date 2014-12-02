define(['lib/news_special/bootstrap', 'mediator/mapMediator', 'mediator/mapTooltipMediator', 'mediator/miniMapTooltipMediator', 'dataController'],
    function (news, MapMediator, MapTooltipMediator, MiniMapTooltipMediator, DataController) {

    'use strict';

    /***************************
        Additional 'polyfils'
            * bind function -- bloomin phantonjs doesn't support bind :s
    ***************************/
    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = function (context) {
            var slice = Array.prototype.slice;
            var fn = this;

            return function () {
                var args = slice.call(arguments, 1);

                if (args.length) {
                    return arguments.length ? fn.apply(context, args.concat(slice.call(arguments))) : fn.apply(context, args);
                } else {
                    return arguments.length ? fn.apply(context, arguments) : fn.call(context);
                }
            };
        };
    }

    return {
        init: function () {


            /***************************
                mediator store
            ***************************/
            this.dataController = new DataController();

            console.log(this.dataController.getTranslatedGlobalMap());

            this.mapMediator = new MapMediator();
            this.mapTooltipMediator = new MapTooltipMediator();
            this.miniMapTooltipMediator = new MiniMapTooltipMediator();

            news.sendMessageToremoveLoadingImage();
        }
    };

});
