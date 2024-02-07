/**
 * @author Tim Nguyen
 * @description NetSuite Experimentation - Run Scheduler.
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @created 11/01/2024
 */

import {VARS} from '@/utils/utils.mjs';

// These variables will be injected during upload. These can be changed under 'netsuite' of package.json
let htmlTemplateFilename/**/;
let clientScriptFilename/**/;

const defaultTitle = VARS.pageTitle;
const serviceStopColumns = Object.keys(VARS.serviceStopDefault);
const addressFieldIds = VARS.addressFieldIds;
const addressSublistFieldIds = VARS.addressSublistFieldIds;
const postalLocationFieldIds = VARS.postalLocationFieldIds;

let NS_MODULES = {};


// eslint-disable-next-line no-undef
define(['N/ui/serverWidget', 'N/render', 'N/search', 'N/file', 'N/log', 'N/record', 'N/email', 'N/runtime', 'N/https', 'N/task', 'N/format', 'N/url'],
    (serverWidget, render, search, file, log, record, email, runtime, https, task, format, url) => {
    NS_MODULES = {serverWidget, render, search, file, log, record, email, runtime, https, task, format, url};
    
    const onRequest = ({request, response}) => {
        if (request.method === "GET") {

            if (!_.handleGETRequests(request.parameters['requestData'], response)){
                // Render the page using either inline form or standalone page
                if (request.parameters['standalone']) _.getStandalonePage(response)
                else _.getInlineForm(response)
            }

        } else if (request.method === "POST") { // Request method should be POST (?)
            _.handlePOSTRequests(JSON.parse(request.body), response);
            // _writeResponseJson(response, {test: 'test response from post', params: request.parameters, body: request.body});
        } else {
            log.debug({
                title: "request method type",
                details: `method : ${request.method}`,
            });
        }

    }

    const _ = {
        // Render the htmlTemplateFile as a standalone page without any of NetSuite's baggage. However, this also means no
        // NetSuite module will be exposed to the Vue app. Thus, an api approach using Axios and structuring this Suitelet as
        // a http request handler will be necessary. For reference:
        // https://medium.com/@vladimir.aca/how-to-vuetify-your-suitelet-on-netsuite-part-2-axios-http-3e8e731ac07c
        getStandalonePage(response) {
            let {file} = NS_MODULES;

            // Get the id and url of our html template file
            const htmlFileData = this.getHtmlTemplate(htmlTemplateFilename);

            // Load the  html file and store it in htmlFile
            const htmlFile = file.load({id: htmlFileData[htmlTemplateFilename].id});

            response.write(htmlFile['getContents']());
        },
        // Render the page within a form element of NetSuite. This can cause conflict with NetSuite's stylesheets.
        getInlineForm(response) {
            let {serverWidget} = NS_MODULES;

            // Create a NetSuite form
            let form = serverWidget['createForm']({ title: defaultTitle });

            // Retrieve client script ID using its file name.
            form.clientScriptFileId = this.getHtmlTemplate(clientScriptFilename)[clientScriptFilename].id;

            response['writePage'](form);
        },
        // Search for the ID and URL of a given file name inside the NetSuite file cabinet
        getHtmlTemplate(htmlPageName) {
            let {search} = NS_MODULES;

            const htmlPageData = {};

            search.create({
                type: 'file',
                filters: ['name', 'is', htmlPageName],
                columns: ['name', 'url']
            }).run().each(resultSet => {
                htmlPageData[resultSet.getValue({ name: 'name' })] = {
                    url: resultSet.getValue({ name: 'url' }),
                    id: resultSet.id
                };
                return true;
            });

            return htmlPageData;
        },
        handleGETRequests(request, response) {
            if (!request) return false;

            let {log} = NS_MODULES;

            try {
                let {operation, requestParams} = JSON.parse(request);

                if (!operation) throw 'No operation specified.';

                if (operation === 'getIframeContents') this.getIframeContents(response);
                else if (!getOperations[operation]) throw `GET operation [${operation}] is not supported.`;
                else getOperations[operation](response, requestParams);
            } catch (e) {
                log.debug({title: "_handleGETRequests", details: `error: ${e}`});
                _writeResponseJson(response, {error: `${e}`})
            }

            return true;
        },
        handlePOSTRequests({operation, requestParams}, response) {
            let {log} = NS_MODULES;

            try {
                if (!operation) throw 'No operation specified.';

                // _writeResponseJson(response, {source: '_handlePOSTRequests', operation, requestParams});
                postOperations[operation](response, requestParams);
            } catch (e) {
                log.debug({title: "_handlePOSTRequests", details: `error: ${e}`});
                _writeResponseJson(response, {error: `${e}`})
            }
        },
        getIframeContents(response) {
            const htmlFileData = this.getHtmlTemplate(htmlTemplateFilename);
            const htmlFile = NS_MODULES.file.load({ id: htmlFileData[htmlTemplateFilename].id });

            _writeResponseJson(response, htmlFile['getContents']());
        }
    }

    return {onRequest};
});

