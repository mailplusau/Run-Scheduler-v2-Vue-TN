import { getDay, addDays, format } from 'date-fns';
import http from '@/utils/http';

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

    // TODO: scenario of secondary operator for a temporary period of time.
    // TODO: this is related to invoice
    // TODO: job gets created everyday based on this record
    // TODO:
}

const testData = [
    {
        stopName: 'BANKSTOWN GPO POST SHOP',

        frequency: '1,0,0,0,1,0',
        sequence: 0,
        notes: '',

        time: '6:00 AM - 6:30 AM',

        address: {
            addr1: '',
            addr2: '50 Marion Street',
            city: 'Sydney',
            state: 'NSW',
            zip: '2200',
            country: 'AU',
            lat: 100,
            lng: 200,
        }
    },
    {
        stopName: 'ALEXANDRIA BUSINESS HUB',

        frequency: '1,0,1,0,0,0',
        sequence: 0,
        notes: '',

        time: '3:30 PM - 4:00 PM',

        address: {
            addr1: 'Unit 16',
            addr2: '175 Pitt Street',
            city: 'Sydney',
            state: 'NSW',
            zip: '2000',
            country: 'AU',
            lat: 100,
            lng: 200,
        }
    },
    {
        stopName: 'Test Customer 1',

        frequency: '1,0,1,0,0,0',
        sequence: 1,
        notes: '',

        time: '6:30 PM - 7:00 PM',

        address: {
            addr1: '',
            addr2: '19 Martin Place',
            city: 'Sydney',
            state: 'NSW',
            zip: '2000',
            country: 'AU',
            lat: 100,
            lng: 200,
        }
    },
    {
        stopName: 'SYDNEY GPO POST SHOP',

        frequency: '0,0,1,1,1,0',
        sequence: 0,
        notes: '',

        time: '3:30 AM - 4:00 AM',

        address: {
            addr1: '',
            addr2: '66 Hunter Street',
            city: 'Sydney',
            state: 'NSW',
            zip: '2000',
            country: 'AU',
            lat: 100,
            lng: 200,
        }
    },

]

const state = {
    data: [],
    schema: [
        "custrecord_1288_customer",
        "custrecord_1288_service",
        "custrecord_1288_plan",
        "custrecord_1288_franchisee",
        "custrecord_1288_operator",
        "custrecord_1288_stop_name",
        "custrecord_1288_frequency",
        "custrecord_1288_frequency_cycle",
        "custrecord_1288_stop_times",
        "custrecord_1288_notes",
        "custrecord_1288_transfer_franchisee",
        "custrecord_1288_transfer_operator",
        "custrecord_1288_address_book",
        "custrecord_1288_postal_location",
        "custrecord_1288_manual_address",
        "custrecord_1288_relief_operator",
        "custrecord_1288_relief_end"
    ],
    dialog: {
        open: false,
    }
};

state.data = testData;

const getters = {
    data : state => state.data,
    dialog : state => state.dialog,
    all : state => {
        let today = getDay(new Date());

        let obj = [
            { day: 1, date: format(addDays(new Date(), 1 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 2, date: format(addDays(new Date(), 2 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 3, date: format(addDays(new Date(), 3 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 4, date: format(addDays(new Date(), 4 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 5, date: format(addDays(new Date(), 5 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
            { day: 6, date: format(addDays(new Date(), 6 - today), "EEEE, do 'of' MMMM, yyyy"), stops: [] },
        ]

        state.data.forEach(stop => {
            let daysOfWeek = stop.frequency.split(',');
            let stopTimePerDay = stop.time.split(',');

            for (const [index, value] of daysOfWeek.entries()) {
                if (value === '1')
                    obj[index].stops.push({
                        ...stop,
                        time: stopTimePerDay[index] || stopTimePerDay[0] || 'Not Set'
                    })
            }
        })

        obj.forEach(weekDay => {
            weekDay.stops.sort((a, b) => {
                if (a.time < b.time) return -1;
                else if (a.time > b.time) return 1;
                else return 0;
            })
        })

        return obj;
    }
};

const mutations = {

};

const actions = {
    init : async context => {
        console.log('service-stops init');
        await _getServiceStopsByPlanId(context);
    },
};

async function _getServiceStopsByPlanId(context) {
    if (!context.rootGetters['run-plans/selected']) return;

    context.state.data = await http.get('getServiceStopsByPlanId', {planId: context.rootGetters['run-plans/selected']});
}

export default {
    state,
    getters,
    actions,
    mutations
};