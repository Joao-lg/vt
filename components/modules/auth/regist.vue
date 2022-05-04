<template>
    <div>
        <h1>{{$t('regist')}}</h1>
        <form action="">
            <ModulesAuthPartialsInput v-for="(item, i) in data" :key="i" :data="item" @setVal="setVal"/>
            <label id="terms" class="container-checkbox">
                <NuxtLink to="#">{{$t('terms')}}</NuxtLink>
                <input type="checkbox" name="terms">
                <span class="checkmark"></span>
            </label>
        </form>
        <div class="navigation">
            <button class="goback" @click="goBack"><SvgsChevron/> {{$t('goback')}}</button>
            <button class="submit" @click="submit">
                <template v-if="!loading">
                    {{$t('confirm')}}
                </template>
                <div v-else class="lds-dual-ring"></div>
            </button>
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
        setVal(val) {
            this.form[Object.keys(val)[0]] = Object.values(val)[0]
        },
        async submit() {
            // this.$emit("submit")
            this.loading = !this.loading
            const response = await api.post('register', this.form)
            if(response.data.code === 201) {
                this.$emit("submit")
            } else this.setErrors({error: response.errors, type: 1})
            this.loading = false
            // if(response.status) alert("sucess")
            // else alert("error")
        },
    }
}
</script>
