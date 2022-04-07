<template>
    <div class="chat">
        <div class="chat-container">
            <div class="chat-dialogs">
                <div
                    class="chat-dialog"
                    v-for="dialog in dialogs"
                    :key="dialog._id"
                    @click="selectDialog({ dialogId: dialog._id, recieveId: correctRecieveId(dialog.authorId._id, dialog.recieveId._id) })">
                    {{ formatedDialogName(dialog) }}
                </div>
                <div class="chat-dialog__add" @click="toggleCreateDialog">новый диалог</div>
                <div class="chat-dialog__users" v-if="isCreateDialogVisible">
                    <div class="chat-dialog__users--close" @click="toggleCreateDialog">x</div>
                    <div class="chat-dialog__users--search">
                        <input type="text" placeholder="Введите имя...">
                    </div>
                    <div class="chat-dialog__users--list">
                        <div
                            class="chat-dialog__users--list--block"
                            v-for="user in preparedUsers"
                            :key="user._id"
                            @click="createDialog(user._id)"
                        >
                            {{ user.username }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-show="!dialog.recieveId" class="chat-none-selected"><div>выберите диалог</div></div>
            <div v-show="dialog.recieveId" class="chat-messages-wrapper">
                <div class="chat-messages-profile">{{ dialog.name }}</div>
                <div class="flexbox">
                    <div class="chat-messages-container">
                        <div class="chat-messages" ref="messages">
                            <div
                                v-for="(message, messageIndex) in preparedMessages"
                                :key="messageIndex"
                                class="chat-message"
                                :class="{ 'unreaded': message.unread, 'none-concated': !message.concated }">
                                <div class="message-header" v-if="!message.concated">
                                    <div class="message-name">{{ message.authorId.username }}</div>
                                    <div class="message-date">{{ convertDate(message.createdAt) }}</div>
                                </div>
                                <div class="message-text">{{ message.text }}</div>
                            </div>
                            <div class="chat-messages-bottom"></div>
                        </div>
                    </div>
                    <div
                        v-show="isNewMessagesButtonVisible"
                        class="chat-messages-unread"
                        @click="lastMessageScroll"
                    >
                        <img src="@/assets/arrow-down.svg">
                        <span>{{ unreadMessagesCount }}</span>
                    </div>
                    <div class="chat-send">
                        <input
                            ref="sendMessageInput"
                            type="text"
                            v-model="message.current"
                            placeholder="Напишите что-нибудь..."
                            @keyup.enter="sendMessage">
                        <div class="chat-send__button">
                            <v-btn
                                @click="sendMessage"
                                icon
                            >
                                <v-icon dark>
                                    mdi-send
                                </v-icon>
                            </v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import moment from 'moment';

export default {
    name: 'Chat',
    data() {
        return {
            message: {
                current: '',
                list: [],
            },
            dialog: {
                id: null,
                recieveId: null,
                name: '',
            },
            isScrollEnded: true,
            isScrollUpped: false,
            allMessagesReaded: true,
            unreadMessagesCount: 0,
            isFocused: false,
            lastScrollHeight: 0,
            isCreateDialogVisible: false,
        };
    },
    computed: {
        ...mapGetters({
            userInfo: 'globals/userInfo',
            messages: 'chat/messages',
            dialogs: 'chat/dialogs',
            messagesCount: 'chat/messagesCount',
            dialogId: 'chat/dialogId',
            accounts: 'globals/accounts',
            io: 'globals/socket',
        }),

        preparedUsers() {
            return this.accounts.filter(user => user._id !== this.userInfo._id);
        },

        isNewMessagesButtonVisible() {
            return !this.allMessagesReaded && !this.isScrollEnded;
        },

        preparedDate() {
            return new Date(this.userInfo.createdAt) - 10000;
        },

        preparedMessages() {
            let obj = {};

            return this.messages.map(item => {
                if (
                    (item.authorId._id === obj.authorId?._id) &&
                    (moment(item.createdAt) <= (moment(obj.createdAt) + 60000))) {
                    obj = {
                        ...item,
                        concated: true,
                    };

                    return obj;
                }

                obj = item;

                return item;
            });
        },

        isUnreadMessagesExists() {
            return this.unreadMessagesCount > 0 && this.isFocused && this.isScrollEnded;
        },
    },
    async created() {
        await this.getAccounts();
        await this.getDialogs();
        this.watchNewDialog();
        this.watchNewMessage();
    },
    mounted() {
        this.scrollEvent();

        window.onfocus = () => {
            this.isFocused = true;

            console.log('focused');

            if (this.isUnreadMessagesExists) {
                this.readAllMessages();
            }
        };

        window.onblur = () => {
            this.isFocused = false;

            console.log('blured');
        };
    },
    unmounted() {
        this.messages = [];
        this.dialogs = [];
    },
    watch: {
        isScrollEnded() {
            console.log('ended');
            if (this.isUnreadMessagesExists) {
                this.readAllMessages();
            }
        },
        isScrollUpped() {
            if (this.isScrollUpped) {
                console.log('upped');
                this.moreMessages();
            }
        },
    },
    methods: {
        ...mapActions({
            getAccounts: 'globals/getAccounts',
            getDialogs: 'chat/getDialogs',
            addMessage: 'chat/addMessage',
            getMessages: 'chat/getMessages',
            getMoreMessages: 'chat/getMoreMessages',
        }),

        ...mapMutations({
            CLEAR_MESSAGES: 'chat/CLEAR_MESSAGES',
        }),

        async sendMessage() {
            if (this.message.current) {
                const data = {
                    recieveId: this.dialog.recieveId,
                    text: this.message.current,
                    createdAt: Date.now(),
                };

                if (this.preparedMessages.length) {
                    data.dialogId = this.dialog.id;
                }

                const res = await this.addMessage(data);

                this.dialog.id = res.dialogId;
                this.message.current = '';

                new Promise(resolve => {
                    resolve();
                }).then(() => {
                    this.messages.push(res);
                })
                    .then(() => {
                        this.lastMessageScroll();
                    });

                this.io.emit('message', res);
                this.io.emit('dialog', res);

                if (!this.dialogs.some(item => item._id === res.dialogId)) {
                    this.dialogs.unshift({
                        authorId: res.authorId,
                        recieveId: res.recieveId,
                        _id: res.dialogId,
                    });
                }
            }
        },

        async selectDialog({ dialogId, recieveId }) {
            if (this.dialog.id !== dialogId) {
                this.clearAllData();

                this.dialog.id = dialogId;
                this.dialog.recieveId = recieveId;

                await this.getMessages({ dialogId });

                this.lastMessageScroll();
            }
        },

        async createDialog(recieveId) {
            this.clearAllData();

            this.dialog.recieveId = recieveId;

            const dialog = this.dialogs.find(item => item.recieveId._id === recieveId || item.authorId._id === recieveId);

            this.dialog.recieveId = this.correctRecieveId(dialog.authorId._id, dialog.recieveId._id);
            this.dialog.id = dialog._id;

            if (dialog) {
                await this.getMessages({ dialogId: dialog._id });
            }

            this.toggleCreateDialog();
            this.lastMessageScroll();
        },

        async moreMessages() {
            if (this.messagesCount > this.messages.length && this.isScrollUpped) {
                setTimeout(async () => {
                    await this.getMoreMessages({ dialogId: this.dialog.id });

                    const block = this.$refs.messages;

                    block.scrollTop = block.scrollHeight - this.lastScrollHeight;
                }, 500);
            }
        },

        lastMessageScroll() {
            const e = document.querySelector('.chat-messages-bottom');
            if (!e) return;

            e.scrollIntoView({
                behavior: 'auto',
                block: 'end',
            });
        },

        isScrollBottom(block) {
            block.scrollTop === block.scrollHeight - block.clientHeight
                ? this.isScrollEnded = true
                : this.isScrollEnded = false;

            this.lastScrollHeight = block.scrollHeight;
        },

        isScrollTop(block) {
            block.scrollTop === 0 && block.scrollHeight > 100
                ? this.isScrollUpped = true
                : this.isScrollUpped = false;

            this.lastScrollHeight = block.scrollHeight;
        },

        checkScroll() {
            const block = this.$refs.messages;

            this.isScrollBottom(block);
            this.isScrollTop(block);
        },

        scrollEvent() {
            const block = this.$refs.messages;

            block.addEventListener('scroll', this.checkScroll);
        },

        watchNewMessage() {
            this.io.on('message:recieved', async data => {
                if (data.dialogId !== this.dialog.id) {
                    return;
                }

                new Promise(resolve => {
                    resolve();
                }).then(() => {
                    data.unread = true;
                    this.messages.push(data);
                })
                    .then(() => {
                        this.unreadMessagesCount = this.unreadMessagesCount + 1;
                        this.allMessagesReaded = false;

                        if (this.isScrollEnded) {
                            this.lastMessageScroll();
                        }
                    });
            });
        },

        watchNewDialog() {
            this.io.on('dialog:recieved', async data => {
                new Promise(resolve => {
                    resolve();
                }).then(() => {
                    if (!this.dialogs.some(item => item._id === data.dialogId)) {
                        this.dialogs.unshift({
                            authorId: data.authorId,
                            recieveId: data.recieveId,
                            _id: data.dialogId,
                        });
                    }
                });
            });
        },

        readAllMessages() {
            setTimeout(() => {
                for (let i = 0; i < this.unreadMessagesCount; i++) {
                    this.messages[this.messages.length - (i + 1)].unread = false;
                };

                this.allMessagesReaded = true;
                this.unreadMessagesCount = 0;
            });
        },

        convertDate(date) {
            if (moment() >= date) {
                return moment(date)
                    .locale('ru')
                    .format('H:mm');
            }

            return moment(date)
                .locale('ru')
                .fromNow();
        },

        formatedDialogName(payload) {
            let name = '';

            payload.authorId.username === this.userInfo.username
                ? name = payload.recieveId.username
                : name = payload.authorId.username;

            return name;
        },

        toggleCreateDialog() {
            this.isCreateDialogVisible = !this.isCreateDialogVisible;
        },

        clearAllData() {
            this.CLEAR_MESSAGES();
            this.isScrollUpped = false;
        },

        correctRecieveId(authorId, recieveId) {
            let ID = null;

            this.userInfo._id === authorId
                ? ID = recieveId
                : ID = authorId;

            return ID;
        },
    },
};
</script>

<style lang="scss">
.chat {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 0 10%;

    .chat-container {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        border: 1px solid gray;
        height: 500px;

        .chat-none-selected {
            display: flex;
            width: 100%;
            height: 100%;

            div {
                margin: auto;
            }
        }

        .chat-dialogs {
            width: 20%;
            min-width: 300px;
            border-right: 1px solid gray;
            background: rgba(0,0,0, 0.1);
            position: relative;
            padding-bottom: 44px;

            .chat-dialog {
                cursor: pointer;
                padding: 10px;
                border-bottom: 1px solid rgba(0,0,0,0.2);

                &:hover {
                    background: rgba(0,0,0,0.25);
                }

                &__add {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    text-align: center;
                    padding: 10px;
                    width: 100%;
                    background: gray;
                    color: white;
                    cursor: pointer;
                }

                &__users {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #e3e3e3;

                    &--close {
                        position: absolute;
                        right: 10px;
                        top: 2px;
                        font-weight: bolder;
                        cursor: pointer;
                    }

                    &--search {
                        input {
                            width: 100%;
                            padding: 10px;
                            padding-right: 20px;
                            background: white;
                            border: 1px solid gray;
                        }
                    }

                    &--list {
                        &--block {
                            padding: 10px;
                            border-bottom: 1px solid gray;
                            cursor: pointer;
                        }
                    }
                }
            }
        }

        .chat-send {
            display: flex;
            width: 100%;
            border-top: 1px solid gray;

            input {
                outline: none;
                height: 45px;
                width: 100%;
                padding: 0 15px;
            }

            &__button {
                display: flex;
                align-items: center;
                margin: 0 15px;
            }
        }
    }

    .chat-messages-wrapper {
        position: relative;
        width: 100%;

        .chat-messages-profile {
            background: white;
            width: 100%;
            padding: 15px;
            border-bottom: 1px solid gray;
            height: 60px;
        }

        .flexbox {
            height: 100%;

            .chat-messages-container {
                position: relative;
                width: 100%;
                height: 395px;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;

                .chat-messages {
                    max-height: 100%;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;

                    .chat-messages-bottom {
                        padding: 5px 0;
                    }

                    .chat-message {
                        width: 100%;
                        padding: 0 15px;
                        padding-top: 3px;

                        &.unreaded {
                            background: rgba(0,0,0,0.1);
                        }

                        &.none-concated {
                            margin-top: 15px;
                        }

                        .message-header {
                            display: flex;
                            justify-content: flex-start;
                            margin-bottom: 5px;

                            .message-name {
                                font-weight: bolder;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                max-width: 150px;
                                margin-right: 10px;
                            }

                            .message-date {
                                margin-top: 2px;
                                font-size: 13px;
                                color: gray;
                            }
                        }

                        .message-text {
                            font-size: 14px;
                            margin-bottom: 3px;
                        }
                    }
                }
            }

            .chat-messages-unread {
                position: absolute;
                bottom: 60px;
                right: 50px;
                width: 42px;
                height: 42px;
                box-shadow: 0 0 3px rgba(0,0,0, 0.5);
                line-height: 1;
                padding-top: 10px;
                text-align: center;
                font-weight: bolder;
                border-radius: 50%;
                background: white;
                cursor: pointer;

                &:hover {
                    background: #e3e3e3;
                }

                img {
                    margin-top: 2px;
                    width: 18px;
                }

                span {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: gray;
                    padding: 5px;
                    font-size: 12px;
                    color: white;
                    line-height: 0.8;
                    margin-left: 1px;
                    font-weight: normal;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                }
            }
        }
    }
}
</style>
