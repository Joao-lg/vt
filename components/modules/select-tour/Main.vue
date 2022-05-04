<template>
    <section class="container">
        <h1>{{$t('choose_tour')}}</h1>
        <div class="grid" @click="virtual">
            <ModulesSelectTourCard v-for="(item, i) in data" :key="i" :card="item"/>
        </div>\
        <button @click="goBack">
            <SvgsChevron/>
            {{$t('goback')}}
        </button>
    </section>
</template>

<script>
export default {
    props: {
        data: {
            type: Array,
            require: true,
            default: () => []
        }
    },
    methods: {
        goBack() {
            this.$emit('goBack')
        },
        virtual() {
            this.$router.push('/virtual-tour')
        }
    }
}
</script>

<style lang="scss" scoped>
    .container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: fit-content;
        max-width: 90vw;

        > h1 {
            @extend .md-title;
            color: $white;
            font-weight: 400;
            text-align: center;
            margin-bottom: 48px;
        }

        .grid {
            display: flex;
            gap: 24px;
            overflow-x: auto;
            overflow-y: hidden;

            article {
                &:nth-of-type(1) {
                    background: rgb(154,180,185);
                    background: linear-gradient(0deg, rgba(154,180,185, .7) 0%, rgba(0,96,178, .7) 35%, rgba(45,163,226, .7) 68%, rgba(95,202,222, .7) 100%);
                }

                &:nth-of-type(2) {
                    background: rgb(200,16,46);
                    background: linear-gradient(0deg, rgba(200,16,46, .5) 0%, rgba(252,87,93, .5) 35%, rgba(200,16,46, .5) 68%, rgba(252,87,93, .5) 100%);
                }
            }
        }

        button {
            @extend .md-text;
            color: $white;
            margin-top: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 300;
        }
    }
</style>