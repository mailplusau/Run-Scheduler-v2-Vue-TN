<script>
import PageWrapper from '@/components/core/PageWrapper.vue';

export default {
    name: "WeeklyEventCalendar",
    components: {PageWrapper},
    data: () => ({
        value: '',
        events: [],
        colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4',
            '#4CAF50', '#3d8640', '#5c7a2e', '#41bb79'],
        names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
        dragEvent: null,
        dragStart: null,
        dragEventUpperLimit: null,
        dragEventLowerLimit: null,
        createEvent: null,
        createStart: null,
        extendOriginal: null,

        calendar: {
            intervalHeight: 48,
        },

        drawer: false,
        items: [
            { title: 'Home', icon: 'mdi-view-dashboard' },
            { title: 'About', icon: 'mdi-forum' },
        ],

        calendarEvents: [],

        eventsToChange: [],
        rClickedEvent: null,
        eventContextMenu: {
            x: 0,
            y: 0,
            clickedEvent: null,
        },
        stopColors: {},

        moveFlag: false,
        isEventClicked: false,
    }),
    mounted() {
        this.getCalendarEvents()
    },
    methods: {
        getCalendarEvents() {
            this.calendarEvents.splice(0);
            let colors = [...this.colors]
            for (let serviceDay of this.serviceDays) {
                for (let [index, stop] of serviceDay.stops?.entries()) {
                    let color = this.stopColors[stop.internalid] || this.rndElement(colors);
                    this.stopColors[stop.internalid] = color;
                    colors.splice(colors.indexOf(color), 1);

                    let eventDate = new Date(stop.eventStart);
                    this.calendarEvents.push({
                        id: `${stop.internalid}|${serviceDay.day}`,
                        name: stop.custrecord_1288_stop_name,
                        color,
                        start: stop.eventStart,
                        end: stop.eventEnd,
                        _start: stop.eventStart,
                        _end: stop.eventEnd,
                        timed: true,
                        upperLimit: eventDate.setHours(0, 0, 0, 0),
                        lowerLimit: eventDate.setHours(23, 59, 59, 999),
                        serviceId: stop.custrecord_1288_service,
                        customerId: stop.custrecord_1288_customer,
                    });
                }
            }
        },
        startDrag ({ nativeEvent, event, timed }) {
            if (nativeEvent.button === 0 && event && timed) {
                this.dragEvent = event
                this.dragTime = null
                this.extendOriginal = null
            }
        },
        startTime (tms) {
            const mouse = this.toTime(tms)

            if (this.dragEvent && this.dragTime === null) {
                const start = this.dragEvent.start

                this.dragTime = mouse - start
            } else { /** Clicked on calendar **/ }
        },
        extendBottom (event) {
            this.createEvent = event
            this.createStart = event.start
            this.extendOriginal = event.end
        },
        mouseMove (tms) {
            const mouse = this.toTime(tms)

            if (this.dragEvent && this.dragTime !== null) {
                this.moveFlag = true;
                const start = this.dragEvent.start
                const end = this.dragEvent.end
                const duration = end - start
                const newStartTime = mouse - this.dragTime

                // calculate the event's start time in case mouse position is outside the event's current date
                let diff = newStartTime > this.dragEvent.lowerLimit ? Math.floor((newStartTime - this.dragEvent.upperLimit) / 86400000) :
                    ((newStartTime + duration) < this.dragEvent.upperLimit ? -1 * Math.floor((this.dragEvent.lowerLimit - newStartTime) / 86400000) : 0)

                const newStart = this.roundTime(newStartTime - diff * 86400000);
                const newEnd = newStart + duration

                if (newStart >= this.dragEvent.upperLimit && newEnd <= this.dragEvent.lowerLimit) {
                    this.dragEvent.start = newStart
                    this.dragEvent.end = newEnd
                }
            } else if (this.createEvent && this.createStart !== null) {
                this.moveFlag = true;
                const mouseRounded = this.roundTime(mouse, false)
                const min = Math.min(mouseRounded, this.createStart)
                const max = Math.max(mouseRounded, this.createStart)

                if (min >= this.createEvent.upperLimit && max <= this.createEvent.lowerLimit) {
                    this.createEvent.start = min
                    this.createEvent.end = max
                }
            }
        },
        evaluateDirtyDragEvent() {
            if (this.dragEvent && !this.eventsToChange.includes(this.dragEvent.id) && (this.dragEvent.start !== this.dragEvent._start || this.dragEvent.end !== this.dragEvent._end))
                this.eventsToChange.push(this.dragEvent.id);
            else if (this.dragEvent && this.dragEvent.start === this.dragEvent._start && this.dragEvent.end === this.dragEvent._end && this.eventsToChange.includes(this.dragEvent.id))
                this.eventsToChange.splice(this.eventsToChange.indexOf(this.dragEvent.id), 1);
            else if (this.createEvent && !this.eventsToChange.includes(this.createEvent.id) && this.createEvent.end !== this.createEvent._end)
                this.eventsToChange.push(this.createEvent.id);
            else if (this.createEvent && this.eventsToChange.includes(this.createEvent.id) && this.createEvent.start === this.createEvent._start && this.createEvent.end === this.createEvent._end)
                this.eventsToChange.splice(this.eventsToChange.indexOf(this.createEvent.id), 1);
        },
        endDrag() {
            this.evaluateDirtyDragEvent();

            this.dragTime = null
            this.dragEvent = null
            this.createEvent = null
            this.createStart = null
            this.extendOriginal = null

            this.moveFlag = false;
        },
        mouseUpEvent({nativeEvent, event}) {
            if (this.moveFlag || this.eventsToChange.length || nativeEvent.button !== 0) return;

            this.$store.commit('displayBusyGlobalModal', {title: 'Preparing', message: 'Please wait while we retrieve the information...'});
            this.$nextTick(async () => {
                await this.$store.dispatch('customers/setSelected', event.customerId);
                await this.$store.dispatch('services/setSelected', event.serviceId);
                this.$store.commit('goToRoute', 'service-stops');
                this.$store.commit('closeGlobalModal');
            })
        },
        cancelDrag () {
            if (this.createEvent) {
                if (this.extendOriginal) {
                    this.createEvent.end = this.extendOriginal
                } else {
                    const i = this.events.indexOf(this.createEvent)
                    if (i !== -1) {
                        this.events.splice(i, 1)
                    }
                }
            }

            this.createEvent = null
            this.createStart = null
            this.dragTime = null
            this.dragEvent = null
        },
        roundTime (time, down = true) {
            const roundTo = 5 // minutes
            const roundDownTime = roundTo * 60 * 1000

            return down
                ? time - time % roundDownTime
                : time + (roundDownTime - (time % roundDownTime))
        },
        toTime (tms) {
            return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
        },
        getEventColor (event) {
            const rgb = parseInt(event.color.substring(1), 16)
            const r = (rgb >> 16) & 0xFF
            const g = (rgb >> 8) & 0xFF
            const b = (rgb >> 0) & 0xFF

            return event === this.dragEvent
                ? `rgba(${r}, ${g}, ${b}, 0.7)`
                : event === this.createEvent
                    ? `rgba(${r}, ${g}, ${b}, 0.7)`
                    : event.color
        },
        rnd (a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a
        },
        rndElement (arr) {
            return arr[this.rnd(0, arr.length - 1)]
        },
        formatEventTime(date) { // This is used to format the time displayed in each event to be 24-hour format
            return new Date(date).toLocaleTimeString('en-AU', {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            })
        },
        intervalFormatter(locale, getOptions) { // This is used to change how the time is displayed on the left side
            return locale.time;
        },
        goToRoute(routeName) {
            this.drawer = false;
            this.$store.commit('goToRoute', routeName);
        },
        rClickEvent({ nativeEvent, event }) {
            nativeEvent.preventDefault();
            this.$nextTick(() => {
                this.eventContextMenu.x = nativeEvent.clientX
                this.eventContextMenu.y = nativeEvent.clientY
                this.$nextTick(() => {
                    this.eventContextMenu.clickedEvent = event;
                })
            })
        },

        async saveEventChanges() {
            if (!this.eventsToChange.length) return;
            this.$store.commit('displayBusyGlobalModal', {title: 'Processing', message: 'Saving changes in service stop timing. Please wait :)'});
            let eventsToUpdate = {};

            let eventId = this.eventsToChange.pop();

            while(eventId !== undefined) {
                let [internalId, day] = eventId.split('|');

                // TODO: find the original service-stop record
                if (!eventsToUpdate[internalId]) {
                    let index = this.serviceStopWeeklyData.findIndex(item => parseInt(internalId) === parseInt(item.internalid));
                    if (index >= 0) {
                        eventsToUpdate[internalId] = {...this.serviceStopWeeklyData[index]};
                        eventsToUpdate[internalId].custrecord_1288_relief_start = new Date(eventsToUpdate[internalId].custrecord_1288_relief_start);
                        eventsToUpdate[internalId].custrecord_1288_relief_end = new Date(eventsToUpdate[internalId].custrecord_1288_relief_end);
                    }
                }

                // TODO: find the event item in calendarEvents
                let index = this.calendarEvents.findIndex(item => item.id === eventId);
                if (index >= 0) {
                    // TODO: update service time and stop duration
                    let calendarEvent = this.calendarEvents[index];
                    let serviceTimes = eventsToUpdate[internalId].custrecord_1288_stop_times.split(',');

                    let serviceTime = new Date(calendarEvent.start).toLocaleTimeString().substring(0, 5)
                    let stopDuration = calendarEvent.end - calendarEvent.start;
                    serviceTimes[day - 1] = serviceTime + '|' + stopDuration;
                    eventsToUpdate[internalId].custrecord_1288_stop_times = serviceTimes.join(',');
                }

                eventId = this.eventsToChange.pop();
            }

            // TODO: save to backend
            for (let internalId in eventsToUpdate)
                await this.$store.dispatch('service-stops/saveServiceStopData',
                    {serviceStopId: internalId, serviceStopData: eventsToUpdate[internalId]});

            await this.$store.dispatch('service-stops/getDataBySelectedPlan');

            this.$store.commit('displayInfoGlobalModal', {title: 'Complete', message: 'Changes in service stop timing have been saved.'})
        },
        discardEventChanges() {
            for (let eventId of this.eventsToChange) {
                let index = this.calendarEvents.findIndex(item => item.id === eventId);
                if (index >= 0) {
                    this.calendarEvents[index].start = this.calendarEvents[index]._start;
                    this.calendarEvents[index].end = this.calendarEvents[index]._end;
                }
            }

            this.eventsToChange.splice(0);
        }
    },
    computed: {
        editingEventTime() {
            return !!this.eventsToChange.length;
        },
        franchisees() {
            return this.$store.getters['franchisees/all'];
        },
        franchisee: {
            get() {
                return this.$store.getters['franchisees/selected'];
            },
            set(val) {
                this.$store.dispatch('franchisees/setSelected', val);
            }
        },
        runPlans() {
            return this.$store.getters['run-plans/all'];
        },
        runPlan: {
            get() {
                return this.$store.getters['run-plans/selected'];
            },
            set(val) {
                this.$store.dispatch('run-plans/setSelected', val);
            }
        },
        runPlanLoading() {
            return this.$store.getters['run-plans/loading'];
        },
        serviceDays() {
            return this.$store.getters['service-stops/ofWeek'];
        },
        eventContextMenuOpen: {
            get() {
                return !!this.eventContextMenu.clickedEvent;
            },
            set(val) {
                if (!val) this.eventContextMenu.clickedEvent = null;
            }
        },
        serviceStopWeeklyData() {
            return this.$store.getters['service-stops/ofWeekData'];
        }
    },
    watch: {
        serviceStopWeeklyData() {
            this.getCalendarEvents();
        }
    }
};
</script>

