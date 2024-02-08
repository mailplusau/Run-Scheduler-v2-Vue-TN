<script>
import PageWrapper from '@/components/core/PageWrapper.vue';

export default {
    name: "WeeklyEventCalendar",
    components: {PageWrapper},
    data: () => ({
        value: '',
        events: [],
        colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4', '#4CAF50', '#FF9800', '#757575'],
        names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
        dragEvent: null,
        dragStart: null,
        createEvent: null,
        createStart: null,
        extendOriginal: null,
    }),
    methods: {
        startDrag ({ event, timed }) {
            if (event && timed) {
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
            } else {
                // this.createStart = this.roundTime(mouse)
                // this.createEvent = {
                //     name: `Event #${this.events.length}`,
                //     color: this.rndElement(this.colors),
                //     start: this.createStart,
                //     end: this.createStart,
                //     timed: true,
                // }
                //
                // this.events.push(this.createEvent)
            }
        },
        extendBottom (event) {
            this.createEvent = event
            this.createStart = event.start
            this.extendOriginal = event.end
        },
        mouseMove (tms) {
            const mouse = this.toTime(tms)

            if (this.dragEvent && this.dragTime !== null) {
                const start = this.dragEvent.start
                const end = this.dragEvent.end
                const duration = end - start
                const newStartTime = mouse - this.dragTime
                const newStart = this.roundTime(newStartTime)
                const newEnd = newStart + duration

                this.dragEvent.start = newStart
                this.dragEvent.end = newEnd
            } else if (this.createEvent && this.createStart !== null) {
                const mouseRounded = this.roundTime(mouse, false)
                const min = Math.min(mouseRounded, this.createStart)
                const max = Math.max(mouseRounded, this.createStart)

                this.createEvent.start = min
                this.createEvent.end = max
            }
        },
        endDrag () {
            this.dragTime = null
            this.dragEvent = null
            this.createEvent = null
            this.createStart = null
            this.extendOriginal = null
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
        getEvents ({ start, end }) {
            const events = []

            const min = new Date(`${start.date}T00:00:00`).getTime()
            const max = new Date(`${end.date}T23:59:59`).getTime()
            const days = (max - min) / 86400000
            const eventCount = this.rnd(days, days + 20)

            for (let i = 0; i < eventCount; i++) {
                const timed = this.rnd(0, 3) !== 0
                const firstTimestamp = this.rnd(min, max)
                const secondTimestamp = this.rnd(2, timed ? 8 : 288) * 900000
                const start = firstTimestamp - (firstTimestamp % 900000)
                const end = start + secondTimestamp

                events.push({
                    name: this.rndElement(this.names),
                    color: this.rndElement(this.colors),
                    start,
                    end,
                    timed,
                })
            }

            this.events = events
        },
        rnd (a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a
        },
        rndElement (arr) {
            return arr[this.rnd(0, arr.length - 1)]
        },
        formatEventTime(date) { // This is used to format the time displayed in each event to be 24-hour format
            return new Date(date).toLocaleTimeString('en-US', {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            })
        },
        intervalFormatter(locale, getOptions) { // This is used to change how the time is displayed on the left side
            return locale.time;
        }
    },
};
</script>

<template>
    <PageWrapper page-name="weekly-calendar">
        <v-container class="fill-height" fluid>

            <v-row class="fill-height" no-gutters>
                <v-col>
                    <v-sheet>
                        <v-toolbar flat dense color="primary" dark elevation="2">
                            <v-toolbar-title>Weekly Calendar</v-toolbar-title>
                            <v-divider class="mx-4" inset vertical></v-divider>
                            <v-toolbar-title class="caption yellow--text">
                                {{ '' }}
                            </v-toolbar-title>

                            <v-spacer></v-spacer>

                        </v-toolbar>
                        <v-calendar class="calendar-bg"
                                    interval-height="480" interval-count="48" interval-minutes="30"
                                    :interval-format="intervalFormatter"
                                    ref="calendar"
                                    v-model="value"
                                    color="primary"
                                    type="week"
                                    :events="events"
                                    :event-color="getEventColor"
                                    :event-ripple="true"
                                    @change="getEvents"
                                    @mousedown:event="startDrag"
                                    @mousedown:time="startTime"
                                    @mousemove:time="mouseMove"
                                    @mouseup:time="endDrag"
                                    @mouseleave.native="cancelDrag"
                                    :weekdays="[1, 2, 3, 4, 5]"
                        >
                            <template v-slot:event="{ event, timed, eventSummary }">
                                <div class="v-event-draggable">
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
        </v-container>
    </PageWrapper>
</template>

<style lang="scss">
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
</style>