function _writeResponseJson(response, body) {
    response.write({ output: JSON.stringify(body) });
    response.addHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8'
    });
}

const getOperations = {
    'getSelectOptions' : function (response, {id, type, valueColumnName, textColumnName}) {
        let {search} = NS_MODULES;
        let data = [];

        search.create({
            id, type,
            columns: [{name: valueColumnName}, {name: textColumnName}]
        }).run().each(result => {
            data.push({value: result.getValue(valueColumnName), text: result.getValue(textColumnName)});
            return true;
        });

        _writeResponseJson(response, data);
    },
    'getAllFranchisees' : function (response) {
        let data = [];

        NS_MODULES.search.create({
            type: "partner",
            filters:
                [
                    ["isinactive","is","F"],
                    "AND",
                    ["entityid","doesnotstartwith","Old"],
                    "AND",
                    ["custrecord_fr_agreement_franchisee.custrecord_fr_agreement_status","noneof","6"]
                ],
            columns:
                [ 'internalid', 'entityid', 'companyname', 'department', 'location' ]
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getPlansByFranchiseeId' : function (response, {partnerId}) {
        let data = [];

        NS_MODULES.search.create({
            type: "customrecord_run_plan",
            filters:
                [
                    ["custrecord_run_franchisee","is",partnerId],
                ],
            columns:
                [ 'internalid', 'name', 'custrecord_run_franchisee', 'custrecord_run_operator' ]
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getServiceStopsByPlanId' : function (response, {planId}) {
        let data = [];

        NS_MODULES.search.create({
            type: "customrecord_service_stop",
            filters:
                [
                    ["custrecord_1288_plan","is",planId],
                ],
            columns: serviceStopColumns
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getServiceStopsByServiceId' : function (response, {serviceId}) {
        let data = [];

        NS_MODULES.search.create({
            type: "customrecord_service_stop",
            filters:
                [
                    ["custrecord_1288_service", "is", serviceId],
                ],
            columns: serviceStopColumns
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getCustomersByFranchiseeId' : function (response, {partnerId}) {
        let relatedServices = [];
        let customers = [];

        NS_MODULES.search.create({
            type: "customer",
            filters:
                [
                    ["partner", "is", partnerId],
                ],
            columns:
                [ 'internalid', 'entityid', 'companyname' ]
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            customers.push(tmp);

            return true;
        });

        _writeResponseJson(response, {customers, relatedServices});
    },
    'getServicesByCustomerId' : function (response, {customerId}) {
        let data = [];

        NS_MODULES.search.create({
            type: "customrecord_service",
            filters:
                [
                    ["custrecord_service_customer", "is", customerId],
                    "AND",
                    ["isinactive", "is", false],
                ],
            columns:
                [
                    "internalid",
                    "name",
                    "custrecord_service_day_adhoc",
                    "custrecord_service_day_fri",
                    "custrecord_service_day_mon",
                    "custrecord_service_day_thu",
                    "custrecord_service_day_tue",
                    "custrecord_service_day_wed",
                    "custrecord_service_gst",
                    "custrecord_service",
                    "custrecord_service_price",
                    "custrecord_service_package",
                    "custrecord_service_category",
                    "custrecord_service_customer",
                    "custrecord_service_franchisee",
                    "custrecord_service_ns_item",
                    "custrecord_service_comm_reg",
                    "custrecord_service_description",
                    "custrecord_service_day_freq_cycle",
                    "custrecord_service_run_scheduled",
                    "custrecord_service_prem_id",
                    "custrecord_service_classification",
                    "custrecord_service_delete_note",
                    "custrecord_service_date_reviewed",
                    "custrecord_service_date_last_price_upd",
                    "custrecord_show_on_app",
                    "custrecord_multiple_operators"
                ]
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getAllOperators' : function (response) {
        let data = [];

        NS_MODULES.search.create({
            type: "customrecord_operator",
            filters:
                [
                    ["isinactive","is","F"],
                ],
            columns:
                [ 'internalid', 'name', 'custrecord_operator_franchisee', 'custrecord_operator_givennames', 'custrecord_operator_surname', 'custrecord_operator_phone', 'custrecord_operator_email' ]
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getOperatorsByFranchiseeId' : function (response, {franchiseeId}) {
        let data = [];

        NS_MODULES.search.create({
            type: "customrecord_operator",
            filters:
                [
                    ["isinactive","is","F"],
                    "AND",
                    ["custrecord_operator_franchisee", "is", franchiseeId]
                ],
            columns:
                [ 'internalid', 'name', 'custrecord_operator_franchisee', 'custrecord_operator_givennames', 'custrecord_operator_surname', 'custrecord_operator_phone', 'custrecord_operator_email' ]
        }).run().each(result => {
            let tmp = {};
            for (let column of result.columns) {
                tmp[column.name] = result.getValue(column);
                tmp[column.name + '_text'] = result.getText(column);
            }
            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getCustomerAddresses' : function (response, {customerId}) {
        let {record} = NS_MODULES;
        let data = [];

        if (!customerId) return _writeResponseJson(response, {error: `Invalid Customer ID: ${customerId}`});

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
            isDynamic: true
        });

        let lineCount = customerRecord.getLineCount({sublistId: 'addressbook'});

        for (let line = 0; line < lineCount; line++) {
            customerRecord.selectLine({sublistId: 'addressbook', line});
            let entry = {};

            for (let fieldId of addressSublistFieldIds) {
                entry[fieldId] = customerRecord.getCurrentSublistValue({sublistId: 'addressbook', fieldId})
            }

            let addressSubrecord = customerRecord.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});
            for (let fieldId of addressFieldIds) {
                entry[fieldId] = addressSubrecord.getValue({ fieldId })
            }
            entry['fullAddress'] = `${addressSubrecord.getValue({ fieldId: 'addr1' })} ${addressSubrecord.getValue({ fieldId: 'addr2' })}, ${addressSubrecord.getValue({ fieldId: 'city' })} ${addressSubrecord.getValue({ fieldId: 'state' })} ${addressSubrecord.getValue({ fieldId: 'zip' })}`

            data.push(entry);
        }

        _writeResponseJson(response, data);
    },
    'getPostalLocationOptions' : function (response, {postalStateId}) {
        let {search} = NS_MODULES;
        let data = [];

        let NCLSearch = search.load({
            type: 'customrecord_ap_lodgment_location',
            id: 'customsearch_smc_noncust_location'
        });

        //NCL Type: AusPost(1), Toll(2), StarTrack(7)
        NCLSearch.filters.push(search.createFilter({
            name: 'custrecord_noncust_location_type',
            operator: search.Operator.ANYOF,
            values: [1, 2, 7]
        }))

        NCLSearch.filters.push(search.createFilter({
            name: 'custrecord_ap_lodgement_site_state',
            operator: search.Operator.IS,
            values: postalStateId,
        }))

        let results = NCLSearch.run();

        let temp = 0;
        while (temp < 5) {
            let subset = results.getRange({start: temp * 1000, end: temp * 1000 + 1000});
            for (let postalLocation of subset) { // we can also use getAllValues() on one of these to see all available fields
                let entry = {};
                for (let fieldId of postalLocationFieldIds) {
                    if (['custrecord_noncust_location_type', 'custrecord_ap_lodgement_site_state'].includes(fieldId)) {
                        entry[fieldId] = postalLocation.getText({name: fieldId});
                    } else entry[fieldId] = postalLocation.getValue({name: fieldId});
                }
                data.push(entry);
            }
            if (subset.length < 1000) break;
            temp++;
        }

        _writeResponseJson(response, data);
    },
    'getFrequencyCycle' : function (response) {
        //customlist_freq_cycle
    },
    'getCustomerAddressById' : function (response, {customerId, addressId}) {
        let {record} = NS_MODULES;

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
            isDynamic: true
        });

        let line = customerRecord.findSublistLineWithValue({sublistId: 'addressbook', fieldId: 'internalid', value: addressId});

        let entry = {};
        customerRecord.selectLine({sublistId: 'addressbook', line});

        for (let fieldId of addressSublistFieldIds)
            entry[fieldId] = customerRecord.getCurrentSublistValue({sublistId: 'addressbook', fieldId})

        let addressSubrecord = customerRecord.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});

        for (let fieldId of addressFieldIds)
            entry[fieldId] = addressSubrecord.getValue({ fieldId })

        _writeResponseJson(response, entry);
    },
    'getPostalLocationById' : function (response, {postalLocationId}) {
        let postalLocationRecord = NS_MODULES.record.load({type: 'customrecord_ap_lodgment_location', id: postalLocationId});

        let entry = {};
        for (let fieldId of postalLocationFieldIds) {
            if (['custrecord_noncust_location_type', 'custrecord_ap_lodgement_site_state'].includes(fieldId)) {
                entry[fieldId] = postalLocationRecord.getText({fieldId});
            } else entry[fieldId] = postalLocationRecord.getValue({fieldId});
        }
        _writeResponseJson(response, entry);
    }
}

const postOperations = {
    'saveServiceStop' : function (response, {serviceStopId, serviceStopData}) {
        let {record} = NS_MODULES;
        let serviceStopRecord;
        let isoStringRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

        if (serviceStopId) serviceStopRecord = record.load({type: 'customrecord_service_stop', serviceStopId, isDynamic: true});
        else serviceStopRecord = record.create({type: 'customrecord_service_stop'}); // id not present, this is new

        for (let fieldId of serviceStopColumns)
            if (fieldId.toLowerCase() !== 'internalid')
                serviceStopRecord.setValue({
                    fieldId,
                    value: isoStringRegex.test(serviceStopData[fieldId]) ? new Date(serviceStopData[fieldId]) : serviceStopData[fieldId]
                });

        serviceStopId = serviceStopRecord.save({ignoreMandatoryFields: true});

        _writeResponseJson(response, serviceStopId);
    }
};