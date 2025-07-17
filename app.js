import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
console.log('Hello');
// Scene setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5); // static camera

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const directionalLight = new THREE.DirectionalLight(0xffffff, 14);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Model setup
let model;
let basePosition = { x: 0, y: 0, z: 0 }; // Store the base position for hover effect
let time = 0; // Time variable for animation

const loader = new GLTFLoader();
loader.load('/Chithram/battle-armour_sonar_titan__virlance.glb', (gltf) => {
    model = gltf.scene;
    model.position.set(1, 1, 2);
    model.rotation.y = 74.525; // initial position
    basePosition = { x: 1, y: 1, z: 2 }; // Store initial position
    scene.add(model);
}, undefined, (error) => {
    console.error('GLB Load Error:', error);
});

// Section-based positions and rotations (keyframes)
const camStates = [
    {
        id: "Section1",
        position: { x: 1, y: 1, z: 2 },
        rotation: { x: 0, y: -50, z: 0 }
    },
    {
        id: "Section2",
        position: { x: -1, y: 1, z: 2 },
        rotation: { x: 0, y: 50, z: 0 }
    },
    {
        id: "Section3",
        position: { x: 0, y: 1, z: -1 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: "Section4",
        position: { x: 1, y: 1, z: 7 },
        rotation: { x: 10, y: -100, z: 10 }
    },
    {
        id: "Section5",
        position: { x: -1, y: -1, z: 5 },
        rotation: { x: 10, y: -100, z: 10 }
    },
    {
        id: "Section6",
        position: { x: -4, y: 1, z: -4 },
        rotation: { x: 1, y: 70, z: 0 }
    },
    {
        id: "Section7",
        position: { x: -1, y: 1, z: 7 },
        rotation: { x: 10, y: -100, z: 10 }
    },
    {
        id: "Section8",
        position: { x: -1, y: 1, z: 7 },
        rotation: { x: 10, y: -100, z: 10 }
    },
    {
        id: "Section9",
        position: { x: -1, y: 1, z: 7 },
        rotation: { x: 10, y: -100, z: 10 }
    },
    {
        id: "Section9",
        position: { x: -1, y: 1, z: 7 },
        rotation: { x: 10, y: -100, z: 10 }
    },
    {
        id: "Section9",
        position: { x: -1, y: 1, z: 7 },
        rotation: { x: 10, y: -100, z: 10 }
    }
    
];

const degToRad = deg => deg * (Math.PI / 180);

// Linear interpolation function
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Interpolate between two states
function interpolateStates(state1, state2, t) {
    return {
        position: {
            x: lerp(state1.position.x, state2.position.x, t),
            y: lerp(state1.position.y, state2.position.y, t),
            z: lerp(state1.position.z, state2.position.z, t)
        },
        rotation: {
            x: lerp(state1.rotation.x, state2.rotation.x, t),
            y: lerp(state1.rotation.y, state2.rotation.y, t),
            z: lerp(state1.rotation.z, state2.rotation.z, t)
        }
    };
}

// Smooth easing function (ease-in-out)
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Animate model based on continuous scroll position
function handleModelTransition() {
    if (!model) return;

    const sections = document.querySelectorAll('.section');
    if (sections.length === 0) return;

    // Calculate total scrollable height
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);

    // Calculate which section range we're in
    const sectionProgress = scrollProgress * (camStates.length - 1);
    const currentSectionIndex = Math.floor(sectionProgress);
    const nextSectionIndex = Math.min(currentSectionIndex + 1, camStates.length - 1);
    
    // Calculate interpolation factor within the current section
    let t = sectionProgress - currentSectionIndex;
    
    // Apply easing
    t = easeInOutCubic(t);

    // Get the interpolated state
    const currentState = camStates[currentSectionIndex];
    const nextState = camStates[nextSectionIndex];
    const interpolatedState = interpolateStates(currentState, nextState, t);

    // Store base position for hover effect
    basePosition = {
        x: interpolatedState.position.x,
        y: interpolatedState.position.y,
        z: interpolatedState.position.z
    };

    // Apply hover effect (subtle floating and gentle rotation)
    const hoverOffsetY = Math.sin(time * 0.002) * 0.05; // Gentle up-down movement
    const hoverOffsetX = Math.cos(time * 0.0015) * 0.02; // Subtle side-to-side sway
    const hoverRotationY = Math.sin(time * 0.001) * 0.02; // Very gentle Y-axis rotation

    // Apply the interpolated values with hover effect
    model.position.set(
        basePosition.x + hoverOffsetX,
        basePosition.y + hoverOffsetY,
        basePosition.z
    );

    model.rotation.set(
        degToRad(interpolatedState.rotation.x),
        degToRad(interpolatedState.rotation.y) + hoverRotationY,
        degToRad(interpolatedState.rotation.z)
    );
}

