define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');

    var MapBottomBarMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.mapBottomBar');

        this.statDays = this.el.find('.stat__days');
        this.statCountries = this.el.find('.stat__countries');
        this.statAttacks = this.el.find('.stat__attacks');
        this.statDeaths = this.el.find('.stat__deaths');

        this.model = null;
        this.statAnimationTime = 1200;


        /********************************************************
            * INIT STUFF
        ********************************************************/
        news.pubsub.on('map:finishedAnimation', this.show.bind(this));
        
    };

    MapBottomBarMediator.prototype = {

        setData: function (data) {
            this.model = data;
        },

        animateDigit: function ($element, total, callback){
            var self = this;

            /* Speedbar determines how often the number increases */
            var speedVar = (total < 50) ? total : 50;

            console.log($element);

            var numberRollTime = (2 / 3) * this.statAnimationTime,
                fadeInTime = this.statAnimationTime - numberRollTime;

            $element.fadeIn(fadeInTime, function () {
                var count = 0,
                    refreshTime = numberRollTime / speedVar,
                    incrementValue = total / speedVar; 
                    
                var timeInterval = setInterval(function () {
                    count++;
                    var numberValue = Math.floor(incrementValue * count);
                    if (numberValue - incrementValue <= total) {
                        $element.find('strong').text(numberValue + ' ');
                    } else {
                        $element.find('strong').text(total + ' ');
                        
                        clearInterval(timeInterval);
                        
                        if(callback){
                            callback();
                        }
                    }
                }, refreshTime);
            });

        },

        show: function () {

            var self = this;

            self.animateDigit(self.statDays , self.model.days, function () {

                self.animateDigit(self.statCountries , self.model.countries, function () {

                    self.animateDigit(self.statAttacks , self.model.attacks, function () {

                        self.animateDigit(self.statDeaths , self.model.deaths, null);

                    });

                });

            });
            
        }

    };

    return MapBottomBarMediator;

});