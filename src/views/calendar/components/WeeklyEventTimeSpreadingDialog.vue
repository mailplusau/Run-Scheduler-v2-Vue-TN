<script>
export default {
    // TODO: not done
    name: "WeeklyEventTimeSpreadingDialog",
    data: () => ({
        formValid: true
    }),
    methods: {
        applyTimeToAllDays() {

        }
    },
    computed: {
        timeSpreadingDialog() {
            return this.$store.getters['weekly-events/timeSpreadingDialog'];
        },
        event() {
            let events = this.$store.getters['weekly-events/calendarEvents']
            let index = events.findIndex(item => item.id === this.timeSpreadingDialog.eventId);
            return events[index] || null;
        },
    }
};
</script>

<template>
    <v-dialog max-width="400" v-model="timeSpreadingDialog.open">
        <v-card class="background">
            <v-container fluid>
                <v-form ref="form" v-model="formValid" lazy-validation>
                    <v-row justify="center">
                        <v-col cols="auto"><v-icon x-large color="green">mdi-information-outline</v-icon></v-col>
                        <v-col cols="12" class="event-editing-help-texts text-center">
                            <p>Apply service time <b>{{event.start}} - {{event.end}}</b> to other days as well?</p>
                        </v-col>

                        <v-col cols="auto">
                            <v-btn @click="timeSpreadingDialog.open = false">Cancel</v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn color="green" dark @click="applyTimeToAllDays">Apply</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped>

</style>