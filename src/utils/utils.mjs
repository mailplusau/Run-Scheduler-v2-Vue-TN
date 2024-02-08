
export const VARS = {
    pageTitle: 'Run Scheduler',
    serviceStopDefault: {
        internalid: null,
        custrecord_1288_customer: null,
        custrecord_1288_service: null,
        custrecord_1288_plan: null,
        custrecord_1288_franchisee: null,
        custrecord_1288_operator: null,
        custrecord_1288_stop_name: '',
        custrecord_1288_frequency: '0,0,0,0,0,0',
        custrecord_1288_stop_times: '9:00|1800,9:00|1800,9:00|1800,9:00|1800,9:00|1800,9:00|1800',
        custrecord_1288_notes: '',
        custrecord_1288_sequence: 0,
        custrecord_1288_is_transfer: '2', // Yes (1), No (2)
        custrecord_1288_transfer_operator: null,
        custrecord_1288_address_type: 1, // Manual (1), Book (2), Postal (3)
        custrecord_1288_address_book: null,
        custrecord_1288_postal_location: null,
        custrecord_1288_manual_address: '',
        custrecord_1288_relief_operator: null,
        custrecord_1288_relief_start: '2024-01-01',
        custrecord_1288_relief_end: '2024-01-01'
    },
    addressFieldIds: ['addr1', 'addr2', 'city', 'state', 'zip', 'country', 'addressee', 'custrecord_address_lat', 'custrecord_address_lon', 'custrecord_address_ncl'],
    addressSublistFieldIds: ['internalid', 'label', 'defaultshipping', 'defaultbilling', 'isresidential'],
    postalLocationFieldIds: [
        'name',
        'internalid',
        'custrecord_ap_lodgement_addr1',
        'custrecord_ap_lodgement_addr2',
        'custrecord_ap_lodgement_lat',
        'custrecord_ap_lodgement_long',
        'custrecord_ap_lodgement_postcode',
        'custrecord_ap_lodgement_site_phone',
        'custrecord_ap_lodgement_site_state', // getText for this one
        'custrecord_ap_lodgement_suburb',
        'custrecord_ap_lodgement_supply',
        'custrecord_ncl_monthly_fee',
        'custrecord_ncl_site_access_code',
        'custrecord_noncust_location_type', // getText for this one too
    ]
}

export const baseURL = 'https://' + process.env.VUE_APP_NS_REALM + '.app.netsuite.com';

export const rules = {
    email(value, fieldName = 'This field') {
        return !value || /.+@.+\..+/.test(value) || `${fieldName} must be a valid email`;
    },
    required(value, fieldName = 'This field') {
        return !!value || `${fieldName} is required`;
    },
    minLength(value, fieldName = 'This field', length) {
        return (value && value.length >= length) || `${fieldName} must be more than ${length} characters`;
    },
    minValue(value, fieldName = 'This field', min) {
        return !value || parseFloat(value) >= parseFloat(min) || `${fieldName} must be greater than ${parseFloat(min)}`;
    },
    abn(value, fieldName = 'This field') {
        if (!value) return true;

        let weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
            checksum = value.split('').map(Number).reduce(
                function(total, digit, index) {
                    if (!index) {
                        digit--;
                    }
                    return total + (digit * weights[index]);
                },
                0
            );

        return value.length === 11 || !(!checksum || checksum % 89 !== 0) || `${fieldName} must be a valid ABN`;
    },
    ausPhone(value, fieldName = 'This field') {
        let australiaPhoneFormat = /^(\+\d{2}[ -]{0,1}){0,1}(((\({0,1}[ -]{0,1})0{0,1}\){0,1}[2|3|7|8]{1}\){0,1}[ -]*(\d{4}[ -]{0,1}\d{4}))|(1[ -]{0,1}(300|800|900|902)[ -]{0,1}((\d{6})|(\d{3}[ -]{0,1}\d{3})))|(13[ -]{0,1}([\d -]{5})|((\({0,1}[ -]{0,1})0{0,1}\){0,1}4{1}[\d -]{8,10})))$/;
        return !value || australiaPhoneFormat.test(value) || `${fieldName} must be a valid phone number`;
    },

    validate(v, validationString, fieldName = 'This field') {
        let validations = validationString.split('|');

        for (let validation of validations) {
            if (validation === 'validate') continue;

            let terms = validation.split(':');
            let rule = terms.shift();
            terms = terms.length ? terms[0].split(',') : [];
            let result = rules[rule] ? rules[rule](v, fieldName || 'Field', ...terms) : null;

            if (typeof result === 'string') return result;
        }

        return true
    }
}

export function getWindowContext() {
    if (window.location.href.includes('app.netsuite.com')) return window;
    else return top;
}

export function allowOnlyNumericalInput(evt) {
    if ((evt.key === 'a' || evt.key === 'c' || evt.key === 'v') && evt.ctrlKey) // allow select all and copy
        return true;

    // if (!/^[-+]?[0-9]*?[0-9]*$/.test(expect)) // Allow only 1 leading + sign and numbers
    if (!/^[0-9]*$/.test(evt.key) && evt.key.length === 1) // Allow only numbers, assuming evt.key is a string
        evt.preventDefault();
    else return true;
}

export function keepOnlyNumericalCharacters(value) {
    return value.replace(/\D/g, '');
}

export function debounce(fn, wait){
    let timer;
    return function(...args){
        if(timer) {
            clearTimeout(timer); // clear any pre-existing timer
        }
        const context = this; // get the current context
        timer = setTimeout(()=>{
            fn.apply(context, args); // call the function if time expires
        }, wait);
    }
}