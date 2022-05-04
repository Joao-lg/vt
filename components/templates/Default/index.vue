<template>
	<Transition name="fade">
		<ModulesUiLangs v-if="isVisible && step === 0" :langs="data.langs" @nextStep="nextStep"/>
		<ModulesAuthMain v-else-if="isVisible && step === 1" @nextStep="nextStep" @goBack="step = 0"/>
		<ModulesTutorialMain v-else-if="isVisible && step === 2" :tutorial="data.tutorial" :title="data.title" @nextStep="nextStep"/>
		<ModulesSelectTourMain v-else-if="isVisible && step === 3" :data="data.select_tour" @nextStep="nextStep" @goBack="step = 2"/>
	</Transition>
</template>

<script>
import content from "../../../assets/json/content.json";
export default {
	props: {
		isVisible: {
			type: Boolean,
			require: true,
			default: () => false
		}
	},
	data(){
		return {
			data: content,
			step: 0
		}
	},
	mounted() {
		this.checkLoginToken()
	},
	methods: {
		nextStep() {
			this.step++
		},
		checkLoginToken() {
			if(localStorage.loginToken) {
				this.step = 3
			}
		}
	}
}
</script>