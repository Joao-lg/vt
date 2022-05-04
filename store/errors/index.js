export const state = () => ({
    errors: [],
    type: 0,
});

export const mutations = {
	setErrors(state, payload) {
		state.errors.push(payload.error);
		state.type = payload.type;
	},
	resetErrors(state, payload) {
		state.errors = payload;
	},
};

export const getters = {
	getErrors(state) {
		return state.errors;
	},
	getType(state) {
		return state.type;
	},
}