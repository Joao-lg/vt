<template>
    <main>
        <Tour 
            :loc="newLoc"
            @toPoint="openPOI"
            @more="more = true"
            @fullyLoaded="loaded = true"
            @mapUpdate="goToZone"
        />
        <div v-if="!loaded" class="loading">
            <span>{{ $t('loading') }} virtual experience</span>
            <div class="lds-dual-ring"></div>
        </div>
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
        goToZone(e) {
            console.log(e)
            // this.voice_ended = false
            this.newZone = e.name
            // this.handleAudios(e)
        },
        openPOI() {

        }
    }
}
</script>

<style lang="scss" scoped>
.loading {
  position: fixed;
  display: flex;
  background-color: $black;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 5;
  text-transform: uppercase;

  span {
      @extend .text;
      color: $white;
      margin: 20px;
  }
}
</style>