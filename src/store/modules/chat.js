import { send } from '../../tools';

const state = {
    dialogs: [],
    dialogInfo: {
        id: null,
    },
    messages: [],
    messagesCount: 0,
};

const getters = {
    messages: state => state.messages,
    dialogs: state => state.dialogs,
    messagesCount: state => state.messagesCount,
    dialogId: state => state.dialogInfo.id,
};

const mutations = {
    SET_MESSAGES_LIST(state, res) {
        state.messages = res;
    },
    SET_MESSAGES_COUNT(state, res) {
        state.messagesCount = res;
    },
    SET_DIALOGS_LIST(state, res) {
        state.dialogs = res;
    },
    SET_DIALOG_ID(state, res) {
        state.dialogInfo.id = res;
    },
    CLEAR_MESSAGES(state) {
        state.messages = [];
    },
};

const actions = {
    async getDialogs({ commit }) {
        const res = await send({
            uri: 'chat/get_dialogs',
            reqType: 'get',
        });

        commit('SET_DIALOGS_LIST', res.data);
    },

    async getMessages({ commit }, req) {
        const payload = {
            dialogId: req.dialogId,
        };

        const res = await send({
            uri: 'chat/get_messages',
            reqType: 'post',
            payload,
        });

        commit('SET_MESSAGES_LIST', res.data);
        commit('SET_MESSAGES_COUNT', res.count);
        commit('SET_DIALOG_ID', res.data[0]?.dialogId);
    },

    async getMoreMessages({ commit, getters }, req) {
        const payload = {
            dialogId: req.dialogId,
            step: getters.messages.length +
                  (getters.messagesCount - getters.messages.length >= 20
                      ? 20
                      : getters.messagesCount - getters.messages.length),
        };

        const res = await send({
            uri: 'chat/get_messages',
            reqType: 'post',
            payload,
        });

        const messages = res.data.concat(getters.messages);

        commit('SET_MESSAGES_LIST', messages);
        commit('SET_MESSAGES_COUNT', res.count);
    },

    async addMessage({ commit }, req) {
        const res = await send({
            uri: 'chat/add_message',
            reqType: 'post',
            payload: req,
        });

        return res.data;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
