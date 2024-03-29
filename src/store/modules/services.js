import http from '@/utils/http';

const testData = [
    {
        "internalid": "13706",
        "internalid_text": "13706",
        "name": "AMPO",
        "name_text": null,
        "custrecord_service_day_adhoc": false,
        "custrecord_service_day_adhoc_text": null,
        "custrecord_service_day_fri": false,
        "custrecord_service_day_fri_text": null,
        "custrecord_service_day_mon": false,
        "custrecord_service_day_mon_text": null,
        "custrecord_service_day_thu": false,
        "custrecord_service_day_thu_text": null,
        "custrecord_service_day_tue": false,
        "custrecord_service_day_tue_text": null,
        "custrecord_service_day_wed": false,
        "custrecord_service_day_wed_text": null,
        "custrecord_service_gst": "1",
        "custrecord_service_gst_text": "Yes",
        "custrecord_service": "1",
        "custrecord_service_text": "AMPO",
        "custrecord_service_price": "8.50",
        "custrecord_service_price_text": null,
        "custrecord_service_package": "",
        "custrecord_service_package_text": "",
        "custrecord_service_category": "1",
        "custrecord_service_category_text": "Services",
        "custrecord_service_customer": "630601",
        "custrecord_service_customer_text": "71165274 Test NSW Customer 02",
        "custrecord_service_franchisee": "779884",
        "custrecord_service_franchisee_text": "TEST - NSW",
        "custrecord_service_ns_item": "24",
        "custrecord_service_ns_item_text": "Pick up and Delivery from PO",
        "custrecord_service_comm_reg": "18118",
        "custrecord_service_comm_reg_text": "18118",
        "custrecord_service_description": "",
        "custrecord_service_description_text": null,
        "custrecord_service_day_freq_cycle": "",
        "custrecord_service_day_freq_cycle_text": "",
        "custrecord_service_run_scheduled": "1",
        "custrecord_service_run_scheduled_text": "Yes",
        "custrecord_service_prem_id": "",
        "custrecord_service_prem_id_text": null,
        "custrecord_service_classification": "1",
        "custrecord_service_classification_text": "Morning Delivery",
        "custrecord_service_delete_note": "",
        "custrecord_service_delete_note_text": null,
        "custrecord_service_date_reviewed": "8/11/2018",
        "custrecord_service_date_reviewed_text": null,
        "custrecord_service_date_last_price_upd": "5/11/2020",
        "custrecord_service_date_last_price_upd_text": null,
        "custrecord_show_on_app": "",
        "custrecord_show_on_app_text": "",
        "custrecord_multiple_operators": "",
        "custrecord_multiple_operators_text": ""
    },
    {
        "internalid": "13707",
        "internalid_text": "13707",
        "name": "AMStreet",
        "name_text": null,
        "custrecord_service_day_adhoc": false,
        "custrecord_service_day_adhoc_text": null,
        "custrecord_service_day_fri": false,
        "custrecord_service_day_fri_text": null,
        "custrecord_service_day_mon": false,
        "custrecord_service_day_mon_text": null,
        "custrecord_service_day_thu": false,
        "custrecord_service_day_thu_text": null,
        "custrecord_service_day_tue": false,
        "custrecord_service_day_tue_text": null,
        "custrecord_service_day_wed": false,
        "custrecord_service_day_wed_text": null,
        "custrecord_service_gst": "1",
        "custrecord_service_gst_text": "Yes",
        "custrecord_service": "3",
        "custrecord_service_text": "AMStreet",
        "custrecord_service_price": "9.00",
        "custrecord_service_price_text": null,
        "custrecord_service_package": "",
        "custrecord_service_package_text": "",
        "custrecord_service_category": "1",
        "custrecord_service_category_text": "Services",
        "custrecord_service_customer": "630601",
        "custrecord_service_customer_text": "71165274 Test NSW Customer 02",
        "custrecord_service_franchisee": "779884",
        "custrecord_service_franchisee_text": "TEST - NSW",
        "custrecord_service_ns_item": "138",
        "custrecord_service_ns_item_text": "Pickup and Delivery of Street Addressed Mail",
        "custrecord_service_comm_reg": "18118",
        "custrecord_service_comm_reg_text": "18118",
        "custrecord_service_description": "",
        "custrecord_service_description_text": null,
        "custrecord_service_day_freq_cycle": "",
        "custrecord_service_day_freq_cycle_text": "",
        "custrecord_service_run_scheduled": "1",
        "custrecord_service_run_scheduled_text": "Yes",
        "custrecord_service_prem_id": "",
        "custrecord_service_prem_id_text": null,
        "custrecord_service_classification": "1",
        "custrecord_service_classification_text": "Morning Delivery",
        "custrecord_service_delete_note": "",
        "custrecord_service_delete_note_text": null,
        "custrecord_service_date_reviewed": "8/11/2018",
        "custrecord_service_date_reviewed_text": null,
        "custrecord_service_date_last_price_upd": "5/11/2020",
        "custrecord_service_date_last_price_upd_text": null,
        "custrecord_show_on_app": "",
        "custrecord_show_on_app_text": "",
        "custrecord_multiple_operators": "",
        "custrecord_multiple_operators_text": ""
    },
    {
        "internalid": "56274",
        "internalid_text": "56274",
        "name": "MPEX Pickup",
        "name_text": null,
        "custrecord_service_day_adhoc": false,
        "custrecord_service_day_adhoc_text": null,
        "custrecord_service_day_fri": false,
        "custrecord_service_day_fri_text": null,
        "custrecord_service_day_mon": true,
        "custrecord_service_day_mon_text": null,
        "custrecord_service_day_thu": false,
        "custrecord_service_day_thu_text": null,
        "custrecord_service_day_tue": true,
        "custrecord_service_day_tue_text": null,
        "custrecord_service_day_wed": false,
        "custrecord_service_day_wed_text": null,
        "custrecord_service_gst": "1",
        "custrecord_service_gst_text": "Yes",
        "custrecord_service": "24",
        "custrecord_service_text": "MPEX Pickup",
        "custrecord_service_price": ".00",
        "custrecord_service_price_text": null,
        "custrecord_service_package": "",
        "custrecord_service_package_text": "",
        "custrecord_service_category": "1",
        "custrecord_service_category_text": "Services",
        "custrecord_service_customer": "630601",
        "custrecord_service_customer_text": "71165274 Test NSW Customer 02",
        "custrecord_service_franchisee": "779884",
        "custrecord_service_franchisee_text": "TEST - NSW",
        "custrecord_service_ns_item": "8981",
        "custrecord_service_ns_item_text": "MPEX Pickup",
        "custrecord_service_comm_reg": "27400",
        "custrecord_service_comm_reg_text": "27400",
        "custrecord_service_description": "",
        "custrecord_service_description_text": null,
        "custrecord_service_day_freq_cycle": "",
        "custrecord_service_day_freq_cycle_text": "",
        "custrecord_service_run_scheduled": "",
        "custrecord_service_run_scheduled_text": "",
        "custrecord_service_prem_id": "",
        "custrecord_service_prem_id_text": null,
        "custrecord_service_classification": "2",
        "custrecord_service_classification_text": "Afternoon Lodgement",
        "custrecord_service_delete_note": "",
        "custrecord_service_delete_note_text": null,
        "custrecord_service_date_reviewed": "",
        "custrecord_service_date_reviewed_text": null,
        "custrecord_service_date_last_price_upd": "",
        "custrecord_service_date_last_price_upd_text": null,
        "custrecord_show_on_app": "",
        "custrecord_show_on_app_text": "",
        "custrecord_multiple_operators": "",
        "custrecord_multiple_operators_text": ""
    },
    {
        "internalid": "13708",
        "internalid_text": "13708",
        "name": "PMPO",
        "name_text": null,
        "custrecord_service_day_adhoc": false,
        "custrecord_service_day_adhoc_text": null,
        "custrecord_service_day_fri": true,
        "custrecord_service_day_fri_text": null,
        "custrecord_service_day_mon": true,
        "custrecord_service_day_mon_text": null,
        "custrecord_service_day_thu": false,
        "custrecord_service_day_thu_text": null,
        "custrecord_service_day_tue": false,
        "custrecord_service_day_tue_text": null,
        "custrecord_service_day_wed": true,
        "custrecord_service_day_wed_text": null,
        "custrecord_service_gst": "1",
        "custrecord_service_gst_text": "Yes",
        "custrecord_service": "4",
        "custrecord_service_text": "PMPO",
        "custrecord_service_price": "10.00",
        "custrecord_service_price_text": null,
        "custrecord_service_package": "",
        "custrecord_service_package_text": "",
        "custrecord_service_category": "1",
        "custrecord_service_category_text": "Services",
        "custrecord_service_customer": "630601",
        "custrecord_service_customer_text": "71165274 Test NSW Customer 02",
        "custrecord_service_franchisee": "779884",
        "custrecord_service_franchisee_text": "TEST - NSW",
        "custrecord_service_ns_item": "27",
        "custrecord_service_ns_item_text": "Outgoing Mail Lodgement",
        "custrecord_service_comm_reg": "18118",
        "custrecord_service_comm_reg_text": "18118",
        "custrecord_service_description": "",
        "custrecord_service_description_text": null,
        "custrecord_service_day_freq_cycle": "",
        "custrecord_service_day_freq_cycle_text": "",
        "custrecord_service_run_scheduled": "1",
        "custrecord_service_run_scheduled_text": "Yes",
        "custrecord_service_prem_id": "",
        "custrecord_service_prem_id_text": null,
        "custrecord_service_classification": "2",
        "custrecord_service_classification_text": "Afternoon Lodgement",
        "custrecord_service_delete_note": "",
        "custrecord_service_delete_note_text": null,
        "custrecord_service_date_reviewed": "8/11/2018",
        "custrecord_service_date_reviewed_text": null,
        "custrecord_service_date_last_price_upd": "",
        "custrecord_service_date_last_price_upd_text": null,
        "custrecord_show_on_app": "",
        "custrecord_show_on_app_text": "",
        "custrecord_multiple_operators": "",
        "custrecord_multiple_operators_text": ""
    }
]

const state = {
    data: [],
    selected: null,
    selectable: true,
    loading: false,
};

// state.data = testData;

const getters = {
    data : state => state.data,
    selected : state => state.selected,
    selectable : state => state.selectable,
    loading : state => state.loading,

    selectedItem : state => {
        let i = state.data.findIndex(item => item.internalid === state.selected);
        return i >= 0 ? state.data[i] : {};
    }
};

const mutations = {
    setSelected : (state, id) => state.selected = id,

    clearData : state => state.data.splice(0),
};

const actions = {
    init : async context => {
        await _getServicesByCustomerId(context);
    },
    setSelected : async (context, id) => {
        context.commit('setSelected', id);
        await context.dispatch('service-stops/getDataBySelectedService', null, {root: true});
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