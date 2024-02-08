import http from '@/utils/http';

const state = {
    id: null,
    role: null,
    name: '',
    email: '',
};

const getters = {
    id : state => state.id,
    role : state => state.role,
    name : state => state.name,
    email : state => state.email,

    isAdmin : state => [3, 1032].includes(parseInt(state.role)),
};

const mutations = {

};

const actions = {
    init : async context => {
        let userData = await http.get('getCurrentUserDetails');

        for (let fieldId in context.state) context.state[fieldId] = userData[fieldId] || null;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};