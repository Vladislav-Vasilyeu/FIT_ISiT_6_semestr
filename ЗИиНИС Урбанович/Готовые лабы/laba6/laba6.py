import time
import os
import matplotlib.pyplot as plt
from collections import Counter
import math

# ==================== ПРИЛОЖЕНИЕ 1: ЛИНЕЙНЫЙ КОНГРУЭНТНЫЙ ГЕНЕРАТОР ====================

class LCG:
    """
    Линейный конгруэнтный генератор (LCG)
    Формула: X_{n+1} = (a * X_n + c) mod m
    Вариант 5: a = 421, c = 1663, m = 7875
    """
    def __init__(self, a=421, c=1663, m=7875, seed=None):
        self.a = a
        self.c = c
        self.m = m
        # Начальное значение (если не задано — используем время)
        self.state = seed if seed is not None else int(time.time() * 1000) % m
    
    def next(self):
        """Следующее псевдослучайное число"""
        self.state = (self.a * self.state + self.c) % self.m
        return self.state
    
    def next_byte(self):
        """Получить байт (0-255) из текущего состояния"""
        return self.state % 256
    
    def generate_sequence(self, length):
        """Генерация последовательности заданной длины"""
        return [self.next() for _ in range(length)]
    
    def generate_bytes(self, length):
        """Генерация байтов для шифрования"""
        return bytes([self.next_byte() for _ in range(length)])
    
    def get_period(self, max_iter=100000):
        """Определение периода генератора (для анализа)"""
        seen = {}
        current = self.state
        for i in range(max_iter):
            if current in seen:
                return i - seen[current], seen[current]  # период, начало
            seen[current] = i
            current = (self.a * current + self.c) % self.m
        return None, None  # период > max_iter

# ==================== ПРИЛОЖЕНИЕ 2: RC4 ====================

class RC4:
    """
    RC4 (Rivest Cipher 4) — потоковый шифр
    Вариант 5: n = 8 (обычный RC4), ключ = [123, 125, 41, 84, 203]
    """
    def __init__(self, key):
        """
        Инициализация RC4
        key: список байтов (0-255) или bytes
        """
        if isinstance(key, list):
            self.key = bytes(key)
        else:
            self.key = key
        
        self.S = list(range(256))  # S-бокс
        self.T = []  # временный массив
        self.i = 0
        self.j = 0
        
        self._ksa()  # Key Scheduling Algorithm
    
    def _ksa(self):
        """Key Scheduling Algorithm — инициализация S-бокса"""
        key_len = len(self.key)
        
        # Инициализация T
        self.T = [self.key[i % key_len] for i in range(256)]
        
        # Перемешивание S
        j = 0
        for i in range(256):
            j = (j + self.S[i] + self.T[i]) % 256
            self.S[i], self.S[j] = self.S[j], self.S[i]
    
    def _prga(self):
        """Pseudo-Random Generation Algorithm — генерация псевдослучайного байта"""
        self.i = (self.i + 1) % 256
        self.j = (self.j + self.S[self.i]) % 256
        self.S[self.i], self.S[self.j] = self.S[self.j], self.S[self.i]
        t = (self.S[self.i] + self.S[self.j]) % 256
        return self.S[t]
    
    def generate_keystream(self, length):
        """Генерация ключевого потока заданной длины"""
        return bytes([self._prga() for _ in range(length)])
    
    def encrypt(self, data):
        """
        Шифрование/расшифрование (XOR с ключевым потоком)
        RC4 симметричен: encrypt = decrypt
        """
        keystream = self.generate_keystream(len(data))
        return bytes([a ^ b for a, b in zip(data, keystream)])
    
    def decrypt(self, data):
        """Расшифрование (идентично шифрованию)"""
        return self.encrypt(data)

# ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

def calculate_entropy(data):
    """Энтропия Шеннона"""
    if not data:
        return 0
    counter = Counter(data)
    length = len(data)
    entropy = 0.0
    for count in counter.values():
        p = count / length
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy

def chi_square_test(data):
    """Хи-квадрат тест на равномерность"""
    if not data:
        return 0
    counter = Counter(data)
    expected = len(data) / 256
    chi2 = sum((count - expected) ** 2 / expected for count in counter.values())
    return chi2

