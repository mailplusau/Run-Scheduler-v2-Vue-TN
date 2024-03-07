import {getDay, addDays, format, addMinutes} from 'date-fns';
import http from '@/utils/http';
import {VARS} from '@/utils/utils.mjs';

const SERVICE_STOP_SCHEMA = {
    internalId: Number,
    /** Relationships **/
    customerId: Number,
    serviceId: Number,
    planId: Number,
    franchiseeId: Number,
    operatorId: Number,

    /** Stop's information **/
    stopName: String,
    frequency: String, // a string of 0s and 1s with comma delimiter representing mon, tue, wed, thu, fri and adhoc
    frequencyCycle: Number, // id for daily, weekly, fortnightly, monthly, etc...
    times: String, // a string of times and possibly stop duration, separated by commas.
    notes: String,
    sequence: Number, // a number representing the stop's position in a sequence of stops

    isTransferPoint: Boolean,
    transferFranchiseeId: Number,
    transferOperatorId: Number,

    /** Addresses **/
    addressType: Number || String, // Book (1), Postal (2), Manual (3)
    addressBookId: Number,
    postalLocationId: Number,

    address: {
        addr1: String,
        addr2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        lat: Number,
        lng: Number,
    },

    /** Secondary Operator **/
    temporaryOperatorId: Number,
    temporaryPeriod: Date, // Date time period during which this operator should be used

    // TODO: this is related to invoice
    // TODO: job gets created everyday based on this record
    // TODO: apply relief driver on plan level
}

