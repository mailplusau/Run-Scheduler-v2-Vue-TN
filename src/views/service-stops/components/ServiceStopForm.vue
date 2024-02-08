<script>
import {allowOnlyNumericalInput, keepOnlyNumericalCharacters, debounce, rules} from '@/utils/utils.mjs';
import EditableTimeInput from '@/components/EditableTimeInput.vue';
import EditableDateInput from '@/components/EditableDateInput.vue';
import OperatorPicker from '@/views/customers/components/OperatorPicker.vue';
import AddressPicker from '@/views/customers/components/AddressPicker.vue';

export default {
    name: "ServiceStopForm",
    components: {AddressPicker, OperatorPicker, EditableDateInput, EditableTimeInput},
    data: () => ({
        dayArray: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        formValid: true,
        serviceTime: 0,
        serviceTimeOptions: [
            {value: 0, text: 'at the same time everyday'},
            {value: 1, text: 'at different time for each day'}
        ],
        transferPoint: 0,
        transferPointOptions: [
            {value: 0, text: 'is not a transfer point'},
            {value: 1, text: 'is a transfer point'}
        ],
        reliefDriver: 2,
        reliefDriverOptions: [
            {value: 1, text: 'is required'},
            {value: 2, text: 'is not required for this stop'}
        ],
        serviceTimeDisabled: true,
        serviceTimeSelectionDisabled: true,
    }),
    methods: {
        validate: rules.validate,
        allowOnlyNumericalInput,
        keepOnlyNumericalCharacters,
        resetValidation () {
            this.$refs.serviceStopForm.resetValidation();
        },
        validateAndSave() {
            if (!this.$refs.serviceStopForm.validate()) return false;
            if (this.formData.custrecord_1288_frequency === '0,0,0,0,0,0') return false;
            console.log('form valid');
            // TODO: save form
            this.$store.dispatch('service-stops/save');
        },
        getFreq(index) { // arcane voodoo black magic stuffs
            if (index >= 0 && index <= 5)
                return this.formData?.custrecord_1288_frequency?.split(',')[index] ? !!parseInt(this.formData.custrecord_1288_frequency.split(',')[index]) : false;
            else if (index === -1)
                return this.formData.custrecord_1288_frequency.substr(0, 9) === '1,1,1,1,1';
        },
        setFreq(index, value) {
            if (index === 5) {
                this.formData.custrecord_1288_frequency = '0,0,0,0,0,' + (value === null ? 0 : 1);
            } else if (index >= 0 && index <= 4) {
                let arr = this.formData.custrecord_1288_frequency.split(',');
                arr.splice(index, 1, value === null ? 0 : 1);
                arr.splice(5, 1, 0);
                this.formData.custrecord_1288_frequency = arr.join(',');
            } else if (index === -1)
                this.formData.custrecord_1288_frequency = '1,1,1,1,1,0';
        },
        getServiceTime(index) {
            return this.formData.custrecord_1288_stop_times.split(',')[index].split('|')[0];
        },
        setServiceTime(index, value) {
            let arr = this.formData.custrecord_1288_stop_times.split(',');
            let duration = this.formData.custrecord_1288_stop_times.split(',')[index].split('|')[1];
            if (this.serviceTime === 0)
                this.formData.custrecord_1288_stop_times = arr.map(() => value + '|' + duration).join(',');
            else {
                arr.splice(index, 1, value + '|' + duration);
                this.formData.custrecord_1288_stop_times = arr.join(',');
            }
        },
        getServiceDuration(index) {
            return this.formData.custrecord_1288_stop_times.split(',')[index].split('|')[1];
        },
        setServiceDuration(index, value) {
            let arr = this.formData.custrecord_1288_stop_times.split(',');
            let time = this.formData.custrecord_1288_stop_times.split(',')[index].split('|')[0];
            if (this.serviceTime === 0)
                this.formData.custrecord_1288_stop_times = arr.map(() => time + '|' + value).join(',');
            else {
                arr.splice(index, 1, time + '|' + value);
                this.formData.custrecord_1288_stop_times = arr.join(',');
            }
        }
    },
    computed: {
        formData() {
            return this.$store.getters['service-stops/formDialog'].form;
        },
    },
    watch: {
        'formData.custrecord_1288_frequency' : function (val) {
            this.serviceTimeDisabled = val === '0,0,0,0,0,0';
            this.serviceTimeSelectionDisabled = ['0,0,0,0,0,0', '0,0,0,0,0,1'].includes(val);
            if (['0,0,0,0,0,0', '0,0,0,0,0,1'].includes(val)) this.serviceTime = 0;
        }
    }
};
</script>

