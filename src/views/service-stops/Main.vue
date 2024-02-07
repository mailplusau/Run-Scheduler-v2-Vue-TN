<template>
    <PageWrapper page-name="service-stops">
        <v-row justify="center">

            <v-col cols="12">
            </v-col>

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

                    <v-btn outlined color="secondary" small dark
                           @click.stop="$store.dispatch('service-stops/createNewServiceStopOfCurrentService')">
                        Add New Stop
                    </v-btn>
                </v-toolbar>

                <v-timeline dense>
                    <v-timeline-item v-for="(serviceStop, i) in serviceStops" :key="`serviceStop${i}`">
                        {{serviceStop}}
                    </v-timeline-item>

                    <v-timeline-item class="mb-4" color="red" icon-color="grey lighten-2" small>
                        <v-row justify="space-between">
                            <v-col cols="auto">
                                This order was archived.
                            </v-col>
                            <v-col><v-btn>edit</v-btn></v-col>
                            <v-col
                                class="text-right"
                                cols="auto"
                            >
                                15:26 EDT
                            </v-col>
                        </v-row>
                    </v-timeline-item>

                    <v-timeline-item
                        class="mb-4"
                        small
                    >
                        <v-row justify="space-between">
                            <v-col cols="7">
                                <v-chip
                                    class="white--text ml-0"
                                    color="purple"
                                    label
                                    small
                                >
                                    APP
                                </v-chip>
                                Digital Downloads fulfilled 1 item.
                            </v-col>
                            <v-col
                                class="text-right"
                                cols="5"
                            >
                                15:25 EDT
                            </v-col>
                        </v-row>
                    </v-timeline-item>

                    <v-timeline-item
                        class="mb-4"
                        color="grey"
                        small
                    >
                        <v-row justify="space-between">
                            <v-col cols="7">
                                Order confirmation email was sent to John Leider (john@vuetifyjs.com).
                            </v-col>
                            <v-col
                                class="text-right"
                                cols="5"
                            >
                                15:25 EDT
                            </v-col>
                        </v-row>
                    </v-timeline-item>

                    <v-timeline-item
                        class="mb-4"
                        hide-dot
                    >
                        <v-btn
                            class="mx-0"
                        >
                            Resend Email
                        </v-btn>
                    </v-timeline-item>

                    <v-timeline-item
                        class="mb-4"
                        color="grey"
                        small
                    >
                        <v-row justify="space-between">
                            <v-col cols="7">
                                A $15.00 USD payment was processed on PayPal Express Checkout
                            </v-col>
                            <v-col
                                class="text-right"
                                cols="5"
                            >
                                15:25 EDT
                            </v-col>
                        </v-row>
                    </v-timeline-item>

                    <v-timeline-item
                        color="grey"
                        small
                    >
                        <v-row justify="space-between">
                            <v-col cols="7">
                                John Leider placed this order on Online Store (checkout #1937432132572).
                            </v-col>
                            <v-col
                                class="text-right"
                                cols="5"
                            >
                                15:25 EDT
                            </v-col>
                        </v-row>
                    </v-timeline-item>
                </v-timeline>
            </v-col>

            <v-col cols="12">
                <v-btn color="green darken-2" dark large block @click="finishEditing" :disabled="panel !== undefined">
                    finish editing service stops
                </v-btn>
            </v-col>

        </v-row>
    </PageWrapper>
</template>

<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import ServiceStopForm from '@/views/customers/components/ServiceStopForm.vue';

export default {
    name: "Main",
    components: {ServiceStopForm, PageWrapper},
    data: () => ({
        panel: undefined,
        table2data: [
            {id: 1, name: 'Adelong LPO', duration: 3600},
            {id: 2, name: 'Test Customer 1', duration: 600},
        ],

        panelsDisabled: false,

        items: [
            {
                color: 'red lighten-2',
                icon: 'mdi-star',
            },
            {
                color: 'purple darken-1',
                icon: 'mdi-book-variant',
            },
            {
                color: 'green lighten-1',
                icon: 'mdi-airballoon',
            },
            {
                color: 'indigo',
                icon: 'mdi-buffer',
            },
        ],
    }),
    methods: {
        finishEditing() {
            this.panel = undefined;
            this.$store.commit('setRoute', 'customers');
        },
        addNewStop() {

        }
    },
    computed: {
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
    watch: {
        panel(val) {
            this.panelsDisabled = val !== undefined;
        }
    }
};
</script>
<style scoped>

</style>