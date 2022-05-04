<template>
    <div>
        <h1>{{$t('login')}}</h1>
        <form action="" @submit.prevent>
            <ModulesAuthPartialsInput v-for="(item, i) in data" :key="i" :data="item" @setVal="setVal"/>
            <button class="submit" type="button" @click="formSubmit">
                <template v-if="!loading">
                    {{$t('confirm')}}
                </template>
                <div v-else class="lds-dual-ring"></div>
            </button>
        </form>
        <div class="navigation">
            <button class="goback" @click="goBack"><SvgsChevron/>{{$t('goback')}}</button>
            <button @click="guest">{{$t('guest')}}</button>
        </div>
        <div class="bottom">
            <button @click="recover">{{$t('forgot')}} <span>{{$t('password')}}</span>?</button>
            <button @click="toRegist">{{$t('no_account')}} <span>{{$t('regist_here')}}</span></button>
        </div>
    </div>
</template>

<script>
import { mapMutations } from "vuex";
import api from "../../../assets/js/api.js"
export default {
    props: {
        data: {
            type: Array,
            require: true,
            default:() => []
        }
    },
    data() {
        return {
            form: {},
            loading: false
        }
    },
    methods: {
        ...mapMutations({
            setErrors: "errors/setErrors",
        }),
        goBack() {
            this.$emit("goBack")
        },
        toRegist() {
            this.$emit("toRegist")
        },
        recover() {
            this.$emit("recover")
        },
        setVal(val) {
            this.form[Object.keys(val)[0]] = Object.values(val)[0]
        },
        async formSubmit() {
            this.loading = !this.loading
            const response = await api.post('login', this.form)
            if(response.data.code === 201) {
                localStorage.loginToken = response.data.data.access_token
                this.$emit("submit")
            } else this.setErrors({error: response.errors, type: 1})
            this.loading = false
        },
        guest() {
             this.$emit("submit")
        }
    }
}
</script>