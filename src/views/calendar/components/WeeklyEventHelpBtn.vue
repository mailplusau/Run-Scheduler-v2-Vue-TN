<script>
export default {
    name: "WeeklyEventHelpBtn",
    props: ['offsetBottom'],
    data: () => ({
        dialog: false,
    }),
    computed: {
        editingEventTime() {
            return this.$store.getters['weekly-events/editingEventTime'];
        },
    }
};
</script>

<template>
    <v-dialog width="450px" v-model="dialog">
        <template v-slot:activator="{ on, attrs }">
            <v-fab-transition>
                <v-btn v-show="editingEventTime" fab right bottom fixed  color="white" dark
                       title="What is this?" v-bind="attrs" v-on="on" :style="`bottom: ${offsetBottom};`">
                    <v-icon large color="black">mdi-help</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>

        <v-card class="background">
            <v-container fluid>
                <v-row justify="center">
                    <v-col cols="auto"><v-icon large color="primary">mdi-help</v-icon></v-col>
                    <v-col cols="12" class="event-editing-help-texts">
                        <p><v-icon color="primary">mdi-information-outline</v-icon>
                            This is <b class="red--text">Event Editing Mode</b> where you can <b>move</b> and <b>resize</b> events on the calendar.</p>
                        <p><v-icon color="primary">mdi-information-outline</v-icon>
                            Once you're satisfied with the changes, hit the <b>green
                                circular button</b> at the bottom right hand corner to save your changes.</p>
                        <p><v-icon color="primary">mdi-information-outline</v-icon>
                            Or hit <b>the red button</b> to discard the changes.</p>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="primary" outlined dark @click="dialog = false">Understood</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.event-editing-help-texts > p {
    font-size: .9em;
    margin: 2px 0;
}
</style>