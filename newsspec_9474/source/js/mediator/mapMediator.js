define(['lib/news_special/bootstrap', 'dataController', 'text!../../assets/world_map.json', 'mediator/mapBottomBarMediator', 'mediator/miniMapMediator', 'lib/vendors/mapping/d3.v3.min', 'queue', 'lib/vendors/mapping/topojson'],
    function (news, DataController, worldJson, MapBottomBar, MiniMap, d3, queue, topojson) {

    'use strict';

    var MapMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl                   =           news.$('.mapHolder');
        this.restartButton              =           this.holderEl.find('.restartButton');
        this.infoOverlay                =           this.holderEl.find('.interactiveInfoOverlay');
        this.canvasWidth                =           976;
        this.canvasHeight               =           553;

        this.proj                       =           d3.geo.mercator()
                                                        .translate([(this.canvasWidth / 8), (this.canvasHeight / 1.70)]);

        this.mapScale                   =           350;

        this.proj.scale(this.mapScale);
        this.path                       =           d3.geo.path()
                                                        .projection(this.proj);
        this.graticule                  =           d3.geo.graticule();

        this.incidentPositions          =           [];
        this.isInitialDraw              =           true;
        this.incidentTimeouts           =           [];

        this.dayCanvasCount             =           0;

        this.mapBottomBar               =           new MapBottomBar();

        this.miniMaps                   =           news.$('.mini-maps');
        this.iraqMapEl                  =           news.$('.mini-map__iraq');
        this.afgahnMapEl                =           news.$('.mini-map__afgahn');
        this.nigeriaMapEl               =           news.$('.mini-map__nigeria');

        this.iraqMap                    =           null;
        this.afgahnMap                  =           null;
        this.nigeriaMap                 =           null;

        /********************************************************
            * INIT AND DRAW MAP
        ********************************************************/
        this.init();
        this.draw();
    };

    MapMediator.prototype = {

        init: function () {

            this.worldMap = JSON.parse(worldJson);

            this.mapCanvas = d3.select(this.holderEl[0]).append('canvas')
                                .attr('width', this.canvasWidth)
                                .attr('height', this.canvasHeight)
                                .attr('id', 'mapBgCanvas');

            this.mapCtx = this.mapCanvas.node().getContext('2d');

            this.dataController = new DataController();
            this.vocabs = this.dataController.getVocabs();
            this.countriesData = this.dataController.getTranslatedCountriesData();
            this.globalMapData = this.dataController.getTranslatedGlobalMapData();

            /********************************************************
                * LISTENERS AND HANDLERS
            ********************************************************/
            d3.select(this.holderEl[0]).on('click', this.handleMapClick.bind(this));

            this.restartButton.on('click', this.restart.bind(this));

            news.pubsub.on('bottomBar:complete', this.showOverlay.bind(this));
            news.pubsub.on('hideTooltip', this.pauseClickEventListener.bind(this));
        },

        pauseClickEventListener: function () {
            
            d3.select(this.holderEl[0])
                    .on('click', null);

            setTimeout(function () {
                d3.select(this.holderEl[0])
                    .on('click', this.handleMapClick.bind(this));
            }.bind(this), 100);

        },

        countObjectProps: function (object) {
            var count = 0;
            for (var i in object) {
                count++;
            }
            return count;
        },

        draw: function (error) {

            this.mapCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            if (this.isInitialDraw) {

                if (this.isDesktop()) {
                    this.iraqMap = new MiniMap(this.iraqMapEl, [this.vocabs['IRQ'], this.vocabs['SYR']], 'irq_syr', 1350);
                    this.afgahnMap = new MiniMap(this.afgahnMapEl, [this.vocabs['PAK'], this.vocabs['AFG']], 'afg_pak', 950);
                    this.nigeriaMap = new MiniMap(this.nigeriaMapEl, [this.vocabs['NGA']], 'nga', 1350);
                } else {
                    this.miniMaps.hide();
                }

                this.mapBottomBar.setData({
                    days: this.countObjectProps(this.globalMapData),
                    countries: this.countObjectProps(this.countriesData.countries) - 1,
                    attacks: this.countriesData.countries.overview.attacks_number,
                    deaths: this.countriesData.countries.overview.total_killed
                });
            }

            var land = topojson.feature(this.worldMap, this.worldMap.objects.worldmap), ocean = {type: 'Sphere'};

            this.mapCtx.strokeStyle = '#999999';
            this.mapCtx.lineWidth = 0.2;

            this.mapCtx.fillStyle = 'rgba(255,255,255,0)';
            this.mapCtx.beginPath();
            this.path.context(this.mapCtx)(ocean);
            this.mapCtx.fill();

            this.mapCtx.fillStyle = '#DBDADA';
            this.mapCtx.beginPath();
            this.path.context(this.mapCtx)(land);
            this.mapCtx.fill();
            this.mapCtx.stroke();

            /*******************
                * create the seperate canvas elements for the days in the month
            *******************/
            var itt = 0;

            for (var key in this.globalMapData) {

                var incidentCanvas = d3.select(this.holderEl[0]).append('canvas')
                    .attr('width', this.canvasWidth)
                    .attr('height', this.canvasHeight)
                    .attr('class', 'mapDayCanvas visibilityHidden mapDayCanvasAnim');

                var indidentCanvasCtx = incidentCanvas.node().getContext('2d');

                this.drawIncidents(this.globalMapData[key], indidentCanvasCtx);

                /*******************
                    * the delay numbers in the following setTimeout call controls the speed at which the 
                    * animation of the days incidents appears, you'll also want to check out the speed
                    * of the opacity css transition in animations.scss: .mapDayCanvasAnim
                *******************/
                this.incidentTimeouts[itt] = setTimeout(this.showDayIncidents.bind(this), 500 + (itt * 300), incidentCanvas.node(), this.globalMapData[key]);
                itt ++;
                this.dayCanvasCount++;

            }

            this.isInitialDraw = false;

        },

        showDayIncidents: function (dayCanvas, incidentsArr) {
            var self = this;

            var $dayCanvas = news.$(dayCanvas);
            $dayCanvas.removeClass('visibilityHidden');
            $dayCanvas.addClass('hideCanvas');

            /*******************
                * add an event listener so when the canvas opacity
                * gets to 0 then you add the 'hideMe' class back or
                * remove the element completely depending on performance
            *******************/
            $dayCanvas.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
            function (e) {
                news.$(e.target).remove();
                self.dayCanvasCount--;
                if (self.dayCanvasCount === 3) {
                    news.pubsub.emit('map:finishedAnimation');
                    news.pubsub.emit('istats', ['app', 'newsspec-interaction', 'map-animation-finished']);
                }
            });

            this.drawIncidents(incidentsArr, this.mapCtx, 1);
        },

        drawIncidents: function (incidentsArr, ctx, isFinalColor) {
            this.path.context(ctx)({type: 'Sphere'});

            var isDesktop = this.isDesktop();

            var a, incidentsLength = incidentsArr.length;
            for (a = 0; a < incidentsLength; a++) {

                var incidentInfoObj = incidentsArr[a];

                /* If we don't have a lat long, dont plot */
                if (Number(incidentInfoObj.longitude) === 0 && Number(incidentInfoObj.latitude) === 0) {
                    continue;
                }

                /* Draw the point on the minimaps if they're not already drawn */
                if (this.isInitialDraw && !isFinalColor) {
                    this.drawMiniMapIncident(incidentInfoObj);
                }

                var mapScaleVal = 1;
                if (isDesktop) {
                    mapScaleVal = 976 / news.$('.mapHolder')[0].clientWidth;
                }

                var incidentCenter = this.proj([Number(incidentInfoObj.longitude), Number(incidentInfoObj.latitude)]),
                    radius = (Math.sqrt(Number(incidentInfoObj.total_killed) * 10)) * mapScaleVal;
                    // radius = (4 + (Number(incidentInfoObj.total_killed) / 10) * 2.5) * mapScaleVal;

                this.incidentPositions.push({
                    report_number: incidentInfoObj.report_number,
                    centerX         : incidentCenter[0],
                    centerY         : incidentCenter[1],
                    circleRadius    : radius
                });

                ctx.beginPath();
                ctx.arc(incidentCenter[0], incidentCenter[1], radius, 0, 2 * Math.PI, false);
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = 'rgba(255,255,255,.6)';
                ctx.stroke();
                ctx.fillStyle = (isFinalColor) ?  'rgba(193,5,5,.4)' : 'rgba(255,117,48,.6)';
                ctx.fill();

            }
        },

        drawMiniMapIncident: function (incident) {
            if (this.isDesktop()) {
                var miniMap = null;

                switch (incident.country) {
                    case this.vocabs['AFG']:
                    case this.vocabs['PAK']:
                        miniMap = this.afgahnMap;
                        break;
                    case this.vocabs['SYR']:
                    case this.vocabs['IRQ']:
                        miniMap = this.iraqMap;
                        break;
                    case this.vocabs['NGA']:
                        miniMap = this.nigeriaMap;
                        break;
                }

                if (miniMap) {
                    miniMap.drawIncident(incident);
                }
            }
        },

        handleMapClick: function (x, y) {
            if (this.isDesktop()) {     
                var mousePos = (x && y) ? [x, y] : d3.mouse(this.holderEl[0]), 
                    mapScaleVal = 976 / news.$('.mapHolder')[0].clientWidth;

                var canvasXPos = (mousePos[0] * mapScaleVal), canvasYPos = (mousePos[1] * mapScaleVal);

                var a, arrLength = this.incidentPositions.length, chosenIncident = 0, smallestDistance = 99999;
                for (a = 0; a < arrLength; a++) {
                    var incidentObj = this.incidentPositions[a];

                    var xs = incidentObj.centerX - canvasXPos, ys = incidentObj.centerY - canvasYPos;
                    xs = xs * xs;
                    ys = ys * ys;

                    var distance = Math.sqrt( xs + ys );


                    if (distance <= incidentObj.circleRadius) {
                        if (distance < smallestDistance) {
                            smallestDistance = distance;
                            chosenIncident = incidentObj;
                        }
                    }
                }

                if (chosenIncident) {
                    var countryName = this.countriesData.incidentLookup[chosenIncident.report_number];
                    var countryData = this.countriesData.countries[countryName];
                    news.pubsub.emit('istats', ['map-clicked-country', 'newsspec-interaction', countryName]);
                    news.pubsub.emit('showTooltip', [countryName, countryData, {x:chosenIncident.centerX / mapScaleVal, y:chosenIncident.centerY / mapScaleVal}]);
                }
            }
        },

        isDesktop: function () {
            return (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) > 760);
        },

        restart: function () {
            news.pubsub.emit('map:reset');
            news.$('.mapDayCanvas').remove();
            this.dayCanvasCount = 0;
            for (var i = 0; i < this.incidentTimeouts.length; i++) {
                clearTimeout(this.incidentTimeouts[i]);
            }
            this.draw();
        
            news.pubsub.emit('istats', ['button-clicked', 'newsspec-interaction', 'restart-map']);
        },

        showExample: function () {
            this.handleMapClick(394.5, 102);
        },

        showOverlay: function () {
            var self = this;
            if (this.isDesktop()) {
                this.infoOverlay.on('click', function () { self.infoOverlay.hide(); self.showExample(); });
                this.infoOverlay.fadeIn(1000, function () {
                    setTimeout(function () {
                        self.infoOverlay.fadeOut(600, function () {
                            self.infoOverlay.off('click');
                            self.showExample();
                        });
                    }, 3000);

                });
            }
        }



    };

    return MapMediator;

});