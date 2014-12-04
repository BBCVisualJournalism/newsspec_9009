define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');

    var MapBottomBarMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.mapBottomBar');

        this.stats = this.el.find('.stat');
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
        news.pubsub.on('map:reset', this.hide.bind(this));
        
    };

    MapBottomBarMediator.prototype = {

        setData: function (data) {
            this.model = data;
        },

        animateDigit: function ($element, total, callback){
            var self = this;

            /* Speedbar determines how often the number increases */
            var speedVar = (total < 50) ? total : 50;

            var numberRollTime = (2 / 3) * this.statAnimationTime,
                fadeInTime = this.statAnimationTime - numberRollTime;

            var $valueEl = $element.find('strong');

            $element.fadeIn(fadeInTime, function () {
                var count = 0,
                    refreshTime = numberRollTime / speedVar,
                    incrementValue = total / speedVar; 
                    
                var timeInterval = setInterval(function () {
                    count++;
                    var numberValue = Math.floor(incrementValue * count);
                    if (numberValue - incrementValue <= total) {
                        $valueEl.text(numberValue + ' ');
                    } else {
                        $valueEl.text(total + ' ');
                        
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

            self.el.fadeIn('fast', function () {

                self.animateDigit(self.statDays , self.model.days, function () {

                    self.animateDigit(self.statCountries , self.model.countries, function () {

                        self.animateDigit(self.statAttacks , self.model.attacks, function () {

                            self.animateDigit(self.statDeaths , self.model.deaths, function () {
                                news.pubsub.emit('bottomBar:complete');
                            });

                        });

                    });

                });

            });
        },

        hide: function () {
            var self = this;

            this.el.fadeOut(function () {
                self.stats.hide();

                self.statDays.find('strong').text('0');
                self.statCountries.find('strong').text('0');
                self.statAttacks.find('strong').text('0');
                self.statDeaths.find('strong').text('0');
            });
        }

    };

    return MapBottomBarMediator;

});