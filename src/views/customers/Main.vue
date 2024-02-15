<template>
    <PageWrapper page-name="customers">
        <v-row justify="center">
            <v-col cols="12">
                <v-btn color="primary" @click="$store.commit('goToRoute', 'calendar')">
                    Weekly Stops
                </v-btn>
                <v-btn color="primary" class="ml-2" @click="$store.commit('goToRoute', 'weekly-calendar')">
                    Weekly Calendar
                </v-btn>
            </v-col>
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

export default {
    name: "Main",
    components: {ServiceTable, CustomerTable, PageWrapper},
    data: () => ({
        sidePanel: true,
    }),
};
</script>

<style scoped>

</style>