# Efectos originales

Estos cuatro sonidos se sintetizaron específicamente para **El Ahorcado Móvil**
mediante ondas sinusoidales, sin grabaciones ni muestras de terceros.
El script reproducible está en `scripts/generate-sounds.cjs`:

```powershell
node scripts/generate-sounds.cjs
```

Formato: WAV RIFF, PCM lineal de 16 bits, mono, 44.100 Hz. Los efectos tienen
ataque y desvanecimiento suaves y amplitud moderada.

| Archivo | Evento | Duración |
| --- | --- | --- |
| `correct.wav` | Letra correcta | 0,224 s |
| `incorrect.wav` | Letra incorrecta | 0,254 s |
| `win.wav` | Victoria | 0,708 s |
| `loss.wav` | Derrota | 0,656 s |

No se necesita conexión a Internet durante una partida. `expo-audio` carga los
recursos locales; `useAudioPlayer` libera los reproductores con el proveedor.
Los efectos respetan el interruptor Sonidos guardado por el jugador y el volumen
multimedia del dispositivo. Con Sonidos activado, la sesión permite reproducir
también en modo silencio/vibración (`playsInSilentMode: true`, Android e iOS).
Se espera la preparación de la sesión y la carga del WAV antes de reproducir.

## Uso y licencia

Se permite usar, copiar, modificar y distribuir estos cuatro efectos y su script
de generación con este proyecto o en otros proyectos, sin pago ni atribución
obligatoria. No se incluyen contenidos sujetos a licencias de terceros.

Las pruebas automatizadas comprueban cabeceras, longitud, muestras PCM y ausencia
de saturación. La verificación de volumen percibido, latencia y reproducción en
Expo Go requiere una prueba en un dispositivo real.
