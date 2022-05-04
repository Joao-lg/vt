<template>
    <main>
        <Tour 
            :loc="newLoc"
            @toPoint="openPOI"
            @more="more = true"
            @fullyLoaded="loaded = true"
            @mapUpdate="goToZone"
        />
    </main>
</template>
<script>
// import locations  from '../../assets/json/locations.json'
export default {
	name: 'IndexPage',
	layout: 'tour',
    data() {
        return {
            newLoc: 'cena-1',
            loaded: false,
            more: false
        }
    },
    methods: {
        goToZone() {

        },
        openPOI() {

        }
    }
}
</script>