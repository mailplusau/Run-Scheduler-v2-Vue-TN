import http from "@/utils/http";

const state = {
    frequencyCycle: [],
};

const getters = {
    frequencyCycle : state => state.frequencyCycle,
};

const mutations = {};

const actions = {
    init : async context => {
        let alwaysLoad = ['getFrequencyCycle'];

        let dataToFetch = alwaysLoad.map(item => context.dispatch(item));

        await Promise.allSettled(dataToFetch);
    },
    getFrequencyCycle : async (context) => {
        await _fetchDataForHtmlSelect(context, context.state.frequencyCycle,
            null, 'customlist_freq_cycle', 'internalId', 'name');
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