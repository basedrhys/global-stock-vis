Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZWJmNmUxYi1iZTAyLTQ5ZGQtYmExZi0yMjA3MTZmNDRkOTIiLCJpZCI6MTA4MjMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTc0NTcyNjV9.0OUF07n2Qpn53VPyMU4F2DqfDP2UEi1fX55reLJ3gwY';

/**
 * This class is an example of a custom DataSource.  It loads JSON data as
 * defined by Google's WebGL Globe, https://github.com/dataarts/webgl-globe.
 * @alias WebGLGlobeDataSource
 * @constructor
 *
 * @param {String} [name] The name of this data source.  If undefined, a name
 *                        will be derived from the url.
 *
 * @example
 * var dataSource = new Cesium.WebGLGlobeDataSource();
 * dataSource.loadUrl('sample.json');
 * viewer.dataSources.add(dataSource);
 */
function WebGLGlobeDataSource(name) {
    //All public configuration is defined as ES5 properties
    //These are just the "private" variables and their defaults.
    this._name = name;
    this._changed = new Cesium.Event();
    this._error = new Cesium.Event();
    this._isLoading = false;
    this._loading = new Cesium.Event();
    this._entityCollection = new Cesium.EntityCollection();
    this._seriesNames = [];
    this._seriesToDisplay = undefined;
    this._heightScale = 10000000;
    this._entityCluster = new Cesium.EntityCluster();
    this._showVolume = false;
}

Object.defineProperties(WebGLGlobeDataSource.prototype, {
    //The below properties must be implemented by all DataSource instances

    /**
     * Gets a human-readable name for this instance.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {String}
     */
    name : {
        get : function() {
            return this._name;
        }
    },
    /**
     * Since WebGL Globe JSON is not time-dynamic, this property is always undefined.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {DataSourceClock}
     */
    clock : {
        value : undefined,
        writable : false
    },
    /**
     * Gets the collection of Entity instances.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {EntityCollection}
     */
    entities : {
        get : function() {
            return this._entityCollection;
        }
    },
    /**
     * Gets a value indicating if the data source is currently loading data.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Boolean}
     */
    isLoading : {
        get : function() {
            return this._isLoading;
        }
    },
    /**
     * Gets an event that will be raised when the underlying data changes.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Event}
     */
    changedEvent : {
        get : function() {
            return this._changed;
        }
    },
    /**
     * Gets an event that will be raised if an error is encountered during
     * processing.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Event}
     */
    errorEvent : {
        get : function() {
            return this._error;
        }
    },
    /**
     * Gets an event that will be raised when the data source either starts or
     * stops loading.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Event}
     */
    loadingEvent : {
        get : function() {
            return this._loading;
        }
    },

    //These properties are specific to this DataSource.

    /**
     * Gets the array of series names.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {String[]}
     */
    seriesNames : {
        get : function() {
            return this._seriesNames;
        }
    },
    /**
     * Gets or sets the name of the series to display.  WebGL JSON is designed
     * so that only one series is viewed at a time.  Valid values are defined
     * in the seriesNames property.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {String}
     */
    seriesToDisplay : {
        get : function() {
            return this._seriesToDisplay;
        },
        set : function(value) {
            this._seriesToDisplay = value;

            //Iterate over all entities and set their show property
            //to true only if they are part of the current series.
            var collection = this._entityCollection;
            var entities = collection.values;
            collection.suspendEvents();
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.show = value === entity.seriesName;
            }
            collection.resumeEvents();
        }
    },
    /**
     * Gets or sets the scale factor applied to the height of each line.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Number}
     */
    heightScale : {
        get : function() {
            return this._heightScale;
        },
        set : function(value) {
            if (value < 0) {
                throw new Cesium.DeveloperError('value must be greater than 0');
            }
            this._heightScale = value;
        }
    },
    /**
     * Gets whether or not this data source should be displayed.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Boolean}
     */
    show : {
        get : function() {
            return this._entityCollection;
        },
        set : function(value) {
            this._entityCollection = value;
        }
    },
        /**
     * Gets whether or not this data source should be displayed.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Boolean}
     */
    showVolume : {
        get : function() {
            return this._showVolume;
        },
        set : function(value) {
            this._showVolume = value;

            // Change the label text to reflect the showing value
            var btnText;
            var labelText;
            if (this._showVolume) {
                btnText = 'Show Price';
                labelText = 'Showing: Trade Volume'
            } else {
                btnText = 'Show Volume';
                labelText = 'Showing: Stock Price';
            }
            document.getElementById('change-vis').innerText = btnText;
            document.getElementById('showing-label').innerText = labelText;

            //Iterate over all entities and set their show property
            //to true only if they are part of the current series.
            var collection = this._entityCollection;
            var entities = collection.values;
            collection.suspendEvents();
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                var heightVal;
                if (this._showVolume) {
                    heightVal = entity.volume / 50;
                } else {
                    heightVal = entity.closingPrice * 50000;
                }
                entity.rectangle.extrudedHeight = heightVal;
                // entity.
                // entity.show = value === entity.seriesName;
            }
            collection.resumeEvents();
        }
    },
    /**
     * Gets or sets the clustering options for this data source. This object can be shared between multiple data sources.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {EntityCluster}
     */
    clustering : {
        get : function() {
            return this._entityCluster;
        },
        set : function(value) {
            if (!Cesium.defined(value)) {
                throw new Cesium.DeveloperError('value must be defined.');
            }
            this._entityCluster = value;
        }
    }
});

