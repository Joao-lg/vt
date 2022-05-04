<template>
    <article>
        <section>
            <h1>{{card.title}}</h1>
            <h2>{{card.price}}<span>€</span> </h2>
            <hr>
        </section>
        <ul>
            <li v-for="(feature, x) in card.features" :key="x" :class="{disable : !feature.active}">{{feature.name}}</li>
        </ul>
    </article>
</template>

<script>
export default {
    props: {
        card: {
            type: Object,
            require: true,
            default: () => {}
        }
    }
}
</script>

<style lang="scss" scoped>
    article {
        min-width: 60vw;
        padding: 45px 32px;
        background-color: rgba($white, .3);
        border-radius: 14px;
        transition: .3s;
        cursor: pointer;

        @media screen and (min-width: 768px) {
            min-width: 280px;
        }

        @media screen and (min-width: 1700px) {
            min-width: 380px;
        }


        h1 {
            @extend .xs-title;
            font-weight: 700;
            color: $white;
            text-align: center;
            margin-bottom: 16px;
            
            @media screen and (min-width: 1700px) {
                margin-bottom: 30px;
            }
        }

        h2 {
            font-family: $font;
            color: $white;
            font-weight: 100;
            text-align: center;
            font-size: 50px;

            @media screen and (min-width: 1700px) {
                font-size: 80px;
            }

            span {
                font-size: 30px;

                @media screen and (min-width: 1700px) {
                    font-size: 40px;
                }
            }
        }

        hr {
            height: 1px;
            background: repeating-linear-gradient(90deg,$white,$white 2px,transparent 2px,transparent 4px);
            border: none;
            margin: 24px 0;

            @media screen and (min-width: 1100px) {
                margin: 32px 0;
            }

            @media screen and (min-width: 1700px) {
                margin: 44px 0;
            }
        }

        ul {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;

            @media screen and (min-width: 1100px) {
                gap: 18px;
            }

            @media screen and (min-width: 1700px) {
                gap: 26px;
            }

            li {
                @extend .md-text;
                color: $white;
                font-weight: 700;
                text-align: center;

                &.disable {
                    opacity: .3;
                    font-weight: 400;
                }
            }
        }

    }
</style>