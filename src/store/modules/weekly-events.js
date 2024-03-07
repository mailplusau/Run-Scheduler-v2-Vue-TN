import Vue from 'vue';
import {format} from 'date-fns';
import {mainTabs} from '@/utils/utils.mjs';

const state = {
    colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4',
        '#4CAF50', '#3d8640', '#5c7a2e', '#41bb79',
        '#934caf', '#763d86', '#672e7a', '#cd65d9',
        '#af934c', '#86753d', '#7a572e', '#d9be65',
        '#af4c4f', '#863d3d', '#7a2e3c', '#d96565',
        '#4caf60', '#3d8680', '#2e587a', '#6574d9'],
    calendar: {
        settingsPanel: false,
        intervalHeight: 264,

        stopColors: {},
        changingEvents: [],
        originalEvents: [],
        changedEvents: [],
        dragTime: null,
        dragEvent: null,
        dragStart: null,
        createEvent: null,
        createStart: null,
        extendOriginal: null,
        moveFlag: false,

        eventContextMenu: {
            open: false,
            clickedEvent: null,
            x: 0,
            y: 0,
        },
        timeEditingDialog: {
            eventId: null,
            open: false,
            newStartTime: '',
            newEndTime: '',
        },
        timeSpreadingDialog: {
            eventId: null,
            open: false,
        },
    }
};

const getters = {
    calendar : state => state.calendar,
    calendarEvents : state => state.calendar.changingEvents,
    eventContextMenu : state => state.calendar.eventContextMenu,
    timeEditingDialog : state => state.calendar.timeEditingDialog,
    timeSpreadingDialog : state => state.calendar.timeSpreadingDialog,
    calendarEventColor : state => event => {
        const rgb = parseInt(event.color.substring(1), 16)
        const r = (rgb >> 16) & 0xFF
        const g = (rgb >> 8) & 0xFF
        const b = (rgb >> 0) & 0xFF

        return (event === state.calendar.dragEvent || event === state.calendar.createEvent)
            ? `rgba(${r}, ${g}, ${b}, 0.7)` : event.color
    },

    editingEventTime : state => !!state.calendar.changedEvents.length,
};

