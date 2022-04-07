import { getCookie, send } from '@/tools';
import { io } from 'socket.io-client';

const state = {
    token: getCookie('token') ?? '',
    user: {},
    accounts: [],
    socket: null,
    errors: [],
};

const getters = {
    accessToken: state => state.token,
    userInfo: state => state.user,
    accounts: state => state.accounts,
    socket: state => state.socket,
    errors: state => state.errors,
};

const mutations = {
    SET_USER_INFO(state, res) {
        state.user = res;
    },
    SET_ACCOUNTS(state, res) {
        state.accounts = res;
    },
    SET_SOCKET(state, res) {
        state.socket = res;
    },
    SET_ERRORS(state, res) {
        state.errors = res;
    },
};

const actions = {
    async getUserInfo({ commit }, req) {
        const res = await send({
            uri: 'settings/users/info',
            reqType: 'post',
        });

        if (res.status === 200) {
            commit('SET_USER_INFO', res.data);
        }
    },

    async getAccounts({ commit }, req) {
        const res = await send({
            uri: 'settings/users/list',
            reqType: 'get',
        });

        if (res.status === 200) {
            commit('SET_ACCOUNTS', res.data);
        }
    },

    async login({ commit }, req) {
        const res = await send({
            uri: 'auth/login',
            reqType: 'post',
            payload: req,
        });

        if (res.status === 200) {
            document.cookie = `token=${res.token}`;
            location.reload();
        } else {
            alert('неверный логин/пароль');
        }
    },

    async register({ commit }, req) {
        const res = await send({
            uri: 'auth/registration',
            reqType: 'post',
            payload: req,
        });

        if (res.status === 200) {
            return true;
        }
        const { errors = [] } = res.errors;
        errors.forEach(error => {
            alert(error.msg);
        });
    },

    connectToSocket({ commit, getters }) {
        const socket = io('http://localhost:5000');

        socket.emit('userJoined', { userId: getters.userInfo._id });

        commit('SET_SOCKET', socket);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
