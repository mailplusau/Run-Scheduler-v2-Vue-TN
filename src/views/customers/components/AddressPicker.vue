<script>
import {rules} from '@/utils/utils.mjs';
import VuetifyGoogleAutocomplete from '@/components/VuetifyGoogleAutocomplete.vue';

export default {
    name: "AddressPicker",
    components: {VuetifyGoogleAutocomplete},
    data: () => ({
        dialog: false,
        formValid: true,
        panel: undefined,

    }),
    methods: {
        validate: rules.validate,
        handleInputCleared() {
            this.$store.commit('addresses/resetPicker');
        },
        handlePlaceChanged(googlePlace) {
            this.manualForm.lat = '';
            this.manualForm.lng = '';
            this.manualForm.addr2 = '';
            this.manualForm.zip = '';
            this.manualForm.state = '';
            this.manualForm.city = '';
            this.manualForm.country = 'AU';

            if (!googlePlace) return;

            this.manualForm.lat = googlePlace?.geometry?.location?.lat();
            this.manualForm.lng = googlePlace?.geometry?.location?.lng();

            let address2 = "";

            for (let addressComponent of googlePlace.address_components) {

                if (addressComponent.types[0] === 'street_number' || addressComponent.types[0] === 'route') {
                    address2 += addressComponent['short_name'] + " ";
                    this.manualForm.addr2 = address2;
                }
                if (addressComponent.types[0] === 'postal_code') {
                    this.manualForm.zip = addressComponent['short_name'];
                }
                if (addressComponent.types[0] === 'administrative_area_level_1') {
                    this.manualForm.state = addressComponent['short_name'];
                }
                if (addressComponent.types[0] === 'locality') {
                    this.manualForm.city = addressComponent['short_name'];
                }
            }

            this.$refs.form.validate();
        },
        saveManualAddress() {
            if (!this.$refs.form.validate()) return false;

            this.$store.commit('service-stops/saveAddress', {typeId: 1, data: JSON.stringify(this.manualForm)});
            this.$store.dispatch('addresses/cacheAddressData', {typeId: 1, data: JSON.stringify(this.manualForm)})
                .then(() => {this.$store.commit('addresses/resetPicker');});
            this.dialog = false;
        },
        savePostalLocation() {
            if (!this.$refs.form.validate()) return false;

            this.$store.commit('service-stops/saveAddress', {typeId: 3, data: this.picker.postalLocationId});
            this.$store.dispatch('addresses/cacheAddressData', {typeId: 3, addressId: this.picker.postalLocationId})
                .then(() => {this.$store.commit('addresses/resetPicker');});
            this.dialog = false;
        },
        saveCustomerAddress() {
            if (!this.$refs.form.validate()) return false;

            this.$store.commit('service-stops/saveAddress', {typeId: 2, data: this.picker.customerAddressId});
            this.$store.dispatch('addresses/cacheAddressData', {typeId: 2, addressId: this.picker.customerAddressId, customerId: this.selectedCustomer.internalid})
                .then(() => {this.$store.commit('addresses/resetPicker');});
            this.dialog = false;
        }
    },
    computed: {
        picker() {
            return this.$store.getters['addresses/picker'];
        },
        displayText() {
            let addressType = parseInt(this.$store.getters['service-stops/formDialog'].form.custrecord_1288_address_type);
            let tmp = ['Manually Entered: ', 'Address Book: ', 'Postal Location: ']
            let str1 = tmp[addressType - 1]
            let str2 = this.$store.getters['addresses/getFormattedAddress'](addressType, this.$store.getters['service-stops/formDialog'].form)
            return str2 ? str1 + str2 : '';
        },
        manualForm() {
            return this.$store.getters['addresses/picker'].manualForm;
        },
        loading() {
            return this.$store.getters['addresses/picker'].loading;
        },
        validateAutofillFields() {
            return !!this.manualForm.lat ||
                !!this.manualForm.lng ||
                !!this.manualForm.addr2 ||
                !!this.manualForm.zip ||
                !!this.manualForm.state ||
                !!this.manualForm.city || 'Please fill in this field using one of the address suggestions';
        },
        selectedPostalLocation() {
            return this.$store.getters['addresses/selectedPostalLocation'];
        },
        selectedCustomerAddress() {
            return this.$store.getters['addresses/selectedCustomerAddress'];
        },
        selectedCustomer() {
            return this.$store.getters['customers/selectedItem'];
        }
    },
    watch: {
        dialog(val) {
            if (!val) {
                this.panel = undefined;
                this.$store.commit('addresses/resetPicker')
            }
        },
    }
};
</script>

