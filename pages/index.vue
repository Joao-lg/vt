<template>
<TemplatesDefault :is-visible="isVisible"/>
</template>

<script>
export default {
	name: 'IndexPage',
	layout: 'default',
	data(){
		return {
			isVisible: false
		}
	},
	mounted() {
		this.checkState()
		this.onbeforeunload()
	},
	methods: {
		checkState() {
			if(localStorage.visited) {
				this.isVisible = true
				return
			}
			localStorage.visited = true
			setTimeout(() => {
				this.isVisible = true
			}, 3000);
		},
		onbeforeunload() {
			// window.onbeforeunload = function(){
			// 	localStorage.clear()
			// }
		}
	}
}
</script>