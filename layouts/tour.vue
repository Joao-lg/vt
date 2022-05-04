<template>
    <main>
        <ModulesUiLogo :logo="data.logo" :has-langs="true"/>
        <Nuxt/>
    </main>
</template>

<script>
import content from "../assets/json/content.json";
export default {
    data() {
        return {
            data: content,
        }
    },
	methods: {
	}
}
</script>