function getMaxStocksValue(coordinates, closingI, volumeI, jumpVal) {
    var maxVal = -1;
    for (var i = 0; i < coordinates.length; i += jumpVal) {
        var tempHeight = coordinates[i + closingI] * coordinates[i + volumeI]
        if (tempHeight > maxVal) {
            maxVal = tempHeight;
        }
    }
    return maxVal
}

function getMaxPopulationVal(coordinates, populationI, jumpVal) {
    var maxVal = -1;
    for (var i = 0; i < coordinates.length; i += jumpVal) {
        var temp = coordinates[i + populationI]
        if (temp > maxVal) {
            maxVal = temp;
        }
    }
    return maxVal
}

function scale(val, min, max) {
    var t = (val - min) / (max - min)
    return (val - min) / (max - min); 
}

function clamp(val) {
    return Math.max(0, Math.min(val, 1));
}

var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  };

/**
 * Asynchronously loads the GeoJSON at the provided url, replacing any existing data.
 * @param {Object} url The url to be processed.
 * @returns {Promise} a promise that will resolve when the GeoJSON is loaded.
 */
WebGLGlobeDataSource.prototype.loadUrl = function(url) {
    if (!Cesium.defined(url)) {
        throw new Cesium.DeveloperError('url is required.');
    }

    //Create a name based on the url
    var name = Cesium.getFilenameFromUri(url);

    //Set the name if it is different than the current name.
    if (this._name !== name) {
        this._name = name;
        this._changed.raiseEvent(this);
    }

    //Use 'when' to load the URL into a json object
    //and then process is with the `load` function.
    var that = this;
    return Cesium.Resource.fetchJson(url).then(function(json) {
        return that.load(json, url);
    }).otherwise(function(error) {
        //Otherwise will catch any errors or exceptions that occur
        //during the promise processing. When this happens,
        //we raise the error event and reject the promise.
        this._setLoading(false);
        that._error.raiseEvent(that, error);
        return Cesium.when.reject(error);
    });
};

/**
 * Loads the provided data, replacing any existing data.
 * @param {Array} data The object to be processed.
 */