const testData = [
    {
        "internalid": "1",
        "internalid_text": "1",
        "custrecord_1288_customer": "630600",
        "custrecord_1288_customer_text": "71165273 Test NSW Customer 01",
        "custrecord_1288_service": "88530",
        "custrecord_1288_service_text": "AMPO",
        "custrecord_1288_plan": "258",
        "custrecord_1288_plan_text": "Test Tim",
        "custrecord_1288_franchisee": "779884",
        "custrecord_1288_franchisee_text": "TEST - NSW",
        "custrecord_1288_operator": "",
        "custrecord_1288_operator_text": "",
        "custrecord_1288_stop_name": "Test",
        "custrecord_1288_stop_name_text": null,
        "custrecord_1288_frequency": "1,1,1,1,1,0",
        "custrecord_1288_frequency_text": null,
        "custrecord_1288_frequency_cycle": "5",
        "custrecord_1288_frequency_cycle_text": "Date Specific",
        "custrecord_1288_stop_times": "09:00|600,09:00|600,09:00|600,09:00|600,09:00|600,09:00|600",
        "custrecord_1288_stop_times_text": null,
        "custrecord_1288_notes": "",
        "custrecord_1288_notes_text": null,
        "custrecord_1288_sequence": "0",
        "custrecord_1288_sequence_text": null,
        "custrecord_1288_is_transfer": "2",
        "custrecord_1288_is_transfer_text": "No",
        "custrecord_1288_transfer_franchisee": "",
        "custrecord_1288_transfer_franchisee_text": "",
        "custrecord_1288_transfer_operator": "",
        "custrecord_1288_transfer_operator_text": "",
        "custrecord_1288_address_type": "1",
        "custrecord_1288_address_type_text": null,
        "custrecord_1288_address_book": "",
        "custrecord_1288_address_book_text": "",
        "custrecord_1288_postal_location": "",
        "custrecord_1288_postal_location_text": "",
        "custrecord_1288_manual_address": "{\"addr1\":\"\",\"addr2\":\"33 Rose Ln \",\"city\":\"Melbourne\",\"state\":\"VIC\",\"zip\":\"3000\",\"country\":\"AU\",\"lat\":-37.81500010000001,\"lng\":144.9538708}",
        "custrecord_1288_manual_address_text": null,
        "custrecord_1288_relief_operator": "",
        "custrecord_1288_relief_operator_text": "",
        "custrecord_1288_relief_start": "1/1/2024 12:00:00 AM",
        "custrecord_1288_relief_start_text": null,
        "custrecord_1288_relief_end": "1/1/2024 11:59:59 PM",
        "custrecord_1288_relief_end_text": null
    },
    {
        "internalid": "2",
        "internalid_text": "2",
        "custrecord_1288_customer": "630600",
        "custrecord_1288_customer_text": "71165273 Test NSW Customer 01",
        "custrecord_1288_service": "88530",
        "custrecord_1288_service_text": "AMPO",
        "custrecord_1288_plan": "258",
        "custrecord_1288_plan_text": "Test Tim",
        "custrecord_1288_franchisee": "779884",
        "custrecord_1288_franchisee_text": "TEST - NSW",
        "custrecord_1288_operator": "",
        "custrecord_1288_operator_text": "",
        "custrecord_1288_stop_name": "Test Stop 2",
        "custrecord_1288_stop_name_text": null,
        "custrecord_1288_frequency": "1,1,1,1,1,0",
        "custrecord_1288_frequency_text": null,
        "custrecord_1288_frequency_cycle": "5",
        "custrecord_1288_frequency_cycle_text": "Date Specific",
        "custrecord_1288_stop_times": "07:00|600,07:00|600,07:00|600,07:00|600,07:00|600,07:00|600",
        "custrecord_1288_stop_times_text": null,
        "custrecord_1288_notes": "",
        "custrecord_1288_notes_text": null,
        "custrecord_1288_sequence": "0",
        "custrecord_1288_sequence_text": null,
        "custrecord_1288_is_transfer": "2",
        "custrecord_1288_is_transfer_text": "No",
        "custrecord_1288_transfer_franchisee": "",
        "custrecord_1288_transfer_franchisee_text": "",
        "custrecord_1288_transfer_operator": "",
        "custrecord_1288_transfer_operator_text": "",
        "custrecord_1288_address_type": "2",
        "custrecord_1288_address_type_text": null,
        "custrecord_1288_address_book": "317961",
        "custrecord_1288_address_book_text": "Site Address",
        "custrecord_1288_postal_location": "",
        "custrecord_1288_postal_location_text": "",
        "custrecord_1288_manual_address": "",
        "custrecord_1288_manual_address_text": null,
        "custrecord_1288_relief_operator": "",
        "custrecord_1288_relief_operator_text": "",
        "custrecord_1288_relief_start": "1/1/2024 12:00:00 AM",
        "custrecord_1288_relief_start_text": null,
        "custrecord_1288_relief_end": "1/1/2024 11:59:59 PM",
        "custrecord_1288_relief_end_text": null
    },
    {
        "internalid": "3",
        "internalid_text": "3",
        "custrecord_1288_customer": "630600",
        "custrecord_1288_customer_text": "71165273 Test NSW Customer 01",
        "custrecord_1288_service": "88530",
        "custrecord_1288_service_text": "AMPO",
        "custrecord_1288_plan": "258",
        "custrecord_1288_plan_text": "Test Tim",
        "custrecord_1288_franchisee": "779884",
        "custrecord_1288_franchisee_text": "TEST - NSW",
        "custrecord_1288_operator": "",
        "custrecord_1288_operator_text": "",
        "custrecord_1288_stop_name": "Test Stop 3",
        "custrecord_1288_stop_name_text": null,
        "custrecord_1288_frequency": "0,1,1,1,1,0",
        "custrecord_1288_frequency_text": null,
        "custrecord_1288_frequency_cycle": "4",
        "custrecord_1288_frequency_cycle_text": "Adhoc",
        "custrecord_1288_stop_times": "08:00|600,08:00|600,08:00|600,08:00|600,08:00|600,08:00|600",
        "custrecord_1288_stop_times_text": null,
        "custrecord_1288_notes": "",
        "custrecord_1288_notes_text": null,
        "custrecord_1288_sequence": "0",
        "custrecord_1288_sequence_text": null,
        "custrecord_1288_is_transfer": "2",
        "custrecord_1288_is_transfer_text": "No",
        "custrecord_1288_transfer_franchisee": "",
        "custrecord_1288_transfer_franchisee_text": "",
        "custrecord_1288_transfer_operator": "",
        "custrecord_1288_transfer_operator_text": "",
        "custrecord_1288_address_type": "3",
        "custrecord_1288_address_type_text": null,
        "custrecord_1288_address_book": "",
        "custrecord_1288_address_book_text": "",
        "custrecord_1288_postal_location": "2203",
        "custrecord_1288_postal_location_text": "ABERDEEN LPO",
        "custrecord_1288_manual_address": "",
        "custrecord_1288_manual_address_text": null,
        "custrecord_1288_relief_operator": "",
        "custrecord_1288_relief_operator_text": "",
        "custrecord_1288_relief_start": "1/1/2024 12:00:00 AM",
        "custrecord_1288_relief_start_text": null,
        "custrecord_1288_relief_end": "1/1/2024 11:59:59 PM",
        "custrecord_1288_relief_end_text": null
    }
]

