import * as THREE from 'three';
import { CameraControls } from './camera-controls'; // Импортируем ваш класс управления

// Инициализация сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 50, 200);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Создаем объект управления камерой
const controls = new CameraControls(camera, renderer.domElement);

// Загрузка данных из JSON файла
async function loadMapData() {
  const response = await fetch('box-001.bsp.json');
  //const response = await fetch('Testmap.bsp.json');

  const data = await response.json();
  return data;
}

// Загрузка данных из JSON и рендеринг карты
async function loadAndRenderMap() {
  const data = await loadMapData();
  const { vertices, edges } = data;

  // Создание геометрии для рёбер
  const edgesArray: number[] = [];
  edges.forEach((edge: any) => {
    const v1 = vertices[edge.startVertex];
    const v2 = vertices[edge.endVertex];

    if (!v1 || !v2) {
      console.error(`Ошибка: не удалось найти вершины с индексами ${edge[0]} и ${edge[1]}`);
      return;
    }

    edgesArray.push(v1.x, v1.y, v1.z);
    edgesArray.push(v2.x, v2.y, v2.z);
  });

  // Создание буферной геометрии для линий
  const edgesGeometry = new THREE.BufferGeometry();
  const edgesLineArray = new Float32Array(edgesArray);
  edgesGeometry.setAttribute('position', new THREE.BufferAttribute(edgesLineArray, 3));

  // Создание материала и объекта для линий
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const edgesLine = new THREE.LineSegments(edgesGeometry, edgesMaterial);

  scene.add(edgesLine);


  // Запуск анимации
  animate();
}


// Анимация
let lastTime = 0;

function animate(time: number = 0) {
  const delta = (time - lastTime) / 1000; // Расчет времени между кадрами в секундах
  lastTime = time;

  controls.update(delta); // Обновляем позицию камеры через кастомный контроллер
  renderer.render(scene, camera); // Рендер сцены
  requestAnimationFrame(animate); // Запуск следующего кадра
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Загрузка и отрисовка карты
loadAndRenderMap();