<template>
    <PageWrapper page-name="weekly-calendar">
        <v-row class="fill-height">
            <v-col cols="12">
                <v-btn color="primary" @click="$store.commit('goToRoute', 'customers')">
                    Customer List
                </v-btn>
                <v-btn color="primary" class="ml-2" @click="$store.commit('goToRoute', 'calendar')">
                    Weekly Stops
                </v-btn>
            </v-col>

            <v-col>
                <v-sheet>
                    <v-toolbar rounded dense color="primary" dark elevation="5">
                        <v-toolbar-title>Weekly Calendar</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-toolbar-title class="caption yellow--text">{{ '' }}</v-toolbar-title>

                        <v-spacer></v-spacer>



                        <v-autocomplete prefix="Franchisee:" class="mr-2" solo-inverted dense hide-details
                                        v-model="franchisee"
                                        :items="franchisees"
                                        item-value="internalid"
                                        item-text="companyname"
                                        placeholder="(Select a franchisee)"
                        ></v-autocomplete>

                        <v-autocomplete prefix="Plan:" class="mr-2" solo-inverted dense hide-details
                                        v-model="runPlan"
                                        :items="runPlans"
                                        item-value="internalid"
                                        item-text="name"
                                        :placeholder="franchisee ? '(Select a run plan)' : 'Please select a franchisee first'"
                                        :disabled="!franchisee || runPlanLoading"
                                        :loading="runPlanLoading"
                        ></v-autocomplete>

                        <v-btn color="white" icon @click="drawer = !drawer">
                            <v-icon>mdi-cog-outline</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-calendar class="calendar-bg"
                                :interval-height="calendar.intervalHeight"
                                interval-count="48"
                                interval-minutes="30"
                                :interval-format="intervalFormatter"
                                ref="calendar"
                                v-model="value"
                                color="primary"
                                type="week"
                                event-overlap-mode="stack"
                                :events="calendarEvents"
                                :event-color="getEventColor"
                                :event-ripple="true"
                                @mousedown:event="startDrag"
                                @mousedown:time="startTime"
                                @mousemove:time="mouseMove"
                                @mouseup:event="mouseUpEvent"
                                @mouseup:time="endDrag"
                                @contextmenu:event="rClickEvent"
                                :weekdays="[1, 2, 3, 4, 5]"
                    >
                        <template v-slot:event="{ event, timed, eventSummary }">
                            <div :class="'v-event-draggable' + (eventsToChange.includes(event.id) ? ' selected' : '')">
                                <strong>{{ event.name }}</strong><br>
                                {{ formatEventTime(event.start) }} - {{ formatEventTime(event.end) }}
