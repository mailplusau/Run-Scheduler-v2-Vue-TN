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
                this.$store.dispatch('run-plans/setSelected', val);
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
        },
        mainTabs() {
            return mainTabs
        }
    }
};
</script>

<template>
    <v-navigation-drawer :app="isVisible"
                         :permanent="isVisible"
                         fixed right floating hide-overlay
                         class="background map-side-panel"
                         v-model="drawer">

        <v-list dense>

            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>

                    </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                    <v-btn text small @click="drawer = !drawer" color="red"><v-icon>mdi-close</v-icon> close panel</v-btn>
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

            <v-subheader>Routes -{{runPlan}}-</v-subheader>

            <v-list-item-group v-model="selectedWeekDays"
                multiple active-class="">

                <template v-for="weekDay of $store.getters['map/weeklyStopData']">
                    <v-list-item v-if="[1, 2, 3, 4, 5].includes(weekDay.day)" :disabled="dataLoading || !runPlan">
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

            <v-list-item>
                <v-btn block small v-if="territoryMarkings.show" :disabled="territoryMarkings.processing"
                       @click="$store.dispatch('map/showTerritoryMarkings', false)">Hide territories</v-btn>
                <v-btn block small v-else :disabled="territoryMarkings.processing"
                       @click="$store.dispatch('map/showTerritoryMarkings', true)">Show territories</v-btn>
            </v-list-item>

            <v-divider></v-divider>

            <v-subheader>Navigations</v-subheader>

            <template v-for="mainTab in Object.keys(mainTabs)">

                <v-list-item v-show="!mainTabs[mainTab].hidden" link
                             @click="goToRoute(mainTabs[mainTab].id)"
                             :disabled="dataLoading || mainTabs[mainTab].id === $store.getters['route']">

                    <v-list-item-icon>
                        <v-icon>{{mainTabs[mainTab].icon}}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>{{mainTabs[mainTab].name}}</v-list-item-title>
                    </v-list-item-content>

                </v-list-item>

            </template>

        </v-list>
    </v-navigation-drawer>
</template>

<style scoped>
.map-side-panel {

    box-shadow: 0px 0px 10px 0px #282828;
}
</style>