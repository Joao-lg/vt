<template>
    <section class="container-auth">
        <Transition name="fade">
            <ModulesAuthLogin v-if="active === 0" :data="data.login" @goBack="goBack" @toRegist="toRegist" @submit="submit" @recover="recover"/>
            <ModulesAuthRegist v-if="active === 1" :data="data.regist" @goBack="goBack"/>
            <ModulesAuthRecover v-if="active === 2" :data="data.recover_password" @goBack="goBack"/>
        </Transition>
        <Transition name="fade">
            <ModulesUiError/>
        </Transition>
    </section>
</template>

<script>
import forms from "../../../assets/json/forms.json"
export default {
    data() {
        return {
            data: forms,
            active: 0,

        }
    },
    methods: {
        goBack() {
            if(this.active) {
                this.active = 0
                return
            }
            this.$emit("goBack")
        },
        toRegist() {
            this.active = 1
        },
        recover() {
            this.active = 2
        },
        submit() {
            this.$emit("nextStep")
        }
    }
}
</script>

<style lang="scss">
    .container-auth {
        position: relative;

        > div {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;

            @media screen and (min-width: 768px) {
                width: 60%;
            }

            @media screen and (min-width: 1100px) {
                width: 40%;
            }

            @media screen and (min-width: 1700px) {
                width: 30%;
            }
        }
    }

    h1 {
        @extend .md-title;
        color: $white;
        text-transform: uppercase;
        margin-bottom: 48px;
        text-align: center;

        @media screen and (min-width: 1100px) {
            margin-bottom: 28px;
        }

        @media screen and (min-width: 1700px) {
            margin-bottom: 48px;
        }
    }

    form {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 15px 0;
    }

    .submit {
        @extend .button;
        display: flex;
        margin-left: auto;
    }

    .navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 24px 0 32px;

        @media screen and (min-width: 1700px) {
            margin: 42px 0 54px;
        }

        button {
            @extend .sm-text;
            color: $white;
        }
    }

    .bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 44px;

        @media screen and (min-width: 1100px) {
            gap: 64px;
        }

        @media screen and (min-width: 1700px) {
            gap: 92px;
        }

        button {
            @extend .sm-text;
            color: $white;
            font-weight: 400;

            span {
                font-weight: 700;
            }
        }
    }

    .goback {
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>