const mutations = {
    clearData : state => {
        state.calendar.originalEvents.splice(0);
        state.calendar.changingEvents.splice(0);
    },
    startTimer : (state, calendarTime) => {
        const mouse = _convertCalendarTimeToMilliseconds(calendarTime)

        if (state.calendar.dragEvent && state.calendar.dragTime === null) {
            const start = state.calendar.dragEvent.start

            state.calendar.dragTime = mouse - start
        } else { /** Clicked on calendar **/ }
    },
    startDraggingOnCalendar : (state, { nativeEvent, event, timed }) => {
        if (nativeEvent.button === 0 && event && timed) {
            state.calendar.dragEvent = event
            state.calendar.dragTime = null
            state.calendar.extendOriginal = null
        }
    },
    startDraggingOnBottomOfEvent : (state, event) => {
        state.calendar.createEvent = event
        state.calendar.createStart = event.start
        state.calendar.extendOriginal = event.end
    },
    dragCurrentDragEvent : (state, calendarTime) => {
        const mouse = _convertCalendarTimeToMilliseconds(calendarTime)

        if (state.calendar.dragEvent && state.calendar.dragTime !== null) {
            state.calendar.moveFlag = true;
            const start = state.calendar.dragEvent.start
            const end = state.calendar.dragEvent.end
            const duration = end - start
            const newStartTime = mouse - state.calendar.dragTime

            // calculate the event's start time in case mouse position is outside the event's current date
            let diff = newStartTime > state.calendar.dragEvent.lowerLimit ? 
                Math.floor((newStartTime - state.calendar.dragEvent.upperLimit) / 86400000) :
                ((newStartTime + duration) < state.calendar.dragEvent.upperLimit ? -1 * Math.floor((state.calendar.dragEvent.lowerLimit - newStartTime) / 86400000) : 0)

            const newStart = _roundTime(newStartTime - diff * 86400000);
            const newEnd = newStart + duration

            if (newStart >= state.calendar.dragEvent.upperLimit && newEnd <= state.calendar.dragEvent.lowerLimit) {
                state.calendar.dragEvent.start = newStart
                state.calendar.dragEvent.end = newEnd
            }
        } else if (state.calendar.createEvent && state.calendar.createStart !== null) {
            state.calendar.moveFlag = true;
            const mouseRounded = _roundTime(mouse, false)
            const min = Math.min(mouseRounded, state.calendar.createStart)
            const max = Math.max(mouseRounded, state.calendar.createStart)

            if (min >= state.calendar.createEvent.upperLimit && max <= state.calendar.createEvent.lowerLimit) {
                state.calendar.createEvent.start = min
                state.calendar.createEvent.end = max
            }
        }
    },
    endDragging : (state, {nativeEvent}) => {
        let currentEvent = state.calendar.dragEvent || state.calendar.createEvent || null;
        let originalEvent = _getOriginalEventFromEventId(state, currentEvent?.id);

        _evaluateEventChanged(state, currentEvent, originalEvent)

        state.calendar.dragTime = null
        state.calendar.dragEvent = null
        state.calendar.createEvent = null
        state.calendar.createStart = null
        state.calendar.extendOriginal = null

        state.calendar.moveFlag = false;
    },
    restoreChangingEvents : state => {
        state.calendar.changingEvents = JSON.parse(JSON.stringify(state.calendar.originalEvents));
        state.calendar.changedEvents.splice(0);
    },

    openTimeEditingDialog : (state, eventId) => {
        let currentEvent = _getChangingEventFromEventId(state, eventId);
        if (!currentEvent) return;
        state.calendar.timeEditingDialog.eventId = eventId;
        state.calendar.timeEditingDialog.newStartTime = new Date(currentEvent.start).toLocaleTimeString().substring(0, 5);
        state.calendar.timeEditingDialog.newEndTime = new Date(currentEvent.end).toLocaleTimeString().substring(0, 5);
        state.calendar.timeEditingDialog.open = true;
    },
    applyChangeOfEventTime : (state) => {
        let data = state.calendar.timeEditingDialog;
        let currentEvent = _getChangingEventFromEventId(state, data.eventId);
        let originalEvent = _getOriginalEventFromEventId(state, data.eventId);

        currentEvent.start = new Date(format(new Date(originalEvent.start), "yyyy-MM-dd") + 'T' + data.newStartTime).getTime()
        currentEvent.end = new Date(format(new Date(originalEvent.end), "yyyy-MM-dd") + 'T' + data.newEndTime).getTime()
        state.calendar.timeEditingDialog.open = false;

        _evaluateEventChanged(state, currentEvent, originalEvent)
    },
    applyEventTimeToAllDays : (state, eventId) => {
        let currentEvent = _getChangingEventFromEventId(state, eventId);
        if (!currentEvent) return;
    }
};

