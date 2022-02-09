export default function guest({ next, store }) {
    if (store.getters['globals/accessToken']) {
        return next({
            path: '/chat',
        });
    }

    return next();
}
