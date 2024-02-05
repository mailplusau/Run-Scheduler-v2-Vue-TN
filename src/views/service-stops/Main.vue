<template>
    <PageWrapper page-name="service-stops">
        <v-row justify="center">

            <v-col cols="12">
                <v-toolbar flat dense color="primary" dark>
                    <v-toolbar-title class="subtitle-1">
                        Stops under service <b class="yellow--text">AMPO ($9.00)</b>
                    </v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-toolbar-title class="caption yellow--text">
                        {{ '100009 TEST - Brighton Le Sands Public School' }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>

                    <v-btn outlined color="secondary" small dark :disabled="panel !== undefined">Add New Stop</v-btn>
                </v-toolbar>

                <v-expansion-panels focusable inset :disabled="panelsDisabled" v-model="panel">
                    <v-expansion-panel v-for="(item, i) in table2data" :key="i">
                        <v-expansion-panel-header :class="panel === i ? 'px-3 py-0' : 'px-3 py-0 background'" hide-actions>
                            <template v-slot:default="{ open }">
                                <v-row no-gutters justify="space-between" align="center">
                                    <v-col :cols="open ? 'auto' : '3'">
                                        <v-fade-transition leave-absolute>
                                            <span v-if="open" key="0" class="primary--text">Stop #{{i + 1}}: {{item.name}} is under service ADELONG PO of Customer #</span>
                                            <span v-else key="1">Stop #{{i + 1}}: {{ item.name }}</span>
                                        </v-fade-transition>
                                    </v-col>
                                    <v-col cols="auto">

                                        <v-fade-transition leave-absolute>
                                            <span class="text--secondary" v-if="!open" key="0">Duration: 3600</span>
                                        </v-fade-transition>
                                    </v-col>
                                    <v-fade-transition leave-absolute>
                                        <v-col v-if="!open" cols="auto" key="0">
                                            <v-btn icon color="primary" title="Inactivate stop" @click.stop="panel = i"><v-icon>mdi-pencil</v-icon></v-btn>
                                            <v-btn icon color="" title="Inactivate stop" @click.stop=""><v-icon>mdi-arrow-up-bold-outline</v-icon></v-btn>
                                            <v-btn icon color="" title="Inactivate stop" @click.stop=""><v-icon>mdi-arrow-down-bold-outline</v-icon></v-btn>
                                        </v-col>
                                    </v-fade-transition>
                                </v-row>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="pa-0">
                            <ServiceStopForm />
                            <v-row justify="center" align="center">
                                <v-col cols="auto">
                                    <v-btn color="red" dark @click.stop="panel = undefined">cancel</v-btn>
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn color="green" dark large @click.stop="panel = undefined">save service stop</v-btn>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>

            </v-col>

            <v-col cols="12">
                <v-btn color="green darken-2" dark x-large block @click="finishEditing">
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
    }),
    methods: {
        finishEditing() {
            this.panel = undefined;
            this.$store.commit('setRoute', 'customers');
        }
    },
    computed: {

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