<template>
    <PageWrapper page-name="customers">
        <v-row justify="center">
            <v-col cols="12">
                <v-btn color="primary" @click="$store.commit('setRoute', 'calendar')">
                    View Calendar
                </v-btn>
            </v-col>
            <v-col :cols="sidePanel ? 7 : 12">
                <CustomerTable />
            </v-col>

            <v-col :cols="sidePanel ? 5 : 0">
                <ServiceTable />
            </v-col>
        </v-row>

        <ServiceStopDialog v-model="serviceStopDialog" />
    </PageWrapper>
</template>

<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import ServiceStopDialog from '@/views/customers/components/ServiceStopDialog.vue';
import CustomerTable from '@/views/customers/components/CustomerTable.vue';
import ServiceTable from '@/views/customers/components/ServiceTable.vue';

export default {
    name: "Main",
    components: {ServiceTable, CustomerTable, ServiceStopDialog, PageWrapper},
    data: () => ({
        sidePanel: true,
    }),
    methods: {

    },
    computed: {
        serviceStopDialog: {
            get() {
                return this.$store.getters['service-stops/dialog'].open;
            },
            set(val) {
                this.$store.getters['service-stops/dialog'].open = val;
            }
        }
    }
};
</script>

<style scoped>

</style>