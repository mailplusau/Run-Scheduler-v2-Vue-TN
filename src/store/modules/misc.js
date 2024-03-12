import http from "@/utils/http";

const state = {
    states: [
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
    frequencyCycle: [],
    nonCustomerLocationTypes: [],
};

const getters = {
    states : state => state.states,
    frequencyCycle : state => state.frequencyCycle,
    nonCustomerLocationTypes : state => state.nonCustomerLocationTypes,
};

const mutations = {};

const actions = {
    init : async context => {
        let alwaysLoad = ['getFrequencyCycle', 'getNonCustomerLocationType'];

        let dataToFetch = alwaysLoad.map(item => context.dispatch(item));

        await Promise.allSettled(dataToFetch);
    },
    getFrequencyCycle : async (context) => {
        await _fetchDataForHtmlSelect(context, context.state.frequencyCycle,
            null, 'customlist_freq_cycle', 'internalId', 'name');
    },
    getNonCustomerLocationType : async (context) => {
        await _fetchDataForHtmlSelect(context, context.state.nonCustomerLocationTypes,
            null, 'customlist_noncust_location_type', 'internalId', 'name');
    },
};

async function _fetchDataForHtmlSelect(context, stateObject, id, type, valueColumnName, textColumnName) {
    stateObject.splice(0);

    let data = await http.get('getSelectOptions', {
        id, type, valueColumnName, textColumnName
    });

    data.forEach(item => { stateObject.push(item); });
}

export default {
    state,
    getters,
    actions,
    mutations
};