import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
    theme: {
        themes: {
            light: {
                primary: '#03a9f4',
                secondary: '#607d8b',
                accent: '#ffc107',
                error: '#f44336',
                warning: '#ff9800',
                info: '#00bcd4',
                success: '#8bc34a',
            },
        },
    },
};

export default new Vuetify(opts);
