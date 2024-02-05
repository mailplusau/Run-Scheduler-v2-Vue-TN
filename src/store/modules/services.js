import http from '@/utils/http';

const state = {
    data: [],
    selected: null,
    selectable: true,
    loading: false,
};

const getters = {
    data : state => state.data,
    selected : state => state.selected,
    selectable : state => state.selectable,
    loading : state => state.loading,
};

const mutations = {
    setSelected : (state, id) => state.selected = id,
};

const actions = {
    init : async context => {
        console.log('init services')
        await _getServicesByCustomerId(context);
    },
    setSelected : (context, id) => {
        context.commit('setSelected', id);
        context.dispatch('run-plans/init', null, {root: true}).then();
        context.dispatch('customers/init', null, {root: true}).then();
    }
};

async function _getServicesByCustomerId(context) {
    if (!context.rootGetters['customers/selected']) return;

    context.state.loading = true;
    context.state.data = await http.get('getServicesByCustomerId', {customerId: context.rootGetters['customers/selected']});
    context.state.loading = false;
}

export default {
    state,
    getters,
    actions,
    mutations
};