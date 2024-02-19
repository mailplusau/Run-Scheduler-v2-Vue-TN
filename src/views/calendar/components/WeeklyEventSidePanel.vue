<script>
export default {
    name: "WeeklyEventSidePanel",
    data: () => ({

    }),
    methods: {
        goToRoute(routeName) {
            this.drawer = false;
            this.$store.commit('goToRoute', routeName);
        },
    },
    computed: {
        drawer: {
            get() {
                return this.$store.getters['weekly-events/calendar'].settingsPanel;
            },
            set(val) {
                this.$store.getters['weekly-events/calendar'].settingsPanel = val;
            }
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
    }
};
</script>

<template>

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
                <v-slider v-model="$store.getters['weekly-events/calendar'].intervalHeight"
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
</template>

<style scoped>

</style>