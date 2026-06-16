import time
from collections import Counter
import matplotlib.pyplot as plt
import os

# Польский алфавит (32 буквы)
ALPHABET = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ"
M = len(ALPHABET)
save_dir = os.path.dirname(os.path.abspath(__file__))
# Параметры аффинного шифра
A = 5
B = 7

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def mod_inverse(a, m):
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None

# Проверка параметров
if gcd(A, M) != 1:
    raise ValueError(f"НОД({A}, {M}) != 1")
A_INV = mod_inverse(A, M)

def normalize(text):
    """Оставляем только буквы польского алфавита"""
    text = text.upper()
    # Замена латинских аналогов
    text = text.replace('Q', 'K').replace('V', 'W').replace('X', 'KS')
    return ''.join(c for c in text if c in ALPHABET)

def affine_encrypt(text):
    """E(x) = (a*x + b) mod m"""
    result = []
    for c in text:
        x = ALPHABET.index(c)
        y = (A * x + B) % M
        result.append(ALPHABET[y])
    return ''.join(result)

def affine_decrypt(text):
    """D(y) = a^(-1)*(y - b) mod m"""
    result = []
    for c in text:
        y = ALPHABET.index(c)
        x = (A_INV * (y - B)) % M
        result.append(ALPHABET[x])
    return ''.join(result)

def porta_encrypt(text, key):
    """Шифр Порты - полиалфавитная подстановка"""
    key = normalize(key)
    if not key:
        raise ValueError("Пустой ключ")
    
    result = []
    n = M // 2  # 16
    
    for i, c in enumerate(text):
        key_char = key[i % len(key)]
        # Используем только первую половину алфавита для ключа
        key_idx = ALPHABET.index(key_char) % n
        shift = (key_idx + 1) * 2
        
        idx = ALPHABET.index(c)
        new_idx = (idx + shift) % M
        result.append(ALPHABET[new_idx])
    
    return ''.join(result)

def porta_decrypt(text, key):
    """Дешифрование Порты (симметричное)"""
    return porta_encrypt(text, key)

def get_freq(text):
    """Частоты символов в процентах"""
    count = Counter(text)
    total = len(text)
    return {c: (count.get(c, 0) / total) * 100 for c in ALPHABET}