def plot_histogram(data, title, filename=None):
    """Построение гистограммы распределения байтов"""
    counter = Counter(data)
    values = [counter.get(i, 0) for i in range(256)]
    
    plt.figure(figsize=(12, 4))
    plt.bar(range(256), values, width=1.0, color='blue', alpha=0.7)
    plt.xlabel('Значение байта')
    plt.ylabel('Частота')
    plt.title(f'{title}\nЭнтропия: {calculate_entropy(data):.4f}, Хи²: {chi_square_test(data):.2f}')
    plt.xlim(0, 255)
    plt.grid(True, alpha=0.3)
    
    if filename:
        plt.savefig(filename, dpi=150, bbox_inches='tight')
        print(f"Гистограмма сохранена: {filename}")
    plt.show()

def speed_test(generator_func, sizes=[1000, 10000, 100000, 1000000]):
    """Тест скорости генерации"""
    print(f"\n{'Размер':>10} | {'Время (мс)':>12} | {'Скорость (МБ/с)':>15}")
    print("-" * 50)
    
    for size in sizes:
        start = time.perf_counter()
        data = generator_func(size)
        elapsed = (time.perf_counter() - start) * 1000
        
        # МБ/с
        mb_per_sec = (size / 1024 / 1024) / (elapsed / 1000) if elapsed > 0 else 0
        
        print(f"{size:>10} | {elapsed:>12.3f} | {mb_per_sec:>15.2f}")

# ==================== ГЛАВНОЕ МЕНЮ ====================

