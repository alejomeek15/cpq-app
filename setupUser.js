/**
 * setupUser.js
 * Script para configurar un usuario específico copiando datos desde /defaults/
 * 
 * USO:
 * 1. Crear usuario manualmente en Firebase Console
 * 2. Copiar el UID del usuario
 * 3. Ejecutar: node setupUser.js UID_DEL_USUARIO email@ejemplo.com
 * 
 * Ejemplo:
 * node setupUser.js abc123xyz user@example.com
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// TODO: Reemplaza con tu configuración real
const firebaseConfig = {
  apiKey: "AIzaSyDkRiI_h6qBdlMrjHIstbxOSpSSA1fl9M4",
  authDomain: "app-cpq.firebaseapp.com",
  projectId: "app-cpq",
  storageBucket: "app-cpq.firebasestorage.app",
  messagingSenderId: "144495366011",
  appId: "1:144495366011:web:3e9ebcc37369f25a40f7de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Copia impuestos desde /defaults/ al usuario
 */
async function copiarImpuestos(userId) {
  console.log(`\n📋 Copiando impuestos para usuario: ${userId}`);
  
  // Leer impuestos de defaults
  const defaultsRef = collection(db, 'defaults', 'impuestos', 'items');
  const snapshot = await getDocs(defaultsRef);
  
  if (snapshot.empty) {
    console.warn('⚠️  No hay impuestos en /defaults/impuestos/items/');
    return 0;
  }
  
  let contador = 0;
  
  // Copiar cada impuesto
  for (const docSnap of snapshot.docs) {
    const impuestoData = docSnap.data();
    
    // Crear nuevo documento en colección del usuario
    const nuevoDocRef = doc(collection(db, `usuarios/${userId}/impuestos`));
    
    await setDoc(nuevoDocRef, {
      ...impuestoData,
      id: nuevoDocRef.id,
      fechaCreacion: new Date().toISOString(),
      origenDefecto: true,
      idOriginal: docSnap.id
    });
    
    console.log(`  ✓ ${impuestoData.nombre || 'Sin nombre'}`);
    contador++;
  }
  
  console.log(`✅ ${contador} impuestos copiados`);
  return contador;
}

/**
 * Copia condiciones de pago desde /defaults/ al usuario
 */
async function copiarCondicionesPago(userId) {
  console.log(`\n📋 Copiando condiciones de pago para usuario: ${userId}`);
  
  const defaultsRef = collection(db, 'defaults', 'condicionesPago', 'items');
  const snapshot = await getDocs(defaultsRef);
  
  if (snapshot.empty) {
    console.warn('⚠️  No hay condiciones en /defaults/condicionesPago/items/');
    return 0;
  }
  
  let contador = 0;
  
  for (const docSnap of snapshot.docs) {
    const condicionData = docSnap.data();
    
    const nuevoDocRef = doc(collection(db, `usuarios/${userId}/condicionesPago`));
    
    await setDoc(nuevoDocRef, {
      ...condicionData,
      id: nuevoDocRef.id,
      fechaCreacion: new Date().toISOString(),
      origenDefecto: true,
      idOriginal: docSnap.id
    });
    
    console.log(`  ✓ ${condicionData.nombre || 'Sin nombre'}`);
    contador++;
  }
  
  console.log(`✅ ${contador} condiciones de pago copiadas`);
  return contador;
}

/**
 * Crea configuración inicial del usuario
 */
async function crearConfiguracionInicial(userId, userEmail) {
  console.log(`\n⚙️  Creando configuración inicial para: ${userId}`);
  
  const configRef = doc(db, `usuarios/${userId}/configuracion/global`);
  
  await setDoc(configRef, {
    emailUsuario: userEmail,
    fechaRegistro: new Date().toISOString(),
    version: '1.0',
    onboardingCompletado: false,
    configuracionCotizaciones: {
      prefijo: 'COT',
      longitudNumero: 4,
      incluirAnio: true
    },
    configuracionEmpresa: {
      nombre: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: userEmail,
      logo: null
    }
  });
  
  console.log('✅ Configuración inicial creada');
}

/**
 * Verifica si el usuario ya tiene datos configurados
 */
async function verificarUsuarioExistente(userId) {
  const impuestosRef = collection(db, `usuarios/${userId}/impuestos`);
  const snapshot = await getDocs(impuestosRef);
  
  return !snapshot.empty;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function setupUser(userId, userEmail) {
  console.log('\n🚀 Iniciando configuración de usuario...');
  console.log(`   Usuario ID: ${userId}`);
  console.log(`   Email: ${userEmail}`);
  
  try {
    // Verificar si ya tiene datos
    const yaExiste = await verificarUsuarioExistente(userId);
    
    if (yaExiste) {
      console.log('\n⚠️  Este usuario YA tiene datos configurados.');
      console.log('   ¿Deseas continuar de todas formas? (duplicará los datos)');
      // En producción, podrías pedir confirmación aquí
      // return;
    }
    
    // Copiar impuestos
    const impuestosCargados = await copiarImpuestos(userId);
    
    // Copiar condiciones de pago
    const condicionesCargadas = await copiarCondicionesPago(userId);
    
    // Crear configuración inicial
    await crearConfiguracionInicial(userId, userEmail);
    
    console.log('\n✨ ¡Usuario configurado exitosamente!');
    console.log(`   ${impuestosCargados} impuestos`);
    console.log(`   ${condicionesCargadas} condiciones de pago`);
    console.log(`   1 configuración inicial`);
    
  } catch (error) {
    console.error('\n❌ Error configurando usuario:', error);
    process.exit(1);
  }
}

// ============================================
// EJECUCIÓN DEL SCRIPT
// ============================================

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('\n❌ Uso incorrecto del script\n');
  console.log('Uso correcto:');
  console.log('  node setupUser.js <USER_ID> <EMAIL>\n');
  console.log('Ejemplo:');
  console.log('  node setupUser.js abc123xyz usuario@ejemplo.com\n');
  process.exit(1);
}

const [userId, userEmail] = args;

// Ejecutar
setupUser(userId, userEmail)
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });