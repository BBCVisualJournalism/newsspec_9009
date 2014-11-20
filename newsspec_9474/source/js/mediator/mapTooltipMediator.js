define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');

    var MapTooltipMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl = news.$('.mapTooltipHolder');
        this.tooltipCloseBtnEl = this.holderEl.find('.mapTooltipClose');
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

        /********************************************************
            * MOUSE LISTENERS
        ********************************************************/
        this.tooltipCloseBtnEl.on('click', this.handleCloseBtnClick.bind(this));
        
    };

    MapTooltipMediator.prototype = {

        showTooltip: function (countryName, data, position) {

            this.holderEl.removeClass('hideMe');

            this.tooltipTitleEl.html(countryName);
            
            // console.log(data);

            this.firstFigureEl.html(data.total_killed);

            var percentOfDeathsFigure = '' + (((data.total_world_killed_percent * 10) << 0) * 0.1);
            percentOfDeathsFigure = percentOfDeathsFigure.substr(0, percentOfDeathsFigure.indexOf('.') + 2);
            this.seondFigureEl.html(percentOfDeathsFigure + '%');

            this.thirdFigureEl.html(data.attacks_number);

            var percentOfAttacksFigure = '' + (((data.total_world_attacks_percent * 10) << 0) * 0.1);
            percentOfAttacksFigure = percentOfAttacksFigure.substr(0, percentOfAttacksFigure.indexOf('.') + 2);
            this.fourthFigureEl.html(percentOfAttacksFigure + '%');

            this.holderEl.css({
                top: position.y + 'px',
                left: position.x + 'px'
            });
        },

        handleCloseBtnClick: function (e) {
            e.preventDefault();
            this.holderEl.addClass('hideMe');

            news.pubsub.emit('hideTooltip');
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