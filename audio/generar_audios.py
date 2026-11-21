# Síntesis aditiva: dos timbres con la misma nota (la, f0 = 220 Hz)
# Ecuación: y(t) = suma de A_n * sen(2*pi*n*f0*t)
import wave
import numpy as np

FS = 22050        # muestras por segundo
F0 = 220.0        # frecuencia fundamental (Hz)
DURACION = 2.0    # segundos
RAMPA = 0.04      # subida y bajada de volumen (s)

def sintetizar(armonicos):
    t = np.arange(int(FS * DURACION)) / FS
    y = np.zeros_like(t)
    for n in armonicos:
        y += (1.0 / n) * np.sin(2 * np.pi * n * F0 * t)   # amplitud 1/n
    # subida y bajada suaves para evitar clics
    k = int(FS * RAMPA)
    env = np.ones_like(t)
    env[:k] = np.linspace(0, 1, k)
    env[-k:] = np.linspace(1, 0, k)
    y *= env
    return y / np.max(np.abs(y)) * 0.8   # normalizar

def guardar(nombre, y):
    datos = (y * 32767).astype(np.int16)
    with wave.open(nombre, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(FS)
        w.writeframes(datos.tobytes())

guardar("timbre_A_armonicos_impares.wav", sintetizar([1, 3, 5, 7, 9]))
guardar("timbre_B_todos_los_armonicos.wav", sintetizar(range(1, 11)))
print("Listo: se crearon los dos archivos .wav")
