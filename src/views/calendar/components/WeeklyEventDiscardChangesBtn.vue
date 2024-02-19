<script>
export default {
    name: "WeeklyEventDiscardChangesBtn",
    props: ['offsetBottom'],
    data: () => ({
        dialog: false,
    }),
    methods: {
        proceed() {
            this.$store.commit('weekly-events/restoreChangingEvents');
            this.dialog = false;
        },
    },
    computed: {
        editingEventTime() {
            return this.$store.getters['weekly-events/editingEventTime'];
        },
    }
};
</script>

<template>
    <v-dialog width="350px" v-model="dialog">
        <template v-slot:activator="{ on, attrs }">
            <v-fab-transition>
                <v-btn v-show="editingEventTime" fab right bottom fixed color="red" dark
                       title="Discard Event Changes" v-bind="attrs" v-on="on"
                       :style="`bottom: ${offsetBottom};`">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>

        <v-card class="background">
            <v-container fluid>
                <v-row justify="center">
                    <v-col cols="auto"><v-icon x-large color="red">mdi-close-octagon</v-icon></v-col>
                    <v-col cols="12" class="event-editing-help-texts text-center">
                        <p>Discard all unsaved changes?</p>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="dialog = false">Cancel</v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="red" dark @click="proceed">Discard</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped>

</style>