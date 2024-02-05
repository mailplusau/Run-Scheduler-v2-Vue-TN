<template>
    <PageWrapper page-name="calendar">
        <v-row justify="center">
            <v-col cols="12">
                <v-btn color="primary" @click="$store.commit('setRoute', 'customers')">
                    View Customer List
                </v-btn>
            </v-col>
            <v-col cols="12">
                <v-card color="background" elevation="10">


                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card elevation="10" color="background">
                    <v-container fluid>
                        <v-row>
                            <v-col>
                                <v-autocomplete prefix="Franchisee:"
                                                v-model="franchisee"
                                                :items="franchisees"
                                                item-value="internalid"
                                                item-text="companyname"
                                                placeholder="(Select a franchisee)"></v-autocomplete>
                            </v-col>
                            <v-col>
                                <v-autocomplete prefix="Plan Name:"
                                                v-model="runPlan"
                                                :items="runPlans"
                                                item-value="internalid"
                                                item-text="name"
                                                :placeholder="franchisee ? '(Select a run plan)' : 'Please select a franchisee first'"
                                                :disabled="!franchisee || runPlanLoading"
                                                :loading="runPlanLoading"
                                ></v-autocomplete>
                            </v-col>
                        </v-row>
                    </v-container>

                    <v-list dense class="calendar-stop-list" color="background">

                        <template v-for="(serviceDay, index) in serviceDays">

                            <v-list-item :key="`service-day-${index}`" v-show="serviceDay.stops.length">
                                <v-list-item-content>
                                    <v-list-item-title class="primary--text subtitle-1">
                                        {{serviceDay.date}}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>

                            <template v-for="(serviceStop, innerIndex) in serviceDay.stops">

                                <v-divider :key="`service-stop-divider-${index}-${innerIndex}`"></v-divider>

                                <v-list-item :key="`service-stop-${index}-${innerIndex}`" @click="dialogOpen = true">
                                    <v-list-item-action>
                                        <v-list-item-action-text class="black--text subtitle-2">
                                            {{ serviceStop.time}}
                                        </v-list-item-action-text>
                                    </v-list-item-action>

                                    <v-list-item-icon><v-icon small>mdi-map-marker</v-icon></v-list-item-icon>

                                    <v-list-item-content>
                                        <v-list-item-title>
                                            {{ serviceStop.stopName }}
                                        </v-list-item-title>

                                        <v-list-item-subtitle>
                                            {{ serviceStop.address.addr1 }} {{ serviceStop.address.addr2 }},
                                            {{ serviceStop.address.city }} {{ serviceStop.address.state }} {{ serviceStop.address.zip }}
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                        </template>

                    </v-list>
                </v-card>
            </v-col>
        </v-row>


        <v-dialog v-model="dialogOpen" scrollable>
            <v-card class="background">
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>
                        Editing Stop
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text style="height: 80vh;">
                    <ServiceStopForm />
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="dialogOpen = false">Cancel</v-btn>
                    <v-btn @click="dialogOpen = false" color="green" dark>Save Changes</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </PageWrapper>
</template>

<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import ServiceStopForm from '@/views/customers/components/ServiceStopForm.vue';

export default {
    name: "Main",
    components: {ServiceStopForm, PageWrapper},
    data: () => ({
        dialogOpen: false,
    }),
    computed: {
        serviceDays() {
            return this.$store.getters['service-stops/all'];
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
        serviceStops() {
            return this.$store.getters['service-stops/all'];
        }
    }
};
</script>

<style>
.calendar-stop-list .v-list-item__action {
    min-width: 9em !important;
}
</style>