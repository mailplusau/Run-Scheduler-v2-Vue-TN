<template>
    <PageWrapper :page-name="mainTabs.CUSTOMER_LIST.id">
        <v-row justify="center">
            <v-col lg="7" cols="6">
                <CustomerTable />
            </v-col>

            <v-col lg="5" cols="6">
                <ServiceTable />
            </v-col>
        </v-row>

    </PageWrapper>
</template>

<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import CustomerTable from '@/views/customers/components/CustomerTable.vue';
import ServiceTable from '@/views/customers/components/ServiceTable.vue';
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: "Main",
    computed: {
        mainTabs() {
            return mainTabs
        }
    },
    components: {ServiceTable, CustomerTable, PageWrapper},
    data: () => ({
        sidePanel: true,
    }),
};
</script>

<style scoped>

</style>