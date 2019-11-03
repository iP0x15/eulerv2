import Vue from 'vue';
import Vuex from 'vuex'
import * as _ from 'lodash'

Vue.use(Vuex);

/* 
 * This store is to organize the prior state of the Scene (which can't be 
 * changed without moving between Animations), the diff being configured for the
 * current Scene (which is set directly), and the diff generated by the current
 * Animation (which is computed from the arguments).
 */
const store = new Vuex.Store({
  state: {
    priorScene: [],
    sceneDiff: {},
    animationDiff: {},
  },
  mutations: {
    updateDiffs(state, payload) {
      if ('priorScene' in payload) {
        state.priorScene = payload.priorScene;
      }
      if ('sceneDiff' in payload) {
        state.sceneDiff = payload.sceneDiff;
      }
      if ('animationDiff' in payload) {
        state.animationDiff = payload.animationDiff;
      }
    },
    stepForward(state) {
      let newScene = _.cloneDeep(state.priorScene);
      newScene = _.concat(newScene, state.sceneDiff['add'] || []);
      newScene = _.difference(newScene, state.sceneDiff['remove'] || []);
      newScene = _.concat(newScene, state.animationDiff['add'] || []);
      newScene = _.difference(newScene, state.animationDiff['remove'] || []);
      state.priorScene = newScene;
    },
    stepBackward(state, payload) {
      let newScene = _.cloneDeep(state.priorScene);
      newScene = _.concat(newScene, payload.animationDiff['remove'] || []);
      newScene = _.difference(newScene, payload.animationDiff['add'] || []);
      newScene = _.concat(newScene, payload.sceneDiff['remove'] || []);
      newScene = _.difference(newScene, payload.sceneDiff['add'] || []);
      state.priorScene = newScene;
    },
  },
  actions: {

  },
  getters: {
    sceneBeforeAnimation(state) {
      let ret = state.priorScene;
      ret = _.concat(ret, state.sceneDiff.add);
      ret = _.difference(ret, state.sceneDiff.remove);
      return ret;
    },
    animationIsValid(state, getters) {
      let sceneBeforeAnimation = getters.sceneBeforeAnimation;
      for (let mobjectName of (state.animationDiff['add'] || [])) {
        if (sceneBeforeAnimation.includes(mobjectName)) {
          return false;
        }
      }
      for (let mobjectName of (state.animationDiff['remove'] || [])) {
        if (!sceneBeforeAnimation.includes(mobjectName)) {
          return false;
        }
      }
      return true;
    },
    sceneIsValid(state) {
      let priorScene = state.priorScene;
      for (let mobjectName of (state.sceneDiff['add'] || [])) {
        if (priorScene.includes(mobjectName)) {
          return false;
        }
      }
      for (let mobjectName of (state.sceneDiff['remove'] || [])) {
        if (!priorScene.includes(mobjectName)) {
          return false;
        }
      }
      return true;
    }
  }
});

export default store;
