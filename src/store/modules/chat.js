import { send } from '../../tools';

const state = {
    messages: [],
};

const getters = {
    messages: state => state.messages,
};

const mutations = {
    SET_MESSAGES_LIST(state, res) {
        state.messages = res;
    },
};

const actions = {
    async getMessages({ commit }, req) {
        const payload = {
            authorId: req.authorId,
            recieveId: req.recieveId,
        };

        const res = await send({
            uri: 'chat/get_messages',
            reqType: 'post',
            payload,
        });

        console.log(res);

        commit('SET_MESSAGES_LIST', res.data);
    },

    async addMessage({ commit }, req) {
        const payload = {
            authorId: req.authorId,
            recieveId: req.recieveId,
            text: req.text,
        };

        const res = await send({
            uri: 'chat/add_message',
            reqType: 'post',
            payload,
        });

        console.log(res);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
