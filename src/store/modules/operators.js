import http from '@/utils/http';

const testData = [
    {
        "internalid": "788",
        "internalid_text": "788",
        "name": "Rick Zammit",
        "name_text": null,
        "custrecord_operator_franchisee": "212",
        "custrecord_operator_franchisee_text": "Acacia Ridge",
        "custrecord_operator_givennames": "Rick",
        "custrecord_operator_givennames_text": null,
        "custrecord_operator_surname": "Zammit",
        "custrecord_operator_surname_text": null,
        "custrecord_operator_phone": "0404314375",
        "custrecord_operator_phone_text": null,
        "custrecord_operator_email": "rickyzammit1966@gmail.com",
        "custrecord_operator_email_text": null
    },
    {
        "internalid": "1076",
        "internalid_text": "1076",
        "name": "Stacey Romanoff",
        "name_text": null,
        "custrecord_operator_franchisee": "212",
        "custrecord_operator_franchisee_text": "Acacia Ridge",
        "custrecord_operator_givennames": "Stacey",
        "custrecord_operator_givennames_text": null,
        "custrecord_operator_surname": "Romanoff",
        "custrecord_operator_surname_text": null,
        "custrecord_operator_phone": "0421 953 758",
        "custrecord_operator_phone_text": null,
        "custrecord_operator_email": "stroma747@gmail.com",
        "custrecord_operator_email_text": null
    }
]

const state = {
    data: [],
    loading: false,
    picker: {
        data: [],
        selectedFranchisee: null,
        loading: false,
    }
};

state.picker.data = testData

const getters = {
    all : state => state.data,
    loading : state => state.loading,
    picker : state => state.picker,
};

const mutations = {

};

const actions = {
    init : async context => {
        // await _getAllOperators(context);
    },
    setFranchiseeForPicker : async (context, franchiseeId) => {
        context.state.picker.loading = true;
        context.state.picker.selectedFranchisee = franchiseeId;
        context.state.picker.data = await http.get('getOperatorsByFranchiseeId', {franchiseeId: franchiseeId});
        context.state.picker.loading = false;
    }
};

async function _getAllOperators(context) {
    context.state.loading = true;
    context.state.data = await http.get('getAllOperators');
    context.state.loading = false;
}

export default {
    state,
    getters,
    actions,
    mutations
};