WebGLGlobeDataSource.prototype.load = function(data) {
    if (!Cesium.defined(data)) {
        throw new Cesium.DeveloperError('data is required.');
    }

    //Clear out any data that might already exist.
    this._setLoading(true);
    // this._seriesNames.length = 0;
    // this._seriesToDisplay = undefined;

    var entities = this._entityCollection;

    //It's a good idea to suspend events when making changes to a
    //large amount of entities.  This will cause events to be batched up
    //into the minimal amount of function calls and all take place at the
    //end of processing (when resumeEvents is called).
    entities.suspendEvents();
    // entities.removeAll();

    //WebGL Globe JSON is an array of series, where each series itself is an
    //array of two items, the first containing the series name and the second
    //being an array of repeating latitude, longitude, height values.
    //
    //Here's a more visual example.
    //[["series1",[latitude, longitude, height, ... ]
    // ["series2",[latitude, longitude, height, ... ]]

    var type = data[0];
    if (type == "stocks") {
        // Loop over each series
        for (var x = 1; x < data.length; x++) {
            var series = data[x];
            var seriesName = series[0];
            var coordinates = series[1];

            //Add the name of the series to our list of possible values.
            this._seriesNames.push(seriesName);

            //Make the first series the visible one by default
            var show = x === 0;
            if (show) {
                this._seriesToDisplay = seriesName;
            }

            var maxValue = getMaxStocksValue(coordinates, 3, 4, 5)

            //Now loop over each coordinate in the series and create
            // our entities from the data.
            for (var i = 0; i < coordinates.length; i += 5) {
                var name = coordinates[i];
                var latitude = coordinates[i + 1];
                var longitude = coordinates[i + 2];
                var closingPrice = coordinates[i + 3];
                var volume = coordinates[i + 4];
                
                // Scale the height so it displays nicely, lets get its hundreds of millions and scale it up
                var height = closingPrice;

                //Ignore lines of zero height.
                if(height === 0) {
                    continue;
                }

                // console.log(name + " actual name is " + globalStockInfo[name].name);

                entities.add({
                    show: false,
                    name : name,
                    description : '<table class="cesium-infoBox-defaultTable"><tbody>' +
                    '<tr><th>NAME</th><td>' + globalStockInfo[name].name + '</td></tr>' +
                    '<tr><th>INDUSTRY</th><td>' + globalStockInfo[name].industry + '</td></tr>' +
                    '<tr><th>SUB INDUSTRY</th><td>' + globalStockInfo[name].subIndustry + '</td></tr>' +
                    '<tr><th>LOCATION</th><td>' + globalStockInfo[name].location + '</td></tr>' +
                    '<tr><th>FOUNDED</th><td>' + globalStockInfo[name].founded + '</td></tr>' +
                    '<tr><th>CLOSE PRICE</th><td>' + "$"+ closingPrice + '</td></tr>' +
                    '</tbody></table>',
                    rectangle : {
                        id : name,
                        coordinates : Cesium.Rectangle.fromDegrees(longitude-0.5, latitude-0.5, longitude+0.5, latitude+0.5),
                        extrudedHeight : height,
                        outline: true,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 4,
                        stRotation : Cesium.Math.toRadians(45),
                        material : Cesium.Color.fromCssColorString(industryColours[globalStockInfo[name].industry])
                    },
                    seriesName : seriesName,
                    closingPrice: closingPrice,
                    volume: volume
                });
            }
        }
    } else if (type == "population") {
        for (var x = 1; x < data.length; x++) {
            var series = data[x];
            var seriesName = series[0];
            var coordinates = series[1];

            //Add the name of the series to our list of possible values.
            this._seriesNames.push(seriesName);

            //Make the first series the visible one by default
            var show = x === 0;
            if (show) {
                this._seriesToDisplay = seriesName;
            }

            var maxValue = getMaxPopulationVal(coordinates, 4, 5);

            //Now loop over each coordinate in the series and create
            // our entities from the data.
            for (var i = 0; i < coordinates.length; i += 5) {
                var cityName = coordinates[i];
                var country = coordinates[i + 1];
                var latitude = coordinates[i + 2];
                var longitude = coordinates[i + 3];
                var population = coordinates[i + 4];
                
                var width = scale(population, 0, maxValue);
                var scaleFactor = 1000000;

                // Scale the lightness between 0.5 (Max population, vivid red) and 
                // 1 (Minimum population, pale red/white)
                var lightnessDif = 0.5 + (1 - width) / 3;
                var color = Cesium.Color.fromHsl(0.0, 1, lightnessDif, 0.5);
                
                var surfacePosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);

                var popFormat = population / 1000.0 + " million"
                
                entities.add({
                    name : cityName,
                    description : '<table class="cesium-infoBox-defaultTable"><tbody>' +
                    '<tr><th>City Name</th><td>' + cityName + '</td></tr>' +
                    '<tr><th>Country</th><td>' + country + '</td></tr>' +
                    '<tr><th>Population</th><td>' + popFormat + '</td></tr>' +
                    '</tbody></table>',
                    position : surfacePosition,
                    ellipse : {
                        semiMajorAxis: width * scaleFactor,
                        semiMinorAxis: width * scaleFactor,
                        height: 0,
                        material : color
                    },
                    seriesName : seriesName
                });
            }
        }
    } else { 
        for (var x = 1; x < data.length; x++) {
            var series = data[x];
            var stockName = series[0];
            var stockInfo = series[1];

            var founded = stockInfo[4];
            if (founded == -1)
                founded = 'Unknown'

            globalStockInfo[stockName] = {
                name: stockInfo[0],
                industry: stockInfo[1],
                subIndustry: stockInfo[2],
                location: stockInfo[3],
                founded: founded
            }

            // Also create the colour dictionary at the same time
            var sectors = ["Energy", "Materials", "Industrials", "Consumer Discretionary", "Consumer Staples", "Health Care", "Financials", "Information Technology", "Communication Services", "Utilities", "Real Estate"]
            var colors = ['#F44336', '#9C27B0', '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50', '#CDDC39', '#FF9800', '#FF5722', '#9E9E9E', '#FEFEFE']

            for (var i = 0; i < sectors.length; i++) {
                industryColours[sectors[i]] = colors[i];
            }
        }

    }
    //Once all data is processed, call resumeEvents and raise the changed event.
    entities.resumeEvents();
    this._changed.raiseEvent(this);
    this._setLoading(false);
};