<!--                                    <component :is="{ render: eventSummary }"></component>-->
                            </div>
                            <div
                                v-if="timed"
                                class="v-event-drag-bottom"
                                @mousedown.stop="extendBottom(event)"
                            ></div>
                        </template>
                    </v-calendar>
                </v-sheet>
            </v-col>
        </v-row>




        <v-fab-transition>
            <v-btn v-show="!eventsToChange.length" fab right bottom fixed @click="drawer = !drawer" color="primary" dark
                   title="Open Calendar Settings">
                <v-icon large color="secondary">mdi-cog-outline</v-icon>
            </v-btn>
        </v-fab-transition>

        <v-fab-transition>
            <v-btn v-show="eventsToChange.length" fab right bottom fixed color="green" dark @click="saveEventChanges"
                   title="Save Changes">
                <v-icon>mdi-content-save-all-outline</v-icon>
            </v-btn>
        </v-fab-transition>

        <v-fab-transition>
            <v-btn v-show="eventsToChange.length" fab right bottom fixed color="red" @click="discardEventChanges" dark
                   title="Discard Changes" style="bottom: 7em;">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-fab-transition>


        <v-navigation-drawer fixed temporary right floating
                             class="background" v-model="drawer">

            <v-list dense>

                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title>
                            <v-icon color="primary" class="mr-2">mdi-cog-outline</v-icon>
                            <b class="primary--text">Calendar Settings</b>
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                    <v-autocomplete label="Franchisee"
                                    v-model="franchisee"
                                    :items="franchisees"
                                    placeholder="Start typing to search..."
                                    item-value="internalid"
                                    item-text="companyname"
                    ></v-autocomplete>
                </v-list-item>

                <v-list-item>
                    <v-autocomplete label="Plan"
                                    v-model="runPlan"
                                    :items="runPlans"
                                    placeholder="Start typing to search..."
                                    item-value="internalid"
                                    item-text="name"
                                    :placeholder="franchisee ? '(Select a run plan)' : 'Select a franchisee first'"
                                    :disabled="!franchisee || runPlanLoading"
                                    :loading="runPlanLoading"
                    ></v-autocomplete>
                </v-list-item>

                <v-divider></v-divider>

                <v-subheader>Settings</v-subheader>

                <v-list-item>
                    <v-slider v-model="calendar.intervalHeight"
                              label="Time Scale"
                              min="48"
                              max="480"
                    ></v-slider>
                </v-list-item>

                <v-divider></v-divider>

                <v-subheader>Navigations</v-subheader>

                <v-list-item link @click="goToRoute('customers')">
                    <v-list-item-icon>
                        <v-icon>mdi-account</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Customer List</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item link @click="goToRoute('calendar')">
                    <v-list-item-icon>
                        <v-icon>mdi-calendar</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Weekly Stops</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

            </v-list>
        </v-navigation-drawer>

        <v-menu transition="scale-transition"
            v-model="eventContextMenuOpen"
            :position-x="eventContextMenu.x"
            :position-y="eventContextMenu.y"
            absolute
            offset-y
        >
            <v-list dense class="background">
                <v-list-item @click="">
                    <v-list-item-title>Click me</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>Click me</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>Click me</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>

        <template v-if="eventsToChange.length">
            <div class="weekly-calendar-editing-frame"></div>
            <div class="weekly-calendar-editing-frame2"></div>
            <p class="weekly-calendar-editing-text">Event Editing Mode</p>
        </template>
    </PageWrapper>
