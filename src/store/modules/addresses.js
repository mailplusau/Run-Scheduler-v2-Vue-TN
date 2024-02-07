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
        customerAddresses: {},
        postalLocations: {},
        tries: {},
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
        return index >= 0 ? state.picker.postalLocations[index] : {};
    },
    selectedCustomerAddress : state => {
        if (!state.picker.customerAddressId) return {};

        let index = state.picker.customerAddresses.findIndex(item => item.internalid === state.picker.customerAddressId);
        return index >= 0 ? state.picker.customerAddresses[index] : {};
    },

    getFormattedAddress : state => (typeId, addressData) => {
        let arr = ['custrecord_1288_manual_address', 'custrecord_1288_address_book', 'custrecord_1288_postal_location'];
        let addressId = addressData[arr[parseInt(typeId) - 1]] + '';
        console.log('formatting address:', addressId, 'of type:', typeId);
        if (typeId === 1) {
            try {
                let address = JSON.parse(addressId);
                return `${address.addr1} ${address.addr2}, ${address.city} ${address.state} ${address.zip} (${address.lat}, ${address.lng})`
            } catch (e) { return addressId; }
        } else if (typeId === 2) {

            if (!state.cache.customerAddresses[addressId + '']) {
                Vue.set(state.cache.customerAddresses, addressId + '', 'Retrieving...');
                _requestAddressDataFromSuitelet(state, typeId, addressId, addressData['custrecord_1288_customer']);
            }

            return state.cache.customerAddresses[addressId]

        } else if (typeId === 3) {

            if (!state.cache.postalLocations[addressId + '']) {
                Vue.set(state.cache.postalLocations, addressId + '', 'Retrieving...');
                _requestAddressDataFromSuitelet(state, typeId, addressId, addressData['custrecord_1288_customer']);
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
    }
};

const actions = {
    init : context => {
        console.log('init');
        storeContext = context;
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
    cacheAddressData : async (context, {typeId, addressId, customerId}) => {
        console.log('caching');
        if (typeId === 2) {
            let index = state.picker.customerAddresses.findIndex(item => parseInt(item.internalid) === parseInt(addressId));

            if (index >= 0) {
                context.state.cache.customerAddresses[addressId + ''] = _getCustomerAddressString(state.picker.customerAddresses[index])
            } else { // request from suitelet
                let addressData = await http.get('getCustomerAddressById', {customerId, addressId});
                context.state.cache.customerAddresses[addressId + ''] = _getCustomerAddressString(addressData)
            }
        } else if (typeId === 3) {
            let index = state.picker.postalLocations.findIndex(item => parseInt(item.internalid) === parseInt(addressId));

            if (index >= 0) {
                context.state.cache.postalLocations[addressId + ''] = _getPostalLocationString(state.picker.postalLocations[index]);
            } else { // request from suitelet
                let addressData = await http.get('getPostalLocationById', {postalLocationId: addressId});
                context.state.cache.postalLocations[addressId + ''] = _getPostalLocationString(addressData)
            }
        }
    }
};

async function _getCustomersAddresses(context) {
    if (!context.rootGetters['customers/selected']) return;

    context.state.picker.customerAddresses = await http.get('getCustomerAddresses', {customerId: context.rootGetters['customers/selected']})
}

function _getCustomerAddressString(sAddr) {
    return `${sAddr.addr1} ${sAddr.addr2}, ${sAddr.city} ${sAddr.state} ${sAddr.zip} (${sAddr.custrecord_address_lat}, ${sAddr.custrecord_address_lon})`;
}

function _requestAddressDataFromSuitelet(state, typeId, addressId, customerId) {
    if (storeContext) {
        let key = typeId + '' + addressId;
        if (!state.cache.tries[key]) {
            Vue.set(state.cache.tries, key, 1)
            storeContext.dispatch('addresses/cacheAddressData', {typeId, addressId, customerId}, {root: true});
        } else if (state.cache.tries[key] < 10) {
            state.cache.tries[key] += 1;
            storeContext.dispatch('addresses/cacheAddressData', {typeId, addressId, customerId}, {root: true});
        }
    } else console.log('no storeContext')
}

function _getPostalLocationString(sAddr) {
    return `${sAddr.name} (${sAddr.custrecord_ap_lodgement_addr1} ${sAddr.custrecord_ap_lodgement_addr2},` +
        ` ${sAddr.custrecord_ap_lodgement_suburb} ${sAddr.custrecord_ap_lodgement_site_state} ${sAddr.custrecord_ap_lodgement_postcode})` +
        ` (${sAddr.custrecord_ap_lodgement_lat}, ${sAddr.custrecord_ap_lodgement_long})`;
}

export default {
    state,
    getters,
    actions,
    mutations
};