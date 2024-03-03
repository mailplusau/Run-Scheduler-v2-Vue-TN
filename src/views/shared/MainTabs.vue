<script>
import {mainTabs} from '@/utils/utils.mjs';

export default {
    name: "MainTabs",
    data: () => ({
        tabOptions: [
            mainTabs.WEEKLY_STOPS,
            mainTabs.WEEKLY_CALENDAR,
            mainTabs.CUSTOMER_LIST,
            mainTabs.SERVICE_MAP,
        ]
    }),
    computed: {
        tab: {
            get() {
                return this.$store.getters['route'];
            },
            set(val) {
                this.$store.commit('goToRoute', val);
            }
        },
    }
};
</script>

<template>
    <v-tabs v-model="tab" color="primary" background-color="background">
        <v-tab v-for="(tabOption, index) in tabOptions" :key="`tab${index}`" :href="`#${tabOption.id}`"
               :disabled="$store.getters['mainTabDisabled']">
            <v-icon left>{{ tabOption.icon }}</v-icon>
            {{ tabOption.name }}
        </v-tab>
    </v-tabs>
</template>

<style scoped>

</style>