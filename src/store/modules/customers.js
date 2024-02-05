
import http from '@/utils/http';

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

        return index >= 0 ? state.data[index] : null;
    }
};

const mutations = {
    setSelected : (state, id) => state.selected = id,
};

const actions = {
    init : async context => {
        console.log('customers init');
        await _getCustomersByFranchiseeId(context);
    },
    setSelected : (context, id) => {
        context.commit('setSelected', id);
        console.log('customer selected. init services...');
        context.dispatch('services/init', null, {root: true}).then();
    }
};

async function _getCustomersByFranchiseeId(context) {
    if (!context.rootGetters['franchisees/selected']) return;

    context.state.loading = true;

    let {customers} = await http.get('getCustomersByFranchiseeId', {
        partnerId: context.rootGetters['franchisees/selected']
    })

    context.state.data = customers
    context.state.loading = false;
}

export default {
    state,
    getters,
    actions,
    mutations
};