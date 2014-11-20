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

            var mapHolderWidth = news.$('.mapHolder')[0].clientWidth, tooltipWidth = this.holderEl[0].clientWidth, tooltipHeight = this.holderEl[0].clientHeight;

            var leftArrowPos = {
                top: position.y - (tooltipHeight >> 1),
                left: position.x + 16
            };

            console.log('mapHolderWidth = ', mapHolderWidth);

            if (leftArrowPos.top >= 0 && leftArrowPos.left <= (mapHolderWidth - (tooltipWidth + 16))) {
                this.positionTooltip(leftArrowPos);
                console.log('leftArrowPos.left = ', leftArrowPos.left);
                console.log('(mapHolderWidth - (tooltipWidth + 16)) = ', (mapHolderWidth - (tooltipWidth + 16)));
                console.log('tooltipWidth = ', tooltipWidth);
                console.log('left arrow rule applies');
                return;
            }

            var rightArrowPos = {
                top: position.y - (tooltipHeight >> 1),
                left: position.x - (tooltipWidth + 16)
            };

            if (rightArrowPos.top >= 0 && rightArrowPos.left >= 0) {
                console.log('right arrow rule applies');
                this.positionTooltip(rightArrowPos);
                return;
            }
        },

        positionTooltip: function (pos) {
            this.holderEl.css({
                top: pos.top + 'px',
                left: pos.left + 'px'
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