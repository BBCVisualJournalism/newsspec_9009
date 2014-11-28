define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');

    var MapBottomBarMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl = news.$('.mapBottomBar');


        /********************************************************
            * INIT STUFF
        ********************************************************/
        news.pubsub.on('map:finishedAnimation', this.show.bind(this));
        
    };

    MapBottomBarMediator.prototype = {

        show: function () {
            console.log('showing bottom bar')
        }

    };

    return MapBottomBarMediator;

});