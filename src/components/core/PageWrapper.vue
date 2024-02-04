<script>
export default {
    name: "PageWrapper",
    props: {
        pageName: {
            type: String,
            required: true
        }
    }
};
</script>

<template>
    <v-fade-transition mode="in-out" hide-on-leave>
        <v-container fluid v-show="$store.getters['route'] === pageName">
            <slot name="default"></slot>
        </v-container>
    </v-fade-transition>
</template>

<style scoped>

</style>