def main():
    print("=" * 70)
    print("ЛАБОРАТОРНАЯ РАБОТА №6")
    print("ПОТОКОВЫЕ ШИФРЫ")
    print("=" * 70)
    print("Приложение 1: Линейный конгруэнтный генератор (ЛКГ)")
    print("  Вариант 5: a = 421, c = 1663, m = 7875")
    print()
    print("Приложение 2: RC4")
    print("  Вариант 5: n = 8, ключ = [123, 125, 41, 84, 203]")
    print("=" * 70)
    
    # Глобальные переменные для сохранения состояния
    lcg = None
    rc4 = None
    last_plain = None
    last_encrypted = None
    
    while True:
        print("\n" + "=" * 50)
        print("ГЛАВНОЕ МЕНЮ")
        print("=" * 50)
        print("1. ЛКГ — анализ генератора")
        print("2. ЛКГ — шифрование текста")
        print("3. RC4 — шифрование текста")
        print("4. RC4 — скорость генерации ПСП")
        print("5. Сравнительный анализ ЛКГ vs RC4")
        print("6. Визуализация (графики)")
        print("0. Выход")
        
        choice = input("\nВыбор: ").strip()
        
        # ==================== ЛКГ АНАЛИЗ ====================
        if choice == "1":
            print("\n" + "=" * 50)
            print("ЛИНЕЙНЫЙ КОНГРУЭНТНЫЙ ГЕНЕРАТОР")
            print("Параметры: a = 421, c = 1663, m = 7875")
            print("=" * 50)
            
            seed = input("Начальное значение (Enter для случайного): ").strip()
            seed = int(seed) if seed else None
            
            lcg = LCG(seed=seed)
            
            # Анализ периода
            print("\n[1] Анализ периода...")
            period, start_at = lcg.get_period()
            if period:
                print(f"  Период обнаружен: {period}")
                print(f"  Начало цикла: позиция {start_at}")
                print(f"  [ВАЖНО] Максимальный период LCG ≤ m = 7875")
            else:
                print("  Период > 100000 (или генератор не зациклился)")
            
            # Генерация выборки
            print("\n[2] Генерация 10000 чисел...")
            sample = lcg.generate_sequence(10000)
            
            # Статистика
            print(f"  Минимум: {min(sample)}")
            print(f"  Максимум: {max(sample)}")
            print(f"  Среднее: {sum(sample)/len(sample):.2f} (ожидание: ~{7875/2})")
            
            # Распределение по модулям 256 (для использования как байты)
            bytes_sample = [x % 256 for x in sample]
            print(f"\n[3] Распределение как байтов (mod 256):")
            print(f"  Энтропия: {calculate_entropy(bytes_sample):.4f} (макс: 8.0)")
            print(f"  Хи² тест: {chi_square_test(bytes_sample):.2f} (меньше = лучше)")
            
            # Первые 20 чисел
            print(f"\n[4] Первые 20 чисел последовательности:")
            lcg_temp = LCG(seed=seed)
            for i in range(20):
                print(f"  X_{i} = {lcg_temp.next()}")
        
        # ==================== ЛКГ ШИФРОВАНИЕ ====================
        elif choice == "2":
            if lcg is None:
                print("Сначала инициализируйте ЛКГ (пункт 1)!")
                continue
            
            text = input("\nВведите текст для шифрования: ").strip()
            if not text:
                print("Пустой текст!")
                continue
            
            data = text.encode('utf-8')
            
            # Генерация гаммы
            keystream = lcg.generate_bytes(len(data))
            
            # XOR (шифрование)
            start = time.perf_counter()
            encrypted = bytes([p ^ k for p, k in zip(data, keystream)])
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\n{'='*50}")
            print(f"ШИФРОВАНИЕ ЛКГ (потоковый шифр)")
            print(f"{'='*50}")
            print(f"Открытый текст: {text}")
            print(f"Длина: {len(data)} байт")
            print(f"Гамма (первые 20 байт): {keystream[:20].hex().upper()}")
            print(f"Шифртекст (hex): {encrypted.hex().upper()}")
            print(f"Время шифрования: {elapsed:.3f} мс")
            
            # Дешифрование (та же операция)
            lcg_dec = LCG(seed=lcg.state - len(data))  # Восстановить состояние
            # Проще: сохраним начальное состояние
            print(f"\n[ДЕШИФРОВАНИЕ] Для дешифрования нужно то же начальное значение!")
            
            # Сохранение
            with open("lcg_encrypted.bin", "wb") as f:
                f.write(encrypted)
            with open("lcg_keystream.bin", "wb") as f:
                f.write(keystream)
            print("Сохранено: lcg_encrypted.bin, lcg_keystream.bin")
            
            last_plain = data
            last_encrypted = encrypted
        
        # ==================== RC4 ШИФРОВАНИЕ ====================
        elif choice == "3":
            print("\n" + "=" * 50)
            print("RC4 — ПОТОКОВЫЙ ШИФР")
            print("Параметры: n = 8, ключ = [123, 125, 41, 84, 203]")
            print("=" * 50)
            
            # Ключ варианта 5
            key = [123, 125, 41, 84, 203]
            print(f"Ключ (десятичные): {key}")
            print(f"Ключ (hex): {bytes(key).hex().upper()}")
            
            rc4 = RC4(key)
            
            text = input("\nВведите текст для шифрования: ").strip()
            if not text:
                # Тестовый текст
                text = "THIS IS A TEST MESSAGE FOR RC4 ENCRYPTION ALGORITHM"
                print(f"Используется тестовый текст: {text}")
            
            data = text.encode('utf-8')
            
            # Шифрование
            start = time.perf_counter()
            encrypted = rc4.encrypt(data)
            elapsed = (time.perf_counter() - start) * 1000
            
            # Для дешифрования создаём новый объект с тем же ключом
            rc4_dec = RC4(key)
            decrypted = rc4_dec.decrypt(encrypted)
            
            print(f"\n{'='*50}")
            print(f"РЕЗУЛЬТАТ RC4:")
            print(f"Открытый текст:    {text}")
            print(f"Длина:             {len(data)} байт")
            print(f"Шифртекст (hex):   {encrypted.hex().upper()}")
            print(f"Дешифровано:       {decrypted.decode('utf-8', errors='replace')}")
            print(f"Время:             {elapsed:.3f} мс")
            print(f"Скорость:          {len(data)/elapsed*1000:.0f} байт/с" if elapsed > 0 else "Мгновенно")
            
            # Анализ ключевого потока
            rc4_analysis = RC4(key)
            keystream = rc4_analysis.generate_keystream(len(data))
            print(f"\nАнализ ключевого потока:")
            print(f"  Первые 20 байт: {keystream[:20].hex().upper()}")
            print(f"  Энтропия: {calculate_entropy(keystream):.4f}")
            
            # Сохранение
            with open("rc4_encrypted.bin", "wb") as f:
                f.write(encrypted)
            with open("rc4_decrypted.txt", "w") as f:
                f.write(decrypted.decode('utf-8', errors='replace'))
            print("\nСохранено: rc4_encrypted.bin, rc4_decrypted.txt")
            
            last_plain = data
            last_encrypted = encrypted
        
        # ==================== RC4 СКОРОСТЬ ====================
        elif choice == "4":
            print("\n" + "=" * 50)
            print("ТЕСТ СКОРОСТИ ГЕНЕРАЦИИ RC4")
            print("=" * 50)
            
            key = [123, 125, 41, 84, 203]
            
            def rc4_generator(size):
                rc4 = RC4(key)
                return rc4.generate_keystream(size)
            
            print(f"Ключ: {key}")
            speed_test(rc4_generator)
            
            # Сравнение с ЛКГ
            print(f"\n{'='*50}")
            print("СРАВНЕНИЕ С ЛКГ:")
            
            def lcg_generator(size):
                lcg = LCG()
                return lcg.generate_bytes(size)
            
            speed_test(lcg_generator)
        
        # ==================== СРАВНИТЕЛЬНЫЙ АНАЛИЗ ====================
        elif choice == "5":
            print("\n" + "=" * 50)
            print("СРАВНИТЕЛЬНЫЙ АНАЛИЗ ЛКГ vs RC4")
            print("=" * 50)
            
            size = 100000
            
            # ЛКГ
            print(f"\n[1] ЛКГ (a=421, c=1663, m=7875):")
            lcg = LCG()
            lcg_stream = lcg.generate_bytes(size)
            print(f"  Период: ≤ 7875 (очень короткий!)")
            print(f"  Энтропия: {calculate_entropy(lcg_stream):.4f}")
            print(f"  Хи²: {chi_square_test(lcg_stream):.2f}")
            print(f"  [ПРОБЛЕМА] После 7875 байт гамма повторяется!")
            
            # RC4
            print(f"\n[2] RC4 (ключ [123, 125, 41, 84, 203]):")
            rc4 = RC4([123, 125, 41, 84, 203])
            rc4_stream = rc4.generate_keystream(size)
            print(f"  Период: ~2^1600 (практически бесконечный)")
            print(f"  Энтропия: {calculate_entropy(rc4_stream):.4f}")
            print(f"  Хи²: {chi_square_test(rc4_stream):.2f}")
            print(f"  [ПЛЮС] Высокая криптостойкость при правильном использовании")
            
            # Сравнение безопасности
            print(f"\n{'='*50}")
            print("ВЫВОДЫ ДЛЯ ОТЧЁТА:")
            print("=" * 50)
            print("1. ЛКГ — НЕ криптографически стойкий!")
            print("   - Короткий период (7875)")
            print("   - Предсказуемая последовательность")
            print("   - Пригоден только для демонстрации")
            print()
            print("2. RC4 — криптографически стойкий (с оговорками)")
            print("   - Огромный период")
            print("   - Высокая энтропия выхода")
            print("   - [ВАЖНО] Устарел, имеет уязвимости (например, в WEP)")
            print("   - Современная замена: ChaCha20")
        
        elif choice == "6":
            print("\n" + "=" * 50)
            print("ВИЗУАЛИЗАЦИЯ РАСПРЕДЕЛЕНИЙ")
            print("=" * 50)
            
            size = 10000
            
            # ЛКГ
            print("\nГенерация гистограммы для ЛКГ...")
            lcg = LCG()
            lcg_data = lcg.generate_bytes(size)
            plot_histogram(lcg_data, "ЛКГ (a=421, c=1663, m=7875)", "lcg_histogram.png")
            
            # RC4
            print("\nГенерация гистограммы для RC4...")
            rc4 = RC4([123, 125, 41, 84, 203])
            rc4_data = rc4.generate_keystream(size)
            plot_histogram(rc4_data, "RC4 (ключ варианта 5)", "rc4_histogram.png")
            
            print("\nДля сравнения: идеально равномерное распределение")
            ideal = list(range(256)) * (size // 256)
            plot_histogram(ideal, "Идеальное равномерное", None)
        
        elif choice == "0":
            print("Выход...")
            break
        
        else:
            print("Неверный выбор!")

if __name__ == "__main__":
    main()