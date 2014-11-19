define(function (require) {

    'use strict';

    var news = require('lib/news_special/bootstrap');
    var d3 = require('d3');
    var queue = require('queue');
    var topojson = require('lib/vendors/mapping/topojson');

    var MapMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.holderEl                   =           news.$('.mapHolder');
        this.canvasWidth                =           976;
        this.canvasHeight               =           700;
        this.proj                       =           d3.geo.mercator()
                                                        .translate([(this.canvasWidth / 8), (this.canvasHeight / 1.55)]);

        this.mapScale = 350;

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

        d3.select(this.holderEl[0])
            .on('click', this.handleMapClick.bind(this));
    };

    MapMediator.prototype = {

        mapAssetsLoaded: function (error, world, incidentsData, countriesData) {

            var land = topojson.feature(world, world.objects.worldmap), ocean = {type: "Sphere"};

            this.mapCtx.strokeStyle = '#BABABA';
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
                    .attr("class", 'hideCanvas mapDayCanvasAnim');

                var indidentCanvasCtx = incidentCanvas.node().getContext("2d");

                this.drawIncidents(incidentsData[key], indidentCanvasCtx);

                // incidentCanvas.node()
                setTimeout(this.showDayIncidents, 500 + (itt * 100), [incidentCanvas.node()]);
                itt ++;

            }

            /*******************
                * sort the incidentsArrSortedXPos array by the 'centerX' property
            *******************/
            this.incidentsArrSortedXPos.sort(this.sortArrByXPos);

            this.countriesData = countriesData;
        },

        showDayIncidents: function (dayCanvas) {
            news.$(dayCanvas).removeClass('hideCanvas');
        },

        drawIncidents: function (incidentsArr, ctx) {
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
                
                ctx.strokeStyle = 'rgba(200,0,0,.5)';
                ctx.lineWidth = 0.2;
                ctx.stroke();

                ctx.fillStyle = "rgba(200,0,0,.1)";
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
            var a, arrLength = this.incidentsArrSortedXPos.length;
            for (a = 0; a < arrLength; a++) {
                var incidentObj = this.incidentsArrSortedXPos[a];

                var xs = incidentObj.centerX - canvasXPos, ys = incidentObj.centerY - canvasYPos;
                xs = xs * xs;
                ys = ys * ys;

                var distance = Math.sqrt( xs + ys );

                if (distance <= incidentObj.circleRadius) {
                    var incidentHitReportNo = incidentObj.report_number;

                    var countryName = this.countriesData.incidentLookup[incidentHitReportNo];
                    var countryData = this.countriesData.countries[countryName];

                    news.pubsub.emit('showTooltip', [countryName, countryData, {x:incidentObj.centerX * mapScaleVal, y:incidentObj.centerY * mapScaleVal}]);
                    break;
                }
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