const actions = {
    init : () => {
        console.log('init');
    },
    generate : context => {
        let ctxState = context.state;
        let colors = [...ctxState.colors];
        let serviceDays = context.rootGetters['service-stops/ofWeek'];

        ctxState.calendar.originalEvents.splice(0);
        ctxState.calendar.changingEvents.splice(0);
        
        for (let serviceDay of serviceDays) {
            for (let [index, stop] of serviceDay.stops?.entries()) {
                let color = ctxState.calendar.stopColors[stop.internalid] || _getRandomElementOfArray(colors);
                ctxState.calendar.stopColors[stop.internalid] = color;
                if (colors.indexOf(color) >= 0) colors.splice(colors.indexOf(color), 1);

                let eventDate = new Date(stop.eventStart);
                ctxState.calendar.originalEvents.push({
                    id: `${stop.internalid}|${serviceDay.day}`,
                    name: stop.custrecord_1288_stop_name,
                    color,
                    start: stop.eventStart,
                    end: stop.eventEnd,
                    timed: true,
                    upperLimit: eventDate.setHours(0, 0, 0, 0),
                    lowerLimit: eventDate.setHours(23, 59, 59, 999),
                    serviceId: stop.custrecord_1288_service,
                    customerId: stop.custrecord_1288_customer,
                });
            }
        }
        
        ctxState.calendar.changingEvents = JSON.parse(JSON.stringify(ctxState.calendar.originalEvents));
    },
    handleMouseUpOnEvent : async (context, {nativeEvent, event}) => {
        let ctxState = context.state;
        if (ctxState.calendar.moveFlag || ctxState.calendar.changedEvents.length || nativeEvent.button !== 0) return;

        context.commit('displayBusyGlobalModal', {title: 'Preparing', message: 'Please wait while we retrieve the information...'}, {root: true});
        await context.dispatch('customers/setSelected', event.customerId, {root: true});
        await context.dispatch('services/setSelected', event.serviceId, {root: true});
        context.commit('goToRoute', mainTabs.SERVICE_STOP.id, {root: true});
        context.commit('closeGlobalModal', null, {root: true});
    },
    saveEventChanges : async context => {
        let ctxState = context.state;
        if (!ctxState.calendar.changedEvents.length) return;
        context.commit('displayBusyGlobalModal', {title: 'Processing', message: 'Saving changes in service stop timing. Please wait :)'}, {root: true});
        let serviceStopsToUpdate = {};

        let eventId = ctxState.calendar.changedEvents.pop();

        while(eventId !== undefined) {
            let [internalId, day] = eventId.split('|');

            // find the original service-stop record
            if (!serviceStopsToUpdate[internalId]) {
                let index = context.rootGetters['service-stops/ofWeekData'].findIndex(item => parseInt(internalId) === parseInt(item.internalid));
                if (index >= 0) {
                    serviceStopsToUpdate[internalId] = {...context.rootGetters['service-stops/ofWeekData'][index]};
                    serviceStopsToUpdate[internalId].custrecord_1288_relief_start = new Date(serviceStopsToUpdate[internalId].custrecord_1288_relief_start);
                    serviceStopsToUpdate[internalId].custrecord_1288_relief_end = new Date(serviceStopsToUpdate[internalId].custrecord_1288_relief_end);
                }
            }

            // find the event item in calendarEvents
            let index = ctxState.calendar.changingEvents.findIndex(item => item.id === eventId);
            if (index >= 0) {
                // update service time and stop duration
                let calendarEvent = ctxState.calendar.changingEvents[index];
                let serviceTimes = serviceStopsToUpdate[internalId].custrecord_1288_stop_times.split(',');

                let serviceTime = new Date(calendarEvent.start).toLocaleTimeString().substring(0, 5)
                let stopDuration = calendarEvent.end - calendarEvent.start;
                serviceTimes[day - 1] = serviceTime + '|' + stopDuration;
                serviceStopsToUpdate[internalId].custrecord_1288_stop_times = serviceTimes.join(',');
            }

            eventId = ctxState.calendar.changedEvents.pop();
        }

        // save to backend
        for (let internalId in serviceStopsToUpdate)
            await context.dispatch('service-stops/saveServiceStopData',
                {serviceStopId: internalId, serviceStopData: serviceStopsToUpdate[internalId]}, {root: true});

        await context.dispatch('service-stops/getDataBySelectedPlan', null, {root: true});

        context.commit('displayInfoGlobalModal', {title: 'Complete', message: 'Changes in service stop timing have been saved.'}, {root: true})
    },
};

function _areTwoEventsDifferent(eventA, eventB) {
    for (let key in eventA)
        if (eventA[key] !== eventB[key]) return true;
    
    return false;
}

function _evaluateEventChanged(state, currentEvent, originalEvent) {
    if (currentEvent && originalEvent && !state.calendar.changedEvents.includes(currentEvent.id) && _areTwoEventsDifferent(currentEvent, originalEvent))
        state.calendar.changedEvents.push(currentEvent.id);
    else if (currentEvent && originalEvent && state.calendar.changedEvents.includes(currentEvent.id) && !_areTwoEventsDifferent(currentEvent, originalEvent))
        state.calendar.changedEvents.splice(state.calendar.changedEvents.indexOf(currentEvent.id), 1);
}

function _getChangingEventFromEventId(state, eventId) {
    let index = state.calendar.changingEvents.findIndex(item => item.id === eventId);
    return index >= 0 ? state.calendar.changingEvents[index] : null
}

function _getOriginalEventFromEventId(state, eventId) {
    let index = state.calendar.originalEvents.findIndex(item => item.id === eventId);
    return index >= 0 ? state.calendar.originalEvents[index] : null
}

function _convertCalendarTimeToMilliseconds(tms) {
    return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
}

function _roundTime (time, down = true) {
    const roundTo = 5 // minutes
    const roundDownTime = roundTo * 60 * 1000

    return down
        ? time - time % roundDownTime
        : time + (roundDownTime - (time % roundDownTime))
}

function _rnd(a, b) {
    return Math.floor((b - a + 1) * Math.random()) + a
}

function _getRandomElementOfArray(arr) {
    return arr[_rnd(0, arr.length - 1)]
}

export default {
    state,
    getters,
    actions,
    mutations
};