
import http from '@/utils/http';
import Vue from 'vue';

const state = {
    data: [],
    selected: null,
    selectable: true,
    loading: false,
};

const getters = {
    data: state => state.data,
    selected : state => state.selected,
    selectable : state => state.selectable,
    loading : state => state.loading,

    selectedItem : state => {
        let index = state.data.findIndex(item => item['internalid'] === state.selected);

        return index >= 0 ? state.data[index] : {};
    }
};

const mutations = {
    setSelected : (state, id) => state.selected = id,
};

const actions = {
    init : async context => {
        await _getCustomersByFranchiseeId(context);
        await _getServiceScheduleReport(context);
    },
    setSelected : async (context, id) => {
        context.commit('setSelected', id);
        await Promise.allSettled([
            context.dispatch('services/init', null, {root: true}),
            context.dispatch('addresses/init', null, {root: true})
        ])
    }
};

async function _getCustomersByFranchiseeId(context) {
    if (!context.rootGetters['franchisees/selected']) return;

    context.state.loading = true;

    context.state.data = await http.get('getCustomersByFranchiseeId', {
        partnerId: context.rootGetters['franchisees/selected']
    })

    context.state.loading = false;
}

async function _getServiceScheduleReport(context) {
    let executionArray = []
    let getReportForCustomerId = async (customerId, customer) => {
        let data = await http.get('getServiceScheduleReportByCustomerId', {customerId})

        let isFullyScheduled = data.reduce((accumulator, item) => parseInt(item.stopCount) >= 2 ? accumulator : accumulator + 1, 0)

        Vue.set(customer, 'serviceScheduleReport', data);
        Vue.set(customer, 'isFullyScheduled', isFullyScheduled  === 0 && data.length);
    }

    for (let [index, customer] of context.state.data.entries()) {
        // request for data
        executionArray.push(getReportForCustomerId(customer.internalid, customer));

        if (executionArray.length > 100) {
            await Promise.allSettled(executionArray);
            executionArray.splice(0);
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
};