import http from '@/utils/http';

const state = {
    data: [],
    selected: null,
    selectable: true,
    loading: false,
};

const getters = {
    all : state => state.data,
    selected : state => state.selected,
    selectable : state => state.selectable,

    selectedItem : state => {
        let i = state.data.findIndex(item => item.internalid === state.selected);
        return i >= 0 ? state.data[i] : null;
    },
    loading : state => state.loading,
};

const mutations = {
    setSelected : (state, id) => { state.selected = id; console.log('run-plans/setSelected', id)},
};

const actions = {
    init : async context => {
        context.commit('setSelected', null);
        await _getPlansByFranchiseeId(context);
    },
    setSelected : async (context, id) => {
        context.commit('setSelected', id);
        await context.dispatch('service-stops/init', null, {root: true});
    }
};

async function _getPlansByFranchiseeId(context) {
    if (!context.rootGetters['franchisees/selected']) return;

    context.state.data = await http.get('getPlansByFranchiseeId', {partnerId: context.rootGetters['franchisees/selected']})
}

export default {
    state,
    getters,
    actions,
    mutations
};