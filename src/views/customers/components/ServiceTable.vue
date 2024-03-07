<template>
    <v-data-table :headers="headers" :items="services" :loading="loading" item-key="internalid"
                  :no-data-text="$store.getters['customers/selected'] ? 'No Service to show' : 'Please select a Customer first'"
                  :items-per-page="-1"
                  class="elevation-5 background" :hide-default-footer="services.length <= 5" loading-text="Loading services..."
                  @click:row="handleServiceDetailClick">

        <template v-slot:top>
            <v-toolbar flat dense color="primary" dark>
                <v-toolbar-title v-if="customer['companyname']" class="subtitle-1 yellow--text">Services of {{customer['companyname']}}</v-toolbar-title>
                <v-toolbar-title  v-else class="subtitle-2 grey--text">No customer selected</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-toolbar-title class="caption yellow--text">
                    {{ '' }}
                </v-toolbar-title>

                <v-spacer></v-spacer>
            </v-toolbar>
        </template>

        <template v-slot:item.scheduled="{ item }">
            <v-icon v-if="isScheduled(item.internalid)" color="green">mdi-check</v-icon>
            <v-icon v-else color="red">mdi-close</v-icon>
        </template>

        <template v-slot:item.actions="{ item }">
<!--            <v-btn icon color="primary" title="Edit stop" @click.stop="handleServiceDetailClick"><v-icon>mdi-pencil</v-icon></v-btn>-->
            <v-btn icon color="red" title="Delete stop" @click.stop=""><v-icon>mdi-delete</v-icon></v-btn>
            <v-btn icon color="" title="Inactivate stop" @click.stop=""><v-icon>mdi-pause-box-outline</v-icon></v-btn>
<!--            <v-btn icon color="" title="Reactivate stop" @click.stop=""><v-icon>mdi-play-box-outline</v-icon></v-btn>-->
        </template>
    </v-data-table>
</template>

<script>
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: "ServiceTable",
    data: () => ({
        headers: [
            {value: 'name', text: 'Name', align: 'start', sortable: false},
            {value: 'custrecord_service_price', text: 'Price', align: 'center', sortable: false},
            {value: 'scheduled', text: 'Scheduled', align: 'center', sortable: false},
            {value: 'actions', text: '', align: 'end', sortable: false}
        ],
    }),
    methods: {
        handleServiceDetailClick(e, v) {
            this.$store.dispatch('services/setSelected', v.item.internalid);
            this.$store.commit('goToRoute', this.mainTabs.SERVICE_STOP.id);
        },
        isScheduled(serviceId) {
            if (!this.customer['serviceScheduleReport'] || !this.customer['serviceScheduleReport']?.length) return false;
            let index = this.customer['serviceScheduleReport'].findIndex(item => parseInt(item.internalid) === parseInt(serviceId));
            return this.customer['serviceScheduleReport'][index]?.stopCount && parseInt(this.customer['serviceScheduleReport'][index]?.stopCount) >= 2;
        }
    },
    computed: {
        mainTabs() {
            return mainTabs
        },
        customer() {
            return this.$store.getters['customers/selectedItem']
        },
        services() {
            return this.$store.getters['services/data'];
        },
        loading() {
            return this.$store.getters['services/loading'];
        },
    }
};
</script>

<style scoped>

</style>