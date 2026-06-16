import time
import os
import zlib
import math
from collections import Counter
import matplotlib.pyplot as plt

# ==================== ТАБЛИЦЫ DES ====================

# Начальная перестановка (64 бита)
IP = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7
]

# Конечная перестановка (обратная IP)
FP = [
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9, 49, 17, 57, 25
]

# Расширение E (32 -> 48)
E = [
    32, 1, 2, 3, 4, 5,
    4, 5, 6, 7, 8, 9,
    8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32, 1
]

# P-блок (перестановка после S-блоков)
P = [
    16, 7, 20, 21, 29, 12, 28, 17,
    1, 15, 23, 26, 5, 18, 31, 10,
    2, 8, 24, 14, 32, 27, 3, 9,
    19, 13, 30, 6, 22, 11, 4, 25
]

# S-блоки (8 штук, каждый 4x16)
S_BOXES = [
    # S1
    [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
     [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
     [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
     [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]],
    # S2
    [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
     [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
     [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
     [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]],
    # S3
    [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
     [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
     [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
     [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]],
    # S4
    [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
     [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
     [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
     [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]],
    # S5
    [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
     [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
     [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
     [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]],
    # S6
    [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
     [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
     [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
     [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]],
    # S7
    [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
     [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
     [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
     [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]],
    # S8
    [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
     [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
     [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
     [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]]
]

# PC1 (выбор 56 бит из 64 ключа)
PC1 = [
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4
]

# PC2 (выбор 48 бит из 56)
PC2 = [
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32
]

# Сдвиги влево для каждого раунда
SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

# ==================== КЛАСС DES ====================

class DES:
    def __init__(self, key):
        """key: 8 байт (64 бита, но 8 бит четности игнорируются)"""
        self.key = key
        self.subkeys = self._generate_subkeys()
    
    def _bytes_to_bits(self, data):
        """Преобразование байтов в список битов"""
        bits = []
        for byte in data:
            for i in range(7, -1, -1):
                bits.append((byte >> i) & 1)
        return bits
    
    def _bits_to_bytes(self, bits):
        """Преобразование битов в байты"""
        bytes_data = bytearray()
        for i in range(0, len(bits), 8):
            byte = 0
            for j in range(8):
                if i + j < len(bits):
                    byte = (byte << 1) | bits[i + j]
                else:
                    byte = byte << 1
            bytes_data.append(byte)
        return bytes(bytes_data)
    
    def _permute(self, bits, table):
        """Перестановка битов по таблице"""
        return [bits[i - 1] for i in table]
    
    def _left_shift(self, bits, n):
        """Циклический сдвиг влево"""
        return bits[n:] + bits[:n]
    
    def _generate_subkeys(self):
        """Генерация 16 подключей"""
        key_bits = self._bytes_to_bits(self.key)
        
        # PC1: 64 -> 56 бит
        key_56 = self._permute(key_bits, PC1)
        
        # Разделяем на C и D (по 28 бит)
        C = key_56[:28]
        D = key_56[28:]
        
        subkeys = []
        for shift in SHIFTS:
            C = self._left_shift(C, shift)
            D = self._left_shift(D, shift)
            # PC2: 56 -> 48 бит
            subkey = self._permute(C + D, PC2)
            subkeys.append(subkey)
        
        return subkeys
    
    def _xor(self, a, b):
        """XOR двух списков битов"""
        return [x ^ y for x, y in zip(a, b)]
    
    def _f_function(self, R, subkey):
        """Функция Фейстеля"""
        # E: 32 -> 48
        expanded = self._permute(R, E)
        # XOR с ключом
        xored = self._xor(expanded, subkey)
        
        # S-блоки: 48 -> 32
        output = []
        for i in range(8):
            # Берем 6 бит для i-го S-блока
            block = xored[i*6:(i+1)*6]
            row = block[0] * 2 + block[5]  # 1-й и 6-й бит
            col = block[1] * 8 + block[2] * 4 + block[3] * 2 + block[4]  # 2-5 биты
            val = S_BOXES[i][row][col]
            # 4 бита из S-блока
            for j in range(3, -1, -1):
                output.append((val >> j) & 1)
        
        # P: перестановка 32 бит
        return self._permute(output, P)
    
    def _encrypt_block(self, block):
        """Шифрование одного блока (8 байт)"""
        bits = self._bytes_to_bits(block)
        
        # Начальная перестановка
        bits = self._permute(bits, IP)
        
        # Разделяем на L и R
        L = bits[:32]
        R = bits[32:]
        
        # 16 раундов
        for i in range(16):
            new_R = self._xor(L, self._f_function(R, self.subkeys[i]))
            L = R
            R = new_R
        
        # Меняем местами (swap) после последнего раунда
        bits = R + L
        
        # Конечная перестановка
        bits = self._permute(bits, FP)
        
        return self._bits_to_bytes(bits)
    
    def _decrypt_block(self, block):
        """Расшифрование одного блока (8 байт)"""
        bits = self._bytes_to_bits(block)
        
        # Начальная перестановка
        bits = self._permute(bits, IP)
        
        # Разделяем на L и R
        L = bits[:32]
        R = bits[32:]
        
        # 16 раундов в обратном порядке ключей
        for i in range(15, -1, -1):
            new_R = self._xor(L, self._f_function(R, self.subkeys[i]))
            L = R
            R = new_R
        
        # Swap
        bits = R + L
        
        # Конечная перестановка
        bits = self._permute(bits, FP)
        
        return self._bits_to_bytes(bits)

# ==================== DES-EDE2 ====================

class DES_EDE2:
    def __init__(self, key1, key2):
        """
        DES-EDE2: Encrypt(K1) -> Decrypt(K2) -> Encrypt(K1)
        Ключи: 8 байт каждый
        """
        self.des1 = DES(key1)
        self.des2 = DES(key2)
    
    def encrypt(self, data):
        """Шифрование в режиме ECB"""
        # Дополнение PKCS7
        pad_len = 8 - (len(data) % 8)
        if pad_len == 0:
            pad_len = 8
        padded = data + bytes([pad_len] * pad_len)
        
        result = bytearray()
        for i in range(0, len(padded), 8):
            block = padded[i:i+8]
            
            # EDE2: E(K1) -> D(K2) -> E(K1)
            temp = self.des1._encrypt_block(block)
            temp = self.des2._decrypt_block(temp)
            temp = self.des1._encrypt_block(temp)
            
            result.extend(temp)
        
        return bytes(result)
    
    def decrypt(self, data):
        """Расшифрование в режиме ECB"""
        result = bytearray()
        
        for i in range(0, len(data), 8):
            block = data[i:i+8]
            
            # Обратный порядок: D(K1) -> E(K2) -> D(K1)
            temp = self.des1._decrypt_block(block)
            temp = self.des2._encrypt_block(temp)
            temp = self.des1._decrypt_block(temp)
            
            result.extend(temp)
        
        # Удаление дополнения PKCS7
        if result:
            pad_len = result[-1]
            if 1 <= pad_len <= 8:
                result = result[:-pad_len]
        
        return bytes(result)

# ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

def str_to_key(s):
    """Строка (8 символов) -> ключ (8 байт)"""
    return s.encode('utf-8')[:8].ljust(8, b'\0')

def count_bits_diff(a, b):
    """Подсчет различий в битах между двумя байтовыми строками"""
    diff = 0
    for x, y in zip(a, b):
        xor = x ^ y
        diff += bin(xor).count('1')
    return diff

def avalanche_effect(ede2, block1, block2):
    """Анализ лавинного эффекта"""
    enc1 = ede2.encrypt(block1)
    enc2 = ede2.encrypt(block2)
    
    diff = count_bits_diff(enc1, enc2)
    return diff, enc1, enc2

def test_weak_keys():
    """Проверка слабых ключей DES"""
    # Слабые ключи (E(K) = D(K))
    weak_keys = [
        bytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        bytes([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        bytes([0xE1, 0xE1, 0xE1, 0xE1, 0xF0, 0xF0, 0xF0, 0xF0]),
        bytes([0x1F, 0x1F, 0x1F, 0x1F, 0x0E, 0x0E, 0x0E, 0x0E]),
    ]
    
    test_block = b"TESTBLCK"
    
    print("\n" + "="*60)
    print("ПРОВЕРКА СЛАБЫХ КЛЮЧЕЙ")
    print("="*60)
    print("Слабый ключ: E(K, X) == D(K, X) (шифрование = расшифрование)")
    print("-"*60)
    
    for key in weak_keys:
        des = DES(key)
        enc = des._encrypt_block(test_block)
        dec = des._decrypt_block(test_block)
        
        is_weak = (enc == des._decrypt_block(test_block))
        print(f"Ключ: {key.hex().upper()}")
        print(f"  E(K, 'TESTBLCK'): {enc.hex().upper()}")
        print(f"  D(K, 'TESTBLCK'): {dec.hex().upper()}")
        print(f"  Слабый: {'ДА!' if is_weak else 'Нет'}")
        print()

def compression_ratio(data):
    """Оценка сжимаемости (через zlib)"""
    compressed = zlib.compress(data)
    ratio = len(compressed) / len(data) * 100
    return ratio, len(compressed)

def main():
    print("="*60)
    print("ЛАБОРАТОРНАЯ РАБОТА №5")
    print("БЛОЧНЫЙ ШИФР DES-EDE2")
    print("="*60)
    print("Режим: ECB, Дополнение: PKCS7")
    print("Длина блока: 64 бита (8 байт)")
    print("Длина ключа: 2 × 56 бит (8 байт с четностью)")
    print("="*60)
    
    while True:
        print("\nМЕНЮ:")
        print("1. Зашифровать текст")
        print("2. Расшифровать (hex)")
        print("3. Лавинный эффект (пошаговый анализ)")
        print("4. Проверка слабых ключей")
        print("5. Сравнение сжатия (открытый vs зашифрованный)")
        print("0. Выход")
        
        choice = input("\nВыбор: ").strip()
        
        if choice == "0":
            break
        
        elif choice == "1":
            text = input("Введите текст: ").strip()
            key1_str = input("Ключ 1 (8 символов): ").strip()
            key2_str = input("Ключ 2 (8 символов): ").strip()
            
            key1 = str_to_key(key1_str)
            key2 = str_to_key(key2_str)
            
            data = text.encode('utf-8')
            ede2 = DES_EDE2(key1, key2)
            
            start = time.perf_counter()
            encrypted = ede2.encrypt(data)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\n{'='*60}")
            print(f"РЕЗУЛЬТАТ:")
            print(f"Открытый текст: {text}")
            print(f"Ключ 1: {key1.hex().upper()} ({key1_str})")
            print(f"Ключ 2: {key2.hex().upper()} ({key2_str})")
            print(f"Зашифровано (hex): {encrypted.hex().upper()}")
            print(f"Время шифрования: {elapsed:.3f} мс")
            print(f"Размер: {len(data)} -> {len(encrypted)} байт")
            
            # Сохранение
            with open("encrypted_des.bin", "wb") as f:
                f.write(encrypted)
            with open("keys.txt", "w") as f:
                f.write(f"Key1: {key1.hex()}\nKey2: {key2.hex()}\n")
            print("Сохранено: encrypted_des.bin, keys.txt")
            
            global last_encrypted, last_key1, last_key2, last_plain
            last_encrypted = encrypted
            last_key1 = key1
            last_key2 = key2
            last_plain = data
        
        elif choice == "2":
            hex_str = input("Введите hex-строку: ").strip().replace(" ", "")
            key1_str = input("Ключ 1 (8 символов): ").strip()
            key2_str = input("Ключ 2 (8 символов): ").strip()
            
            try:
                data = bytes.fromhex(hex_str)
                key1 = str_to_key(key1_str)
                key2 = str_to_key(key2_str)
                
                ede2 = DES_EDE2(key1, key2)
                
                start = time.perf_counter()
                decrypted = ede2.decrypt(data)
                elapsed = (time.perf_counter() - start) * 1000
                
                print(f"\nРасшифровано за {elapsed:.3f} мс")
                print(f"Результат: {decrypted.decode('utf-8', errors='replace')}")
                
                with open("decrypted.txt", "w") as f:
                    f.write(decrypted.decode('utf-8', errors='replace'))
                    
            except Exception as e:
                print(f"Ошибка: {e}")
        
        elif choice == "3":
            print("\n" + "="*60)
            print("ЛАВИННЫЙ ЭФФЕКТ")
            print("="*60)
            print("Изменение 1 бита во входном блоке -> изменение битов в шифртексте")
            
            key1 = b"KEYONEEE"
            key2 = b"KEYTWOOO"
            ede2 = DES_EDE2(key1, key2)
            
            # Базовый блок
            block1 = b"ABCDEFGH"
            # Блок с измененным 1 битом (меняем последний байт)
            block2 = bytearray(block1)
            block2[-1] ^= 0x01  # Инвертируем младший бит последнего байта
            block2 = bytes(block2)
            
            print(f"\nБазовый блок:     {block1} ({block1.hex().upper()})")
            print(f"Измененный блок:  {block2} ({block2.hex().upper()})")
            print(f"Различия во входе: {count_bits_diff(block1, block2)} бит")
            
            # Шифруем оба
            enc1 = ede2.encrypt(block1)
            enc2 = ede2.encrypt(block2)
            diff = count_bits_diff(enc1, enc2)
            
            print(f"\nШифртекст 1: {enc1.hex().upper()}")
            print(f"Шифртекст 2: {enc2.hex().upper()}")
            print(f"Различия в выходе: {diff} бит из 64 ({diff/64*100:.1f}%)")
            
            if 28 <= diff <= 36:
                print("\n[OK] Лавинный эффект достигнут (изменено ~50% битов)")
            else:
                print(f"\n[ВНИМАНИЕ] Необычное распределение (ожидалось ~32 бита)")
            
            # Детальный анализ по раундам (для одного DES)
            print("\n" + "-"*60)
            print("Детализация для одиночного DES (K1):")
            des = DES(key1)
            
            bits1 = des._bytes_to_bits(block1)
            bits2 = des._bytes_to_bits(block2)
            
            # Начальная перестановка
            bits1 = des._permute(bits1, IP)
            bits2 = des._permute(bits2, IP)
            
            L1, R1 = bits1[:32], bits1[32:]
            L2, R2 = bits2[:32], bits2[32:]
            
            print(f"После IP: различий {count_bits_diff(des._bits_to_bytes(bits1), des._bits_to_bytes(bits2))} бит")
            
            for round_num in range(16):
                new_R1 = des._xor(L1, des._f_function(R1, des.subkeys[round_num]))
                new_R2 = des._xor(L2, des._f_function(R2, des.subkeys[round_num]))
                L1, R1 = R1, new_R1
                L2, R2 = R2, new_R2
                
                combined1 = des._bits_to_bytes(R1 + L1)
                combined2 = des._bits_to_bytes(R2 + L2)
                round_diff = count_bits_diff(combined1, combined2)
                print(f"Раунд {round_num+1:2d}: {round_diff:2d} бит отличаются")
        
        elif choice == "4":
            test_weak_keys()
            
            # Дополнительно: полуслабые ключи для EDE2
            print("="*60)
            print("ПОЛУСЛАБЫЕ КЛЮЧИ (для EDE2)")
            print("="*60)
            print("Полуслабые: E(K1) = D(K2), т.е. E(K1, E(K2, X)) = X")
            print("Пример: если K1 = K2, то EDE2 сводится к одиночному DES")
            
            key = b"TESTKEYY"
            ede2_same = DES_EDE2(key, key)  # K1 = K2
            des_single = DES(key)
            
            block = b"TESTDATA"
            
            # EDE2 с одинаковыми ключами
            enc_ede = ede2_same.encrypt(block)
            # Одиночный DES
            enc_des = des_single._encrypt_block(block)
            
            print(f"\nКлюч: {key}")
            print(f"Блок: {block}")
            print(f"DES-EDE2 (K1=K2): {enc_ede[:8].hex().upper()}")
            print(f"Single DES:       {enc_des.hex().upper()}")
            print(f"Идентичны: {'ДА (это плохо!)' if enc_ede[:8] == enc_des else 'Нет'}")
        
        elif choice == "5":
            print("\n" + "="*60)
            print("АНАЛИЗ СЖАТИЯ")
            print("="*60)
            
            # Генерируем осмысленный текст
            text = "THIS IS A TEST MESSAGE FOR COMPRESSION ANALYSIS. " * 50
            text_bytes = text.encode()
            
            # Шифруем
            ede2 = DES_EDE2(b"KEY1KEY1", b"KEY2KEY2")
            encrypted = ede2.encrypt(text_bytes)
            
            # Сжимаем
            ratio_plain, size_plain = compression_ratio(text_bytes)
            ratio_enc, size_enc = compression_ratio(encrypted)
            
            print(f"Открытый текст:")
            print(f"  Исходный размер: {len(text_bytes)} байт")
            print(f"  Сжатый размер:   {size_plain} байт ({ratio_plain:.1f}%)")
            print(f"  Энтропия:        {calculate_entropy(text_bytes):.3f}")
            
            print(f"\nЗашифрованный (DES-EDE2):")
            print(f"  Исходный размер: {len(encrypted)} байт")
            print(f"  Сжатый размер:   {size_enc} байт ({ratio_enc:.1f}%)")
            print(f"  Энтропия:        {calculate_entropy(encrypted):.3f}")
            
            print(f"\nВЫВОД:")
            if ratio_enc > ratio_plain:
                print("  Зашифрованные данные сжимаются хуже (высокая энтропия)")
                print("  Это признак хорошего шифра (отсутствие паттернов)")
            else:
                print("  [АНОМАЛИЯ] Шифрованные данные сжимаются лучше?")
        
        else:
            print("Неверный выбор")

def calculate_entropy(data):
    """Вычисление энтропии Шеннона"""
    if not data:
        return 0
    counter = Counter(data)
    length = len(data)
    entropy = 0
    for count in counter.values():
        p = count / length
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy

if __name__ == "__main__":
    main()