<template>
    <v-container fluid class="light-grey darken-2" dark>
        <v-form ref="serviceStopForm" v-model="formValid" lazy-validation>
            <v-row class="mt-3">
                <v-col cols="6">
                    <v-autocomplete prefix="Select Plan:" outlined dense
                                    v-model="formData.custrecord_1288_plan"
                                    :items="$store.getters['run-plans/all']"
                                    :rules="[v => validate(v, 'required')]"
                                    item-text="name" item-value="internalid"></v-autocomplete>
                </v-col>
                <v-col cols="6">
                    <v-text-field prefix="Stop Name:" outlined dense value="SYDNEY LPO"
                                  :rules="[v => validate(v, 'required')]"
                                  v-model="formData.custrecord_1288_stop_name" ></v-text-field>
                </v-col>

            </v-row>

            <v-row class="mt-0">
                <v-col cols="12">
                    <AddressPicker />
                </v-col>
            </v-row>

            <v-row justify="space-between" class="mt-3" no-gutters>
                <v-col cols="12">
                    Service Frequency:
                    <i v-show="formData.custrecord_1288_frequency === '0,0,0,0,0,0'" class="red--text">
                        (Please specify frequency)
                    </i>
                </v-col>
                <v-col cols="auto">
                    <v-checkbox  label="Daily"
                                 :value="getFreq(-1)" @change="v => setFreq(-1, v)"
                    ></v-checkbox>
                </v-col>

                <v-col cols="auto">
                    <v-checkbox hide-details label="Adhoc"
                                :value="getFreq(5)" @change="v => setFreq(5, v)"
                    ></v-checkbox>
                </v-col>
                <v-col cols="auto">
                    <v-checkbox hide-details label="Monday"
                                :value="getFreq(0)" @change="v => setFreq(0, v)"
                    ></v-checkbox>
                </v-col>
                <v-col cols="auto">
                    <v-checkbox hide-details label="Tuesday"
                                :value="getFreq(1)" @change="v => setFreq(1, v)"
                    ></v-checkbox>
                </v-col>
                <v-col cols="auto">
                    <v-checkbox hide-details label="Wednesday"
                                :value="getFreq(2)" @change="v => setFreq(2, v)"
                    ></v-checkbox>
                </v-col>
                <v-col cols="auto">
                    <v-checkbox hide-details label="Thursday"
                                :value="getFreq(3)" @change="v => setFreq(3, v)"
                    ></v-checkbox>
                </v-col>
                <v-col cols="auto">
                    <v-checkbox hide-details label="Friday"
                                :value="getFreq(4)" @change="v => setFreq(4, v)"
                    ></v-checkbox>
                </v-col>
            </v-row>

            <v-row class="mt-0">
                <v-col cols="12">
                    <v-select outlined dense prefix="This service runs"
                              :menu-props="{ bottom: true, offsetY: true }"
                              :items="serviceTimeOptions" v-model="serviceTime"
                              :disabled="serviceTimeSelectionDisabled"></v-select>
                </v-col>
            </v-row>

            <v-row v-show="serviceTime === 0" class="mt-0">
                <v-col cols="12">
                    <EditableTimeInput prepend-icon="mdi-timer-check-outline" prefix="Service Time:"
                                       :value="getServiceTime(0)" @input="v => setServiceTime(0, v)"
                                       :disabled="serviceTimeDisabled" />
                </v-col>
