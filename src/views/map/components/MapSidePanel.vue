<script>
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: "MapSidePanel",
    data: () => ({
        settings: [],
    }),
    methods: {
        goToRoute(routeName) {
            this.drawer = false;
            this.$store.commit('goToRoute', routeName);
        },
    },
    computed: {
        territoryMarkings() {
            return this.$store.getters['map/settingsPanel'].territoryMarkings;
        },
        isVisible() {
            return this.$store.getters['route'] === mainTabs.SERVICE_MAP.id && this.drawer
        },
        drawer: {
            get() {
                return this.$store.getters['map/settingsPanel'].open;
            },
            set(val) {
                this.$store.getters['map/settingsPanel'].open = val;
            }
        },
        dataLoading() {
            return this.$store.getters['map/settingsPanel'].dataLoading;
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
                this.$store.getters['map/settingsPanel'].dataLoading = true;
                this.$store.dispatch('run-plans/setSelected', val).then(() => {
                    this.$store.dispatch('map/displayRoutesOfSelectedRunPlan');
                });
            }
        },
        runPlanLoading() {
            return this.$store.getters['run-plans/loading'];
        },
        selectedWeekDays: {
            get() {
                return this.$store.getters['map/settingsPanel'].selectedDays;
            },
            set(val) {
                this.$store.getters['map/settingsPanel'].selectedDays = val;
                this.$store.dispatch('map/handleSelectedWeekDaysChanged');
            }
        }
    }
};
</script>

<template>
    <v-navigation-drawer :app="isVisible"
                         :permanent="isVisible"
                         fixed right floating
                         class="background map-side-panel"
                         v-model="drawer">

        <v-list dense>

            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        <v-icon color="primary" class="mr-2">mdi-cog-outline</v-icon>
                        <b class="primary--text">Map Settings</b>
                    </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                    <v-btn text small @click="drawer = !drawer" color="red"><v-icon>mdi-close</v-icon> close</v-btn>
                </v-list-item-action>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item>
                <v-autocomplete label="Franchisee"
                                v-model="franchisee"
                                :items="franchisees"
                                placeholder="Start typing to search..."
                                item-value="internalid"
                                item-text="companyname"
                                :disabled="runPlanLoading || dataLoading"
                                :loading="runPlanLoading"
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
                                :disabled="!franchisee || runPlanLoading || dataLoading"
                                :loading="runPlanLoading"
                ></v-autocomplete>
            </v-list-item>

            <v-divider></v-divider>

            <v-subheader>Routes -{{selectedWeekDays}}-</v-subheader>

            <v-list-item-group v-model="selectedWeekDays"
                multiple active-class="">

                <template v-for="weekDay of $store.getters['map/weeklyStopData']">
                    <v-list-item v-if="[1, 2, 3, 4, 5].includes(weekDay.day)" :disabled="dataLoading">
                        <template v-slot:default="{ active }">
                            <v-list-item-action>
                                <v-checkbox :input-value="active"></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                                <v-list-item-title>{{ weekDay.date }}</v-list-item-title>
                            </v-list-item-content>
                        </template>
                    </v-list-item>
                </template>

            </v-list-item-group>

            <v-divider></v-divider>

            <v-subheader>Navigations</v-subheader>

            <v-list-item link @click="goToRoute('weekly_stops')">
                <v-list-item-icon>
                    <v-icon>mdi-format-list-bulleted</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>Weekly Stops</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="goToRoute('customers')">
                <v-list-item-icon>
                    <v-icon>mdi-account</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>Customer List</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="goToRoute('weekly_calendar')">
                <v-list-item-icon>
                    <v-icon>mdi-calendar</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>Weekly Calendar</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

        </v-list>
    </v-navigation-drawer>
</template>

<style scoped>
.map-side-panel {

    box-shadow: 0px 0px 10px 0px #282828;
}
</style>