<script>
import PageWrapper from '@/components/core/PageWrapper.vue';
import MapSidePanel from '@/views/map/components/MapSidePanel.vue';
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: "Main",
    components: {MapSidePanel, PageWrapper},
    data: () => ({
        btnToggle: null,
        routeNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }),
    mounted() {
        console.log('service map mounted')
        this.$store.dispatch('map/init');
    },
    beforeDestroy() {
        console.log('service map destroyed')
    },
    computed: {
        isVisible() {
            return this.$store.getters['route'] === mainTabs.SERVICE_MAP.id
        },
        dataLoading() {
            return this.$store.getters['map/settingsPanel'].dataLoading;
        },
        routeColors() {
            return this.$store.getters['map/routeColors'];
        }
    },
    watch: {
        isVisible(val) {
            if (val) console.log('map is visible');
            else console.log('map is hidden');
        }
    }
};
</script>

<template>
    <v-card :class="isVisible ? 'grow d-flex flex-column flex-nowrap' : ''" style="height: 100%" fluid>
        <v-row class="shrink" no-gutters>

            <v-col cols="12" class="shrink">
                <v-toolbar color="primary" dense dark>
                    <v-btn icon><v-icon>mdi-arrow-left</v-icon></v-btn>

                    <v-toolbar-title>Route Map</v-toolbar-title>

                    <v-divider vertical class="mx-3"></v-divider>

                    <template v-if="dataLoading">
                        <v-progress-circular color="yellow" size="25" indeterminate class="mr-2"></v-progress-circular>
                        <span class="yellow--text">Processing...</span>
                    </template>

                    <v-spacer></v-spacer>

                    <v-fab-transition>
                        <v-btn v-if="!$store.getters['map/settingsPanel'].open" icon @click="$store.getters['map/settingsPanel'].open = true">
                            <v-icon>mdi-cog-outline</v-icon>
                        </v-btn>
                    </v-fab-transition>
                </v-toolbar>
            </v-col>

        </v-row>

        <v-row class="grow background" no-gutters>
            <v-col cols="12" id="google-map-container" ref="googleMapContainer"></v-col>

        </v-row>

        <MapSidePanel />

        <div class="legend-card-container">
            <v-card rounded class="pa-2" elevation="5">
                <p class="subtitle-2 my-1">Legends:</p>
                <p v-for="(routeName, index) in routeNames" :key="'routeName' + index" class="caption my-1">
                    <v-icon :color="routeColors[index]">mdi-chart-line-variant</v-icon> {{routeName}} route
                </p>
            </v-card>
        </div>
    </v-card>
</template>

<style scoped>
.legend-card-container {
    position: fixed;
    left: 10px;
    bottom: 10px;
}
</style>