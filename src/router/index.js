import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store';

import Login from '../components/auth/Login.vue';
import Registration from '../components/auth/Registration.vue';
import NotFound from '@/views/NotFound.vue';
import Chat from '@/views/Chat.vue';

import guest from './middleware/guest';
import user from './middleware/user';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: 'chat',
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            layout: 'auth-layout',
            middleware: [guest],
        },
    },
    {
        path: '/registration',
        name: 'Registration',
        component: Registration,
        meta: {
            layout: 'auth-layout',
            middleware: [guest],
        },
    },
    {
        path: '*',
        name: 'NotFound',
        component: NotFound,
        meta: {
            layout: 'auth-layout',
        },
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat,
        meta: {
            middleware: [user],
        },
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

router.beforeEach((to, from, next) => {
    if (!to.meta.middleware) {
        return next();
    }

    const { middleware } = to.meta;

    const context = {
        to,
        from,
        next,
        store,
    };
    return middleware[0]({
        ...context,
    });
});

export default router;
