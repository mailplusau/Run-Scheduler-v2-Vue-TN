<script>
import EditableTimeInput from '@/components/EditableTimeInput.vue';

export default {
    name: "ServiceStopForm",
    components: {EditableTimeInput},
    data: () => ({
        serviceTime: 0,
        serviceTimeOptions: [
            {value: 0, text: 'at the same time everyday'},
            {value: 1, text: 'at different time for each day'}
        ],
        transferPoint: 0,
        transferPointOptions: [
            {value: 0, text: 'is not a transfer point'},
            {value: 1, text: 'is a transfer point'}
        ]
    })
};
</script>

<template>
    <v-container fluid class="light-grey darken-2" dark>
        <v-row class="mt-5">
            <v-col cols="6">
                <v-text-field readonly prefix="Service Name:" outlined dense value="AMPO"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field readonly prefix="Service Price:" outlined dense value="$9.00"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-autocomplete prefix="Select Plan:" outlined dense ></v-autocomplete>
            </v-col>
            <v-col cols="6">
                <v-text-field prefix="Stop Name:" outlined dense value="SYDNEY LPO"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-select outlined dense prefix="This service runs" :items="serviceTimeOptions" v-model="serviceTime"></v-select>
            </v-col>

            <template v-if="serviceTime === 0">
                <v-col cols="6">
                    <EditableTimeInput prepend-icon="mdi-timer-check-outline" value="10:00" prefix="Service Time:" />
                </v-col>
                <v-col cols="6">
                    <v-text-field prefix="Service Duration:" outlined dense value=""></v-text-field>
                </v-col>
            </template>

            <template v-else-if="serviceTime === 1">
                <template>
                    <v-col cols="4">
                        <v-text-field prepend-icon="mdi-timeline-plus-outline" readonly outlined dense value="Monday"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <EditableTimeInput value="10:00" prefix="Service Time:" />
                    </v-col>
                    <v-col cols="4">
                        <v-text-field prefix="Service Duration:" outlined dense value=""></v-text-field>
                    </v-col>

                    <v-col cols="4">
                        <v-text-field prepend-icon="mdi-timeline-plus-outline" readonly outlined dense value="Wednesday"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <EditableTimeInput value="10:00" prefix="Service Time:" />
                    </v-col>
                    <v-col cols="4">
                        <v-text-field prefix="Service Duration:" outlined dense value=""></v-text-field>
                    </v-col>

                    <v-col cols="4">
                        <v-text-field prepend-icon="mdi-timeline-plus-outline" readonly outlined dense value="Friday"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <EditableTimeInput value="10:00" prefix="Service Time:" />
                    </v-col>
                    <v-col cols="4">
                        <v-text-field prefix="Service Duration:" outlined dense value=""></v-text-field>
                    </v-col>
                </template>
            </template>

            <v-col cols="12">
                <v-select dense outlined prefix="This stop" :items="transferPointOptions" v-model="transferPoint"></v-select>
            </v-col>

            <template v-if="transferPoint === 1">
                <v-col cols="6">
                    <v-autocomplete prepend-icon="mdi-account" dense outlined prefix="Transfer to franchisee:"></v-autocomplete>
                </v-col>
                <v-col cols="6">
                    <v-autocomplete dense outlined prefix="Operator:"></v-autocomplete>
                </v-col>
            </template>

            <v-col cols="12">
                <v-textarea prefix="Notes:" outlined></v-textarea>
            </v-col>

        </v-row>

        <v-row justify="space-between" class="mt-0">
            <v-col cols="auto">
                <v-checkbox hide-details
                            label="Daily"
                ></v-checkbox>
            </v-col>

            <v-col cols="auto">
                <v-checkbox hide-details
                            label="Adhoc"
                ></v-checkbox>
            </v-col>
            <v-col cols="auto">
                <v-checkbox
                    label="Monday"
                ></v-checkbox>
            </v-col>
            <v-col cols="auto">
                <v-checkbox
                    label="Tuesday"
                ></v-checkbox>
            </v-col>
            <v-col cols="auto">
                <v-checkbox
                    label="Wednesday"
                ></v-checkbox>
            </v-col>
            <v-col cols="auto">
                <v-checkbox
                    label="Thursday"
                ></v-checkbox>
            </v-col>
            <v-col cols="auto">
                <v-checkbox
                    label="Friday"
                ></v-checkbox>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>

</style>