</template>

<style lang="scss">

@keyframes rotate {
    0% {
        transform: scale(1.04);
    }
    100% {
        transform: scale(1.045);
    }
}


//@keyframes maskBorder {
//    0% { clip-path: ellipse(40% 40% at 0% 50%); }
//    25% { clip-path: ellipse(40% 40% at 50% 0%); }
//    50% { clip-path: ellipse(40% 40% at 100% 50%); }
//    75% { clip-path: ellipse(40% 40% at 50% 100%); }
//    100% { clip-path: ellipse(40% 40% at 0% 50%); }
//}

//@keyframes maskBorder {
//    0% { clip-path: polygon(50% -100%, 120% -50%, 50% 0%, -20% -50%); }
//    100% { clip-path: polygon(50% 100%, 120% 150%, 50% 200%, -20% 150%); }
//}

@keyframes maskBorder {
    0% { clip-path: polygon(0% -140%, 40% -100%, -100% 40%, -140% 0%); }
    100% { clip-path: polygon(200% 60%, 240% 100%, 100% 240%, 60% 200%); }
}

.weekly-calendar-editing-frame2 {
    background: transparent;
    pointer-events: none;
    box-shadow: inset 0 0 20px rgb(200, 0, 0, .5);
    z-index: 5; border-radius: 20px;
    display: block; position: fixed;
    left: 4px; top: 4px; bottom: 4px; right: 4px;

    border: 3px dashed rgb(255, 20, 20, .5);

}

