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
      console.log(navigationLinks)
      if (navigationLinks.length) {
        navigationLinks.forEach((link) => {
          const { location_id, yaw, pitch } = link
          const pos = this.corrected({ pitch, yaw })
          const position = this.polar3dToCartesian(pos.pitch, pos.yaw)
          const sphere = this.addSphere({
            locationId: location_id,
            radius: 1,
            position,
            currentLocation,
          })

          const assetsComp = document.querySelector('a-assets')
          const existingAssets = Array.from(assetsComp.children)
          const found = existingAssets.some(
            (el) => el.id === `location-${link.location_id}`
          )

          if (!found) {
            this.addInterdit({ position, location_id })
            const img = document.createElement('img')
            img.setAttribute('id', `location-${link.location_id}`)
            img.setAttribute(
              'data-src',
              `https://goxplora.fra1.digitaloceanspaces.com/esp${
                data[link.location_id - 1].background
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
                const load = document.querySelector(`#load${location_id}`)
                if (load) load.remove()
                sphere.addEventListener('click', this.navigate)
                imageElement[0].removeAttribute('data-src')
                URL.revokeObjectURL(objectURL)
              }

              imageElement[0].setAttribute('src', objectURL)
            })

            const imageURL = img.getAttribute('data-src')
            ImageLoaderWorker.postMessage(imageURL)
          } else sphere.addEventListener('click', this.navigate)
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
          const { site_id, yaw, pitch } = link
          const pos = this.corrected({ pitch, yaw })
          const position = this.polar3dToCartesian(pos.pitch, pos.yaw)
          this.addPoint({
            siteId: site_id,
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
      const camera = document.querySelector('a-camera')
      const [{ initialView }] = data.filter(
        (location) => location.id === Number(locationId)
      )

      const yaw = Math.PI * 0.5 - initialView.yaw
      const pitch = Math.PI * 0.1 - initialView.pitch

      camera.components['touch-look-controls'].change(pitch, yaw)
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
      const { siteId, position } = options

      if (siteId === 'tiles') return this.semiCircle(tiles[siteId])
      else if (siteId === 'phases') return this.phases(tiles[siteId])
      else if (siteId.includes('_audio'))
        return this.transparentAudio(tiles[siteId], position)
      else if (siteId.includes('counter'))
        return this.counter(
          tiles.counter.filter((el) =>
            el.name.includes(siteId.replace('counter-', ''))
          ),
          position
        )
      else {
        const plane = document.createElement('a-image')
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
          'data-site': siteId,
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
              this.interact(siteId)
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

    transparentAudio(site, position) {
      const plane = document.createElement('a-image')

      const attributes = {
        position,
        'look-at': { x: 0, y: 0, z: 0 },
        'data-site': site.name,
        scale: '1 1 1',
        width: 4,
        height: 4,
        visible: false,
      }
      for (const key in attributes) {
        plane.setAttribute(key, attributes[key])
      }

      plane.addEventListener('click', () => {
        if (!this.baby_laughing) {
          this.baby_laughing = true
          const listener = new THREE.AudioListener()

          const sound = new THREE.Audio(listener)

          const audioLoader = new THREE.AudioLoader()
          audioLoader.load(
            'https://goxplora.fra1.digitaloceanspaces.com/esp' + site.link,
            function (buffer) {
              sound.setBuffer(buffer)
              sound.setLoop(false)
              sound.setVolume(0.5)
              sound.play()
            }
          )
          setTimeout(() => {
            this.baby_laughing = false
          }, 3000)
        }
      })

      this.sceneEl.appendChild(plane)
      return plane
    },

    counter(info, position) {
      const plane = document.createElement('a-entity')
      const mainText = document.createElement('a-text')
      const secundaryText = document.createElement('a-text')

      const now = new Date()
      const then = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      )
      const diff = now.getTime() - then.getTime()
      const secconds = diff / 1000

      // each second equals around 5 lifes

      const lifes = secconds * 5

      const round = Math.round(lifes)
      const locale = round.toLocaleString()

      const textAttr = {
        position,
        value: locale,
        font: '/fonts/RedHat.fnt',
        fontImage: '/fonts/RedHat.png',
        rotation: '0 -5 0',
        'x-offset': -(locale.length / 1.55),
        width: 50,
        id: `counter-${info[0].name}`,
      }

      for (const key in textAttr) {
        mainText.setAttribute(key, textAttr[key])
      }

      let plus = 0
      setInterval(() => {
        const value = round + plus
        const newVal = value.toLocaleString()
        mainText.setAttribute('value', newVal)
        mainText.setAttribute('x-offset', -(newVal.length / 1.55))
        plus++
      }, info[0].interval)

      plane.appendChild(mainText)

      const secondTextAttr = {
        position: { x: position.x, y: position.y - 1.7, z: position.z },
        value: 'Mais um ser humano no mundo.',
        font: '/fonts/RedHat.fnt',
        fontImage: '/fonts/RedHat.png',
        rotation: '0 0 0',
        'x-offset': -(28 / 5.5),
        width: 15,
        id: `description-${info[0].name}`,
      }

      for (const key in secondTextAttr) {
        secundaryText.setAttribute(key, secondTextAttr[key])
      }

      plane.appendChild(secundaryText)

      this.sceneEl.appendChild(plane)
      return plane
    },

    addInterdit(options) {
      const { position, location_id } = options
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
        id: `load${location_id}`,
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
        pitch: Math.PI * 0.5 + position.pitch,
        yaw: -Math.PI * 0.5 - position.yaw,
      }
    },

    getNavigation(currentLocation) {
      const [{ navigation_links }] = data.filter(
        (location) => location.id === Number(currentLocation)
      )
      return navigation_links
    },

    getInteractions(currentLocation) {
      const [{ interaction_links }] = data.filter(
        (location) => location.id === Number(currentLocation)
      )
      return interaction_links
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
      console.log(locs)
      // for (let i = 0; i < locs.length; i++) {
      //   const element = locs[i]
      //   data.forEach((loc) => {
      //     if (loc.id === element.location_id) {
      //       if (!firstAssets.includes(loc)) firstAssets.push(loc)
      //     }
      //   })
      // }

      firstAssets.push(
        {
          id: 1,
          background: '/360/new/init.jpg',
        },
        {
          id: 3,
          background: '/360/new/grow.jpg',
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
      const [{ initialView }] = data
      console.log(initialView)
      // return `
      //           <a-camera
      //               position="0 0 0"
      //               cursor="rayOrigin: mouse"
      //               wasd-controls-enabled="false"
      //               touch-look-controls="initialYaw:${
      //                 Math.PI * 0.5 - initialView.yaw
      //               }; initialPitch:${Math.PI * 0.1 - initialView.pitch}"
      //               mouse
      //               camera
      //               zoom="1"
      //           >
      //           </a-camera>`
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