const state = {
    data: [],
    ofWeek: {
        data: [],
        loading: false,
    },
    ofCurrentService: {
        data: [],
        loading: false,
    },
    formDialog: {
        form: {},
        open: false,
        serviceTime: 0,
        serviceTimeOptions: [
            {value: 0, text: 'at the same time everyday'},
            {value: 1, text: 'at different time for each day'}
        ],
    },

};

// state.ofWeek.data = testData;
// state.ofCurrentService.data = testData;
state.formDialog.form = {...VARS.serviceStopDefault};

const getters = {
    fieldNameByAddressType : state => typeId => ['custrecord_1288_manual_address', 'custrecord_1288_address_book', 'custrecord_1288_postal_location'][parseInt(typeId) - 1],
    data : state => state.data,
    ofCurrentService : state => state.ofCurrentService,
    formDialog : state => state.formDialog,
    ofWeekLoading : state => state.ofWeek.loading,
    ofWeekData : state => state.ofWeek.data,
    ofWeek : (state, getters, rootState, rootGetters) => {
        let today = getDay(new Date());

        let obj = [
            { day: 1, date: format(addDays(new Date(), 1 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 2, date: format(addDays(new Date(), 2 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 3, date: format(addDays(new Date(), 3 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 4, date: format(addDays(new Date(), 4 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 5, date: format(addDays(new Date(), 5 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 6, date: 'ADHOC', stops: [] },
        ]

        state.ofWeek.data.forEach(stop => {
            let daysOfWeek = stop.custrecord_1288_frequency.split(',');
            let stopTimePerDay = stop.custrecord_1288_stop_times.split(',');

            for (const [index, value] of daysOfWeek.entries()) {
                if (value === '1') {
                    let [stopTime, stopDuration] = stopTimePerDay[index].split('|');
                    let addressTypes = ['Manually Entered', 'Address Book', 'Postal Location']

                    let eventTime = new Date(format(addDays(new Date(), obj[index].day - today), "yyyy-MM-dd") + 'T' + stopTime);
                    obj[index].stops.push({
                        ...stop,
                        eventStart: eventTime.getTime(),
                        eventEnd: addMinutes(eventTime, 30).getTime(),
                        stopTime, stopDuration,
                        address: rootGetters['addresses/getAddressObject'](parseInt(stop.custrecord_1288_address_type), stop).formatted,
                        addressType: addressTypes[parseInt(stop.custrecord_1288_address_type) - 1]
                    });
                }
            }
        })

        obj.forEach(weekDay => {
            weekDay.stops.sort((a, b) => {
                if (a.stopTime < b.stopTime) return -1;
                else if (a.stopTime > b.stopTime) return 1;
                else return 0;
            })
        })

        return obj;
    }
};

const mutations = {
    editServiceStopOfCurrentServiceByIndex : (state, index) => {
        if (!state.ofCurrentService.data[index]) return;
        state.formDialog.form = {...state.ofCurrentService.data[index]};
        state.formDialog.open = true;
    },
    closeFormDialog : state => {
        state.formDialog.open = false;
    },
    saveAddress : (state, {typeId, data}) => {
        let arr = ['custrecord_1288_manual_address', 'custrecord_1288_address_book', 'custrecord_1288_postal_location'];
        state.formDialog.form.custrecord_1288_address_type = typeId;
        state.formDialog.form[arr[typeId - 1]] = data;
    },

    clearDataOfWeek : state => { state.ofWeek.data.splice(0); },
};

const actions = {
    init : async context => {
        await _getServiceStopsBySelectedPlan(context);
    },
    getDataBySelectedPlan : async context => {
        await _getServiceStopsBySelectedPlan(context);
    },
    getDataBySelectedService : async context => {
        if (!context.rootGetters['services/selected']) return;

        context.state.ofCurrentService.loading = true;
        context.state.ofCurrentService.data = await http.get('getServiceStopsByServiceId', {serviceId: context.rootGetters['services/selected']});
        context.state.ofCurrentService.loading = false;
    },

    createNewServiceStopOfCurrentService : context => {
        context.state.formDialog.form = {...VARS.serviceStopDefault};

        // prefill data here
        if (context.rootGetters['services/selectedItem']) {
            let service = context.rootGetters['services/selectedItem'];
            let terms = ['mon', 'tue', 'wed', 'thu', 'fri', 'adhoc'];

            context.state.formDialog.form.custrecord_1288_customer = context.rootGetters['customers/selected'];
            context.state.formDialog.form.custrecord_1288_service = context.rootGetters['services/selected'];
            context.state.formDialog.form.custrecord_1288_plan = context.rootGetters['run-plans/selected'];
            context.state.formDialog.form.custrecord_1288_franchisee = context.rootGetters['franchisees/selected'];
            context.state.formDialog.form.custrecord_1288_operator = context.rootGetters['run-plans/selectedItem']?.custrecord_run_operator || null;

            // pre-fill frequency, service time and stop duration
            context.state.formDialog.form.custrecord_1288_frequency = terms.map(term => !!service[`custrecord_service_day_${term}`] ? 1 : 0).join(',');
            context.state.formDialog.form.custrecord_1288_stop_times = terms.map(() => '07:00|600').join(',');

            context.state.formDialog.serviceTime = 0;
        }

        context.state.formDialog.open = true;
    },
    editServiceStopOfCurrentService : (context, serviceStopId) => {
        let index = context.state.ofCurrentService.data.findIndex(item => parseInt(item.internalid) === parseInt(serviceStopId));

        if (index < 0) return;

        let data = JSON.parse(JSON.stringify(context.state.ofCurrentService.data[index]));

        data['custrecord_1288_relief_start'] = _parseNSDateTimeStrForDateTimeInput(data['custrecord_1288_relief_start']);
        data['custrecord_1288_relief_end'] = _parseNSDateTimeStrForDateTimeInput(data['custrecord_1288_relief_end']);
        context.state.formDialog.form = {...data};

        const stopTimes = context.state.formDialog.form.custrecord_1288_stop_times.split(',');
        const prevStopTime = stopTimes[0];
        for (let stopTime of stopTimes)
            if (stopTime !== prevStopTime) {
                context.state.formDialog.serviceTime = 1;
                break;
            }


        context.state.formDialog.open = true;
    },
    save : async context => {
        context.commit('displayBusyGlobalModal', {title: 'Processing', message: 'Saving service stop. Please wait...'}, {root: true});

            let serviceStopData = JSON.parse(JSON.stringify(context.state.formDialog.form));

        // Data preparation
        serviceStopData.custrecord_1288_relief_start = new Date(serviceStopData.custrecord_1288_relief_start + ' 00:00:00');
        serviceStopData.custrecord_1288_relief_end = new Date(serviceStopData.custrecord_1288_relief_end + ' 23:59:59');

        await http.post('saveServiceStop', {
            serviceStopId: context.state.formDialog.form.internalid,
            serviceStopData
        });

        context.commit('displayBusyGlobalModal', {title: 'Processing', message: 'Retrieving information. Please wait :)'}, {root: true});

        await context.dispatch('getDataBySelectedService');

        context.state.formDialog.open = false;

        context.commit('displayInfoGlobalModal', {
            title: 'Complete',
            message: serviceStopData.internalid ? 'Service stop has been saved' : 'A new service stop has been created'
        }, {root: true});

        _getServiceStopsBySelectedPlan(context).then();
    },
    saveServiceStopData : async (context, {serviceStopId, serviceStopData}) => {
        await http.post('saveServiceStop', {serviceStopId, serviceStopData});
    }
};

async function _getServiceStopsBySelectedPlan(context) {
    if (!context.rootGetters['run-plans/selected']) return;

    context.state.ofWeek.loading = true;
    context.state.ofWeek.data = await http.get('getServiceStopsByPlanId', {planId: context.rootGetters['run-plans/selected']});
    await Promise.allSettled([
        context.dispatch('weekly-events/generate', null, {root: true}),
        context.dispatch('map/displayRoutesOfSelectedRunPlan', null, {root: true})
    ])
    context.state.ofWeek.loading = false;
}

function _parseNSDateTimeStrForDateTimeInput(dateStr) {
    try {
        let [date, _] = dateStr.split(' ');
        let dateComp = date.split('/');
        return `${dateComp[2]}-${dateComp[1].padStart(2, '0')}-${dateComp[0].padStart(2, '0')}`;
    } catch (e) { return '2020-01-01'; }
}

export default {
    state,
    getters,
    actions,
    mutations
};