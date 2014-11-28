define(['lib/news_special/bootstrap', 'lib/vendors/mapping/d3.v3.min', 'queue', 'lib/vendors/mapping/topojson'], function (news, d3, queue, topojson) {

    'use strict';

    var MapMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl                   =           news.$('.mapHolder');
        this.canvasWidth                =           976;
        this.canvasHeight               =           553;
        this.proj                       =           d3.geo.mercator()
                                                        .translate([(this.canvasWidth / 8), (this.canvasHeight / 1.55)]);

        this.mapScale                   =           350;

        this.proj.scale(this.mapScale);
        this.path                       =           d3.geo.path()
                                                        .projection(this.proj);
        this.graticule                  =           d3.geo.graticule();

        this.incidentsArrSortedXPos     =           [];
        this.countriesData              =           undefined;


        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.mapCanvas                  =           d3.select(this.holderEl[0]).append("canvas")
                                                        .attr("width", this.canvasWidth)
                                                        .attr("height", this.canvasHeight)
                                                        .attr("id", "mapBgCanvas");
        this.mapCtx                     =           this.mapCanvas.node().getContext("2d");

        queue()
            .defer(d3.json, 'assets/world_map.json')
            .defer(d3.json, 'assets/global_map_data.json')
            .defer(d3.json, 'assets/countries_data.json')
            .await(this.mapAssetsLoaded.bind(this));

        /********************************************************
            * LISTENERS AND HANDLERS
        ********************************************************/
        d3.select(this.holderEl[0])
                    .on('click', this.handleMapClick.bind(this));

        news.pubsub.on('hideTooltip', this.pauseClickEventListener.bind(this));
    };

    MapMediator.prototype = {

        pauseClickEventListener: function () {
            
            d3.select(this.holderEl[0])
                    .on('click', null);

            setTimeout(function () {
                d3.select(this.holderEl[0])
                    .on('click', this.handleMapClick.bind(this));
            }.bind(this), 100);

        },

        mapAssetsLoaded: function (error, world, incidentsData, countriesData) {

            var land = topojson.feature(world, world.objects.worldmap), ocean = {type: "Sphere"};

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
            for (var key in incidentsData) {

                var incidentCanvas = d3.select(this.holderEl[0]).append("canvas")
                    .attr("width", this.canvasWidth)
                    .attr("height", this.canvasHeight)
                    .attr("class", 'visibilityHidden mapDayCanvasAnim');

                var indidentCanvasCtx = incidentCanvas.node().getContext("2d");

                this.drawIncidents(incidentsData[key], indidentCanvasCtx);

                /*******************
                    * the delay numbers in the following setTimeout call controls the speed at which the 
                    * animation of the days incidents appears, you'll also want to check out the speed
                    * of the opacity css transition in animations.scss: .mapDayCanvasAnim
                *******************/
                setTimeout(this.showDayIncidents.bind(this), 500 + (itt * 200), incidentCanvas.node(), incidentsData[key]);
                itt ++;

            }

            /*******************
                * sort the incidentsArrSortedXPos array by the 'centerX' property
            *******************/
            this.incidentsArrSortedXPos.sort(this.sortArrByXPos);

            this.countriesData = countriesData;
        },

        showDayIncidents: function (dayCanvas, incidentsArr) {            

            var $dayCanvas = news.$(dayCanvas);
            $dayCanvas.removeClass('visibilityHidden');
            $dayCanvas.addClass('hideCanvas');

            /*******************
                * add an event listener so when the canvas opacity
                * gets to 0 then you add the 'hideMe' class back or
                * remove the element completely depending on performance
            *******************/
            $dayCanvas.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
            function(e) {
                news.$(e.target).addClass('hideMe');
            });

            this.drawIncidents(incidentsArr, this.mapCtx, 1);
        },

        drawIncidents: function (incidentsArr, ctx, isFinalColor) {
            this.path.context(ctx)({type: "Sphere"});

            var a, incidentsLength = incidentsArr.length;
            for (a = 0; a < incidentsLength; a++) {

                var incidentInfoObj = incidentsArr[a];

                var circle = d3.geo.circle().angle(Math.sqrt(Number(incidentInfoObj.total_killed))/2).origin([Number(incidentInfoObj.longitude), Number(incidentInfoObj.latitude)])();

                var circleBounds = this.path.bounds(circle), circleLeft = circleBounds[0][0], circleRight = circleBounds[1][0], circleTop = circleBounds[0][1], circleBottom = circleBounds[1][1];
                var circleCenter = {x: circleLeft + ((circleRight - circleLeft) * 0.5), y: circleTop +((circleBottom - circleTop) * 0.5)}, circleRadius = (circleRight - circleLeft) * 0.5;
                
                this.incidentsArrSortedXPos.push({
                    report_number: incidentInfoObj.report_number,
                    centerX         : circleCenter.x,
                    centerY         : circleCenter.y,
                    circleRadius    : circleRadius
                });

                ctx.beginPath();
                this.path({type: "GeometryCollection", geometries: [circle]});
                
                ctx.strokeStyle = 'rgba(255,255,255,.6)';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                if (isFinalColor) {
                    ctx.fillStyle = "rgba(222,88,87,.4)";   
                }
                else {
                    ctx.fillStyle = "rgba(100,19,14,.6)";
                }
                ctx.fill();

            }
        },

        handleMapClick: function () {
            var mousePos = d3.mouse(this.holderEl[0]), mapScaleVal = 976 / news.$('.mapHolder')[0].clientWidth;
            var canvasXPos = (mousePos[0] * mapScaleVal), canvasYPos = (mousePos[1] * mapScaleVal);

            //loop through all the incidents and see if the mouse click was inside any of the circles
            /**********************
                * if the incidents array is ordered by the x position then you should be able to specify
                * a range in the array that you can search for circles within.
                *
                * The x position of the canvas click would give you the left bounds array range, then add
                * to that the width of the largest attck in the data set to get the right bounds array range
            **********************/
            var a, arrLength = this.incidentsArrSortedXPos.length, chosenIncident = 0, smallestDistance = 99999;
            for (a = 0; a < arrLength; a++) {
                var incidentObj = this.incidentsArrSortedXPos[a];

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

                news.pubsub.emit('showTooltip', [countryName, countryData, {x:chosenIncident.centerX * mapScaleVal, y:chosenIncident.centerY * mapScaleVal}]);
            }
        },

        /********************************************************
            * UTIL METHODS
        ********************************************************/
        sortArrByXPos: function (a, b) {
            return a.centerX - b.centerX;
        }

    };

    return MapMediator;

});