<template>
    <section>
        <div>
            <h1>{{$t('welcome')}} {{title}}</h1>
            <div class="advance" @click="goToTour">
                <span>{{$t('advance')}}</span>
                <SvgsChevron />
            </div>
        </div>
        <div class="item">
            <template v-for="(item, i) in tutorial">
                <Transition :key="i" name="fade">
                    <ModulesTimelineMain v-if="item.type === 'timeline' && i === active" :timeline="item"/>
                    <NuxtImg v-else-if="item.type === 'poi' && i === active" :src="item.image.path" :alt="item.image.alt" format="webp" sizes="sm:256 md:512 xl:1024"/>
                </Transition>
            </template>
        </div>
        <div class="about">
            <h2>{{tutorial[active].title}}</h2>
            <p>{{tutorial[active].description}}</p>
        </div>
        <ul class="navigation">
            <button @click="prev">
                <SvgsChevron />
            </button>
            <li v-for="(item, i) in tutorial" :key="`item${i}`" :class="{active : active === i}" @click="active = i"></li>
            <button @click="next">
                <SvgsChevron />
            </button>
        </ul>
    </section>
</template>

<script>
export default {
    props: {
        tutorial: {
            type: Array,
            requiere: true,
            default: () => []
        },
        title: {
            type: String,
            requiere: true,
            default: () => ""
        }
    },
    data() {
        return {
            active: 0
        }
    },
    methods: {
        prev() {
            if(this.active > 0) this.active--
        },
        next() {
            if(this.active === (this.tutorial.length - 1)) this.active = 0
            else this.active++
        },
        goToTour() {
            this.$emit('nextStep')
        }
    }
}
</script>

<style lang="scss" scoped>
    section {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translate(-50%);
        height: fit-content;
        width: 90%;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 24px;

        @media screen and (min-width: 380px) {
            height: fit-content;
            bottom: 64px;
        }
        
        @media screen and (min-width: 768px) {
            top: 55%;
            bottom: unset;
            transform: translate(-50%, -50%);
            height: 75%;
            gap: 32px;
        }

        > div {
            position: relative;
            
            h1 {
                @extend .md-title;
                color: $white;
                text-transform: unset;
            }

            .advance {
                position: absolute;
                top: -20px;
                right: 50%;
                transform: translate(50%, -50%);
                width: fit-content;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 1rem;
                user-select: none;
                cursor: pointer;
                opacity: 0.5;
                transition: 0.5s;
                @extend .sm-text;
                color: $white;
                animation: move 1s infinite;

                @media screen and (min-width: 1100px) {
                    top: 50%;
                    right: 0;
                    transform: translate(0, -50%);
                }

                &:hover {
                    opacity: 1;
                }

                span {
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                svg {
                    width: 15px;
                    height: 15px;
                    transform: scaleX(-1);
                }
            }
        }

        

        .item {
            height: 20vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow-x: auto;

            @media screen and (min-width: 380px) {
                height: 30vh;
            }

            @media screen and (min-width: 1100px) {
                height: 40vh;
            }

            img {
                object-fit: contain;
                height: 100%;
            }

            & > * {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                max-height: 100%;

                @media screen and (min-width: 1100px) {
                    max-width: 90%;
                }
            }
        }

        .about {
            width: 100%;
            margin: 0 auto;
            text-align: center;

            @media screen and (min-width: 768px) {
                width: 75%;
            }

            @media screen and (min-width: 1100px) {
                width: 50%;
            }

            h2 {
                @extend .text;
                color: $white;
                margin-bottom: 16px;

                @media screen and (min-width: 768px) {
                    margin-bottom: 24px;
                }
            }

            p {
                @extend .sm-text;
                color: $white;
            }
        }

        .navigation {
            list-style: none;
            margin: 0 auto;
            display: flex;
            align-items: center;
            gap: 10px;

            li {
                width: 12px;
                height: 12px;
                border-radius: 100%;
                border: 1px solid $white;
                transition: .3s;
                cursor: pointer;

                &.active,
                &:hover {
                    background-color: $white;
                }
            }

            button {
                margin: 0 15px;
                display: flex;
                height: fit-content;
                &:last-of-type {
                    svg {
                        transform: rotate(180deg);
                    }
                }
            }
        }
    }

    @keyframes move {
        0% {
            gap: .75rem
        }
        50% {
            gap: 0.5rem
        }
        100% {
            gap: .75rem
        }
    }
</style>