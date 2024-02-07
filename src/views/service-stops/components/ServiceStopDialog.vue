<template>
    <v-dialog :value="dialogOpen" fullscreen hide-overlay transition="dialog-bottom-transition" persistent eager>
        <v-card class="background">
            <v-toolbar flat dense color="primary" dark>
                <v-toolbar-title v-if="!dialogForm.internalid">New Stop for Service #{{service.internalid}}</v-toolbar-title>
                <v-toolbar-title v-else>Editing Stop # for Service #{{service.internalid}}</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-toolbar-title class="caption yellow--text">
                    {{ '' }}
                </v-toolbar-title>

                <v-spacer></v-spacer>

                <v-btn class="mr-2" @click="closeDialog" small color="white" light>Cancel</v-btn>
                <v-btn color="green" @click="save" small>Save & Close</v-btn>
            </v-toolbar>


            <v-container fluid>
                <v-row justify="center">
                    <v-col cols="12">
                        <ServiceStopForm ref="serviceStopForm" />
                    </v-col>
                    <v-col cols="12">
                        <v-btn color="green" block @click="save" dark large>Save & Close</v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="closeDialog">Cancel</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
import ServiceStopForm from '@/views/service-stops/components/ServiceStopForm.vue';

export default {
    name: "ServiceStopDialog",
    components: {ServiceStopForm},
    props: ['value'],
    data: () => ({

    }),
    methods: {
        closeDialog() {
            this.$store.commit('service-stops/closeFormDialog')
        },
        save() {
            this.$refs.serviceStopForm.validateAndSave();
        }
    },
    computed: {
        dialogOpen() {
            return this.$store.getters['service-stops/formDialog'].open;
        },
        dialogForm() {
            return this.$store.getters['service-stops/formDialog'].form;
        },
        service() {
            return this.$store.getters['services/selectedItem'];
        },
    }
};
</script>

<style scoped>

</style>