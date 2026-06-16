import random
import time
import base64

# ====================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======================
def is_prime(n, k=40):
    if n <= 1 or n == 4: return False
    if n <= 3: return True
    r, s = 0, n - 1
    while s % 2 == 0:
        r += 1
        s //= 2
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, s, n)
        if x == 1 or x == n - 1: continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1: break
        else:
            return False
    return True

def generate_prime(bits):
    while True:
        p = random.getrandbits(bits)
        p |= (1 << bits - 1) | 1
        if is_prime(p):
            return p

def mod_inverse(a, m):
    m0, x0, x1 = m, 0, 1
    if m == 1: return 0
    while a > 1:
        q = a // m
        m, a = a % m, m
        x0, x1 = x1 - q * x0, x0
    if x1 < 0: x1 += m0
    return x1

# ====================== RSA ======================
class RSA:
    def __init__(self, bits=1024):
        self.bits = bits
        self.p = self.q = self.n = self.phi = self.d = None
        self.e = 65537

    def generate_keys(self):
        print(f"\nГенерация ключей RSA ({self.bits} бит)...")
        start = time.time()
        self.p = generate_prime(self.bits // 2)
        self.q = generate_prime(self.bits // 2)
        self.n = self.p * self.q
        self.phi = (self.p - 1) * (self.q - 1)
        self.d = mod_inverse(self.e, self.phi)
        print(f"✓ RSA ключи готовы за {time.time() - start:.2f} сек")

    def encrypt(self, blocks):
        return [pow(m, self.e, self.n) for m in blocks]

    def decrypt(self, blocks):
        return [pow(c, self.d, self.n) for c in blocks]

# ====================== Эль-Гамаль ======================
class ElGamal:
    def __init__(self, bits=1024):
        self.bits = bits
        self.p = self.g = self.x = self.y = None

    def generate_keys(self):
        print(f"\nГенерация ключей ElGamal ({self.bits} бит)...")
        start = time.time()
        self.p = generate_prime(self.bits)
        self.g = random.randint(2, min(1000, self.p-1))
        self.x = random.randint(2, self.p - 2)
        self.y = pow(self.g, self.x, self.p)
        print(f"✓ ElGamal ключи готовы за {time.time() - start:.2f} сек")

    def encrypt(self, blocks):
        ct = []
        k = random.randint(2, self.p - 2)
        a = pow(self.g, k, self.p)
        for m in blocks:
            b = (m * pow(self.y, k, self.p)) % self.p
            ct.append((a, b))
        return ct

    def decrypt(self, ciphertext):
        pt = []
        for a, b in ciphertext:
            a_inv = pow(a, self.p - 1 - self.x, self.p)
            m = (b * a_inv) % self.p
            pt.append(m)
        return pt

# ====================== РАБОТА С ТЕКСТОМ ======================
def text_to_blocks(text: str, mode: str = "ascii"):
    if mode == "ascii":
        return list(text.encode('utf-8'))
    else:
        b64 = base64.b64encode(text.encode('utf-8')).decode('ascii')
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        return [alphabet.index(c) for c in b64 if c != '=']

def blocks_to_text(blocks, mode: str = "ascii"):
    if mode == "ascii":
        return bytes(blocks).decode('utf-8', errors='replace')
    else:
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        b64 = ''.join(alphabet[b] for b in blocks)
        padding = (4 - len(b64) % 4) % 4
        b64 += '=' * padding
        try:
            return base64.b64decode(b64).decode('utf-8', errors='replace')
        except:
            return "[Ошибка Base64]"

# ====================== ЗАДАНИЕ 1 ======================
def task1():
    print("\n=== Задание 1: Зависимость времени y ≡ a^x mod n ===")
    a_list = [5, 17, 31]
    x_list = [103, 1009, 10007, 100003, 10000019, 100000007, 10**9+7]
    bits_list = [1024, 2048]

    print(f"{'a':<4} {'x':<12} {'n(бит)':<8} {'Время (мс)':<10} Результат (посл. 6)")
    print("-" * 62)
    for a in a_list:
        for x in x_list:
            for bits in bits_list:
                n = generate_prime(bits)
                start = time.time()
                y = pow(a, x, n)
                t = (time.time() - start) * 1000
                print(f"{a:<4} {x:<12} {bits:<8} {t:8.3f}     {str(y)[-6:]}")

# ====================== ГЛАВНАЯ ПРОГРАММА ======================
def main():
    print("=== Лабораторная работа №8: RSA и Эль-Гамаль ===\n")
    
    rsa = None
    elgamal = None
    fio = None

    while True:
        print("\n" + "="*75)
        print("1. Ввести ФИО")
        print("2. Задание 1 — a^x mod n")
        print("3. Генерировать ключи RSA")
        print("4. Генерировать ключи ElGamal")
        print("5. Зашифровать и расшифровать RSA")
        print("6. Зашифровать и расшифровать ElGamal")
        print("7. Выход")
        
        choice = input("\nВыберите действие: ").strip()

        if choice == "1":
            fio = input("\nВведите Фамилию Имя Отчество: ").strip()
            if fio: 
                print(f"✓ ФИО сохранено: {fio}")
            else:
                fio = "Иванов Иван Иванович"
                print(f"✓ Используется: {fio}")

        elif choice == "2":
            task1()

        elif choice == "3":
            bits = int(input("Битность RSA (1024/2048): ") or 1024)
            rsa = RSA(bits)
            rsa.generate_keys()

        elif choice == "4":
            bits = int(input("Битность ElGamal (1024/2048): ") or 1024)
            elgamal = ElGamal(bits)
            elgamal.generate_keys()

        elif choice == "5":   # RSA
            if not rsa or not rsa.d:
                print("Сначала сгенерируйте ключи RSA (пункт 3)")
                continue
            if not fio:
                fio = input("Введите ФИО: ").strip() or "Иванов Иван Иванович"

            mode = input("Режим (ascii/base64): ").strip().lower() or "ascii"
            blocks = text_to_blocks(fio, mode)

            # Шифрование
            start = time.time()
            ciphertext = rsa.encrypt(blocks)
            enc_time = time.time() - start

            # Расшифрование
            start = time.time()
            decrypted_blocks = rsa.decrypt(ciphertext)
            decrypted_text = blocks_to_text(decrypted_blocks, mode)
            dec_time = time.time() - start

            print("\n" + "="*60)
            print("РЕЗУЛЬТАТ РАБОТЫ RSA")
            print("="*60)
            print(f"Исходный текст : {fio}")
            print(f"Режим кодировки: {mode.upper()}")
            print(f"Шифротекст     : {ciphertext}")
            print(f"Расшифрованный : {decrypted_text}")
            print(f"Время шифрования  : {enc_time:.4f} сек")
            print(f"Время расшифрования: {dec_time:.4f} сек")
            print(f"Размер шифротекста: {len(str(ciphertext))} символов")

        elif choice == "6":   # ElGamal
            if not elgamal or not elgamal.p:
                print("Сначала сгенерируйте ключи ElGamal (пункт 4)")
                continue
            if not fio:
                fio = input("Введите ФИО: ").strip() or "Иванов Иван Иванович"

            mode = input("Режим (ascii/base64): ").strip().lower() or "ascii"
            blocks = text_to_blocks(fio, mode)

            # Шифрование
            start = time.time()
            ciphertext = elgamal.encrypt(blocks)
            enc_time = time.time() - start

            # Расшифрование
            start = time.time()
            decrypted_blocks = elgamal.decrypt(ciphertext)
            decrypted_text = blocks_to_text(decrypted_blocks, mode)
            dec_time = time.time() - start

            print("\n" + "="*60)
            print("РЕЗУЛЬТАТ РАБОТЫ ElGamal")
            print("="*60)
            print(f"Исходный текст : {fio}")
            print(f"Режим кодировки: {mode.upper()}")
            print(f"Шифротекст     : {ciphertext}")
            print(f"Расшифрованный : {decrypted_text}")
            print(f"Время шифрования  : {enc_time:.4f} сек")
            print(f"Время расшифрования: {dec_time:.4f} сек")
            print(f"Размер шифротекста: {len(ciphertext)} пар (a,b)")

        elif choice == "7":
            print("До свидания!")
            break

        else:
            print("Неверный выбор!")

if __name__ == "__main__":
    main()