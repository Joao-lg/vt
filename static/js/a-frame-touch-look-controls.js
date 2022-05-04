const THREE = AFRAME.THREE
const GRABBING_CLASS = 'a-grabbing'
const PI_2 = Math.PI / 2
const radToDeg = THREE.Math.radToDeg

const checkHasPositionalTracking =
  AFRAME.utils.device.checkHasPositionalTracking

function bind(fn, ctx /* , arg1, arg2 */) {
  return (function (prependedArgs) {
    return function bound() {
      // Concat the bound function arguments with those passed to original bind
      const args = prependedArgs.concat(
        Array.prototype.slice.call(arguments, 0)
      )
      return fn.apply(ctx, args)
    }
  })(Array.prototype.slice.call(arguments, 2))
}

function PolyfillControls(object) {
  let frameData
  if (window.VRFrameData) {
    frameData = new window.VRFrameData()
  }
  this.update = function () {
    let pose
    if (!vrDisplay || !polyfilledVRDisplay) {
      return
    }
    vrDisplay.getFrameData(frameData)
    pose = frameData.pose
    if (pose.orientation !== null) {
      object.quaternion.fromArray(pose.orientation)
    }
    if (pose.position !== null) {
      object.position.fromArray(pose.position)
    } else {
      object.position.set(0, 0, 0)
    }
  }
}

let vrDisplay
let polyfilledVRDisplay
const POLYFILL_VRDISPLAY_ID = 'Cardboard VRDisplay (webvr-polyfill)'

