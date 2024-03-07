import {addDays, format, getDay} from 'date-fns';
import http from '@/utils/http';
import {baseURL, mainTabs} from '@/utils/utils.mjs';

let directionsService, googleMap;
let weekDays = [];

const mapCenterTextDisplayId = 'custom_map_control_text_display'
let mapCenterTextDisplayElement;

const state = {
    googleMap: null,
    weeklyStopData: [],
    routeColors: [
        "#FF5733",
        "#006232",
        "#337aff",
        "#da33ff",
        "#790d0d"
    ],
    waypointInfoDialog: {
        open: false,
        data: {},
    },
    settingsPanel: {
        open: false,
        dataLoading: false,
        selectedDays: [],
        territoryMarkings: {
            show: true,
            processing: false,
        }
    }
};

const getters = {
    settingsPanel : state => state.settingsPanel,
    routeColors: state => state.routeColors,
    weeklyStopData: state => state.weeklyStopData
};

const mutations = {

};

const actions = {
    displayRoutesOfSelectedRunPlan : async context => {
        context.state.settingsPanel.dataLoading = true;

        // clean up previous data if any
        for (let weekDay of weekDays) {
            for (let marker of weekDay.mapMarkers) marker['setMap'](null);
            if (weekDay.visual) weekDay.visual['setMap'](null);
        }

        let serviceStops = context.rootGetters['service-stops/ofWeekData'];
        let today = getDay(new Date());

        context.state.weeklyStopData = [
            { day: 1, date: format(addDays(new Date(), 1 - today), "EEEE (dd/MM/yyyy)") },
            { day: 2, date: format(addDays(new Date(), 2 - today), "EEEE (dd/MM/yyyy)") },
            { day: 3, date: format(addDays(new Date(), 3 - today), "EEEE (dd/MM/yyyy)") },
            { day: 4, date: format(addDays(new Date(), 4 - today), "EEEE (dd/MM/yyyy)") },
            { day: 5, date: format(addDays(new Date(), 5 - today), "EEEE (dd/MM/yyyy)") },
            { day: 6, date: 'ADHOC' },
        ];

        weekDays = [
            { day: 1, date: format(addDays(new Date(), 1 - today), "EEEE (dd/MM/yyyy)"), stops: [], mapMarkers: [] },
            { day: 2, date: format(addDays(new Date(), 2 - today), "EEEE (dd/MM/yyyy)"), stops: [], mapMarkers: [] },
            { day: 3, date: format(addDays(new Date(), 3 - today), "EEEE (dd/MM/yyyy)"), stops: [], mapMarkers: [] },
            { day: 4, date: format(addDays(new Date(), 4 - today), "EEEE (dd/MM/yyyy)"), stops: [], mapMarkers: [] },
            { day: 5, date: format(addDays(new Date(), 5 - today), "EEEE (dd/MM/yyyy)"), stops: [], mapMarkers: [] },
            { day: 6, date: 'ADHOC', stops: [], mapMarkers: [] },
        ]

        // go through service stops and populate week days
        for (let stop of serviceStops) {
            let daysOfWeek = stop.custrecord_1288_frequency.split(',');
            let stopTimePerDay = stop.custrecord_1288_stop_times.split(',');

            for (const [index, value] of daysOfWeek.entries()) {
                if (value === '1') {
                    let [stopTime, stopDuration] = stopTimePerDay[index].split('|');

                    weekDays[index].stops.push({
                        ...stop,
                        stopTime, stopDuration,
                        addressObj: await _getAddressInfo(context, stop),
                    });
                }
            }
        }

        weekDays.forEach(weekDay => {
            // Clean up google map data if any
            context.state.settingsPanel.selectedDays.splice(0);
            if (weekDay.direction) weekDay.direction = null;
            if (weekDay.visual) {
                weekDay.visual['setMap'](null);
                weekDay.visual = null;
            }
            if (weekDay.mapMarkers) {
                for (let marker of weekDay.mapMarkers) marker['setMap'](null);
                weekDay.mapMarkers.splice(0);
            }

            if (!weekDay.stops.length) return;

            // sort the stops by service time
            weekDay.stops.sort((a, b) => {
                if (a.stopTime < b.stopTime) return -1;
                else if (a.stopTime > b.stopTime) return 1;
                else return 0;
            });

            // convert geocoded stops to google map's coordinates
            let stopCoordinates = weekDay.stops.map(stop => new google.maps.LatLng(stop.addressObj.lat, stop.addressObj.lng));

            // create map markers
            weekDay.mapMarkers = weekDay.stops.map((stop, index) => new google.maps.Marker({
                position: new google.maps.LatLng(stop.addressObj.lat, stop.addressObj.lng),
                label: `${index + 1}`,
                title: `Address: ${stop.addressObj.formatted} | Stop Time: ${stop.stopTime}`,
            }));

            // add event listeners for the markers
            for (let [index, marker] of weekDay.mapMarkers.entries()) {
                marker.addListener('click', () => { // click event on the marker
                    _displayWaypointInfo(context, weekDay.stops[index]);
                })
            }

            // build request object for Directions Service
            let request = {
                origin: stopCoordinates.shift(),
                destination: stopCoordinates.pop(),
                travelMode: 'DRIVING'
            };

            if (stopCoordinates.length) request['waypoints'] = stopCoordinates.map(stopCoordinate => ({
                location: stopCoordinate,
                stopover: true,
            }));

            // hit Directions Service API and pass result to Direction Renderers
            directionsService.route(request, function(result, status) {
                if (status === 'OK') {
                    weekDay.direction = result;
                    weekDay.visual = new google.maps.DirectionsRenderer({
                        directions: result,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: context.state.routeColors[weekDay.day - 1],
                            strokeOpacity: 0.8,
                            strokeWeight: 5,
                        },
                    })
                }
            });
        });

        await context.dispatch('handleSelectedWeekDaysChanged');
        await _waitForSeconds(0.15);

        context.state.settingsPanel.dataLoading = false;
    },
    init : async context => {
        console.log('init google map');
        const { Map } = await google.maps.importLibrary("maps");

        googleMap = new Map(document.getElementById('google-map-container'), {
            gestureHandling: 'greedy',
            fullscreenControl: false,
            zoom: 10,
            center: {
                lat: -33.8685466,
                lng: 151.2054126
            }
        });

        // google.maps.event.addListener(googleMap, 'click', function(...args) {
        //     console.log('clicked on map')
        //     console.log(JSON.stringify(args))
        // });

        directionsService = new google.maps.DirectionsService();

        _displayMessageOnMapCenter('');
    },
    getTerritoryMap : async context => {
        let json = await http.get('getTerritoryPolygons');

        for (let feature of json.features) {
            if (!feature?.['geometry']?.['coordinates']?.length || !feature?.['properties']?.['Name']) continue;

            let invalidCoords = false;
            let paths = feature?.['geometry']?.['coordinates'][0].map(item => {
                let [lng, lat] = item;
                if (isNaN(lng) || isNaN(lat)) invalidCoords = true
                return isNaN(lng) || isNaN(lat) ? null : new google.maps.LatLng(lat, lng);
            })

            if (invalidCoords) continue;

            let territoryName = `${feature['properties']['Territory'] || feature['properties']['Name']} (${feature['properties']['State']})`

            let polygon = new google.maps.Polygon({
                paths,
                strokeColor: "#ff0000",
                strokeOpacity: 0.2,
                strokeWeight: 2,
                fillColor: "#ff5959",
                fillOpacity: 0.1,
            });
            polygon.addListener('mouseover', () => {
                _displayMessageOnMapCenter(`Territory: ${territoryName}`)
                polygon['setOptions']({strokeOpacity: 0.1});
                polygon['setOptions']({fillOpacity: 0.5});
            });

            polygon.addListener('mouseout', () => {
                _displayMessageOnMapCenter('')
                polygon['setOptions']({strokeOpacity: 0.2});
                polygon['setOptions']({fillOpacity: 0.1});
            });
            polygon['setMap'](googleMap);

            territories.push({
                text: territoryName,
                ...feature['properties'],
                polygon
            })
        }
    },
    showTerritoryMarkings : (context, show = true) => {
        context.state.settingsPanel.territoryMarkings.processing = true;
        context.state.settingsPanel.territoryMarkings.show = show;

        for (let territory of territories)
            territory.polygon['setMap'](show ? googleMap : null);

        context.state.settingsPanel.territoryMarkings.processing = false;
    },
    handleSelectedWeekDaysChanged : context => {
        for (let [index, weekDay] of weekDays.entries()) {
            // Set map for markers
            for (let marker of weekDay.mapMarkers)
                marker['setMap'](context.state.settingsPanel.selectedDays.includes(index) ? googleMap : null);

            // Set map for renders
            if (weekDay.visual) weekDay.visual['setMap'](context.state.settingsPanel.selectedDays.includes(index) ? googleMap : null);
        }
    }
};

