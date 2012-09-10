Map Widget Maker
================

Create at embed-able map iFrame using WMS services and leaflet. You can see a demo [here](http://maps.co.mecklenburg.nc.us/embedmap/).

Configuration options are located in js/config.json.

* basemaps - A basemap can be any tile server (zxy). Give the base map in identifier and suppy it with a title, url (with placeholders for zxy - see examples). Options currently include attribution information.
* wmsurl - The URL to the WMS server. Note this is the base url - GetCapabilities or GetFeatureInfo will be tacked on in the code.
* wmsnamespace - This is a namespace filter property (think GeoServer). Leave it empty to get everything.
* wmsfilter - Filter out any entries that don't contain this text. Leave it empty to get everything.
* attribution - Attribution for the WMS layers.
* defaultlayer - This currently does nothing. You're welcome!
* center - The default map center to begin at.
* zoom - The default zoom level to begin at.
* search - Include a search box in the map. Currently does nothing. You're welcome!

