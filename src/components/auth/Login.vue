<template>
    <div>
        <div class="login-wrapper">
            <div class="login__container">
                <div class="login__title">Авторизация</div>
                <v-form>
                    <v-container>
                        <v-row>
                            <v-col cols="12" class="pb-0">
                                <v-text-field
                                    v-model="username"
                                    label="Логин"
                                    hide-details
                                    filled
                                    single-line
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="password"
                                    label="Пароль"
                                    type="password"
                                    hide-details
                                    filled
                                    single-line
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" class="py-0">
                                <v-checkbox
                                    v-model="checked"
                                    :label="`Запомнить меня`"
                                    hide-details
                                    dense
                                ></v-checkbox>
                            </v-col>
                            <v-col cols="12" class="mt-5">
                                <v-btn
                                    @click="login"
                                    elevation="1"
                                    color="primary"
                                    block
                                    :loading="isLoading"
                                    large
                                >Войти</v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
                <div class="login__back"><router-link to="/registration">Перейти к регистрации</router-link></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'Login',
    data() {
        return {
            username: '',
            password: '',
            isLoading: false,
            checked: false,
        };
    },
    computed: {
        ...mapGetters({
            errors: 'globals/errors',
        }),

        authErrors: {
            get() {
                return this.errors;
            },

            set(value) {
                this.errors = [];
            },
        },

        isForgoted() {
            return !!localStorage.getItem('savedLogin');
        },
    },
    mounted() {
        if (this.isForgoted) {
            this.username = localStorage.getItem('savedLogin');
        }
    },
    methods: {
        ...mapActions({
            authorisation: 'globals/login',
        }),

        async login() {
            this.isLoading = true;

            if (this.checked) {
                localStorage.setItem('savedLogin', this.username);
            }

            const { username, password } = this;

            const params = {
                username,
                password,
            };

            try {
                await this.authorisation(params);
            } catch (e) {
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style lang="scss">
    .login-wrapper {
        text-align: center;
        max-width: 500px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 100vh;
        justify-content: center;

        .login {
            &__title {
                margin-bottom: 10px;
                font-size: 24px;
            }
            &__container {
                display: flex;
                flex-direction: column;
                padding: 30px;
                background: rgba(0,0,0,0.03);
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.15);
            }
            &__back {
                margin-top: 10px;
                font-size: 14px;
            }
        }
    }
</style>
