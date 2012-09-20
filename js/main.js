/*
    embedmap
    Author: Tobin Bradley
    License: MIT
*/

var config;  // container for the config.json

$(document).ready(function() {

    $('.carousel').carousel({
        interval: false
    }).bind('slid', function() {
        if ( $('#mapcanvas').is(':hidden') ) $("#mapcanvas").fadeIn(function(){ createIframe(); });
    });


    $("#step3 img").on("click", function() {
        var selected = $(this);
        selected.addClass("selected-size").siblings().removeClass("selected-size");
        $("#embed-width").val(selected.data("width"));
        $("#embed-height").val(selected.data("height"));
        createIframe(false);
    });

    $("#step3 textarea").on("click", function() {
        $(this).select();
    });

    $("#wmsList").change(function() {
        var selected = $("#wmsList option:selected");
        $("#wmsAbstract").html(selected.data("abstract"));
        selected.data("identify") == true ? $("#identify").show() : $("#identify").hide();
        createIframe();
    });

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

    // hide search if set to false
    if (config.search === false) $("#search").hide();

    // Load base maps
    $.each(config.basemaps, function(key, value) {
        $("#basemaps").append('<label class="radio"><input type="radio" name="optionsRadios" data-basemap="' + key + '">' + value.title + '</label>');
    });
    $("#basemaps input:radio:first").attr('checked', true);

    // Load overlay layers from GetCapabilities
    $.ajax({
        url: "wmsproxy.php",
        dataType: "xml",
        type: "GET",
        success: loadGetCapabilities
    });

    $("#basemaps input:radio, #search, #identify").on("change", function() {
        createIframe();
    });
    $("#embed-width, #embed-height").on("change", function() {
        createIframe(false);
    });

    // Listen for events from child window to set up pan/zoom of map
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, function(e) {
        // make sure the returned pan/zoom message isn't the same as the original, then run
        var numDecLat = (config.center[0] + "").split(".")[1].length;
        if (config.center[0] != e.data[0].toFixed(numDecLat) || config.zoom != e.data[2]) {
            config.center[0] = e.data[0].toFixed(4);
            config.center[1] = e.data[1].toFixed(4);
            config.zoom = e.data[2];
            createIframe(false);
        }
    }, false);

});

function loadGetCapabilities(data) {
    $(data).find('Layer').each(function() {
        if ($(this).children("Name").text().match(config.wmsfilter) != null) {
            var name = $(this).children("Name").text();
            var title = $(this).children("Title").text();
            var abstract = $(this).children("Abstract").text();
            var identify;
            $(this).attr("queryable") == 1 ? identify = true : identify = false;
            $("#wmsList").append('<option data-name="' + name + '" data-abstract="' + abstract + '" data-title="' + title + '" data-identify="' + identify + '">' + title + '</option>');
        }
    });
    $("#wmsList").trigger("change");
}

function createIframe(noembed) {
    // don't change the embedded map for certain types of iframe argument changes, like size
    noembed = (typeof noembed === "undefined") ? true : false;

    // overlay layer
    var overlay = "?overlay=" + $("#wmsList option:selected").data("name");
    // base map
    var basemap = "&base=" + $('input[name=optionsRadios]:checked').data("basemap");
    // include search
    var search = "&search=" + $("#search input").is(":checked");
    // include identify
    var identify = "&identify=" + $("#identify input").is(":checked");
    // set size
    var size = "&width=" + $("#embed-width").val() + "&height=" + $("#embed-height").val();
    // set map extent and zoom
    var loc = "&loc=" + config.center[0] + "," + config.center[1] + "," + config.zoom;
    // return iframe code
    var url = window.location.protocol + "//" + window.location.host ;
    var path = window.location.pathname.split( '/' );
    path.pop();
    url += path.join("/") + "/";
    $("#embed-code").text('<iframe frameborder="0" width="' + $("#embed-width").val() + '" height="' + $("#embed-height").val() + '" src="' + url + 'embed.html' + (overlay + basemap + search + identify + size + loc).trim() + '"></iframe>');
    if ( noembed && $('#mapcanvas').is(':visible') ) $("#map").html('<iframe frameborder="0" width="350" height="300" src="' + url + 'embed.html' + (overlay + basemap + search + identify + loc).trim() + '&width=350&height=300"></iframe>');
}