AFRAME.registerComponent('touch-look-controls', {
  dependencies: ['position', 'rotation'],

  schema: {
    enabled: { default: true },
    touchEnabled: { default: true },
    hmdEnabled: { default: true },
    pointerLockEnabled: { default: false },
    reverseMouseDrag: { default: false },
  },

  init() {
    this.previousHMDPosition = new THREE.Vector3()
    this.hmdQuaternion = new THREE.Quaternion()
    this.hmdEuler = new THREE.Euler()
    this.position = new THREE.Vector3()
    // To save / restore camera pose
    this.savedRotation = new THREE.Vector3()
    this.savedPosition = new THREE.Vector3()
    this.polyfillObject = new THREE.Object3D()
    this.polyfillControls = new PolyfillControls(this.polyfillObject)
    this.rotation = {}
    this.deltaRotation = {}
    this.savedPose = null
    this.pointerLocked = false
    this.setupMouseControls()
    this.bindMethods()

    // To save / restore camera pose
    this.savedPose = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    }

    // Call enter VR handler if the scene has entered VR before the event listeners attached.
    if (this.el.sceneEl.is('vr-mode')) {
      this.onEnterVR()
    }

    this.pitchObject.rotation.x = this.data.initialPitch
    this.yawObject.rotation.y = this.data.initialYaw

    setTimeout(() => {
      const canvas = document.querySelector('canvas')

      const rotate = setInterval(() => {
        this.yawObject.rotation.y -= 0.0002
      }, 1)

      canvas.addEventListener('mousedown', () => {
        clearInterval(rotate)
      })
      canvas.addEventListener('touchstart', () => {
        clearInterval(rotate)
      })
    }, 5000)
  },

  change(p, y) {
    this.pitchObject.rotation.x = p
    this.yawObject.rotation.y = y
  },

  update(oldData) {
    const data = this.data

    // Disable grab cursor classes if no longer enabled.
    if (data.enabled !== oldData.enabled) {
      this.updateGrabCursor(data.enabled)
    }

    // Reset pitch and yaw if disabling HMD.
    if (oldData && !data.hmdEnabled && !oldData.hmdEnabled) {
      this.pitchObject.rotation.set(0, 0, 0)
      this.yawObject.rotation.set(0, 0, 0)
    }

    if (oldData && !data.pointerLockEnabled !== oldData.pointerLockEnabled) {
      this.removeEventListeners()
      this.addEventListeners()
      if (this.pointerLocked) {
        document.exitPointerLock()
      }
    }
  },

  tick(t) {
    const data = this.data
    if (!data.enabled) {
      return
    }
    this.updateOrientation()
  },

  play() {
    this.addEventListeners()
  },

  pause() {
    this.removeEventListeners()
  },

  remove() {
    this.removeEventListeners()
  },

  bindMethods() {
    this.onMouseDown = bind(this.onMouseDown, this)
    this.onMouseMove = bind(this.onMouseMove, this)
    this.onMouseUp = bind(this.onMouseUp, this)
    this.onTouchStart = bind(this.onTouchStart, this)
    this.onTouchMove = bind(this.onTouchMove, this)
    this.onTouchEnd = bind(this.onTouchEnd, this)
    this.onEnterVR = bind(this.onEnterVR, this)
    this.onExitVR = bind(this.onExitVR, this)
    this.onPointerLockChange = bind(this.onPointerLockChange, this)
    this.onPointerLockError = bind(this.onPointerLockError, this)
  },

  /**
   * Set up states and Object3Ds needed to store rotation data.
   */
  setupMouseControls() {
    this.mouseDown = false
    this.pitchObject = new THREE.Object3D()
    this.yawObject = new THREE.Object3D()
    this.yawObject.position.y = 10
    this.yawObject.add(this.pitchObject)
  },

  /**
   * Add mouse and touch event listeners to canvas.
   */
  addEventListeners() {
    const sceneEl = this.el.sceneEl
    const canvasEl = sceneEl.canvas

    // Wait for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener(
        'render-target-loaded',
        bind(this.addEventListeners, this)
      )
      return
    }

    // Mouse events.
    canvasEl.addEventListener('mousedown', this.onMouseDown, false)
    window.addEventListener('mousemove', this.onMouseMove, false)
    window.addEventListener('mouseup', this.onMouseUp, false)

    // Touch events.
    canvasEl.addEventListener('touchstart', this.onTouchStart)
    window.addEventListener('touchmove', this.onTouchMove)
    window.addEventListener('touchend', this.onTouchEnd)

    // sceneEl events.
    sceneEl.addEventListener('enter-vr', this.onEnterVR)
    sceneEl.addEventListener('exit-vr', this.onExitVR)

    // Pointer Lock events.
    if (this.data.pointerLockEnabled) {
      document.addEventListener(
        'pointerlockchange',
        this.onPointerLockChange,
        false
      )
      document.addEventListener(
        'mozpointerlockchange',
        this.onPointerLockChange,
        false
      )
      document.addEventListener(
        'pointerlockerror',
        this.onPointerLockError,
        false
      )
    }
  },

  /**
   * Remove mouse and touch event listeners from canvas.
   */
  removeEventListeners() {
    const sceneEl = this.el.sceneEl
    const canvasEl = sceneEl && sceneEl.canvas

    if (!canvasEl) {
      return
    }

    // Mouse events.
    canvasEl.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)

    // Touch events.
    canvasEl.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('touchend', this.onTouchEnd)

    // sceneEl events.
    sceneEl.removeEventListener('enter-vr', this.onEnterVR)
    sceneEl.removeEventListener('exit-vr', this.onExitVR)

    // Pointer Lock events.
    document.removeEventListener(
      'pointerlockchange',
      this.onPointerLockChange,
      false
    )
    document.removeEventListener(
      'mozpointerlockchange',
      this.onPointerLockChange,
      false
    )
    document.removeEventListener(
      'pointerlockerror',
      this.onPointerLockError,
      false
    )
  },

  /**
   * Update orientation for mobile, mouse drag, and headset.
   * Mouse-drag only enabled if HMD is not active.
   */
  updateOrientation() {
    const hmdEuler = this.hmdEuler
    const pitchObject = this.pitchObject
    const yawObject = this.yawObject
    const sceneEl = this.el.sceneEl
    const rotation = this.rotation

    // In VR mode, THREE is in charge of updating the camera rotation.
    if (sceneEl.is('vr-mode') && sceneEl.checkHeadsetConnected()) {
      return
    }

    // Calculate polyfilled HMD quaternion.
    this.polyfillControls.update()
    hmdEuler.setFromQuaternion(this.polyfillObject.quaternion, 'YXZ')
    // On mobile, do camera rotation with touch events and sensors.
    rotation.x = radToDeg(hmdEuler.x) + radToDeg(pitchObject.rotation.x)
    rotation.y = radToDeg(hmdEuler.y) + radToDeg(yawObject.rotation.y)
    rotation.z = 0

    this.el.setAttribute('rotation', rotation)
  },

  /**
   * Translate mouse drag into rotation.
   *
   * Dragging up and down rotates the camera around the X-axis (yaw).
   * Dragging left and right rotates the camera around the Y-axis (pitch).
   */
  onMouseMove(event) {
    const pitchObject = this.pitchObject
    const yawObject = this.yawObject
    const previousMouseEvent = this.previousMouseEvent
    let movementX
    let movementY

    // Not dragging or not enabled.
    if (!this.data.enabled || (!this.mouseDown && !this.pointerLocked)) {
      return
    }

    // Calculate delta.
    movementX = event.movementX || event.mozMovementX
    movementY = event.movementY || event.mozMovementY
    if (movementX === undefined || movementY === undefined) {
      movementX = event.screenX - previousMouseEvent.screenX
      movementY = event.screenY - previousMouseEvent.screenY
    }
    this.previousMouseEvent = event

    // Calculate rotation.
    yawObject.rotation.y -= movementX * -0.002
    pitchObject.rotation.x -= movementY * -0.002
    pitchObject.rotation.x = Math.max(
      -PI_2,
      Math.min(PI_2, pitchObject.rotation.x)
    )
  },

  /**
   * Register mouse down to detect mouse drag.
   */
  onMouseDown(evt) {
    if (!this.data.enabled) {
      return
    }
    // Handle only primary button.
    if (evt.button !== 0) {
      return
    }

    const sceneEl = this.el.sceneEl
    const canvasEl = sceneEl && sceneEl.canvas

    this.mouseDown = true
    this.previousMouseEvent = evt
    document.body.classList.add(GRABBING_CLASS)

    if (this.data.pointerLockEnabled && !this.pointerLocked) {
      if (canvasEl.requestPointerLock) {
        canvasEl.requestPointerLock()
      } else if (canvasEl.mozRequestPointerLock) {
        canvasEl.mozRequestPointerLock()
      }
    }
  },

  /**
   * Register mouse up to detect release of mouse drag.
   */
  onMouseUp() {
    this.mouseDown = false
    document.body.classList.remove(GRABBING_CLASS)
  },

  /**
   * Register touch down to detect touch drag.
   */
  onTouchStart(evt) {
    if (evt.touches.length !== 1 || !this.data.touchEnabled) {
      return
    }
    this.touchStart = {
      x: evt.touches[0].pageX,
      y: evt.touches[0].pageY,
    }
    this.touchStarted = true
  },

  /**
   * Translate touch move to Y-axis rotation.
   */
  onTouchMove(evt) {
    const canvas = this.el.sceneEl.canvas
    const pitchObject = this.pitchObject
    const yawObject = this.yawObject

    if (!this.touchStarted || !this.data.touchEnabled) {
      return
    }

    const deltaY =
      (2 * Math.PI * (evt.touches[0].pageX - this.touchStart.x)) /
      canvas.clientWidth
    const deltaX =
      (2 * Math.PI * (evt.touches[0].pageY - this.touchStart.y)) /
      canvas.clientHeight

    // Allow touch orientaion to to x and y
    yawObject.rotation.y -= deltaY * -0.5
    pitchObject.rotation.x -= deltaX * -0.5
    pitchObject.rotation.x = Math.max(
      -PI_2,
      Math.min(PI_2, pitchObject.rotation.x)
    )
    this.touchStart = {
      x: evt.touches[0].pageX,
      y: evt.touches[0].pageY,
    }
  },

  /**
   * Register touch end to detect release of touch drag.
   */
  onTouchEnd() {
    this.touchStarted = false
  },

  /**
   * Save pose.
   */
  onEnterVR() {
    this.saveCameraPose()
  },

  /**
   * Restore the pose.
   */
  onExitVR() {
    this.restoreCameraPose()
    this.previousHMDPosition.set(0, 0, 0)
  },

  /**
   * Update Pointer Lock state.
   */
  onPointerLockChange() {
    this.pointerLocked = !!(
      document.pointerLockElement || document.mozPointerLockElement
    )
  },

  /**
   * Recover from Pointer Lock error.
   */
  onPointerLockError() {
    this.pointerLocked = false
  },

  /**
   * Toggle the feature of showing/hiding the grab cursor.
   */
  updateGrabCursor(enabled) {
    const sceneEl = this.el.sceneEl

    function enableGrabCursor() {
      sceneEl.canvas.classList.add('a-grab-cursor')
    }
    function disableGrabCursor() {
      sceneEl.canvas.classList.remove('a-grab-cursor')
    }

    if (!sceneEl.canvas) {
      if (enabled) {
        sceneEl.addEventListener('render-target-loaded', enableGrabCursor)
      } else {
        sceneEl.addEventListener('render-target-loaded', disableGrabCursor)
      }
      return
    }

    if (enabled) {
      enableGrabCursor()
      return
    }
    disableGrabCursor()
  },

  /**
   * Save camera pose before entering VR to restore later if exiting.
   */
  saveCameraPose() {
    const el = this.el
    const position = el.getAttribute('position')
    const rotation = el.getAttribute('rotation')
    const hasPositionalTracking =
      this.hasPositionalTracking !== undefined
        ? this.hasPositionalTracking
        : checkHasPositionalTracking()

    if (this.savedPose || !hasPositionalTracking) {
      return
    }
    this.savedPose = {
      position: this.savedPosition.copy(position),
      rotation: this.savedRotation.copy(rotation),
    }
  },

  /**
   * Reset camera pose to before entering VR.
   */
  restoreCameraPose() {
    const el = this.el
    const savedPose = this.savedPose
    const hasPositionalTracking =
      this.hasPositionalTracking !== undefined
        ? this.hasPositionalTracking
        : checkHasPositionalTracking()

    if (!savedPose || !hasPositionalTracking) {
      return
    }

    // Reset camera orientation.
    el.setAttribute('position', savedPose.position)
    el.setAttribute('rotation', savedPose.rotation)
    this.savedPose = null
  },
})

const lookControls = AFRAME.components['touch-look-controls']

const lookControlsComponent = lookControls
lookControlsComponent.schema.initialYaw = {
  default: 0,
  parse(e) {
    return parseFloat(e)
  },
}
lookControlsComponent.schema.initialPitch = {
  default: 0,
  parse(e) {
    return parseFloat(e)
  },
}
