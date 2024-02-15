<template>
    <PageWrapper page-name="calendar">
        <v-row justify="center">
            <v-col cols="12">
                <v-btn color="primary" @click="$store.commit('goToRoute', 'customers')">
                    Customer List
                </v-btn>
                <v-btn color="primary" class="ml-2" @click="$store.commit('goToRoute', 'weekly-calendar')">
                    Weekly Calendar
                </v-btn>
            </v-col>

            <v-col cols="12">
                <v-card elevation="10" color="background">
                    <v-toolbar flat dense color="primary" dark>
                        <v-toolbar-title>Weekly Stops</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-toolbar-title class="caption yellow--text">
                            {{ '' }}
                        </v-toolbar-title>

                        <v-spacer></v-spacer>

                        <v-autocomplete prefix="Franchisee:" class="mr-2" solo-inverted dense hide-details
                                        v-model="franchisee"
                                        :items="franchisees"
                                        item-value="internalid"
                                        item-text="companyname"
                                        placeholder="(Select a franchisee)"
                        ></v-autocomplete>
                        <v-autocomplete prefix="Plan:" solo-inverted dense hide-details
                                        v-model="runPlan"
                                        :items="runPlans"
                                        item-value="internalid"
                                        item-text="name"
                                        :placeholder="franchisee ? '(Select a run plan)' : 'Please select a franchisee first'"
                                        :disabled="!franchisee || runPlanLoading"
                                        :loading="runPlanLoading"
                        ></v-autocomplete>
                    </v-toolbar>

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

                                <v-list-item :key="`service-stop-${index}-${innerIndex}`" @click="editServiceStop(serviceStop)">
                                    <v-list-item-action>
                                        <v-list-item-action-text class="black--text subtitle-2">
                                            {{ serviceStop.stopTime}}
                                        </v-list-item-action-text>
                                    </v-list-item-action>

                                    <v-list-item-icon><v-icon small>mdi-map-marker</v-icon></v-list-item-icon>

                                    <v-list-item-content>
                                        <v-list-item-title>
                                            {{ serviceStop.custrecord_1288_stop_name }}
                                        </v-list-item-title>

                                        <v-list-item-subtitle>
                                            {{serviceStop.address}} ({{ serviceStop.addressType }})
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                        </template>

                    </v-list>
                </v-card>
            </v-col>
        </v-row>

    </PageWrapper>
</template>

<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import ServiceStopForm from '@/views/service-stops/components/ServiceStopForm.vue';

export default {
    name: "Main",
    components: {ServiceStopForm, PageWrapper},
    data: () => ({
        dialogOpen: false,
    }),
    methods: {
        async editServiceStop(serviceStop) {
            this.$store.commit('displayBusyGlobalModal', {title: 'Preparing', message: 'Please wait while we retrieve the information...'});
            this.$nextTick(async () => {
                await this.$store.dispatch('customers/setSelected', serviceStop.custrecord_1288_customer);
                await this.$store.dispatch('services/setSelected', serviceStop.custrecord_1288_service);
                this.$store.commit('goToRoute', 'service-stops');
                this.$store.commit('closeGlobalModal');
            })
        }
    },
    computed: {
        serviceDays() {
            return this.$store.getters['service-stops/ofWeek'];
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

<style>
.calendar-stop-list .v-list-item__action {
    min-width: 9em !important;
}
</style>