function _getAddressInfo(context, stop) {
    return new Promise(async (resolve, reject) => {
        let address = {};

        for (let i = 0; i < 10; i++) {
            address = context.rootGetters['addresses/getAddressObject'](parseInt(stop.custrecord_1288_address_type), stop);

            if (address?.state) return resolve(address);

            await _waitForSeconds(0.5);
        }

        if (!address?.state) reject('Could not resolve address');
    })
}

function _waitForSeconds(seconds = 1) {
    return new Promise((resolve) => {
        setTimeout(() => {resolve(true)}, seconds * 1000)
    })
}

function _displayWaypointInfo(context, stop) {
    context.commit('displayInfoGlobalModal', {title: 'test', message: JSON.stringify(stop)}, {root: true});
}

function _displayMessageOnMapCenter(message = '') {
    googleMap.controls[google.maps.ControlPosition.TOP_CENTER].clear()

    if (!message) return;

    if (!mapCenterTextDisplayElement) {
        mapCenterTextDisplayElement = document.createElement("div");

        // Set CSS for the control.
        mapCenterTextDisplayElement.id = mapCenterTextDisplayId;
        mapCenterTextDisplayElement.style.backgroundColor = "#fff";
        mapCenterTextDisplayElement.style.border = "2px solid #fff";
        mapCenterTextDisplayElement.style.borderRadius = "5px";
        mapCenterTextDisplayElement.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
        mapCenterTextDisplayElement.style.color = "rgb(25,25,25)";
        mapCenterTextDisplayElement.style.fontFamily = "Roboto,Arial,sans-serif";
        mapCenterTextDisplayElement.style.fontSize = "16px";
        mapCenterTextDisplayElement.style.lineHeight = "38px";
        mapCenterTextDisplayElement.style.margin = "10px 0 22px";
        mapCenterTextDisplayElement.style.padding = "0 15px";
        mapCenterTextDisplayElement.style.textAlign = "center";
        mapCenterTextDisplayElement.style.pointerEvents = "none";
    }

    mapCenterTextDisplayElement.textContent = message;

    googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(mapCenterTextDisplayElement);
}

export default {
    state,
    getters,
    actions,
    mutations
};