def show_histograms(freq1, freq2, title1="Исходный", title2="Зашифрованный"):
    """Построение гистограмм"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    chars = list(ALPHABET)
    vals1 = [freq1.get(c, 0) for c in chars]
    vals2 = [freq2.get(c, 0) for c in chars]
    
    ax1.bar(chars, vals1, color='blue', alpha=0.7)
    ax1.set_title(title1)
    ax1.set_ylabel('Частота (%)')
    ax1.tick_params(axis='x', rotation=45)
    
    ax2.bar(chars, vals2, color='red', alpha=0.7)
    ax2.set_title(title2)
    ax2.set_ylabel('Частота (%)')
    ax2.tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.show()

def main():
    print("=" * 50)
    print("ЛАБОРАТОРНАЯ РАБОТА №2")
    print("Шифры подстановки (польский язык)")
    print(f"Алфавит: {ALPHABET}")
    print(f"Аффинный: a={A}, b={B}, a^(-1)={A_INV}")
    print("=" * 50)
    
    # Загрузка файла
    filename = input("\nВведите имя файла (или Enter для тестового текста): ").strip()
    
    if filename:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                text = f.read()
        except FileNotFoundError:
            print("Файл не найден!")
            return
    else:
        # Тестовый текст (>5000 символов)
        text = """WARSZAWA STOŁECZNE MIASTO POLSKI LEŻY NAD WISŁĄ W ŚRODKOWEJ CZĘŚCI KRAJU 
        JEST NAJWIĘKSZYM MIASTEM W POLSCE I CENTRUM POLITYCZNYM GOSPODARCZYM KULTUROWYM 
        I NAUKOWYM KRAJU MIASTO Z PRAWEM POWIATU POŁOŻONE W DZIELNICY STOŁECZNEJ 
        W WOJEWÓDZTWIE MAZOWIECKIM WYDZIELONE JAKO SAMODZIELNA JEDNOSTKA 
        PODZIAŁU TERYTORIALNEGO ADMINISTRACJI RZĄDOWEJ I SAMORZĄDOWEJ ORAZ JAKO 
        SIEDZIBA WŁADZ WOJEWÓDZTWA MAZOWIECKIEGO I POWIATU WARSZAWSKIEGO ZAMIESZKANE 
        PRZEZ PONAD MILION SIEDEMSET TYSIĘCY MIESZKAŃCÓW W GRANICACH ADMINISTRACYJNYCH 
        A TRZY MILIONY W OBSZARZE ZESPOLU MIEJSKIEGO WARSZAWA JEST SIEDZIBĄ SEJMU I SENATU 
        PREZYDENTA RZECZPOSPOLITEJ POLSKIEJ RADY MINISTRÓW I INNYCH WŁADZ CENTRALNYCH 
        ORAZ INSTYTUCJI MIĘDZYNARODOWYCH TAKICH JAK FRONTEX CZY BIURO INSTYTUCJI 
        DEMOKRACJI I PRAW CZŁOWIEKA PRZY RADZIE EUROPY WARSZAWA JEST TAKŻE CENTRUM 
        NAUKOWYM Z WIELoma UNIWERSYTETAMI W TYM UNIWERSYTETEM WARSZAWSKIM I POLITECHNIKĄ 
        WARSZAWSKĄ """ * 10
    
    # Нормализация
    normalized = normalize(text)
    print(f"\nЗагружено символов: {len(text)}")
    print(f"После нормализации: {len(normalized)}")
    
    if len(normalized) < 5000:
        print("ПРЕДУПРЕЖДЕНИЕ: Текст меньше 5000 символов!")
    
    # Меню
    while True:
        print("\n" + "=" * 30)
        print("МЕНЮ:")
        print("1. Аффинный шифр Цезаря - зашифровать")
        print("2. Аффинный шифр Цезаря - расшифровать")
        print("3. Шифр Порты - зашифровать")
        print("4. Шифр Порты - расшифровать")
        print("5. Гистограммы частот")
        print("0. Выход")
        
        choice = input("\nВыбор: ").strip()
        
        if choice == "0":
            break
        
        elif choice == "1":
            start = time.perf_counter()
            encrypted = affine_encrypt(normalized)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\nЗашифровано за {elapsed:.3f} мс")
            print(f"Первые 100 символов: {encrypted[:100]}...")
            
            
            
            filepath = os.path.join(save_dir, "encrypted_affine.txt")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(encrypted)
            print(f"Сохранено в: {filepath}")

            # Сохраняем для гистограмм
            global last_source, last_affine
            last_source = normalized
            last_affine = encrypted
        
        elif choice == "2":
            start = time.perf_counter()
            decrypted = affine_decrypt(normalized)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\nРасшифровано за {elapsed:.3f} мс")
            print(f"Первые 100 символов: {decrypted[:100]}...")
            
            filepath = os.path.join(save_dir, "decrypted_affine.txt")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(decrypted)         
            print(f"Сохранено в {filepath}")
        
        elif choice in ("3", "4"):
            key = input("Введите ключ (только польские буквы): ").strip().upper()
            if not key:
                print("Ключ не может быть пустым!")
                continue
            
            start = time.perf_counter()
            result = porta_encrypt(normalized, key)
            elapsed = (time.perf_counter() - start) * 1000
            
            action = "Зашифровано" if choice == "3" else "Расшифровано"
            print(f"\n{action} за {elapsed:.3f} мс")
            print(f"Первые 100 символов: {result[:100]}...")
            
        
            filepath = os.path.join(save_dir, "porta_result.txt")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(result)
            print(f"Сохранено в {filepath}")
            
            global last_porta
            last_porta = result
            last_source = normalized
        
        elif choice == "5":
            print("\nВыберите сравнение:")
            print("1. Исходный vs Аффинный")
            print("2. Исходный vs Порты")
            h_choice = input("Выбор: ").strip()
            
            try:
                if h_choice == "1":
                    f1 = get_freq(last_source)
                    f2 = get_freq(last_affine)
                    show_histograms(f1, f2, "Исходный", "Аффинный шифр")
                elif h_choice == "2":
                    f1 = get_freq(last_source)
                    f2 = get_freq(last_porta)
                    show_histograms(f1, f2, "Исходный", "Шифр Порты")
                else:
                    print("Неверный выбор!")
            except NameError:
                print("Сначала выполните шифрование!")
        
        else:
            print("Неверный выбор!")

if __name__ == "__main__":
    last_source = ""
    last_affine = ""
    last_porta = ""
    main()