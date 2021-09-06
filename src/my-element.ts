import { LitElement, html, customElement, property, css } from 'lit-element'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Lensflare, LensflareElement } from './Lensflare.js'

enum theme{
  dark,
  light
}

/**
 * The background element with the pencil
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('pencil-background')
export class PencilBackground extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      margin: 0;
      padding: 0;
    }
  `

  private scene =new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  private renderer = new THREE.WebGLRenderer()
  private controls = new OrbitControls(this.camera, this.renderer.domElement);
  public pencil: any

  constructor() {
    super()
    console.log('in ctor')

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Camera
    this.camera.position.set(0, 0, 15)

    // Objects
    // const material = new THREE.MeshStandardMaterial({ color: 0xff2222 })
    // const centerDot = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), material)
    // scene.add(centerDot)

    const loader = new GLTFLoader();
    loader.load( './src/assets/Pencil3.glb', gltf => {
      gltf.scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          this.pencil = new THREE.Mesh().copy(o)
        } 
      })
      this.pencil.geometry.center()
      this.pencil.rotateX(-Math.PI/2)

      // Rescale the object to normalized space
      this.pencil.scale.multiplyScalar(0.12)

      this.scene.add(this.pencil)
      console.log({ pencil: this.pencil })

    }, undefined, function ( error ) {
      console.error( error );
    })

    // Helpers
    // const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
    // scene.add( helper );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // Adding the Point Lights
    let lightCount = 30
    for (let i = 0; i < lightCount; i++) {
      // Random Color
      let randColor = Math.random() * 0xffffff
      let pointLight = new THREE.PointLight(randColor, Math.random() * 0.05)

      pointLight.position.y = i - lightCount / 2

      // Position spotLights in a circle around Center with distance 2 more than camera to center
      let randAngle = Math.random() * Math.PI * 2
      pointLight.position.x = Math.cos(randAngle) * (this.camera.position.z + 2)
      pointLight.position.z = Math.sin(randAngle) * (this.camera.position.z + 2)
      
      // Lensflare
      const textureLoader = new THREE.TextureLoader()
      const textureFlare0 = textureLoader.load( "./src/assets/lensflare0.png" )

      const lensflare = new Lensflare()
      lensflare.addElement( new LensflareElement( textureFlare0, 32, 0, new THREE.Color(randColor) ) )
      pointLight.add( lensflare )

      this.scene.add(pointLight)
    }
  }

  firstUpdated = () => {
    console.log('in firstUpdated')

    // resize background on window resize
    // window.addEventListener('resize', onWindowResize, false)
    // const onWindowResize = () => {
    //   this.camera.aspect = window.innerWidth / window.innerHeight
    //   this.camera.updateProjectionMatrix()
    //   this.renderer.setSize(window.innerWidth, window.innerHeight)
    //   this.renderer.render(this.scene, this.camera)
    // }

    let canvas = this.shadowRoot?.getElementById('threeDiv')
    canvas?.appendChild(this.renderer.domElement)
    this._animate(this.now)
  }

  /**
   * The theme which decieds the color n' stuff
   */
  @property({ type: theme })
  theme = theme.dark

  private moveStuff = (t: number) => {
    if (this.pencil) {
      const hover = (Math.sin(t * 0.0005));
      this.pencil.position.y = hover

      const rotationY = Math.sin(t * 0.0001) * 0.2
      const rotationX = Math.cos(t * 0.0001) * 0.2
      this.pencil.rotation.x = -Math.PI/2 + rotationX
      this.pencil.rotation.y = rotationY

      this.pencil.rotateZ(0.002)
    }
  }

  private framerate = 60
  private fpsint = 1000 / this.framerate
  private now = window.performance.now()
  private then = this.now

  private _animate = (newtime: number) => {
    this.controls.update()

    this.now = newtime;
    let elapsed = this.now - this.then

    if (!this.fpsint || elapsed > this.fpsint) {
      this.then = this.now - (elapsed % this.fpsint);
    }
    this.moveStuff(newtime);

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this._animate);
  }

  render = () => {
    console.log('in render')
    return html`
      <div id="threeDiv"></div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pencil-background': PencilBackground
  }
}