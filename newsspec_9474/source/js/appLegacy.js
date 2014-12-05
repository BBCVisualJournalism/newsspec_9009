define(['lib/news_special/bootstrap', 'mediator/mapBottomBarMediator'], function (news, MapBottomBar) {

    'use strict';

    /***************************
        Additional 'polyfils'
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

    var $ = news.$;
    var mapBottomBar = new MapBottomBar();

    function hideUnwantedElements() {
        $('.hideLegacy').hide();
    }

    function displayFallbackImages() {
        $('.mapHolder').append($('<img src="img/fallback-map.png" alt="Map" class="legacyMapImage" />'));
        $('.mini-map__iraq .miniMapCanvases').append($('<img src="img/fallback-map-irq.png" alt="Map" class="legacyMapImage" />'));
        $('.mini-map__afgahn .miniMapCanvases').append($('<img src="img/fallback-map-pak.png" alt="Map" class="legacyMapImage" />'));
        $('.mini-map__nigeria .miniMapCanvases').append($('<img src="img/fallback-map-nga.png" alt="Map" class="legacyMapImage" />'));
        $('.legendKeys').empty().append($('<img src="img/legend-fallback.png" alt="Key" class="legacyKeyImage" />'));
    }

    function doBottomBar() {
        mapBottomBar.setData({
            days: 30,
            countries: 15,
            attacks: 666,
            deaths: 5045
        });

        mapBottomBar.show();
    }

    return {
        init: function () {

            hideUnwantedElements();
            displayFallbackImages();
            doBottomBar();

            news.$('.main').removeClass('hideMe');
            news.sendMessageToremoveLoadingImage();


            // this.mapMediator = new MapMediator();
            // this.mapTooltipMediator = new MapTooltipMediator();
            // this.miniMapTooltipMediator = new MiniMapTooltipMediator();

        }
    };

});
