define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');

    var MiniMapTooltipMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl = news.$('.miniMapTooltipHolder');
        this.mapHolderEl = news.$('.mini-maps')[0];
        this.tooltipCloseBtnEl = this.holderEl.find('.miniMapTooltipClose');
        this.tooltipTitleEl = this.holderEl.find('h2');

        this.dateText = this.holderEl.find('.date');
        this.killedText = this.holderEl.find('.killed');
        this.typeText = this.holderEl.find('.type');
        this.groupText = this.holderEl.find('.group');

        this.arrowLeft = this.holderEl.find('.arrow-left');
        this.arrowRight = this.holderEl.find('.arrow-right');
        this.arrowTop = this.holderEl.find('.arrow-top');
        this.arrowBottom = this.holderEl.find('.arrow-bottom');


        /********************************************************
            * INIT STUFF
        ********************************************************/
        news.pubsub.on('showMiniMapTooltip', this.showTooltip.bind(this));
        news.pubsub.on('showTooltip', this.hide.bind(this));

        /********************************************************
            * MOUSE LISTENERS
        ********************************************************/
        this.tooltipCloseBtnEl.on('click', this.handleCloseBtnClick.bind(this));
        
    };

    MiniMapTooltipMediator.prototype = {

        showTooltip: function (data, mapEl, mapPosition) {

            var mapElPosition = mapEl.find('.miniMapCanvases').position(),
                position = {x: (mapPosition.x + mapElPosition.left), y: (mapPosition.y + mapElPosition.top)};

            this.dateText.text(data.date);
            this.killedText.text(data.total_killed);
            this.typeText.text(data.type_of_attack);
            this.groupText.text(data.group_responsible);


            this.holderEl.removeClass('hideMe');
           
            var mapHolderWidth = this.mapHolderEl.clientWidth, 
                mapHolderHeight = this.mapHolderEl.clientHeight, 
                tooltipWidth = this.holderEl[0].clientWidth, 
                tooltipHeight = this.holderEl[0].clientHeight;

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

            if (leftArrowPos.top >= 0 && leftArrowPos.top <= (mapHolderHeight - (tooltipHeight + 16)) && leftArrowPos.left <= (mapHolderWidth - (tooltipWidth + 16))) {
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

            if (rightArrowPos.top >= 0 && rightArrowPos.top <= (mapHolderHeight - (tooltipHeight + 16)) && rightArrowPos.left >= 0) {
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
                * the arrow pointing at the incident. Will position 
                where it was last placed.
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

    return MiniMapTooltipMediator;

});