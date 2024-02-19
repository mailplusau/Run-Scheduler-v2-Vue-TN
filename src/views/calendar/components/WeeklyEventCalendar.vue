<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import WeeklyEventSidePanel from '@/views/calendar/components/WeeklyEventSidePanel.vue';
import WeeklyEventHelpBtn from '@/views/calendar/components/WeeklyEventHelpBtn.vue';
import WeeklyEventDiscardChangesBtn from '@/views/calendar/components/WeeklyEventDiscardChangesBtn.vue';
import WeeklyEventSaveChangesBtn from '@/views/calendar/components/WeeklyEventSaveChangesBtn.vue';

export default {
    name: "WeeklyEventCalendar",
    components: {
        WeeklyEventSaveChangesBtn,
        WeeklyEventDiscardChangesBtn, WeeklyEventHelpBtn, WeeklyEventSidePanel, PageWrapper},
    data: () => ({
        value: '',
        events: [],
        eventContextMenu: {
            x: 0,
            y: 0,
            clickedEvent: null,
        },
    }),
    mounted() {
        this.$store.dispatch('weekly-events/generate');
    },
    methods: {
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
    },
    computed: {
        editingEventTime() {
            return this.$store.getters['weekly-events/editingEventTime'];
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
    },
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

                        <v-btn color="white" icon @click="$store.getters['weekly-events/calendar'].settingsPanel = true">
                            <v-icon>mdi-cog-outline</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <v-calendar class="calendar-bg"
                                :interval-height="$store.getters['weekly-events/calendar'].intervalHeight"
                                interval-count="48"
                                interval-minutes="30"
                                :interval-format="intervalFormatter"
                                ref="calendar"
                                v-model="value"
                                color="primary"
                                type="week"
                                event-overlap-mode="stack"
                                :events="$store.getters['weekly-events/calendarEvents']"
                                :event-color="event => $store.getters['weekly-events/calendarEventColor'](event)"
                                :event-ripple="true"
                                @mousedown:event="v => $store.commit('weekly-events/startDraggingOnCalendar', v)"
                                @mousedown:time="time => $store.commit('weekly-events/startTimer', time)"
                                @mousemove:time="time => $store.commit('weekly-events/dragCurrentDragEvent', time)"
                                @mouseup:event="v => $store.dispatch('weekly-events/handleMouseUpOnEvent', v)"
                                @mouseup:time="(time, nativeEvent) => $store.commit('weekly-events/endDragging', {time, nativeEvent})"
                                @contextmenu:event="rClickEvent"
                                :weekdays="[1, 2, 3, 4, 5]"
                    >
                        <template v-slot:event="{ event, timed, eventSummary }">
                            <div :class="'v-event-draggable' + ($store.getters['weekly-events/calendar'].changedEvents.includes(event.id) ? ' selected' : '')">
                                <strong>{{ event.id }} {{ event.name }}</strong><br>
                                {{ formatEventTime(event.start) }} - {{ formatEventTime(event.end) }}
<!--                                    <component :is="{ render: eventSummary }"></component>-->
                            </div>
                            <div v-if="timed" class="v-event-drag-bottom"
                                @mousedown.stop.left="$store.commit('weekly-events/startDraggingOnBottomOfEvent', event)"
                            ></div>
                        </template>
                    </v-calendar>
                </v-sheet>
            </v-col>
        </v-row>



        <v-fab-transition>
            <v-btn v-show="!editingEventTime" fab right bottom fixed
                   @click="$store.getters['weekly-events/calendar'].settingsPanel = true" color="primary" dark
                   title="Open Calendar Settings">
                <v-icon large color="secondary">mdi-cog-outline</v-icon>
            </v-btn>
        </v-fab-transition>

        <WeeklyEventHelpBtn offset-bottom="13em" />

        <WeeklyEventDiscardChangesBtn offset-bottom="7em" />

        <WeeklyEventSaveChangesBtn />

        <WeeklyEventSidePanel />

        <v-menu transition="scale-transition"
            v-model="eventContextMenuOpen"
            :position-x="eventContextMenu.x"
            :position-y="eventContextMenu.y"
            absolute
            offset-y
        >
            <v-list dense class="background">
                <v-list-item @click="">
                    <v-list-item-title>Set time manually</v-list-item-title>
                </v-list-item>
                <v-list-item @click="">
                    <v-list-item-title>Apply this time to all days of this stop</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>Click me</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="eventContextMenuOpen = false">
                    <v-list-item-title class="red--text">Cancel</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>

        <template v-if="editingEventTime">
            <div class="weekly-calendar-editing-frame2"></div>
            <div class="weekly-calendar-editing-frame"></div>
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
    font-size: 30px;
    position: fixed;
    left: 0;
    right: 0;
    font-weight: bolder;
    bottom: 20px;
    color: #ff0000;
    text-shadow: 3px 2px 10px #ffffff;
    pointer-events: none;
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