<script>
import EditableTimeInput from '@/components/EditableTimeInput.vue';
import {format} from 'date-fns';

export default {
    name: "WeeklyEventTimeEditingDialog",
    components: {EditableTimeInput},
    data: () => ({
        formValid: true
    }),
    methods: {
        applyTimeChange() {
            if (!this.$refs.form.validate()) return false;

            this.$store.commit('weekly-events/applyChangeOfEventTime')
        },
        startTimeRule() {
            if (this.timeEditingDialog.newStartTime > this.timeEditingDialog.newEndTime)
                return 'Start Time must be earlier than End Time'

            return true;
        }
    },
    computed: {
        timeEditingDialog() {
            return this.$store.getters['weekly-events/timeEditingDialog'];
        },
        event() {
            let events = this.$store.getters['weekly-events/calendarEvents']
            let index = events.findIndex(item => item.id === this.timeEditingDialog.eventId);
            return events[index] || null;
        },
    }
};
</script>

<template>
    <v-dialog max-width="450" v-model="timeEditingDialog.open">
        <v-card class="background">
            <v-container fluid>
                <v-form ref="form" v-model="formValid" lazy-validation>
                <v-row justify="center">
                    <v-col cols="auto" v-if="event">
                        <span>Set time for <b>{{event.name}}</b> on <b>{{new Date(event.start).toDateString()}}</b></span>
                    </v-col>
                    <v-col cols="12">
                        <EditableTimeInput v-model="timeEditingDialog.newStartTime"
                                           prepend-icon="mdi-ray-start-arrow" prefix="Start Time:" :rules="[() => startTimeRule()]" />
                    </v-col>
                    <v-col cols="12">
                        <EditableTimeInput v-model="timeEditingDialog.newEndTime"
                                           prepend-icon="mdi-ray-end" prefix="End Time:" />
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="timeEditingDialog.open = false">cancel</v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="green" @click="applyTimeChange" dark>done</v-btn>
                    </v-col>
                </v-row>
                </v-form>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped>

</style>