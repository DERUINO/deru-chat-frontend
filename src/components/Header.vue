<template>
    <div class="header-wrapper">
        <div class="container">
            <div class="navigation">
                <div class="navigation__logout">
                    <div class="navigation__logout-name">{{ user.username }}</div>
                    <div class="navigation__logout-button" @click="logout">выход</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { deleteCookie } from '@/tools';
import { mapGetters } from 'vuex';

export default {
    name: 'Header',
    computed: {
        ...mapGetters({
            user: 'globals/userInfo',
        }),
    },
    methods: {
        logout() {
            deleteCookie('token');
            location.reload();
        },
    },
};
</script>

<style scoped lang="scss">
    .header-wrapper {
        width: 100%;
        .navigation {
            margin-top: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: flex-end;

            &__logout {
                margin-right: 10px;
                text-align: right;

                &-name {
                    font-weight: bolder;
                }

                &-button {
                    font-size: 12px;
                    margin-top: 5px;
                    margin-right: 1px;
                    cursor: pointer;

                    &:hover {
                        color: gray;
                    }
                }
            }
        }

        a {
            text-decoration: none;
            color: inherit;

            &.router-link-exact-active {
               background-color: #0d6efd;
               color: white;
               border-radius: .25rem;

               a {
                background-color: #0d6efd;
                color: white;
                border-radius: .25rem;
               }
            }
        }
    }
</style>
