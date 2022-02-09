import Vue from 'vue';
import Vuex from 'vuex';
import chat from './modules/chat';
import globals from './modules/globals';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        chat,
        globals,
    },
});
