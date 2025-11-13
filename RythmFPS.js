import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, RotateCcw, MousePointer2 } from 'lucide-react';
import GameHUD from '../components/game/GameHUD';
import StartScreen from '../components/game/StartScreen';
import GameOverScreen from '../components/game/GameOverScreen';
import PauseMenu from '../components/game/PauseMenu';

export default function RhythmFPS() {
  const mountRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [muted, setMuted] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState('normal');
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundPhase, setRoundPhase] = useState('wave');
  const [enemiesInRound, setEnemiesInRound] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    enemies: [],
    bullets: [],
    powerUps: [],
    audioContext: null,
    analyser: null,
    musicNodes: [],
    lastBeatTime: 0,
    lastPowerUpSpawn: 0,
    playerPosition: new THREE.Vector3(0, 0, 5),
    playerVelocity: new THREE.Vector3(0, 0, 0),
    cameraRotation: { yaw: 0, pitch: 0 },
    keys: {},
    mouseMovement: { x: 0, y: 0 },
    isGrounded: true,
    verticalVelocity: 0,
    rapidFire: false,
    speedBoost: false,
    shield: false,
    roundEnemiesSpawned: 0,
    bossSpawned: false,
    startTime: 0,
    beatInterval: null,
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.copy(gameRef.current.playerPosition);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x6b46c1, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Grid floor
    const gridHelper = new THREE.GridHelper(100, 50, 0xff00ff, 0x00ffff);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    gameRef.current = {
      ...gameRef.current,
      scene,
      camera,
      renderer,
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = true;
      
      // Jump with space
      if (e.key === ' ' && gameRef.current.isGrounded && gameState === 'playing') {
        gameRef.current.verticalVelocity = 8;
        gameRef.current.isGrounded = false;
      }

      // Pause with Escape
      if (e.key === 'Escape' && gameState === 'playing') {
        handlePause();
      }
    };

    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse controls
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === renderer.domElement) {
        gameRef.current.mouseMovement.x = e.movementX || 0;
        gameRef.current.mouseMovement.y = e.movementY || 0;
      }
    };

    const handleClick = () => {
      if (gameState !== 'playing') return;
      
      if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
      } else {
        shootBullet();
      }
    };

    const handlePointerLockChange = () => {
      setPointerLocked(document.pointerLockElement === renderer.domElement);
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    // Touch controls for mobile
    const handleTouchStart = (event) => {
      if (gameState !== 'playing') return;
      event.preventDefault();
      shootBullet();
    };

    renderer.domElement.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      stopMusic();
    };
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationId;
    const clock = new THREE.Clock();
    let lastTimeUpdate = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Update timer
      if (time - lastTimeUpdate >= 1) {
        setSurvivalTime(Math.floor(time - gameRef.current.startTime));
        lastTimeUpdate = time;
      }

      const { 
        scene, 
        camera, 
        renderer, 
        enemies, 
        bullets,
        powerUps,
        analyser,
        keys,
        mouseMovement,
        cameraRotation,
        playerPosition,
        playerVelocity
      } = gameRef.current;

      // Mouse look controls
      if (document.pointerLockElement === renderer.domElement) {
        cameraRotation.yaw -= mouseMovement.x * 0.002;
        cameraRotation.pitch -= mouseMovement.y * 0.002;
        cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.pitch));
        
        mouseMovement.x = 0;
        mouseMovement.y = 0;
      }

      // Apply camera rotation
      camera.rotation.order = 'YXZ';
      camera.rotation.y = cameraRotation.yaw;
      camera.rotation.x = cameraRotation.pitch;

      // WASD movement
      const moveSpeed = gameRef.current.speedBoost ? 15 : 10;
      const forward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);
      
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      playerVelocity.set(0, 0, 0);

      if (keys['w']) playerVelocity.add(forward.multiplyScalar(moveSpeed * delta));
      if (keys['s']) playerVelocity.add(forward.multiplyScalar(-moveSpeed * delta));
      if (keys['a']) playerVelocity.add(right.multiplyScalar(-moveSpeed * delta));
      if (keys['d']) playerVelocity.add(right.multiplyScalar(moveSpeed * delta));

      // Gravity and jumping
      const gravity = -20;
      const groundLevel = 0;
      
      gameRef.current.verticalVelocity += gravity * delta;
      playerPosition.y += gameRef.current.verticalVelocity * delta;

      if (playerPosition.y <= groundLevel) {
        playerPosition.y = groundLevel;
        gameRef.current.verticalVelocity = 0;
        gameRef.current.isGrounded = true;
      }

      playerPosition.add(playerVelocity);
      camera.position.copy(playerPosition);

      // Get difficulty settings
      const difficultySettings = getDifficultySettings();

      // Round management
      if (roundPhase === 'wave') {
        const totalEnemiesForRound = 10 + (currentRound * 5) + (level * 3);
        
        if (gameRef.current.roundEnemiesSpawned < totalEnemiesForRound) {
          // Audio analysis for beat detection
          if (analyser) {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            const bass = dataArray.slice(0, 40).reduce((a, b) => a + b) / 40;
            
            // Pulse enemies with music
            enemies.forEach(enemy => {
              if (enemy.mesh && !enemy.isBoss) {
                const scale = enemy.baseScale + (bass / 255) * 0.3;
                enemy.mesh.scale.set(scale, scale, scale);
              }
            });
          }

          // Spawn power-ups occasionally
          if (time - gameRef.current.lastPowerUpSpawn > 15) {
            gameRef.current.lastPowerUpSpawn = time;
            spawnPowerUp();
          }
        } else if (enemies.length === 0) {
          // Wave complete, spawn boss
          setRoundPhase('boss');
          gameRef.current.bossSpawned = false;
        }
      } else if (roundPhase === 'boss' && !gameRef.current.bossSpawned) {
        spawnBoss();
        gameRef.current.bossSpawned = true;
      } else if (roundPhase === 'boss' && enemies.length === 0 && gameRef.current.bossSpawned) {
        // Boss defeated, round complete
        setRoundPhase('complete');
        setTimeout(() => {
          startNextRound();
        }, 2000);
      }

      // Update enemies - move towards player
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Direction towards player
        const direction = new THREE.Vector3();
        direction.subVectors(playerPosition, enemy.mesh.position);
        direction.normalize();
        
        enemy.mesh.position.add(direction.multiplyScalar(enemy.speed * delta));
        enemy.mesh.rotation.x += delta * enemy.rotationSpeed;
        enemy.mesh.rotation.y += delta * 0.5 * enemy.rotationSpeed;

        // Enemy reached player
        const distanceToPlayer = enemy.mesh.position.distanceTo(playerPosition);
        if (distanceToPlayer < (enemy.size + 1.5)) {
          scene.remove(enemy.mesh);
          enemies.splice(i, 1);
          
          if (gameRef.current.shield) {
            // Shield absorbs damage
            gameRef.current.shield = false;
            setActivePowerUps(prev => prev.filter(p => p.type !== 'shield'));
          } else {
            setHealth(h => Math.max(0, h - enemy.damage));
            setCombo(0);
          }
        }
      }

      // Update power-ups
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.mesh.rotation.y += delta * 2;
        powerUp.mesh.position.y = powerUp.baseY + Math.sin(time * 2 + i) * 0.3;

        const distanceToPowerUp = powerUp.mesh.position.distanceTo(playerPosition);
        if (distanceToPowerUp < 2) {
          collectPowerUp(powerUp);
          scene.remove(powerUp.mesh);
          powerUps.splice(i, 1);
        }
      }

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(delta * 30));

        // Remove bullets that are too far
        if (bullet.position.distanceTo(playerPosition) > 100) {
          scene.remove(bullet);
          bullets.splice(i, 1);
        }
      }

      // Check collisions
      checkCollisions();

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, difficulty, currentRound, roundPhase, level]);

  // Check health
  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
      setGameState('gameover');
      stopMusic();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  }, [health, gameState]);

  const getDifficultySettings = () => {
    const settings = {
      easy: { spawnInterval: 0.6, enemySpeed: 2, enemyHealth: 1 },
      normal: { spawnInterval: 0.45, enemySpeed: 3.5, enemyHealth: 1 },
      hard: { spawnInterval: 0.3, enemySpeed: 5, enemyHealth: 2 },
    };
    return settings[difficulty];
  };

  const getEnemyType = (type) => {
    const types = {
      small: { size: 0.3, health: 1, speed: 5, damage: 5, color: 0x00ffff, points: 50 },
      normal: { size: 0.5, health: 1, speed: 3.5, damage: 10, color: 0xff00ff, points: 100 },
      large: { size: 0.8, health: 3, speed: 2, damage: 15, color: 0xff0080, points: 200 },
      boss: { size: 2, health: 20 + (level * 5), speed: 1.5, damage: 25, color: 0xff0000, points: 1000 },
    };
    return types[type] || types.normal;
  };

  const spawnEnemy = (type = 'normal') => {
    const { scene, enemies, playerPosition } = gameRef.current;
    const difficultySettings = getDifficultySettings();
    
    // Random enemy type for variety
    if (type === 'normal' && Math.random() > 0.7) {
      type = Math.random() > 0.5 ? 'small' : 'large';
    }
    
    const enemyType = getEnemyType(type);
    
    const geometry = new THREE.OctahedronGeometry(enemyType.size);
    const material = new THREE.MeshStandardMaterial({
      color: enemyType.color,
      emissive: enemyType.color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Spawn in a circle around the player at random distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 20;
    const height = (Math.random() - 0.5) * 8;
    
    mesh.position.set(
      playerPosition.x + Math.cos(angle) * distance,
      playerPosition.y + height,
      playerPosition.z + Math.sin(angle) * distance
    );

    const enemy = {
      mesh,
      speed: enemyType.speed * (difficultySettings.enemySpeed / 3.5),
      health: enemyType.health * difficultySettings.enemyHealth,
      maxHealth: enemyType.health * difficultySettings.enemyHealth,
      damage: enemyType.damage,
      size: enemyType.size,
      points: enemyType.points,
      type,
      isBoss: false,
      baseScale: 1,
      rotationSpeed: 1,
    };

    scene.add(mesh);
    enemies.push(enemy);
  };

  const spawnBoss = () => {
    const { scene, enemies, playerPosition } = gameRef.current;
    const enemyType = getEnemyType('boss');
    
    const geometry = new THREE.DodecahedronGeometry(enemyType.size);
    const material = new THREE.MeshStandardMaterial({
      color: enemyType.color,
      emissive: enemyType.color,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Spawn boss in front of player
    mesh.position.set(
      playerPosition.x,
      playerPosition.y + 3,
      playerPosition.z - 25
    );

    const enemy = {
      mesh,
      speed: enemyType.speed,
      health: enemyType.health,
      maxHealth: enemyType.health,
      damage: enemyType.damage,
      size: enemyType.size,
      points: enemyType.points,
      type: 'boss',
      isBoss: true,
      baseScale: 1,
      rotationSpeed: 0.5,
    };

    scene.add(mesh);
    enemies.push(enemy);
  };

  const spawnPowerUp = () => {
    const { scene, powerUps, playerPosition } = gameRef.current;
    
    const powerUpTypes = [
      { type: 'health', color: 0x00ff00, emissive: 0x00ff00 },
      { type: 'speed', color: 0x00ffff, emissive: 0x00ffff },
      { type: 'rapidfire', color: 0xffff00, emissive: 0xffff00 },
      { type: 'shield', color: 0x0080ff, emissive: 0x0080ff },
    ];

    const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    const material = new THREE.MeshStandardMaterial({
      color: powerUpType.color,
      emissive: powerUpType.emissive,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Spawn at random location near player
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 10;
    
    mesh.position.set(
      playerPosition.x + Math.cos(angle) * distance,
      1,
      playerPosition.z + Math.sin(angle) * distance
    );

    const powerUp = {
      mesh,
      type: powerUpType.type,
      baseY: 1,
    };

    scene.add(mesh);
    powerUps.push(powerUp);
  };

  const collectPowerUp = (powerUp) => {
    switch (powerUp.type) {
      case 'health':
        setHealth(h => Math.min(100, h + 25));
        break;
      case 'speed':
        gameRef.current.speedBoost = true;
        setActivePowerUps(prev => [...prev.filter(p => p.type !== 'speed'), { type: 'speed', name: 'Speed Boost' }]);
        setTimeout(() => {
          gameRef.current.speedBoost = false;
          setActivePowerUps(prev => prev.filter(p => p.type !== 'speed'));
        }, 10000);
        break;
      case 'rapidfire':
        gameRef.current.rapidFire = true;
        setActivePowerUps(prev => [...prev.filter(p => p.type !== 'rapidfire'), { type: 'rapidfire', name: 'Rapid Fire' }]);
        setTimeout(() => {
          gameRef.current.rapidFire = false;
          setActivePowerUps(prev => prev.filter(p => p.type !== 'rapidfire'));
        }, 10000);
        break;
      case 'shield':
        gameRef.current.shield = true;
        setActivePowerUps(prev => [...prev.filter(p => p.type !== 'shield'), { type: 'shield', name: 'Shield' }]);
        break;
    }
  };

  const shootBullet = () => {
    const { scene, camera, bullets, playerPosition } = gameRef.current;

    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1,
    });

    const bullet = new THREE.Mesh(geometry, material);
    bullet.position.copy(camera.position);

    // Shoot in the direction the camera is facing
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    direction.normalize();

    bullet.userData.velocity = direction;

    scene.add(bullet);
    bullets.push(bullet);

    // Play shoot sound
    playShootSound();
  };

  const checkCollisions = () => {
    const { scene, enemies, bullets } = gameRef.current;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];

      for (let j = bullets.length - 1; j >= 0; j--) {
        const bullet = bullets[j];

        const distance = enemy.mesh.position.distanceTo(bullet.position);

        if (distance < (enemy.size + 0.3)) {
          // Hit!
          enemy.health -= 1;
          
          scene.remove(bullet);
          bullets.splice(j, 1);

          if (enemy.health <= 0) {
            createExplosion(enemy.mesh.position);
            scene.remove(enemy.mesh);
            enemies.splice(i, 1);

            setCombo(c => c + 1);
            setScore(s => s + (enemy.points * (1 + combo * 0.1) * level));
            setEnemiesKilled(k => k + 1);
          } else if (enemy.isBoss) {
            // Boss flash when hit
            enemy.mesh.material.emissiveIntensity = 2;
            setTimeout(() => {
              if (enemy.mesh) enemy.mesh.material.emissiveIntensity = 0.8;
            }, 100);
          }
          
          break;
        }
      }
    }
  };

  const createExplosion = (position) => {
    const { scene } = gameRef.current;

    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.05);
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff00ff : 0x00ffff,
      });
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.copy(position);
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );

      scene.add(particle);

      setTimeout(() => {
        scene.remove(particle);
      }, 500);
    }
  };

  const startNextRound = () => {
    setCurrentRound(r => r + 1);
    setRoundPhase('wave');
    gameRef.current.roundEnemiesSpawned = 0;
    gameRef.current.bossSpawned = false;
  };

  const handlePause = () => {
    setGameState('paused');
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  };

  const handleResume = () => {
    setGameState('playing');
  };

  const handleGoHome = () => {
    setGameState('start');
    stopMusic();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  };

  const startGame = (selectedLevel, selectedDifficulty) => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setCombo(0);
    setLevel(selectedLevel);
    setDifficulty(selectedDifficulty);
    setActivePowerUps([]);
    setCurrentRound(1);
    setRoundPhase('wave');
    setEnemiesKilled(0);
    setSurvivalTime(0);
    
    // Reset player position and rotation
    gameRef.current.playerPosition.set(0, 0, 5);
    gameRef.current.cameraRotation = { yaw: 0, pitch: 0 };
    gameRef.current.isGrounded = true;
    gameRef.current.verticalVelocity = 0;
    gameRef.current.rapidFire = false;
    gameRef.current.speedBoost = false;
    gameRef.current.shield = false;
    gameRef.current.roundEnemiesSpawned = 0;
    gameRef.current.bossSpawned = false;
    gameRef.current.startTime = 0;
    
    // Clear enemies, bullets, and power-ups
    const { scene, enemies, bullets, powerUps, camera } = gameRef.current;
    enemies.forEach(e => scene.remove(e.mesh));
    bullets.forEach(b => scene.remove(b));
    powerUps.forEach(p => scene.remove(p.mesh));
    gameRef.current.enemies = [];
    gameRef.current.bullets = [];
    gameRef.current.powerUps = [];
    
    camera.position.copy(gameRef.current.playerPosition);

    startMusic();
  };

  const startMusic = () => {
    if (muted) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    masterGain.connect(analyser);
    analyser.connect(audioContext.destination);

    const musicNodes = [];

    // Bass drum (kick) - plays on beat
    const createKick = (time) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(time);
      osc.stop(time + 0.5);
    };

    // Hi-hat
    const createHiHat = (time) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, time);
      
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(time);
      osc.stop(time + 0.1);
    };

    // Synth bass line
    const bassOsc = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    const bassFilter = audioContext.createBiquadFilter();
    
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, audioContext.currentTime);
    
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(300, audioContext.currentTime);
    bassFilter.Q.setValueAtTime(5, audioContext.currentTime);
    
    bassGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    
    bassOsc.start();
    musicNodes.push(bassOsc);

    // Synth melody
    const synthOsc = audioContext.createOscillator();
    const synthGain = audioContext.createGain();
    const synthFilter = audioContext.createBiquadFilter();
    
    synthOsc.type = 'square';
    synthOsc.frequency.setValueAtTime(440, audioContext.currentTime);
    
    synthFilter.type = 'lowpass';
    synthFilter.frequency.setValueAtTime(1200, audioContext.currentTime);
    
    synthGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    
    synthOsc.connect(synthFilter);
    synthFilter.connect(synthGain);
    synthGain.connect(masterGain);
    
    synthOsc.start();
    musicNodes.push(synthOsc);

    // Pattern sequencer
    const bpm = 128;
    const beatTime = 60 / bpm;
    let beatCount = 0;

    const difficultySettings = getDifficultySettings();

    const scheduleBeat = () => {
      const time = audioContext.currentTime;
      
      // Kick on every beat
      createKick(time);
      
      // Hi-hat on offbeats
      if (beatCount % 2 === 1) {
        createHiHat(time);
      }

      // Bass line pattern
      const bassNotes = [55, 55, 65, 55];
      bassOsc.frequency.setValueAtTime(bassNotes[beatCount % 4], time);

      // Synth melody pattern
      const synthNotes = [440, 523, 587, 659, 523, 440, 392, 440];
      synthOsc.frequency.setValueAtTime(synthNotes[beatCount % 8], time);

      // Spawn enemy on beat
      if (roundPhase === 'wave' && gameRef.current.roundEnemiesSpawned < (10 + (currentRound * 5) + (level * 3))) {
        if (beatCount % Math.max(1, Math.floor(2 / (difficultySettings.spawnInterval / 0.3))) === 0) {
          spawnEnemy('normal');
          gameRef.current.roundEnemiesSpawned++;
        }
      }

      beatCount++;
    };

    // Schedule beats
    const beatInterval = setInterval(scheduleBeat, beatTime * 1000);
    gameRef.current.beatInterval = beatInterval;

    gameRef.current.audioContext = audioContext;
    gameRef.current.analyser = analyser;
    gameRef.current.musicNodes = musicNodes;
    gameRef.current.startTime = audioContext.currentTime;
  };

  const stopMusic = () => {
    if (gameRef.current.beatInterval) {
      clearInterval(gameRef.current.beatInterval);
      gameRef.current.beatInterval = null;
    }
    
    if (gameRef.current.musicNodes) {
      gameRef.current.musicNodes.forEach(node => {
        try {
          node.stop();
        } catch (e) {
          // Already stopped
        }
      });
      gameRef.current.musicNodes = [];
    }
    
    if (gameRef.current.audioContext) {
      gameRef.current.audioContext.close();
      gameRef.current.audioContext = null;
    }
  };

  const playShootSound = () => {
    if (muted) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const restartGame = () => {
    setGameState('start');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {gameState === 'start' && <StartScreen onStart={startGame} />}
      
      {gameState === 'playing' && (
        <>
          <GameHUD 
            score={score} 
            health={health} 
            combo={combo} 
            level={level}
            activePowerUps={activePowerUps}
            currentRound={currentRound}
            roundPhase={roundPhase}
            survivalTime={survivalTime}
            onPause={handlePause}
            onHome={handleGoHome}
            muted={muted}
            onToggleMute={() => setMuted(!muted)}
          />

          {!pointerLocked && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                <MousePointer2 className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">Click to Start</p>
                <p className="text-white/60 text-sm">Use mouse to look around</p>
                <p className="text-white/60 text-sm">WASD to move • Space to jump • Click to shoot</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm z-10 text-center">
            <p>WASD: Move • Space: Jump • Mouse: Look • Click: Shoot • ESC: Pause</p>
          </div>
        </>
      )}

      {gameState === 'paused' && (
        <PauseMenu onResume={handleResume} onHome={handleGoHome} />
      )}
      
      {gameState === 'gameover' && (
        <GameOverScreen 
          score={score} 
          level={level} 
          survivalTime={survivalTime}
          enemiesKilled={enemiesKilled}
          onRestart={restartGame} 
        />
      )}
    </div>
  );
}
