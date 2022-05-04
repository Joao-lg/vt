<template>
	<ul class="langs">
		<template v-for="(lang, index) in langs" >
			<li :key="index" class="lang" @click="goTo(lang)">
				<hr v-if="index > 0" />
				<!-- <NuxtLink
					:to="switchLocalePath(lang)"> {{lang}}
				</NuxtLink> -->
				<span> {{lang}}</span>
			</li>
		</template>
	</ul>
</template>

<script>
// import {langs} from "../../assets/json/content.json"
export default {
	props: {
		langs: {
			type: Array,
			require: true,
			default: () => []
		}
	},
	methods: {
		goTo(lang) {
			this.$emit('nextStep')
		}
	}
}
</script>

<style lang="scss" scoped>
	.langs {
		z-index: 1;
		color: $white;
		display: flex;
		align-items: center;
		gap: 1rem;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

		.lang {
			display: flex;
			gap: 1rem;

			hr {
				border: none;
				width: 2px;
				background: $white;
			}

			span, 
			a {
				cursor: pointer;
				position: relative;
				text-transform: uppercase;
				font-size: 1.5rem;
				font-family: $font;
				color: $white;
				text-decoration: none;

				&::after {
					content: '';
					position: absolute;
					width: 0px;
					height: 3px;
					left: 0;
					bottom: -10px;
					border-radius: 19px;
					background-color: $red;
					transition: all ease-in-out 0.2s;
				}

				&:hover::after {
					width: 100%;
				}
			}
		}
  	}
</style>