// Use throttling for better performance
let ticking = false;
function requestTick() {
    if (!ticking) {
        requestAnimationFrame(() => {
            handleModelTransition();
            ticking = false;
        });
        ticking = true;
    }
}

// Listen to scroll with throttling
window.addEventListener('scroll', requestTick);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    time += 16; // Increment time (roughly 60fps)
    requestAnimationFrame(animate);
    handleModelTransition(); // Update model position with hover effect
    renderer.render(scene, camera);
}
animate();
/*------------Scroll Visibility---------*/
// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px', // Trigger when 10% of element is visible
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, observerOptions);

// Observe all sections
const sections = document.querySelectorAll('.section, .section3');
sections.forEach(section => {
    observer.observe(section);
});

// Make the first section visible by default
window.addEventListener('load', () => {
    const firstSection = document.querySelector('#Section1');
    if (firstSection) {
        firstSection.classList.add('in-view');
    }
});
/*---------Home Movie Posters-------------*/
document.querySelectorAll('.movie-poster').forEach(poster => {
            poster.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) rotate(2deg)';
            });
            
            poster.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });
        });

/*-----------Map Section--------------*/
function openModal() {
            const modal = document.getElementById('modal');
            const loading = document.getElementById('modalLoading');
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show loading animation initially
            loading.style.display = 'block';
            
            // Hide loading after animation completes
            setTimeout(() => {
                loading.style.display = 'none';
            }, 800);
        }

        function closeModal(event) {
            if (event && event.target !== event.currentTarget && !event.target.classList.contains('close-btn')) {
                return;
            }
            
            const modal = document.getElementById('modal');
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        window.closeModal = closeModal;
        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        // Enhanced function to add SVG content with fade-in effect
        function addSVGContent(svgContent) {
            const container = document.getElementById('svgContainer');
            container.style.opacity = '0';
            container.innerHTML = svgContent;
            
            setTimeout(() => {
                container.style.transition = 'opacity 0.5s ease';
                container.style.opacity = '1';
            }, 100);
        }
        window.addSVGContent =addSVGContent;
        window.openModal = openModal;
        function initializeTitleDisplay() {
            const titleDisplay = document.getElementById('titleDisplay');
            const svgPaths = document.querySelectorAll('#svgContainer svg path');
            
            svgPaths.forEach(path => {
                // Get title from title tag within the path
                const titleElement = path.querySelector('title');
                const titleText = titleElement ? titleElement.textContent.trim() : '';
                
                if (titleText) {
                    // Mouse enter event
                    path.addEventListener('mouseenter', function(e) {
                        titleDisplay.textContent = titleText;
                        titleDisplay.setAttribute('data-title', titleText);
                        titleDisplay.classList.add('active');
                    });
                    
                    // Mouse leave event
                    path.addEventListener('mouseleave', function(e) {
                        titleDisplay.classList.remove('active');
                        setTimeout(() => {
                            if (!titleDisplay.classList.contains('active')) {
                                titleDisplay.textContent = '';
                            }
                        }, 300);
                    });
                }
            });
        }
        window.initializeTitleDisplay = initializeTitleDisplay;
//Footer and Buttons above it
function handleQuiz() {
            window.location.href='quiz/index.html';
            
        }

        function handleTrivia() {
            window.location.href='trivia/index.html';
        }

        function handleImages() {
            alert('Images gallery coming soon!');
            // Add your images logic here
        }

        // Add smooth hover effects
        document.querySelectorAll('.interactive-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        window.handleQuiz = handleQuiz;
        window.handleTrivia = handleTrivia;
        window.handleImages = handleImages;

/*-------Main Script----------*/
var tel = document.getElementById("INTG");
var and = document.getElementById("INAP");
var arp = document.getElementById("INAR");
var ass = document.getElementById("INAS");
var bhr = document.getElementById("INBR");
var chg = document.getElementById("INCH");
var cht = document.getElementById("INCT");
var dli = document.getElementById("INDL");
var goa = document.getElementById("INGA");
var gjt = document.getElementById("INGJ");
var hry = document.getElementById("INHR");
var hmp = document.getElementById("INHP");
var jhk = document.getElementById("INJH");
var ktk = document.getElementById("INKA");
var krl = document.getElementById("INKL");
var mdp = document.getElementById("INMP");
var mhr = document.getElementById("INMH");
var mnp = document.getElementById("INMN");
var mgl = document.getElementById("INML");
var mzm = document.getElementById("INMZ");
var ngl = document.getElementById("INNL");
var ors = document.getElementById("INOR");
var pdy = document.getElementById("INPY");
var pjb = document.getElementById("INPB");
var rjs = document.getElementById("INRJ");
var skm = document.getElementById("INSK");
var tml = document.getElementById("INTN");
var trp = document.getElementById("INTR");
var utp = document.getElementById("INUP");
var utc = document.getElementById("INUT");
var wbl = document.getElementById("INWB");
var lkd = document.getElementById("INLD");
var jak = document.getElementById("INJK");
var ldk = document.getElementById("INLA");
var ann = document.getElementById("INAN");
var dnd = document.getElementById("INDH");

tel.onclick = function () {
  const inputValue = "Telangana";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Telangana");
};

and.onclick = function () {
  const inputValue = "Andhra-Pradesh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Andhra Pradesh");
};
arp.onclick = function () {
  const inputValue = "Arunachal-Pradesh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Arunachal Pradesh");
};
ass.onclick = function () {
  const inputValue = "Assam";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Assam");
};
bhr.onclick = function () {
  const inputValue = "bihar";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Bihar");
};
chg.onclick = function () {
  const inputValue = "Chandigarh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Chandigarh");
};
cht.onclick = function () {
  const inputValue = "Chhattisgarh ";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Chhattisgarh ");
};
dli.onclick = function () {
  const inputValue = "Delhi";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Delhi");
};
goa.onclick = function () {
  const inputValue = "goa";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Goa");
};
gjt.onclick = function () {
  const inputValue = "Gujarat";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Gujarat");
};
hry.onclick = function () {
  const inputValue = "Haryana";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Haryana");
};
hmp.onclick = function () {
  const inputValue = "Himachal-Pradesh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Himachal Pradesh");
};
jhk.onclick = function () {
  const inputValue = "Jharkhand";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Jharkhand");
};
ktk.onclick = function () {
  const inputValue = "Karnataka";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Karnataka");
};
krl.onclick = function () {
  const inputValue = "Kerala";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Kerala");
};
mdp.onclick = function () {
  const inputValue = "Madhya-Pradesh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Madhya Pradesh");
};
mhr.onclick = function () {
  const inputValue = "Maharastra";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Maharashtra");
};
mnp.onclick = function () {
  const inputValue = "Manipur";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Manipur");
};
mgl.onclick = function () {
  const inputValue = "Meghalaya";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Meghalaya");
};
mzm.onclick = function () {
  const inputValue = "Mizoram";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Mizoram");
};
ngl.onclick = function () {
  const inputValue = "Nagaland";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Nagaland");
};
ors.onclick = function () {
  const inputValue = "Orissa";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Orissa");
};
pdy.onclick = function () {
  const inputValue = "Puducherry";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Puducherry");
};
pjb.onclick = function () {
  const inputValue = "Punjab";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Punjab");
};
rjs.onclick = function () {
  const inputValue = "Rajasthan";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Rajasthan");
};
skm.onclick = function () {
  const inputValue = "sikkim";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Sikkim");
};
tml.onclick = function () {
  const inputValue = "Tamil-Nadu";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Tamil Nadu");
};
trp.onclick = function () {
  const inputValue = "Tripura";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Tripura");
};
utp.onclick = function () {
  const inputValue = "uttar-pradesh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Uttar Pradesh");
};
utc.onclick = function () {
  const inputValue = "Uttaranchal";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Uttaranchal");
};
wbl.onclick = function () {
  const inputValue = "West-Bengal";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("West Bengal");
};
lkd.onclick = function () {
  const inputValue = "Lakshadweep";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Lakshadweep");
};
jak.onclick = function () {
  const inputValue = "jammu-and-kashmir";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Jammu and Kashmir");
};
ldk.onclick = function () {
  const inputValue = "ladakh";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Ladakh");
};
ann.onclick = function () {
  const inputValue = "Andaman-and-Nicobar";
  const url = `Carousel/carousel.html?input=${encodeURIComponent(inputValue)}`;
  window.open(url, "_blank");
  console.log("Andaman and Nicobar");
};
/*---------Chatbot-------*/

