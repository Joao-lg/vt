<template>
    <div>
        <h1>{{$t('recover')}}</h1>
        <form action="">
            <ModulesAuthPartialsInput v-for="(item, i) in data" :key="i" :data="item" @setVal="setVal"/>
        </form>
        <div class="navigation">
            <button class="goback" @click="goBack"><SvgsChevron/>{{$t('goback')}}</button>
            <button class="submit" type="button" @click="submit">
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
        setVal(val) {
            this.form[Object.keys(val)[0]] = Object.values(val)[0]
        },
        goBack() {
            this.$emit("goBack")
        },
        async submit() {
            this.loading = !this.loading
            const response = await api.post('forget-password', this.form)
            if(response.status === 200) {
                this.setErrors({error: response.errors, type: 0})
            } else this.setErrors({error: response.errors, type: 1})
            this.loading = false
        }
    }
}
</script>