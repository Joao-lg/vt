<template>
    <main>
        <ModulesUiLogo :logo="data.logo" :has-langs="langs"/>
        <figure class="background">
            <NuxtImg :src="data.background.path" :alt="data.background.alt" format="webp" sizes="xs:400 md:800 xl:1920" class="image"/>
            <div class="overlay"></div>
        </figure>
        <Nuxt/>
    </main>
</template>

<script>
import content from "../assets/json/content.json";
export default {
    data() {
        return {
            data: content,
            langs: false
        }
    },
	mounted() {
		this.activateLangs()
	},
	methods: {
		activateLangs() {
			setTimeout(() => {
				this.langs = true
			}, 3000);
		}
	}
}
</script>

<style lang="scss" scoped>
main {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
 .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1; 

    .overlay {
        background-color: rgba(black, .56);
        backdrop-filter: blur(20px);
    }
}
</style>