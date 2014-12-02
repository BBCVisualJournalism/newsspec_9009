define(function (require) {

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

    /***************************
        Variables
    ***************************/
    var news = require('lib/news_special/bootstrap');
    var MapMediator = require('mediator/mapMediator');
    var MapTooltipMediator = require('mediator/mapTooltipMediator');
    var MiniMapTooltipMediator = require('mediator/miniMapTooltipMediator');

    return {
        init: function () {

            news.pubsub.emit('istats', ['app-initiated', 'newsspec-nonuser', true]);

            news.sendMessageToremoveLoadingImage();

            /***************************
                mediator store
            ***************************/
            this.mapMediator = new MapMediator();
            this.mapTooltipMediator = new MapTooltipMediator();
            this.miniMapTooltipMediator = new MiniMapTooltipMediator();
        }
    };

});