<template>
    <v-dialog v-model="dialog" persistent>
        <template v-slot:activator="{ on, attrs }">
            <v-text-field prefix=""
                          placeholder="(click to select or enter an address)" dense outlined
                          :value="displayText" readonly
                          :rules="[v => validate(v, 'required')]"
                          prepend-inner-icon="mdi-map-marker-outline" v-bind="attrs" v-on="on" @click:clear="handleInputCleared">
            </v-text-field>
        </template>
        <v-card class="background">
            <v-container>
                <v-form ref="form" v-model="formValid" lazy-validation>
                    <v-row>
                        <v-col cols="12">
                            <p v-if="panel !== undefined" class="text-h5 text-center grey--text">|||||||||||</p>
                            <p v-else class="text-h5 text-center">Pick an address from...</p>
                        </v-col>
                        <v-expansion-panels popout focusable v-model="panel">

                            <v-expansion-panel :class="panel === 0 ? '' : 'background'">
                                <v-expansion-panel-header>
                                    <template v-slot:default="{ open }">
                                        <v-slide-x-transition leave-absolute>
                                            <span v-if="open" key="0" class="subtitle-1 primary--text">Please select an address from the customer's address book</span>
                                            <span v-else key="1" :class="panel !== 0 && panel !== undefined ? 'grey--text' : ''">...the customer's address book</span>
                                        </v-slide-x-transition>
                                    </template>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-row class="mt-5">
                                        <v-col cols="12">
                                            <v-autocomplete label="Customer's Address"
                                                            v-model="picker.customerAddressId"
                                                            :items="picker.customerAddresses"
                                                            item-value="internalid" item-text="fullAddress"
                                            ></v-autocomplete>
                                        </v-col>

                                        <v-col cols="4">
                                            <v-text-field label="City" v-model="selectedCustomerAddress.city" dense disabled
                                                          :rules="[v => panel !== 0 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="4">
                                            <v-text-field label="State" v-model="selectedCustomerAddress.state" dense disabled
                                                          :rules="[v => panel !== 0 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="4">
                                            <v-text-field label="Postcode"
                                                          v-model="selectedCustomerAddress.zip" dense disabled
                                                          :rules="[v => panel !== 0 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Lat" v-model="selectedCustomerAddress['custrecord_address_lat']" dense disabled
                                                          :rules="[v => panel !== 0 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Lng" v-model="selectedCustomerAddress['custrecord_address_lon']" dense disabled
                                                          :rules="[v => panel !== 0 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-btn block color="green" dark @click.stop="saveCustomerAddress">Use this address</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-content>
                            </v-expansion-panel>

                            <v-expansion-panel :class="panel === 1 ? '' : 'background'">
                                <v-expansion-panel-header>
                                    <template v-slot:default="{ open }">
                                        <v-slide-x-transition leave-absolute>
                                            <span v-if="open" key="0" class="subtitle-1 primary--text">Please specify a postal location</span>
                                            <span v-else key="1" :class="panel !== 1 && panel !== undefined ? 'grey--text' : ''">...postal locations</span>
                                        </v-slide-x-transition>
                                    </template>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-row class="mt-5">
                                        <v-col cols="6">
                                            <v-autocomplete label="State" :disabled="picker.postalLocationLoading"
                                                            v-model="picker.postalStateId"
                                                            :items="picker.postalStates"
                                                            @change="$store.dispatch('addresses/handlePostalStateChanged')"></v-autocomplete>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-autocomplete label="Postal Location"
                                                            :disabled="picker.postalLocationLoading || !picker.postalStateId"
                                                            :loading="picker.postalLocationLoading"
                                                            v-model="picker.postalLocationId"
                                                            :items="picker.postalLocations"
                                                            :rules="[v => panel !== 1 || validate(v, 'required')]"
                                                            item-value="internalid" item-text="name"></v-autocomplete>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field label="City" v-model="selectedPostalLocation.custrecord_ap_lodgement_suburb"
                                                          dense disabled
                                                          :rules="[v => panel !== 1 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Postcode"
                                                          v-model="selectedPostalLocation.custrecord_ap_lodgement_postcode"
                                                          dense disabled
                                                          :rules="[v => panel !== 1 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Lat" v-model="selectedPostalLocation.custrecord_ap_lodgement_lat"
                                                          dense disabled
                                                          :rules="[v => panel !== 1 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Lng" v-model="selectedPostalLocation.custrecord_ap_lodgement_long"
                                                          dense disabled
                                                          :rules="[v => panel !== 1 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-btn block color="green" dark @click.stop="savePostalLocation">Use this postal location</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-content>
                            </v-expansion-panel>

                            <v-expansion-panel :class="panel === 2 ? '' : 'background'">
                                <v-expansion-panel-header>
                                    <template v-slot:default="{ open }">
                                        <v-slide-x-transition leave-absolute>
                                            <span v-if="open" key="0" class="subtitle-1 primary--text">Please manually enter an address</span>
                                            <span v-else key="1" :class="panel !== 2 && panel !== undefined ? 'grey--text' : ''">...or enter an address manually</span>
                                        </v-slide-x-transition>
                                    </template>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-row class="mt-5">
                                        <v-col cols="12">
                                            <VuetifyGoogleAutocomplete label="Street No. & Name" dense clearable ref="googleAutocomplete"
                                                                       @placeChanged="handlePlaceChanged"
                                                                       :rules="[() => panel !== 2 || validateAutofillFields]" />
                                        </v-col>

                                        <v-col cols="4">
                                            <v-text-field label="City" v-model="manualForm.city" dense disabled
                                                          :rules="[v => panel !== 2 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="4">
                                            <v-text-field label="State" v-model="manualForm.state" dense disabled
                                                          :rules="[v => panel !== 2 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="4">
                                            <v-text-field label="Postcode"
                                                          v-model="manualForm.zip" dense disabled
                                                          :rules="[v => panel !== 2 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Lat" v-model="manualForm.lat" dense disabled
                                                          :rules="[v => panel !== 2 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="6">
                                            <v-text-field label="Lng" v-model="manualForm.lng" dense disabled
                                                          :rules="[v => panel !== 2 || validate(v, 'required')]"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-btn block color="green" dark @click.stop="saveManualAddress">Use this address</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-row>
                </v-form>
            </v-container>

            <v-card-actions class="py-5">
                <v-spacer></v-spacer>
                    <v-btn @click="dialog = false">cancel</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>

</style>