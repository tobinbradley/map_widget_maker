var map, popup, config, overlay;

$(document).ready(function() {

    // process inputs
    var width = getUrlVars()["width"];
    var height = getUrlVars()["height"];
    var start = getUrlVars()["loc"].split(",");
    var basemap = getUrlVars()["base"];
    overlay = getUrlVars()["overlay"];
    var maptype = getUrlVars()["type"];
    var identify = getUrlVars()["identify"];
    var search = getUrlVars()["search"];

    // set map dimensions
    $("#map").css("width", width).css("height", height);

    // Load configuration file
    $.ajax({
        url: "js/config.json",
        dataType: "json",
        type: "GET",
        async: false,
        success: function(data) {
            config = data;
        }
    });

    // optional search box

    // Create map
    map = new L.Map('map', {
        center: [start[0], start[1]],
        zoom: start[2],
        minZoom: 0,
        maxZoom: 18
    });

    // add base map
    L.tileLayer(config.basemaps[basemap].url, config.basemaps[basemap].options).addTo(map);

    // add overlay map
    L.tileLayer.wms(config.wmsurl, {
        layers: overlay,
        format: 'image/png',
        transparent: true,
        attribution: config.attribution
    }).addTo(map);

    // optional identify
    if (identify == "true") {
        popup = new L.Popup({
            maxWidth: map.getSize().x - 50,
            maxHeight: map.getSize().y - (map.getSize().y / 2) - 50
        });
        map.on('click', onMapClick);
    }

    // communicate location changes via postmessage
    map.on("moveend", function(e) {
        var message = [map.getCenter().lat, map.getCenter().lng, map.getZoom()];
        window.parent.postMessage(message, "*");
    });

});

/*
    Return GetFeatureInfo request from click event
    Big props to Bryan McBride - http://projects.bryanmcbride.com/leaflet/wms_info.html
*/
function onMapClick(e) {
    var latlngStr = '(' + e.latlng.lat.toFixed(3) + ', ' + e.latlng.lng.toFixed(3) + ')';
    var BBOX = map.getBounds().toBBoxString();
    var WIDTH = map.getSize().x;
    var HEIGHT = map.getSize().y;
    var X = map.layerPointToContainerPoint(e.layerPoint).x;
    var Y = map.layerPointToContainerPoint(e.layerPoint).y;
    var URL = '?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=' + overlay + '&QUERY_LAYERS=' + overlay + '&STYLES=&BBOX=' + BBOX + '&FEATURE_COUNT=5&HEIGHT=' + HEIGHT + '&WIDTH=' + WIDTH + '&FORMAT=image%2Fpng&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X=' + X + '&Y=' + Y;
    URL = escape(URL);
    $.ajax({
        url: "wmsproxy.php?type=GetFeatureInfo&args=" + URL,
        dataType: "html",
        type: "GET",
        success: function(data) {
            if (data.indexOf("<table") != -1) {
                popup.setContent(data);
                popup.setLatLng(e.latlng);
                map.openPopup(popup);

                // dork with the default return table - get rid of geoserver fid column, apply bootstrap table styling
                if ( $(".featureInfo th:nth-child(1)").text() == "fid" ) $('.featureInfo td:nth-child(1), .featureInfo th:nth-child(1)').hide();
                $("caption.featureInfo").removeClass("featureInfo");
                $("table.featureInfo").addClass("table").addClass("table-striped").addClass("table-condensed").addClass("table-hover").removeClass("featureInfo");
            }
        }
    });


}
