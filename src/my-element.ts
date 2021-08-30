import { LitElement, html, customElement, property, css } from 'lit-element'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('pencil-background')
export class PencilBackground extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      width: 100%;
      border: solid 1px gray;
      padding: 16px;
    }
  `

  private scene
  private camera
  private renderer

  constructor() {
    super()
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1000)
    this.camera.position.z = 30

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
    const torus = new THREE.Mesh(geometry, material);
    this.scene.add(torus);

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(-5, 5, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(pointLight, ambientLight);
  }

  firstUpdated() {
    let canvas = this.shadowRoot?.getElementById('threeCanvas')
    canvas?.appendChild(this.renderer.domElement)
    this._animate()
  }

  /**
   * The name to say "Hello" to.
   */
  @property()
  name = 'World'

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0

  private _animate() {
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this._animate);
  }

  render() {
    return html`
      <canvas id="threeCanvas"></canvas>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pencil-background': PencilBackground
  }
}
