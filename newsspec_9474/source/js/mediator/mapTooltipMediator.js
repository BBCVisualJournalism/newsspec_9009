define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');
    var DataController = require('dataController');

    var MapTooltipMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl = news.$('.mapTooltipHolder');
        this.mapHolderEl = news.$('.mapHolder')[0];
        this.tooltipCloseBtnEl = this.holderEl.find('.mapTooltipClose');
        this.tooltipTitleEl = this.holderEl.find('h2');
        this.figureHolders = this.holderEl.find('.tooltipFigureHolder');
        
        this.firstFigureEl = news.$(this.figureHolders[0]).find('h3');
        this.seondFigureEl = news.$(this.figureHolders[1]).find('h4');
        this.thirdFigureEl = news.$(this.figureHolders[2]).find('h3');
        this.fourthFigureEl = news.$(this.figureHolders[3]).find('h4');

        this.arrowLeft = this.holderEl.find('.arrow-left');
        this.arrowRight = this.holderEl.find('.arrow-right');
        this.arrowTop = this.holderEl.find('.arrow-top');
        this.arrowBottom = this.holderEl.find('.arrow-bottom');


        /********************************************************
            * INIT STUFF
        ********************************************************/
        news.pubsub.on('showTooltip', this.showTooltip.bind(this));
        news.pubsub.on('showMiniMapTooltip', this.hide.bind(this));
        news.pubsub.on('map:reset', this.hide.bind(this));


        /********************************************************
            * MOUSE LISTENERS
        ********************************************************/
        this.tooltipCloseBtnEl.on('click', this.handleCloseBtnClick.bind(this));
        
    };

    MapTooltipMediator.prototype = {

        showTooltip: function (countryName, data, position) {

            this.holderEl.removeClass('hideMe');

            this.tooltipTitleEl.text(countryName);

            this.firstFigureEl.text(DataController.formatNumber(data.total_killed));

            var deathFigure = (data.total_world_killed_percent < 0.5) ? data.total_world_killed_percent.toFixed(2) : Math.round(data.total_world_killed_percent);
            this.seondFigureEl.text(deathFigure + '%');

            this.thirdFigureEl.text(data.attacks_number);

            var attacksFigure = (data.total_world_attacks_percent < 0.5) ? data.total_world_attacks_percent.toFixed(2) : Math.round(data.total_world_attacks_percent);
            this.fourthFigureEl.text(attacksFigure + '%');
           
            var mapHolderWidth = this.mapHolderEl.clientWidth, mapHolderHeight = this.mapHolderEl.clientHeight, tooltipWidth = this.holderEl[0].clientWidth, tooltipHeight = this.holderEl[0].clientHeight;

            this.arrowLeft.addClass('hideMe');
            this.arrowRight.addClass('hideMe');
            this.arrowTop.addClass('hideMe');
            this.arrowBottom.addClass('hideMe');

            /********************************************************
                * check if we can position the left tooltip box
                * arrow to point at the incident
            ********************************************************/
            var leftArrowPos = {
                top: position.y - (tooltipHeight >> 1),
                left: position.x + 16
            };

            if (leftArrowPos.top >= 0 && leftArrowPos.left <= (mapHolderWidth - (tooltipWidth + 16))) {
                this.positionTooltip(leftArrowPos);
                this.arrowLeft.removeClass('hideMe');
                return;
            }

            /********************************************************
                * check if we can position the right tooltip box
                * arrow to point at the incident
            ********************************************************/
            var rightArrowPos = {
                top: position.y - (tooltipHeight >> 1),
                left: position.x - (tooltipWidth + 16)
            };

            if (rightArrowPos.top >= 0 && rightArrowPos.left >= 0) {
                this.positionTooltip(rightArrowPos);
                this.arrowRight.removeClass('hideMe');
                return;
            }

            /********************************************************
                * check if we can position the top tooltip box
                * arrow to point at the incident
            ********************************************************/
            var topArrowPos = {
                top: position.y + 16,
                left: position.x - (tooltipWidth >> 1)
            };

            if (topArrowPos.top >= 0 && topArrowPos.top <= (mapHolderHeight - (tooltipHeight + 16)) && topArrowPos.left >= 0 && topArrowPos.left <= (mapHolderWidth - (tooltipWidth + 16))) {
                this.positionTooltip(topArrowPos);
                this.arrowTop.removeClass('hideMe');
                return;
            }

            /********************************************************
                * check if we can position the bottom tooltip box
                * arrow to point at the incident
            ********************************************************/
            var bottomArrowPos = {
                top: position.y - (tooltipHeight + 16),
                left: position.x - (tooltipWidth >> 1)
            };

            if (bottomArrowPos.top >= 0 && bottomArrowPos.top <= (mapHolderHeight - (tooltipHeight + 16)) && bottomArrowPos.left >= 0 && bottomArrowPos.left <= (mapHolderWidth - (tooltipWidth + 16))) {
                this.positionTooltip(bottomArrowPos);
                this.arrowBottom.removeClass('hideMe');
                return;
            }

            /********************************************************
                * Ahh! ... the toltip won't fit on the screen with 
                * the arrow pointing at the incident, we'll have to 
                * postion the tooltip somewhere generic like the top
                * left hand corner, or not show it at all 
            ********************************************************/
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
        },

        hide: function () {
            this.holderEl.addClass('hideMe');
        }

    };

    return MapTooltipMediator;

});