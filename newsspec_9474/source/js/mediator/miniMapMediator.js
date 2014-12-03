define(['lib/news_special/bootstrap', 'dataController', 'mediator/mapBottomBarMediator', 'lib/vendors/mapping/d3.v3.min', 'queue', 'lib/vendors/mapping/topojson'],
    function (news, DataController, MapBottomBar, d3, queue, topojson) {

    'use strict';

    var MiniMapMediator = function (el, countryLabels, countryJson, scale) {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el                         =           el;
        this.canvasHolder               =           el.find('.miniMapCanvases');
        this.countryLabels              =           countryLabels;  
        this.countryJson                =           countryJson;   
        this.scale                      =           scale;          

        this.canvasWidth                =           325;
        this.canvasHeight               =           325;

        this.proj                       =           null
        this.path                       =           null;
        this.incidentsArr               =           [];


        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.mapCanvas                  =           d3.select(this.canvasHolder[0]).append("canvas")
                                                        .attr("class", 'miniMapCanvas')
                                                        .attr("width", this.canvasWidth)
                                                        .attr("height", this.canvasHeight);

        this.mapLabels                  =           d3.select(this.canvasHolder[0]).append("canvas")
                                                        .attr("class", 'miniMapLabels')
                                                        .attr("width", this.canvasWidth)
                                                        .attr("height", this.canvasHeight);

        this.dataController             =           new DataController();
        this.incidentsData              =           this.dataController.getTranslatedIncidentsData(); 

        this.mapCtx                     =           this.mapCanvas.node().getContext("2d");
        this.mapLabelsCtx               =           this.mapLabels.node().getContext("2d");
        this.land                       =           undefined;
        this.mapJsonLoaded              =           false;

        this.incidentQueue              =           [];

        queue()
            .defer(d3.json, 'assets/' + this.countryJson + '.json')
            .await(this.mapAssetsLoaded.bind(this));

        /********************************************************
        * LISTENERS AND HANDLERS
        ********************************************************/
        d3.select(this.el[0])
                    .on('click', this.handleMapClick.bind(this));

        news.pubsub.on('hideTooltip', this.pauseClickEventListener.bind(this));

    };

    MiniMapMediator.prototype = {

        initMap: function(land) {
            var center = d3.geo.centroid(land),
                offset = [this.canvasWidth/2, this.canvasHeight/2];

            this.proj = d3.geo.mercator().scale(this.scale).center(center).translate(offset);

            this.path = d3.geo.path().projection(this.proj);
        },


        mapAssetsLoaded: function (error, country) {

            var countryProp = (this.countryJson !== 'afg_pak') ? this.countryJson : 'AFG_PAK';
            this.land = topojson.feature(country, country.objects[countryProp]);
            var ocean = {type: "Sphere"};


            this.initMap(this.land);

            this.mapCtx.strokeStyle = '#999999';
            this.mapCtx.lineWidth = 0.2;

            this.mapCtx.fillStyle = 'rgba(255,255,255,0)';
            this.mapCtx.beginPath();
            this.path.context(this.mapCtx)(ocean);
            this.mapCtx.fill();

            this.mapCtx.fillStyle = '#DBDADA';
            this.mapCtx.beginPath();
            this.path.context(this.mapCtx)(this.land);
            this.mapCtx.fill();
            this.mapCtx.stroke();

            this.mapJsonLoaded = true;

            this.drawCountryLabels();

            /* Draw all queued incidents */
            for (var i = 0; i < this.incidentQueue.length; i++) {
                this.drawIncident(this.incidentQueue[i]);
            }
        },

        drawCountryLabels: function () {
            for (var i = 0; i < this.land.features.length; i++) {
                var featureCenter = this.proj(d3.geo.centroid(this.land.features[i]));

                this.mapLabelsCtx.font = 'bold 18px Arial';
                this.mapLabelsCtx.fillStyle = '#404040'; 
                var countyText = this.countryLabels[i];
                this.mapLabelsCtx.fillText(countyText , (featureCenter[0] - (this.mapLabelsCtx.measureText(countyText).width / 2)), featureCenter[1]);

            }
        },

        drawIncident: function (incident) {
             /* While JSON is loading, if we have any draw calls, queue them */
            if(!this.mapJsonLoaded){
                this.incidentQueue.push(incident);
            }else{
                this.path.context(this.mapCtx)({type: "Sphere"});

                var circle = d3.geo.circle().angle(Math.sqrt(Number(incident.total_killed))/ (12 - ((500 / this.scale) * 10)) ).origin([Number(incident.longitude), Number(incident.latitude)])();

                var circleBounds = this.path.bounds(circle), 
                    circleLeft = circleBounds[0][0], 
                    circleRight = circleBounds[1][0], 
                    circleTop = circleBounds[0][1], 
                    circleBottom = circleBounds[1][1];
                    
                var circleCenter = {x: circleLeft + ((circleRight - circleLeft) * 0.5), y: circleTop +((circleBottom - circleTop) * 0.5)}, circleRadius = (circleRight - circleLeft) * 0.5;
                
                this.incidentsArr.push({
                    report_number: incident.report_number,
                    centerX         : circleCenter.x,
                    centerY         : circleCenter.y,
                    circleRadius    : circleRadius
                });

                this.mapCtx.beginPath();
                this.path({type: "GeometryCollection", geometries: [circle]});
                
                this.mapCtx.strokeStyle = 'rgba(255,255,255,.6)';
                this.mapCtx.lineWidth = 0.5;
                this.mapCtx.stroke();
                this.mapCtx.fillStyle = "rgba(222,88,87,.4)";   
                this.mapCtx.fill();
            }
            
        },

        pauseClickEventListener: function () {
            
            d3.select(this.el[0])
                    .on('click', null);

            setTimeout(function () {
                d3.select(this.el[0])
                    .on('click', this.handleMapClick.bind(this));
            }.bind(this), 100);

        },

        handleMapClick: function () {
            var mousePos = d3.mouse(this.el.find('canvas')[0]), 
                mapScaleVal = this.canvasWidth / this.el[0].clientWidth;

            var canvasXPos = (mousePos[0] * mapScaleVal), canvasYPos = (mousePos[1] * mapScaleVal);

            //loop through all the incidents and see if the mouse click was inside any of the circles
            /**********************
                * if the incidents array is ordered by the x position then you should be able to specify
                * a range in the array that you can search for circles within.
                *
                * The x position of the canvas click would give you the left bounds array range, then add
                * to that the width of the largest attck in the data set to get the right bounds array range
            **********************/
            var a, arrLength = this.incidentsArr.length, chosenIncident = 0, smallestDistance = 99999;
            for (a = 0; a < arrLength; a++) {
                var incidentObj = this.incidentsArr[a];

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
                news.pubsub.emit('showMiniMapTooltip', [this.incidentsData[chosenIncident.report_number], this.el, {x:chosenIncident.centerX / mapScaleVal, y:chosenIncident.centerY / mapScaleVal}]);
            }
        }

    };

    return MiniMapMediator;

});