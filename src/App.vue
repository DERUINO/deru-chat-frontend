<template>
    <v-app id="app">
        <component :is="layout"></component>
    </v-app>
</template>

<script>
import defaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

export default {
    name: 'App',
    components: {
        AuthLayout,
        defaultLayout,
    },
    data() {
        return {
            array: [],
            username: '',
            password: '',
            confirmpass: '',
            email: '',
            authorisation: false,
            users: [],
            alert: {
                text: '',
                status: '',
            },
            trigger: false,
        };
    },
    computed: {
        layout() {
            switch (this.$route.meta.layout) {
                case 'auth-layout':
                    return 'AuthLayout';
                default:
                    return 'defaultLayout';
            }
        },
    },
};
</script>

<style lang="scss">
@import 'assets/scss/style.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0 auto;
}

.v-input__slot::before {
  border-style: none !important;
}
</style>
