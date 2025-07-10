const admin = require("firebase-admin");

// Шлях до файлу облікових даних
const serviceAccount = require("./src/app/shared/FASDK/synikit-12dee-firebase-adminsdk-cpf5m-6dca825ada.json"); 

// Ініціалізація Firebase Admin з використанням файлу облікових даних
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)  // Використовуємо cert() для файлу з обліковими даними
});

// UID користувача, якого потрібно зробити адміністратором
const userUID = "kH2Cwhn6e1dZDwhZHySALN9UPYD3";

admin.auth().setCustomUserClaims(userUID, { admin: true })
  .then(() => {
    console.log("Користувач став адміністратором!");
  })
  .catch((error) => {
    console.error("Помилка:", error);
  });