WebGLGlobeDataSource.prototype._setLoading = function(isLoading) {
    if (this._isLoading !== isLoading) {
        this._isLoading = isLoading;
        this._loading.raiseEvent(this, isLoading);
    }
};

//Create a Viewer instances and add the DataSource.
var viewer = new Cesium.Viewer('cesiumContainer', {
    animation : false,
    timeline : false,
    //sceneMode: Cesium.SceneMode.COLUMBUS_VIEW
});
viewer.clock.shouldAnimate = false;

var globalStockInfo = {}
var industryColours = {}

//Now that we've defined our own DataSource, we can use it to load
//any JSON data formatted for WebGL Globe.

var stockDataSource = new WebGLGlobeDataSource();
var stockInfoSource = new WebGLGlobeDataSource();
stockInfoSource.loadUrl('data/stocks/stock_info.json').then(function() {

    stockDataSource.loadUrl('data/stocks/test_stocks.json').then(function() {
        viewer.dataSources.add(stockDataSource);
        //After the initial load, create buttons to let the user switch among series.
        function createSeriesSetter(seriesName) {
            return function() {
                stockDataSource.seriesToDisplay = seriesName;
            };
        }

        for (var i = 0; i < stockDataSource.seriesNames.length; i++) {
            var seriesName = stockDataSource.seriesNames[i];
            Sandcastle.addToolbarButton(seriesName, createSeriesSetter(seriesName));
        }

        // Add the button to change the value from the stocks we're looking at
        function changeStockVis() {
            return function() {
                stockDataSource.showVolume = !stockDataSource.showVolume;
            };
        }
        // Add the button to change the value from the stocks we're looking at
        function showGithub() {
            return function() {
                window.open('https://github.com/basedrhys/global-stock-vis', "_blank");
            };
        }
        
        Sandcastle.addFooterButton("Show Volume", changeStockVis())
        Sandcastle.addFooterButton("GitHub", showGithub())
        stockDataSource.showVolume = false;
    });
})

//Now that we've defined our own DataSource, we can use it to load
//any JSON data formatted for WebGL Globe.
var popDataSource = new WebGLGlobeDataSource();
popDataSource.loadUrl('data/pop/cities_processed.json').then(function() {
    viewer.dataSources.add(popDataSource);
});


var path;
var pos;

// TODO center viewer on most interesting point

// TODO show logo on mouseover
// var scene = viewer.scene;
// var handler;
// var color = Cesium.Color.WHITE;

// handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
// handler.setInputAction(function(movement) {
//     var pickedObject = scene.pick(movement.endPosition);
//     if (Cesium.defined(pickedObject)) {
//         pickedObject.id.polyline.material = color;
//     }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
