define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');

    var MapTooltipMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl = news.$('.mapTooltipHolder');
        this.tooltipTitleEl = this.holderEl.find('h2');
        this.figureHolders = this.holderEl.find('.tooltipFigureHolder');
        
        this.firstFigureEl = news.$(this.figureHolders[0]).find('h3');
        this.seondFigureEl = news.$(this.figureHolders[1]).find('h4');
        this.thirdFigureEl = news.$(this.figureHolders[2]).find('h3');
        this.fourthFigureEl = news.$(this.figureHolders[3]).find('h4');


        /********************************************************
            * INIT STUFF
        ********************************************************/
        news.pubsub.on('showTooltip', this.showTooltip.bind(this));
        
    };

    MapTooltipMediator.prototype = {

        showTooltip: function (countryName, data, position) {
            this.tooltipTitleEl.html(countryName);
            
            console.log(data);

            this.firstFigureEl.html(data.total_killed);
            this.seondFigureEl.html((((data.total_world_killed_percent * 10) << 0) * 0.1) + '%');

            this.thirdFigureEl.html(data.attacks_number);
            this.fourthFigureEl.html((((data.total_world_attacks_percent * 10) << 0) * 0.1) + '%');

            this.holderEl.css({
                top: position.y + 'px',
                left: position.x + 'px'
            });
        },

        /********************************************************
            * UTIL METHODS
        ********************************************************/
        sortArrByXPos: function (a, b) {
            // return a.centerX - b.centerX;
        }

    };

    return MapTooltipMediator;

});