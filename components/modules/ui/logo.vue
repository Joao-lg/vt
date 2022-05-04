<template>
<figure :class="{topleft: hasLangs}">
    <NuxtImg :src="logo.path" :alt="logo.alt" sizes="xs:256 xl:512" format="webp" quality="100"/>
</figure>
</template>

<script>
export default {
	props: {
		logo: {
			type: Object,
			required: true,
			default: () => {}
		},
		hasLangs: {
			type: Boolean,
			required: true,
			default: () => false
		}
	}
}
</script>

<style lang="scss" scoped>
figure {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    width: 140px;
    transition: 0.5s ease-in-out;
    animation: fade 1s ease-in-out forwards;

    @media only screen and (min-width: 768px) {
        width: 180px;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    &.topleft {
        top: 24px;
        left: 50%;
        width: 64px;
        transform: translate(-50%);
        max-height: 10%;

        @media only screen and (min-width: 768px) {
            top: 100px;
            left: 100px;
            width: 100px;
            max-height: 100px;
            transform: translate(-50%, -50%);
        }

        @media only screen and (min-width: 1700px) {
            width: 120px;
            max-height: 140px;
        }
    }
}
</style>