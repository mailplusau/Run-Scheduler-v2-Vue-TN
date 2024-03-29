import http from '@/utils/http';

const state = {
    data: [],
    selected: null,
    selectable: true,
};

const getters = {
    all : state => state.data,
    selected : state => state.selected,
    selectable : state => state.selectable,
};

const mutations = {
    setSelected : (state, id) => state.selected = id,
};

const actions = {
    init : async context => {
        await _getAllFranchisees(context);
    },
    setSelected : (context, id) => {
        context.commit('setSelected', id);
        context.commit('services/clearData', null, {root: true});
        context.commit('service-stops/clearDataOfWeek', null, {root: true});
        context.commit('weekly-events/clearData', null, {root: true});
        context.dispatch('run-plans/init', null, {root: true}).then();
        context.dispatch('customers/init', null, {root: true}).then();
        context.dispatch('operators/setFranchiseeForPicker', id, {root: true}).then();
        context.dispatch('map/displayRoutesOfSelectedRunPlan', null, {root: true}).then();
    }
};

async function _getAllFranchisees(context) {
    context.state.data = await http.get('getAllFranchisees') || [];
}

export default {
    state,
    getters,
    actions,
    mutations
};