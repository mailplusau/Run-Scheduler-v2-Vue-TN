<script>
export default {
    name: "WeeklyEventSaveChangesBtn",
    props: ['offsetBottom'],
    data: () => ({
        dialog: false,
    }),
    methods: {
        proceed() {
            this.$store.commit('weekly-events/saveEventChanges');
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
                <v-btn v-show="editingEventTime" fab right bottom fixed color="green" dark
                       title="Save Event Changes" v-bind="attrs" v-on="on"
                       :style="`bottom: ${offsetBottom};`">
                    <v-icon>mdi-content-save-all-outline</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>

        <v-card class="background">
            <v-container fluid>
                <v-row justify="center">
                    <v-col cols="auto"><v-icon x-large color="green">mdi-information-outline</v-icon></v-col>
                    <v-col cols="12" class="text-center">
                        <p>Commit all changes to NetSuite?</p>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="dialog = false">Cancel</v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="green" dark @click="proceed">Save</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped>

</style>