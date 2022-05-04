<template>
    <div class="timeline" :style="`min-width: ${timeline.length * 1000}px`">
        <template v-for="(item, i) in timeline.items">
            <label :key="i" :class="{active : active >= i}" @click="active = i">
                <span v-if="item.type === 'scene'" class="dot"></span>
                <SvgsQuiz v-else-if="item.type === 'quiz'" class="icon"/>
                <span>{{item.title}}</span>
            </label>
        </template>
    </div>
</template>
<script>

export default {
    props: {
        timeline: {
            type: Object,
            requiere: true,
            default: () => {}
        }
    },
    data() {
        return {
            active: 0
        }
    }
}
</script>

<style lang="scss" scoped>
.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 100%;
    height: 1px;
    background: $white;
    background: repeating-linear-gradient(90deg,$white,$white 6px,transparent 6px,transparent 12px);

  label {
    position: relative;
    cursor: pointer;

    .dot {
        width: 14px;
        height: 14px;
        background-color: $white-opacity;
        border-radius: 100%;
        position: relative;
        top: -7px;
        transition: .3s;
        backdrop-filter: blur(5px);
    }

    .icon {
        transition: .3s;
        position: relative;
        top: -10px;
        backdrop-filter: blur(5px);
    }

    span {
        @extend .sm-text;
        color: $white;
        font-weight: 300;
        position: absolute;
        left: 0;
        top: 20px;
        clear: both;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
    }

    &.active {
        .dot {
            background-color: $white;
        }
    }

    &:hover {
        .dot,
        .icon {
            transform: scale(1.3);
        }
    }
  }
}
</style>