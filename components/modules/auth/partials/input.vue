<template>
    <input v-if="data.type === 'text' || data.type === 'password' || data.type === 'email' || data.type === 'date'" v-model="input[data.name]" required :type="data.type" :placeholder="data.label" :name="data.name" :class="`input input-${data.size}`">
    <select v-else-if="data.type === 'select'" v-model="input[data.name]" :name="data.name" :class="`input input-${data.size}`" required>
        <option disabled selected value>{{data.label}}</option>
        <option v-for="(option, x) in data.options" :key="x" :value="option.name">{{option.label}}</option>
    </select>
</template>
<script>
export default {
    props: {
        data: {
            type: Object,
            require: true,
            default:() => {}
        }
    },
    data() {
        return {
            input: {}
        }
    },
    watch: {
        input: {
            deep: true,
            handler(val){
                this.$emit('setVal', val)
            }
        }
    },
}
</script>

<style lang="scss" scoped>
.input {
    background-color: rgba($white, .3);
    border-radius: 5px;
    padding: 10px 20px;
    @extend .sm-text;
    color: $white;

    &-50 {
        width: calc(50% - 5px);
    }

    &::placeholder {
        color: $white;
    }

    &-100 {
        width: 100%;
    }

    &::-webkit-datetime-edit {
        text-transform: uppercase;
    }

    &::-webkit-calendar-picker-indicator {
        filter: brightness(1) invert(1);
    }

    option {
        color: $black;

        &:disabled {
            color: $white-opacity;
        }
    }
}
</style>