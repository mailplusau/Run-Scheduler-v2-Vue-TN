<script>
import EditableTimeInput from '@/components/EditableTimeInput.vue';
import {addDays, format} from 'date-fns';

export default {
    name: "WeeklyEventCalendarContextMenu",
    components: {EditableTimeInput},
    data: () => ({

    }),
    methods: {
        openTimeEditingDialog() {
            this.$store.commit('weekly-events/openTimeEditingDialog', this.eventContextMenu.clickedEvent.id);
        },
        applyTimeToOtherDays() {

        }
    },
    computed: {
        eventContextMenu() {
            return this.$store.getters['weekly-events/eventContextMenu'];
        },
    }
};
</script>

<template>
    <v-menu transition="scale-transition"
            v-model="eventContextMenu.open"
            :position-x="eventContextMenu.x"
            :position-y="eventContextMenu.y"
            absolute
            offset-y
    >
        <v-list dense class="background">
            <v-list-item @click="openTimeEditingDialog">
                <v-list-item-title>Set time manually</v-list-item-title>
            </v-list-item>
            <v-list-item @click="" disabled>
                <v-list-item-title>Apply this time to all days of this stop</v-list-item-title>
            </v-list-item>
            <v-list-item disabled>
                <v-list-item-title>Click me</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="eventContextMenu.open = false">
                <v-list-item-title class="red--text">Cancel</v-list-item-title>
            </v-list-item>
        </v-list>

    </v-menu>
</template>

<style scoped>

</style>