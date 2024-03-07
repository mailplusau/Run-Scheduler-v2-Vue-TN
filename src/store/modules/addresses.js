import http from '@/utils/http';
import {debounce} from '@/utils/utils.mjs';
import Vue from 'vue';
// test internal id 317252
const manualAddressFormDefault = {
    addr1: '',
    addr2: '',
    city: '',
    state: '',
    zip: '',
    country: 'AU',
    lat: '',
    lng: '',
}

let storeContext;

const state = {
    picker: {
        loading: false,
        type: 1,
        typeOptions: [
            {text: 'Manual', value: 1},
            {text: 'Book', value: 2},
            {text: 'Postal', value: 3},
        ],

        customerAddressId: null,
        customerAddresses: [],


        postalStateId: null,
        postalStates: [
            {value: 1, text: 'NSW'},
            {value: 2, text: 'QLD'},
            {value: 3, text: 'VIC'},
            {value: 4, text: 'SA'},
            {value: 5, text: 'TAS'},
            {value: 6, text: 'ACT'},
            {value: 7, text: 'WA'},
            {value: 8, text: 'NT'},
            {value: 9, text: 'NZ'},
        ],
        postalLocationLoading: false,
        postalLocationId: null,
        postalLocations: [],


        manualForm: {}
    },

    cache: {
        queue: [],
        customerAddresses: {},
        postalLocations: {},
        tries: {},
        running: false,
    }
};

state.picker.manualForm = {...manualAddressFormDefault}

const getters = {
    picker : state => state.picker,
    cache : state => state.cache,

    selectedPostalLocation : state => {
        if (!state.picker.postalLocationId) return {};

        let index = state.picker.postalLocations.findIndex(item => item.internalid === state.picker.postalLocationId);
        let newObj = {};
        newObj[state.picker.postalLocationId] = '';
        state.cache.customerAddresses = Object.assign(state.cache.customerAddresses, newObj)

        let postalLocation = state.picker.postalLocations[index];
        if (postalLocation)
            postalLocation['fullAddress'] = `${postalLocation.custrecord_ap_lodgement_addr1} ${postalLocation.custrecord_ap_lodgement_addr2},` +
                ` ${postalLocation.custrecord_ap_lodgement_suburb} ${postalLocation.custrecord_ap_lodgement_site_state} ${postalLocation.custrecord_ap_lodgement_postcode}`;

        return index >= 0 ? state.picker.postalLocations[index] : {};
    },
    selectedCustomerAddress : state => {
        if (!state.picker.customerAddressId) return {};

        let index = state.picker.customerAddresses.findIndex(item => item.internalid === state.picker.customerAddressId);
        return index >= 0 ? state.picker.customerAddresses[index] : {};
    },

    getAddressObject : state => (typeId, addressData) => {
        let arr = ['custrecord_1288_manual_address', 'custrecord_1288_address_book', 'custrecord_1288_postal_location'];
        let addressId = addressData[arr[parseInt(typeId) - 1]] + '';
        let defaultAddressObject = {formatted: 'Retrieving...', name: '', addr1: '', addr2: '', city: '', state: '', zip: '', lat: '', lng: '',}

        if (typeId === 1) {
            try {
                let address = JSON.parse(addressId);
                return {...address, formatted: `${address.addr1} ${address.addr2}, ${address.city} ${address.state} ${address.zip} (${address.lat}, ${address.lng})`}
            } catch (e) { return addressId; }
        } else if (typeId === 2) {

            if (!state.cache.customerAddresses[addressId + '']) {
                Vue.set(state.cache.customerAddresses, addressId + '', {...defaultAddressObject});
                state.cache.queue.push({typeId, addressId, customerId: addressData['custrecord_1288_customer']});
                _attemptToStarCacheBuilder();
                // _requestAddressDataFromSuitelet(state, typeId, addressId, addressData['custrecord_1288_customer']);
            }

            return state.cache.customerAddresses[addressId]

        } else if (typeId === 3) {

            if (!state.cache.postalLocations[addressId + '']) {
                Vue.set(state.cache.postalLocations, addressId + '', {...defaultAddressObject});
                state.cache.queue.push({typeId, addressId, customerId: addressData['custrecord_1288_customer']});
                _attemptToStarCacheBuilder();
                // _requestAddressDataFromSuitelet(state, typeId, addressId, addressData['custrecord_1288_customer']);
            }

            return state.cache.postalLocations[addressId]
        }
    }
};