<!--                <v-col cols="6">-->
<!--                    <v-text-field prefix="Service Duration:" outlined dense hint="Unit in second(s)" persistent-hint-->
<!--                                  :value="getServiceDuration(0)" @input="v => setServiceDuration(0, v)"-->
<!--                                  @keydown="allowOnlyNumericalInput"-->
<!--                                  :rules="[v => validate(v, 'required|minValue:60')]"-->
<!--                                  :disabled="serviceTimeDisabled"></v-text-field>-->
<!--                </v-col>-->
            </v-row>

            <template v-for="(day, i) in formData.custrecord_1288_frequency.split(',')">
                <v-row v-show="serviceTime === 1 && parseInt(day) === 1" class="mt-0">
                    <v-col cols="6">
                        <v-text-field prepend-icon="mdi-timeline-plus-outline" readonly outlined dense :value="dayArray[i]"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <EditableTimeInput prefix="Service Time:"
                                           :value="getServiceTime(i)" @input="v => setServiceTime(i, v)" />
                    </v-col>
<!--                    <v-col cols="4">-->
<!--                        <v-text-field prefix="Service Duration:" outlined dense hint="Unit in second(s)" persistent-hint-->
<!--                                      :value="getServiceDuration(i)" @input="v => setServiceDuration(i, v)"-->
<!--                                      @keydown="allowOnlyNumericalInput"-->
<!--                                      :rules="[v => validate(v, 'required|minValue:60')]"></v-text-field>-->
<!--                    </v-col>-->
                </v-row>
            </template>

            <v-row class="mt-0">
                <v-col :cols="transferPoint === 1 ? 6 : 12">
                    <v-select dense outlined prefix="This stop"
                              :menu-props="{ bottom: true, offsetY: true }"
                              :items="transferPointOptions" v-model="transferPoint"></v-select>
                </v-col>
                <v-col cols="6" v-if="transferPoint === 1">
                    <OperatorPicker prepend-icon="mdi-account" prefix="Transfer to driver:"
                                    :rules="[v => validate(v, 'required')]"
                                    v-model="formData.custrecord_1288_transfer_operator" />
                </v-col>
            </v-row>

            <v-row class="mt-0">
                <v-col cols="12">
                    <v-select dense outlined prefix="A relief driver"
                              :menu-props="{ bottom: true, offsetY: true }"
                              :items="reliefDriverOptions" v-model="reliefDriver"></v-select>
                </v-col>

                <template v-if="reliefDriver === 1">
                    <v-col cols="12">
                        <OperatorPicker prepend-icon="mdi-account" prefix="Relief driver:"
                                        :rules="[v => reliefDriver !== 1 || validate(v, 'required')]"
                                        v-model="formData.custrecord_1288_relief_operator" />
                    </v-col>
                    <v-col cols="6">
                        <EditableDateInput v-model="formData.custrecord_1288_relief_start" prefix="From date:"
                                           :rules="[v => reliefDriver !== 1 || validate(v, 'required')]" />
                    </v-col>
                    <v-col cols="6">
                        <EditableDateInput v-model="formData.custrecord_1288_relief_end" prefix="To date:"
                                           :rules="[v => reliefDriver !== 1 || validate(v, 'required')]" />
                    </v-col>
                </template>

            </v-row>


            <v-row class="mt-0">
                <v-col cols="12">
                    <v-textarea prefix="Notes:" v-model="formData.custrecord_1288_notes" outlined></v-textarea>
                </v-col>
            </v-row>

            <v-row>{{formData}}</v-row>
        </v-form>

    </v-container>
</template>

<style scoped>

</style>