.weekly-calendar-editing-frame {
    //position: fixed;
    background: transparent;
    //top: 0;
    //bottom: 0;
    //left: 0;
    //right: 0;
    //
    pointer-events: none;
    box-shadow: inset 0px 0px 10px rgb(200, 0, 0, .5);


    z-index: 5; border-radius: 20px;
    display: block; position: fixed;
    left: 4px; top: 4px; bottom: 4px; right: 4px;

    border: 3px dashed rgb(255, 20, 20, .5);
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);

    animation: maskBorder 3s infinite linear;
}
p.weekly-calendar-editing-text {
    text-align: center;
    font-size: 20px;
    position: fixed;
    left: 0;
    right: 0;
    font-weight: bolder;
    bottom: 20px;
    color: red;
    text-shadow: 3px 2px 4px white;
}
.calendar-bg {
    background-color: #c4d7c3 !important;
    border: 1px solid #c4d7c3 !important;
    box-shadow: 0 0 10px #869685;
}
.calendar-bg div.v-calendar-daily__scroll-area {
    overflow-y: auto !important;
}
.v-event-draggable {
    padding-left: 6px;
}

.v-event-timed {
    user-select: none;
    -webkit-user-select: none;
}

.v-event-drag-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 4px;
    height: 4px;
    cursor: ns-resize;

    &::after {
        display: none;
        position: absolute;
        left: 50%;
        height: 4px;
        border-top: 1px solid white;
        border-bottom: 1px solid white;
        width: 16px;
        margin-left: -8px;
        opacity: 0.8;
        content: '';
    }

    &:hover::after {
        display: block;
    }
}

.theme--light.v-calendar-events .v-event-timed:has(.v-event-draggable.selected) {
    border: 2px dashed red !important;
}
</style>