const mutations = {
    resetPicker : state => {
        state.picker.customerAddressId = null;
        state.picker.postalStateId = null;
        state.picker.postalLocationId = null;
        state.picker.postalLocationLoading = false;
        state.picker.manualForm = {...manualAddressFormDefault}
    },
    addDataToCache : (state, {typeId, addressId, customerId}) => {
        if (typeId === 2) {
            let index = state.picker.customerAddresses.findIndex(item => parseInt(item.internalid) === parseInt(addressId));
            if (index >= 0) Vue.set(state.cache.customerAddresses, addressId + '', _parseCustomerAddress(state.picker.customerAddresses[index]));
            else state.cache.queue.push({typeId, addressId, customerId});
        } else if (typeId === 3) {
            let index = state.picker.postalLocations.findIndex(item => parseInt(item.internalid) === parseInt(addressId));
            if (index >= 0) Vue.set(state.cache.postalLocations, addressId + '', _parsePostalLocation(state.picker.postalLocations[index]));
            else state.cache.queue.push({typeId, addressId, customerId});
        }
    }
};

const actions = {
    init : context => {
        storeContext = context;
        _attemptToStarCacheBuilder();
        _getCustomersAddresses(context).then();
    },
    setPickerAddressType : (context, typeId) => {
        context.state.picker.type = typeId;
    },
    handlePostalStateChanged : async context => {
        context.state.picker.postalLocationLoading = true;

        let data = await http.get('getPostalLocationOptions', { postalStateId: context.state.picker.postalStateId });

        context.state.picker.postalLocations = Array.isArray(data) ? [...data] : [];

        context.state.picker.postalLocationLoading = false;
    },
    cacheAddressData : async (context) => {
        if (context.state.cache.running) return;

        context.state.cache.running = true;

        while(context.state.cache.queue.length) {
            let {typeId, addressId, customerId} = context.state.cache.queue.shift();

            try {
                if (typeId === 2) {
                    let index = context.state.picker.customerAddresses.findIndex(item => parseInt(item.internalid) === parseInt(addressId));

                    if (index >= 0) {
                        context.state.cache.customerAddresses[addressId + ''] = _parseCustomerAddress(context.state.picker.customerAddresses[index])
                    } else { // request from suitelet
                        let addressData = await http.get('getCustomerAddressById', {customerId, addressId});
                        context.state.cache.customerAddresses[addressId + ''] = _parseCustomerAddress(addressData)
                    }
                } else if (typeId === 3) {
                    let index = context.state.picker.postalLocations.findIndex(item => parseInt(item.internalid) === parseInt(addressId));

                    if (index >= 0) {
                        context.state.cache.postalLocations[addressId + ''] = _parsePostalLocation(context.state.picker.postalLocations[index]);
                    } else { // request from suitelet
                        let addressData = await http.get('getPostalLocationById', {postalLocationId: addressId});
                        context.state.cache.postalLocations[addressId + ''] = _parsePostalLocation(addressData)
                    }
                }
            } catch (e) {
                console.log('Something went wrong when retrieving data for', {typeId, addressId, customerId}, '. Aborting', e);
            }
        }

        context.state.cache.running = false;
    },
    test : () => {
        return 'test string'
    }
};

async function _getCustomersAddresses(context) {
    if (!context.rootGetters['customers/selected']) return;

    context.state.picker.customerAddresses = await http.get('getCustomerAddresses', {customerId: context.rootGetters['customers/selected']})
}

function _attemptToStarCacheBuilder() {
    if (storeContext) storeContext.dispatch('addresses/cacheAddressData', null, {root: true});
}

function _parseCustomerAddress(address) {
    return {
        formatted: `${address.addr1} ${address.addr2}, ${address.city} ${address.state} ${address.zip} (${address.custrecord_address_lat}, ${address.custrecord_address_lon})`,
        name: address['addressee'],
        addr1: address['addr1'],
        addr2: address['addr2'],
        city: address['city'],
        state: address['state'],
        zip: address['zip'],
        lat: address['custrecord_address_lat'],
        lng: address['custrecord_address_lon'],
    }
}

function _parsePostalLocation(address) {
    let formatted = `${address.name} (${address.custrecord_ap_lodgement_addr1} ${address.custrecord_ap_lodgement_addr2},` +
        ` ${address.custrecord_ap_lodgement_suburb} ${address.custrecord_ap_lodgement_site_state} ${address.custrecord_ap_lodgement_postcode})` +
        ` (${address.custrecord_ap_lodgement_lat}, ${address.custrecord_ap_lodgement_long})`
    return {
        formatted, name: address['name'],
        addr1: address['custrecord_ap_lodgement_addr1'],
        addr2: address['custrecord_ap_lodgement_addr2'],
        city: address['custrecord_ap_lodgement_suburb'],
        state: address['custrecord_ap_lodgement_site_state'],
        zip: address['custrecord_ap_lodgement_postcode'],
        lat: address['custrecord_ap_lodgement_lat'],
        lng: address['custrecord_ap_lodgement_long'],
    }
}

export default {
    state,
    getters,
    actions,
    mutations
};