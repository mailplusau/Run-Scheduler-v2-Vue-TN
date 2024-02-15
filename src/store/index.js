import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import {getWindowContext, VARS} from '@/utils/utils.mjs';
import http from '@/utils/http';

const baseURL = 'https://' + process.env.VUE_APP_NS_REALM + '.app.netsuite.com';

Vue.use(Vuex)

const routeList = [];

const state = {
    pageTitle: VARS.pageTitle,

    standaloneMode: false,

    route: 'calendar',
    routeScroll: {},

    globalModal: {
        open: false,
        title: 'Default title',
        body: 'This is a global modal that will deliver notification on global level.',
        busy: false,
        progress: -1,
        persistent: true,
        isError: false,
        maxWidth: 500,
        buttons: [], // [{color, action, text}, ...] || 'spacer'
    },
};

const getters = {
    pageTitle: state => state.pageTitle,
    globalModal: state => state.globalModal,

    route: state => state.route,
};

const mutations = {
    closeGlobalModal: state => {
        state.globalModal.title = '';
        state.globalModal.body = '';
        state.globalModal.busy = false;
        state.globalModal.open = false;
        state.globalModal.progress = -1;
        state.globalModal.persistent = false;
        state.globalModal.isError = false;
        state.globalModal.maxWidth = 500;
        state.globalModal.buttons.splice(0);
    },
    displayErrorGlobalModal: (state, {title, message, buttons = [], maxWidth = 500}) => {
        state.globalModal.title = title;
        state.globalModal.body = message;
        state.globalModal.busy = false;
        state.globalModal.open = true;
        state.globalModal.progress = -1;
        state.globalModal.persistent = true;
        state.globalModal.isError = true;
        state.globalModal.maxWidth = maxWidth;
        state.globalModal.buttons = [...buttons];
    },
    displayBusyGlobalModal: (state, {title, message, open = true, progress = -1, buttons = [], maxWidth = 500}) => {
        state.globalModal.title = title;
        state.globalModal.body = message;
        state.globalModal.busy = open;
        state.globalModal.open = open;
        state.globalModal.progress = progress;
        state.globalModal.persistent = true;
        state.globalModal.isError = false;
        state.globalModal.maxWidth = maxWidth;
        state.globalModal.buttons = [...buttons];
    },
    displayInfoGlobalModal: (state, {title, message, persistent = false, buttons = [], maxWidth = 500}) => {
        state.globalModal.title = title;
        state.globalModal.body = message;
        state.globalModal.busy = false;
        state.globalModal.open = true;
        state.globalModal.progress = -1;
        state.globalModal.persistent = persistent;
        state.globalModal.isError = false;
        state.globalModal.maxWidth = maxWidth;
        state.globalModal.buttons = [...buttons];
    },

    setPageTitle: (state, title) => {
        state.pageTitle = title || VARS.pageTitle;

        if (parent['setMPTheme'])
            parent.setMPTheme(title + ' - NetSuite Australia (Mail Plus Pty Ltd)')
    },

    goToRoute: (state, route) => {
        routeList.push(state.route);

        // save the current scroll position before switching route
        Vue.set(state.routeScroll, state.route, document.getElementsByTagName('html')[0].scrollTop);

        state.route = route;

        // restore scroll position on the new route (if any)
        setTimeout(() => {
            document.getElementsByTagName('html')[0].scrollTop = state.routeScroll[state.route] || 0;
        }, 200);
    },
    navigateBack : state => {
        if (routeList.length) {
            // save the current scroll position before switching route
            Vue.set(state.routeScroll, state.route, document.getElementsByTagName('html')[0].scrollTop);

            state.route = routeList.pop();

            // restore scroll position on the new route (if any)
            setTimeout(() => {
                document.getElementsByTagName('html')[0].scrollTop = state.routeScroll[state.route] || 0;
            }, 200);
        }
    }
};

const actions = {
    addShortcut : () => {
        getWindowContext().window['addShortcut']();
    },
    init : async context => {
        // if (!getWindowContext().location.href.includes(baseURL)) return;

        await _readUrlParams(context);

        await Promise.allSettled([
            context.dispatch('addresses/init'),
            context.dispatch('franchisees/init'),
            context.dispatch('run-plans/init'),
            context.dispatch('customers/init'),
            context.dispatch('misc/init'),
            context.dispatch('user/init'),
        ])

        context.dispatch('service-stops/init').then();
    },
    handleException : (context, {title, message}) => {
        context.commit('displayErrorGlobalModal', {
            title, message
        })
    },
};

async function _readUrlParams(context) {
    let currentUrl = getWindowContext().location.href;
    let [, queryString] = currentUrl.split('?');

    const params = new Proxy(new URLSearchParams(`?${queryString}`), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    context.state.standaloneMode = !!params['standalone'];
}

const store = new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
    modules,
});

export default store;