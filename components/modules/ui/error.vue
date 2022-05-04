<template>
    <aside v-if="data.length" :class="{error : getType}" @click="close">
        <p v-for="(x, i) in data" :key=i>{{x}}</p>
    </aside>
</template>

<script>
import {  mapGetters, mapMutations } from "vuex";
export default {
    data() {
        return {
            data: []
        }
    },
  computed: {
    ...mapGetters({
      getErrors: "errors/getErrors",
      getType: "errors/getType",
    }),
  },
  watch: {
    getErrors: {
      deep: true,
      handler(val) {
        this.data =  val
      },
    },
  },
  methods: {
    ...mapMutations({
        resetErrors: "errors/resetErrors",
    }),
    close() {
        this.data = []
        this.resetErrors(this.data)
    }
  }
}
</script>

<style lang="scss" scoped>
aside {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: green;
    padding: 64px;
    cursor: pointer;

    &.error {
      background-color: $red;
    }

    p {
        @extend .md-text;
        color: $white;
    }
}
</style>