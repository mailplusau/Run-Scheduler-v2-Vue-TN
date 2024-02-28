<template>
    <PageWrapper :page-name="mainTabs.SERVICE_STOP.id">
        <v-row justify="center">

            <v-col cols="12">
                <v-toolbar flat dense color="primary" dark>
                    <v-toolbar-title class="subtitle-1">
                        Stops under service <b class="yellow--text">{{service.custrecord_service_text}} (${{service.custrecord_service_price}})</b>
                    </v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-toolbar-title class="caption yellow--text">
                        {{ customer.entityid }} {{customer.companyname}}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>

                    <v-btn small @click="goBack" color="white" light class="mr-2" outlined>
                        <v-icon small>mdi-chevron-left</v-icon> go back
                    </v-btn>
                    <v-btn outlined color="secondary" small dark @click.stop="addNewStop">
                        Add New Stop
                    </v-btn>
                </v-toolbar>

                <v-timeline dense align-top>
                    <v-timeline-item v-if="!serviceStops.length" color="white" icon-color="red" small icon="mdi-exclamation-thick">
                        <v-row justify="space-between" align="center">
                            <v-col>No service stop to show.</v-col>
                        </v-row>
                    </v-timeline-item>
                    <v-timeline-item v-for="(serviceStop, i) in serviceStops" :key="`serviceStop${i}`"
                                     class="mb-4" color="primary" icon-color="grey lighten-2" small>

                        <v-row justify="space-between" align="center">
                            <v-col cols="8">
                                <b class="primary--text">Service stop: {{serviceStop.custrecord_1288_stop_name}}</b><br>
                                <span class="subtitle-2">
                                    Address: {{$store.getters['addresses/getAddressObject'](parseInt(serviceStop.custrecord_1288_address_type), serviceStop).formatted}}
                                </span><br>
                                <span class="caption grey--text lighten-1">
                                    Notes:
                                    <span v-if="serviceStop.custrecord_1288_notes">{{serviceStop.custrecord_1288_notes}}</span>
                                    <i v-else>None provided</i>
                                </span>
                            </v-col>
                            <v-col cols="auto">
<!--                                <v-btn icon><v-icon>mdi-chevron-up-box-outline</v-icon></v-btn>-->
<!--                                <v-btn icon><v-icon>mdi-chevron-down-box-outline</v-icon></v-btn>-->
                                <v-btn color="primary" small @click="editServiceStop(serviceStop.internalid)">
                                    <v-icon small class="mr-2">mdi-pencil</v-icon> Edit stop
                                </v-btn>
                                <v-btn icon color="red"><v-icon>mdi-delete</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </v-timeline-item>

                </v-timeline>
            </v-col>

            <v-col cols="12">
                <v-btn color="green darken-2" dark large block @click="goBack">
                    finish editing service stops
                </v-btn>
            </v-col>

        </v-row>

        <ServiceStopDialog />
    </PageWrapper>
</template>

<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import ServiceStopForm from '@/views/service-stops/components/ServiceStopForm.vue';
import ServiceStopDialog from '@/views/service-stops/components/ServiceStopDialog.vue';
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: "Main",
    components: {ServiceStopDialog, ServiceStopForm, PageWrapper},
    data: () => ({

    }),
    methods: {
        goBack() {
            this.$store.commit('navigateBack');
        },
        editServiceStop(serviceStopId) {
            this.$store.dispatch('service-stops/editServiceStopOfCurrentService', serviceStopId);
        },
        addNewStop() {
            this.$store.dispatch('service-stops/createNewServiceStopOfCurrentService');
        }
    },
    computed: {
        mainTabs() {
            return mainTabs
        },
        serviceStops() {
            return this.$store.getters['service-stops/ofCurrentService'].data;
        },
        service() {
            return this.$store.getters['services/selectedItem'];
        },
        customer() {
            return this.$store.getters['customers/selectedItem'];
        }
    },
};
</script>
<style scoped>

</style>