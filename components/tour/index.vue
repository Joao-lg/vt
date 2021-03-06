<template>
  <div class="vr-container" @wheel.prevent="handleScroll($event)">
    <div v-html="scene"></div>
  </div>
</template>

<script>
/* eslint-disable camelcase */
// import * as AFRAME  from 'aframe';
import * as THREE from 'three';
import { data } from '@/assets/json/locations.json'
import tiles from '@/assets/json/tiles.json'

export default {
  props: {
    loc: {
      type: String,
      required: false,
      default: () => '',
    },
  },

  data() {
    return {
      scene: this.renderScene(),
      sceneEl: null,
      currId: undefined,
      zoom: 1,
      x: undefined,
      y: undefined,
      linkClicked: 0,
      baby_laughing: false,
    }
  },

  watch: {
    currId(val) {
      const zone = Number(val)
      if (zone < 7) this.$emit('currentZone', 1)
      else if (zone === 16 || zone === 17 || zone === 37)
        this.$emit('currentZone', 3)
      else this.$emit('currentZone', 2)
    },

    loc(val) {
      const newLoc =
        data.filter((el) => el.slug === val) || []
      if (newLoc.length) {
        this.worker(newLoc[0].id)
        this.navigate(null, newLoc[0].id.toString())
      }
    },
  },

  mounted() {
    this.registerComponents()
    this.sceneEl = document.querySelector('a-scene')
    if (this.sceneEl.hasLoaded) {
      this.run()
      document.querySelector('.a-enter-vr').style.display = 'none'
    } else {
      this.sceneEl.addEventListener('loaded', (e) => {
        this.run()
        document.querySelector('.a-enter-vr').style.display = 'none'
      })
    }
  },

  methods: {
    handleScroll(data) {
      const camera = document.querySelector('a-camera')
      if (data.deltaY < 0 && this.zoom >= 1 && this.zoom < 3)
        camera.setAttribute('zoom', (this.zoom += 0.1))
      if (data.deltaY > 0 && this.zoom > 1 && this.zoom <= 3.1)
        camera.setAttribute('zoom', (this.zoom -= 0.1))
    },

    registerComponents() {
      try {
        // eslint-disable-next-line no-undef
        AFRAME.registerComponent('look-at', {
          schema: { type: 'vec3' },
          init() {
            this.el.object3D.lookAt(
              new THREE.Vector3(this.data.x, this.data.y, this.data.z)
            )
          },
        })
      } catch (e) {
        console.log(e)
      }
    },

    /* initDistanceComponent() {
      const camera = document.querySelector('a-camera')
      const points = document.querySelectorAll('a-image[data-location]')
      const camPosition = camera.object3D.position

      points.forEach((point) => {
        const pointPosition = point.object3D.position
        const distance = this.calculateDistance(camPosition, pointPosition)

        console.log({
          camPosition,
          pointPosition,
          distance,
        })
      })
    }, */

    calculateDistance(position1, position2) {
      return Math.sqrt(
        Math.pow(position1.x - position2.x, 2) +
          Math.pow(position1.y - position2.y, 2) +
          Math.pow(position1.z - position2.z, 2)
      )
    },

    run(currentLocation = false) {
      if (!currentLocation) currentLocation = data[0].id
      this.runNavigation(currentLocation)
      this.runInteraction(currentLocation)
    },

    runNavigation(currentLocation) {
      const navigationLinks = this.getNavigation(currentLocation)
      if (navigationLinks.length) {
        navigationLinks.forEach((link) => {
          const { id, aframeOptions } = link
          const pos = this.corrected({y: aframeOptions.position.y, z: aframeOptions.position.z})
          const position = this.polar3dToCartesian(pos.y, pos.z)
          const sphere = this.addSphere({
            locationId: id,
            radius: 1,
            position,
            currentLocation,
          })

          const assetsComp = document.querySelector('a-assets')
          const existingAssets = Array.from(assetsComp.children)
          const found = existingAssets.some(
            (el) => el.id === `location-${link.id}`
          )
          if (!found) {
            this.addInterdit({ position, id })
            const img = document.createElement('img')
            img.setAttribute('id', `${link.id}`)
            img.setAttribute(
              'data-src',
              `https://goxplora.fra1.digitaloceanspaces.com/esp${
                data[link.id - 1].background
              }`
            )
            assetsComp.append(img)

            const ImageLoaderWorker = new Worker(
              '/workers/image-loader.worker.js'
            )

            ImageLoaderWorker.addEventListener('message', (event) => {
              const imageData = event.data

              const imageElement = document.querySelectorAll(
                `img[data-src='${imageData.imageURL}']`
              )

              const objectURL = URL.createObjectURL(imageData.blob)

              imageElement[0].onload = () => {
                console.log('oi')
                const load = document.querySelector(`#load${id}`)
                if (load) load.remove()
                sphere.addEventListener('click', this.navigate)
                imageElement[0].removeAttribute('data-src')
                URL.revokeObjectURL(objectURL)
              }

              imageElement[0].setAttribute('src', objectURL)
            })

            const imageURL = img.getAttribute('data-src')
            ImageLoaderWorker.postMessage(imageURL)
          } else {
            sphere.addEventListener('click', this.navigate)
          }
        })
      }
    },

    worker(loc_id) {
      const assetsComp = document.querySelector('a-assets')
      const existingAssets = Array.from(assetsComp.children)
      const found = existingAssets.some((el) => el.id === `location-${loc_id}`)

      if (!found) {
        const img = document.createElement('img')
        img.setAttribute('id', `location-${loc_id}`)

        const index = data.map((el) => el.id).indexOf(loc_id)

        img.setAttribute(
          'data-src',
          `https://goxplora.fra1.digitaloceanspaces.com/esp${data[index].background}`
        )
        assetsComp.append(img)

        const ImageLoaderWorker = new Worker('/workers/image-loader.worker.js')

        const imageURL = img.getAttribute('data-src')
        ImageLoaderWorker.postMessage(imageURL)

        ImageLoaderWorker.addEventListener('message', (event) => {
          const imageData = event.data

          const imageElement = document.querySelectorAll(
            `img[data-src='${imageData.imageURL}']`
          )

          const objectURL = URL.createObjectURL(imageData.blob)

          imageElement[0].setAttribute('src', objectURL)

          imageElement[0].onload = () => {
            imageElement[0].removeAttribute('data-src')
            URL.revokeObjectURL(objectURL)
          }
        })
      }
    },

    runInteraction(currentLocation) {
      const interactionLinks = this.getInteractions(currentLocation)
      if (interactionLinks.length) {
        interactionLinks.forEach((link) => {
          const { id, aframeOptions } = link
          const pos = this.corrected({ y: aframeOptions.position.x, z: aframeOptions.position.z })
          const position = this.polar3dToCartesian(pos.y, pos.z)
          this.addPoint({
            id,
            position,
            type: link.type || '',
          })
        })
      }
    },

    navigate(e, id = false) {
      this.transition(() => {
        if (!id) {
          this.$emit(
            'mapUpdate',
            data.filter(
              (el) => el.id.toString() === e.target.dataset.location
            )[0]
          )
        }

        const locationId = id || e.target.dataset.location
        const image360 = document.querySelector('a-sky')

        const spheres = document.querySelectorAll('a-sphere')
        spheres.forEach((sphere) => sphere.remove())

        const images = document.querySelectorAll('a-image')
        images.forEach((image) => image.remove())

        const phases = document.querySelectorAll('[id^=phase-]')
        phases.forEach((phase) => phase.remove())

        const tiles = document.querySelectorAll('[id^=tile-]')
        tiles.forEach((tile) => tile.remove())

        const counters = document.querySelectorAll('[id^=counter-]')
        counters.forEach((counter) => counter.remove())

        const descriptions = document.querySelectorAll('[id^=description-]')
        descriptions.forEach((description) => description.remove())

        image360.setAttribute('src', `#location-${locationId}`)
        this.currId = locationId
        this.run(locationId)
        this.setInitialView(locationId)
      })
    },

    setInitialView(locationId) {
      const cameraTag = document.querySelector('a-camera')
      const [{ camera }] = data.filter(
        (location) => location.id === Number(locationId)
      )

      const z = Math.PI * 0.5 - camera.position.z
      const x = Math.PI * 0.1 - camera.position.x

      cameraTag.components['touch-look-controls'].change(x, z)
    },

    transition(cb) {
      const container = document.querySelector('.vr-container')
      const overlayNode = document.createElement('div')
      overlayNode.setAttribute('id', 'black-overlay')
      container.append(overlayNode)

      const fadeIn = () => {
        const overlay = document.querySelector('#black-overlay')
        overlay.style.opacity = Number(overlay.style.opacity) + 0.1

        if (overlay.style.opacity <= 1) {
          setTimeout(fadeIn, 30)
        } else {
          cb()
          fadeOut()
        }
      }

      const fadeOut = () => {
        const overlay = document.querySelector('#black-overlay')
        overlay.style.opacity = Number(overlay.style.opacity) - 0.1

        if (overlay.style.opacity > 0) {
          setTimeout(fadeOut, 30)
        } else {
          overlay.remove()
        }
      }

      fadeIn()
    },

    interact(e) {
      this.$emit('toPoint', tiles[e])
      this.linkClicked = 1
      setInterval(() => {
        this.linkClicked = 0
      }, 2000)
    },

    addPoint(options) {
      const { id, position } = options
      if (id === 'tiles') return this.semiCircle(tiles[id])
      // else if (id === 'phases') return this.phases(tiles[id])
      // else if (id.includes('_audio'))
      //   return this.transparentAudio(tiles[id], position)
      // else if (id.includes('counter'))
      //   return this.counter(
      //     tiles.counter.filter((el) =>
      //       el.name.includes(id.replace('counter-', ''))
      //     ),
      //     position
      //   )
      else {
        const plane = document.createElement('a-image')
        // console.log(plane)
        let icon

        switch (options.type) {
          case 'info':
            icon = '/icons/info_icon.png'
            break
          case 'audio':
            icon = '/icons/audio_poi.png'
            break
          case 'video':
            icon = '/icons/video_poi.png'
            break
          default:
            icon = '/icons/POI.png'
            break
        }
        const attributes = {
          position,
          material: `src: url(${icon})`,
          'look-at': { x: 0, y: 0, z: 0 },
          'data-site': id,
          scale: options.type === 'info' ? '0.7 0.7 0.7' : '1 1 1',
          width: 1,
          height: 1,
        }

        for (const key in attributes) {
          plane.setAttribute(key, attributes[key])
        }

        plane.addEventListener('mouseenter', (e) => {
          options.type === 'info'
            ? e.target.setAttribute('scale', '0.8 0.8 0.8')
            : e.target.setAttribute('scale', '1.1 1.1 1.1')

          this.sceneEl.children[3].style.cursor = 'pointer'
        })

        plane.addEventListener('mouseleave', (e) => {
          options.type === 'info'
            ? e.target.setAttribute('scale', '0.7 0.7 0.7')
            : e.target.setAttribute('scale', '1 1 1')

          this.sceneEl.children[3].style.cursor = 'grab'
        })

        plane.addEventListener(
          'click',
          (e) => {
            if (this.linkClicked === 0) {
              this.interact(id)
            } else this.linkClicked = 0
          },
          false
        )

        plane.addEventListener('materialtextureloaded', () => {
          // Small timeout just in case?
          setTimeout(() => {
            this.$emit('fullyLoaded')
          }, 500)
        })

        this.sceneEl.appendChild(plane)
        return plane
      }
    },

    addInterdit(options) {
      const { position, id } = options
      const load = document.createElement('a-image')
      const attributes = {
        position,
        geometry: 'primitive: circle',
        material: 'src: url(/icons/ld.png)',
        visible: true,
        'look-at': { x: 0, y: 0, z: 0 },
        scale: '0.5 0.5 0.5',
        rotation: '0 0 0',
        animation:
          'property: rotation; to: 0 0 -360; loop: true; dur: 1000; easing: linear;',
        id: `load${id}`,
      }

      for (const key in attributes) {
        load.setAttribute(key, attributes[key])
      }

      this.sceneEl.appendChild(load)
      return load
    },

    polar3dToCartesian(pitch, yaw, radius = 15) {
      return {
        x: radius * Math.sin(pitch) * Math.sin(yaw),
        y: radius * Math.cos(pitch),
        z: radius * Math.sin(pitch) * Math.cos(yaw),
      }
    },

    corrected(position) {
      return {
        y: Math.PI * 0.5 + position.y,
        z: -Math.PI * 0.5 - position.z,
      }
    },

    getNavigation(currentLocation) {
      const [{ navigationPoints }] = data.filter(
        (location) => location.id === Number(currentLocation)
      )
      return navigationPoints
    },

    getInteractions(currentLocation) {
      const [{ hotspots }] = data.filter(
        (location) => location.id === Number(currentLocation)
      )
      return hotspots
    },

    addSphere(options) {
      const { locationId, position } = options
      const sphere = document.createElement('a-image')

      const current = data.filter(
        (el) => el.id === Number(options.currentLocation)
      )[0]


      const newLocation = data.filter(
        (el) => el.id === options.locationId
      )[0]
      
      if(!newLocation) return false

      let attributes

      if (current.name === newLocation.name) {
        attributes = {
          position: { x: position.x, y: position.y - 2, z: position.z - 2 },
          geometry: 'primitive: circle',
          material: 'src: url(/icons/PON_lean.png)',
          visible: true,
          scale: '1.3 1.3 1.3',
          rotation: position.x > 0.5 ? '-110 0 0' : '-70 0 0',
          'data-location': locationId,
        }
      } else {
        attributes = {
          position,
          geometry: 'primitive: circle',
          material: 'src: url(/icons/pon.png)',
          visible: true,
          scale: '1.3 1.3 1.3',
          'look-at': { x: 0, y: 0, z: 0 },
          'data-location': locationId,
        }
      }

      for (const key in attributes) {
        sphere.setAttribute(key, attributes[key])
      }

      sphere.addEventListener('mouseenter', () => {
        sphere.setAttribute('scale', '1.4 1.4 1.4')
        this.sceneEl.children[3].style.cursor = 'pointer'
      })

      sphere.addEventListener('mouseleave', (e) => {
        sphere.setAttribute('scale', '1.3 1.3 1.3')
        this.sceneEl.children[3].style.cursor = 'grab'
      })

      if (current.name !== newLocation.name) {
        const img = document.createElement('a-image')

        const imgAttr = {
          geometry: 'primitive: circle',
          material: `src: url(https://goxplora.fra1.digitaloceanspaces.com/esp/360/previews/${locationId}-preview.jpg)`,
          visible: true,
          scale: '0.9 0.9 0.9',
          'look-at': { x: 0, y: 0, z: 0 },
          rotation: '0 0 0',
          'data-location': locationId,
        }

        for (const key in imgAttr) {
          img.setAttribute(key, imgAttr[key])
        }
        sphere.appendChild(img)
      }

      this.sceneEl.appendChild(sphere)
      return sphere
    },

    renderScene() {
      return `
            <a-scene
                loading-screen="dotsColor: white; backgroundColor: black"
            >
                ${this.renderFirstAssets()}
                ${this.render360Image()}
                ${this.renderCamera()}
            </a-scene>`
    },

    renderFirstAssets() {
      let assets = ''
      const locs = this.getNavigation(1)
      const firstAssets = []
      for (let i = 0; i < locs.length; i++) {
        const element = locs[i]
        data.forEach((loc) => {
          if (loc.id === element.location_id) {
            if (!firstAssets.includes(loc)) firstAssets.push(loc)
          }
        })
      }
      firstAssets.push(
        {
          id: data[0].id,
          background: data[0].backgroundImage,
        },
        {
          id: data[1].id,
          background: data[1].backgroundImage,
        }
      )

      for (let i = 0; i < firstAssets.length; i += 1) {
        assets += `
                    <img
                    id="location-${firstAssets[i].id}"
                    src="https://goxplora.fra1.digitaloceanspaces.com/esp${firstAssets[i].background}"
                    alt="360image"
                    />`
      }

      return `<a-assets>${assets}</a-assets>`
    },

    render360Image() {
      const [{ id }] = data
      this.currId = id
      return `
                <a-sky
                    src="#location-${id}"
                    rotation="0 0 0"
                ></a-sky>`
    },

    renderCamera() {
      const [{ camera }] = data
      return `
        <a-camera
            position="0 0 0"
            cursor="rayOrigin: mouse"
            wasd-controls-enabled="false"
            touch-look-controls="initialYaw:${
              Math.PI * 0.5 - camera.position.y
            }; initialPitch:${Math.PI * 0.1 - camera.position.x}"
            mouse
            camera
            zoom="1"
        >
        </a-camera>`
    },
  },
}
</script>

<style>
#black-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background: black;
  z-index: 1;
}
</style>
