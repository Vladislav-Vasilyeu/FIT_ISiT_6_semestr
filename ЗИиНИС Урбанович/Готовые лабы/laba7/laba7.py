import random
import time
import base64
from math import gcd

def egcd(a, b):
    if a == 0:
        return b, 0, 1
    g, y, x = egcd(b % a, a)
    return g, x - (b // a) * y, y

def mod_inverse(a, m):
    g, x, y = egcd(a, m)
    if g != 1:
        raise Exception('Модулярный обратный элемент не существует')
    return x % m

def generate_superincreasing(n, bit_length=100):
    """Генерация сверхвозрастающей последовательности"""
    seq = [random.randint(1, 2**16)]
    for _ in range(1, n):
        next_val = sum(seq) + random.randint(1, 2**16)
        seq.append(next_val)
    
    # Делаем старший элемент примерно 100-битным
    current_bits = seq[-1].bit_length()
    if current_bits < bit_length:
        multiplier = 1 << (bit_length - current_bits + random.randint(0, 10))
        seq = [x * multiplier for x in seq]
    return seq

class KnapsackMH:
    def __init__(self, n=8):
        self.n = n
        self.private = None
        self.public = None
        self.m = None
        self.w = None
        self.w_inv = None

    def generate_keys(self):
        self.private = generate_superincreasing(self.n)
        total = sum(self.private)
        self.m = total + random.randint(total//2, total*2)
        self.w = random.randint(2, self.m-1)
        while gcd(self.w, self.m) != 1:
            self.w = random.randint(2, self.m-1)
        self.public = [(a * self.w) % self.m for a in self.private]
        self.w_inv = mod_inverse(self.w, self.m)

    def encrypt(self, blocks):
        ciphertext = []
        for block in blocks:
            c = sum(self.public[i] for i in range(self.n) if block & (1 << i))
            ciphertext.append(c)
        return ciphertext

    def decrypt(self, ciphertext):
        plaintext = []
        for c in ciphertext:
            s = (c * self.w_inv) % self.m
            block = 0
            temp = s
            for i in range(self.n-1, -1, -1):
                if temp >= self.private[i]:
                    block |= (1 << i)
                    temp -= self.private[i]
            if temp != 0:
                raise ValueError("Ошибка при расшифровке")
            plaintext.append(block)
        return plaintext

def get_blocks(text, mode):
    if mode == "ascii":
        return list(text.encode('utf-8'))
    else:  # base64
        b64 = base64.b64encode(text.encode('utf-8')).decode('ascii')
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        blocks = [alphabet.index(c) for c in b64 if c != '=']
        return blocks

def blocks_to_text(blocks, mode):
    if mode == "ascii":
        return bytes(blocks).decode('utf-8', errors='replace')
    else:
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        b64_str = ''.join(alphabet[b] for b in blocks)
        # Добавляем padding
        padding = (4 - len(b64_str) % 4) % 4
        b64_str += '=' * padding
        try:
            return base64.b64decode(b64_str).decode('utf-8', errors='replace')
        except:
            return "[Ошибка Base64]"

def print_keys(cipher):
    print(f"\nТайный ключ (сверхвозрастающая последовательность, n={cipher.n}):")
    print(cipher.private)
    print(f"\nОткрытый ключ (нормальная последовательность):")
    print(cipher.public[:6], "... (всего", len(cipher.public), "элементов)")

def main():
    print("=== Лабораторная работа №7: Асимметричный шифр Меркле-Хеллмана ===\n")
    
    while True:
        print("\n" + "="*60)
        print("Меню:")
        print("1. Генерировать новые ключи")
        print("2. Зашифровать сообщение (ФИО)")
        print("3. Расшифровать сообщение")
        print("4. Анализ времени (разные n)")
        print("5. Выход")
        
        choice = input("\nВыберите действие (1-5): ").strip()
        
        if choice == "1":
            mode = input("Выберите режим (ascii/base64): ").strip().lower()
            n = int(input(f"Введите n (рекомендуется {8 if mode=='ascii' else 6}): ") or (8 if mode=='ascii' else 6))
            
            cipher = KnapsackMH(n)
            start = time.time()
            cipher.generate_keys()
            print(f"\nКлючи успешно сгенерированы за {time.time()-start:.4f} сек")
            print_keys(cipher)
            current_cipher = cipher
            current_mode = mode

        elif choice == "2":
            if 'current_cipher' not in locals():
                print("Сначала сгенерируйте ключи!")
                continue
            fio = input("Введите ФИО: ").strip() or "Иванов Иван Иванович"
            start = time.time()
            blocks = get_blocks(fio, current_mode)
            ct = current_cipher.encrypt(blocks)
            enc_time = time.time() - start
            
            print(f"\nЗашифровано {len(ct)} блоков за {enc_time:.6f} секунд")
            print("Шифротекст:", ct)
            current_ct = ct

        elif choice == "3":
            if 'current_ct' not in locals() or 'current_cipher' not in locals():
                print("Сначала зашифруйте сообщение!")
                continue
            start = time.time()
            pt_blocks = current_cipher.decrypt(current_ct)
            decrypted = blocks_to_text(pt_blocks, current_mode)
            dec_time = time.time() - start
            print(f"\nРасшифровано за {dec_time:.6f} секунд")
            print("Результат:", decrypted)

        elif choice == "4":
            print("\n=== АНАЛИЗ ВРЕМЕНИ ===")
            test_text = "Иванов Иван Иванович"
            mode = input("Режим (ascii/base64): ").strip().lower() or "ascii"
            print(f"n | Время шифрования (с) | Время расшифрования (с)")
            print("-" * 55)
            
            for n in range(6, 33, 2):
                test = KnapsackMH(n)
                test.generate_keys()
                blocks = get_blocks(test_text, mode)[:12]  # фиксируем кол-во блоков
                
                t1 = time.time()
                ct = test.encrypt(blocks)
                t_enc = time.time() - t1
                
                t2 = time.time()
                test.decrypt(ct)
                t_dec = time.time() - t2
                
                print(f"{n:2d} | {t_enc:.6f}           | {t_dec:.6f}")

        elif choice == "5":
            print("До свидания!")
            break

        else:
            print("Неверный выбор.")

if __name__ == "__main__":
    main()