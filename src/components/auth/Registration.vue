<template>
    <div class="registration-wrapper">
        <div class="registration__container">
            <div class="registration__title">Регистрация</div>
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
                        <v-col cols="12" class="pb-0">
                            <v-text-field
                                v-model="email"
                                label="Эл. почта"
                                type="email"
                                hide-details
                                filled
                                single-line
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" class="pb-0">
                            <v-text-field
                                v-model="password"
                                label="Пароль"
                                type="password"
                                hide-details
                                filled
                                single-line
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" class="pb-0">
                            <v-text-field
                                v-model="confirmpass"
                                label="Повторите пароль"
                                type="password"
                                hide-details
                                filled
                                single-line
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-btn
                                @click="register"
                                elevation="1"
                                color="primary"
                                block
                                large
                            >Зарегистрироваться</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            <div class="registration__back"><router-link to="/login">Перейти к авторизации</router-link></div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'Registration',
    data() {
        return {
            username: '',
            password: '',
            confirmpass: '',
            email: '',
        };
    },
    methods: {
        ...mapActions({
            registration: 'globals/register',
        }),

        async register() {
            const { username, password, confirmpass, email } = this;

            const data = {
                username,
                password,
                confirmpass,
                email,
            };

            await this.registration(data);
        },
    },
};
</script>

<style lang="scss">
    .registration-wrapper {
        text-align: center;
        max-width: 500px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 100vh;
        justify-content: center;

        .registration {
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

                button {
                    max-width: 200px;
                    width: 100%;
                    margin: 0 auto;
                }
            }
            &__back {
                margin-top: 10px;
                font-size: 14px;
            }
        }

        input {
            margin-bottom: 10px;
        }
    }
</style>
