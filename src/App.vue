<template>
    <v-app :style="{background: $vuetify.theme.themes[theme].background}">
        <v-main class="fill-height">
            <ServiceMapView v-show="$store.getters['route'] === mainTabs.SERVICE_MAP.id" />

            <template v-if="$store.getters['route'] !== mainTabs.SERVICE_MAP.id">
                <v-container fluid>
                    <v-row class="mx-1" justify="space-between" align="center">
                        <v-col cols="auto">
                            <h2 class="primary--text" v-html="pageTitle"></h2>
                        </v-col>

                        <v-col cols="auto">
                            <a @click="$store.dispatch('addShortcut')" class="subtitle-1">Add To Shortcuts <v-icon size="20" color="primary">mdi-open-in-new</v-icon></a>
                        </v-col>
                    </v-row>
                </v-container>

                <MainTabs />

                <v-divider class="mb-3"></v-divider>

                <CalendarView />
                <CustomersView />
                <ServiceStopsView />
                <WeeklyEventCalendar />
            </template>

        </v-main>

        <GlobalNotificationModal />
    </v-app>
</template>

<script>
import GlobalNotificationModal from "@/components/GlobalNotificationModal";
import CalendarView from "@/views/calendar/Main.vue";
import CustomersView from "@/views/customers/Main.vue";
import ServiceStopsView from "@/views/service-stops/Main.vue";
import ServiceMapView from "@/views/map/Main.vue";
import WeeklyEventCalendar from '@/views/calendar/components/WeeklyEventCalendar.vue';
import MainTabs from '@/views/shared/MainTabs.vue';
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: 'App',
    components: {
        MainTabs,
        WeeklyEventCalendar,
        GlobalNotificationModal,
        CalendarView,
        CustomersView,
        ServiceStopsView,
        ServiceMapView,
    },
    beforeCreate() {
        this.$store.dispatch('init');
    },
    computed:{
        mainTabs() {
            return mainTabs
        },
        theme() {
            return (this.$vuetify.theme.dark) ? 'dark' : 'light'
        },
        pageTitle() {
            return this.$store.getters['pageTitle'];
        }
    }
};
</script>

<style>

.smaller-cell-text-size {
    font-size: 11px !important;
}
</style>
