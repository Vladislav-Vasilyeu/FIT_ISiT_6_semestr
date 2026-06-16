import time
from collections import Counter
import matplotlib.pyplot as plt
import os

# Польский алфавит (32 буквы)
ALPHABET = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ"
M = len(ALPHABET)

def normalize(text):
    """Оставляем только буквы польского алфавита"""
    text = text.upper()
    text = text.replace('Q', 'K').replace('V', 'W').replace('X', 'KS')
    return ''.join(c for c in text if c in ALPHABET)

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
    ax1.set_title(f"{title1}\n(Энтропия: {calc_entropy(freq1):.3f})")
    ax1.set_ylabel('Частота (%)')
    ax1.tick_params(axis='x', rotation=45)
    
    ax2.bar(chars, vals2, color='red', alpha=0.7)
    ax2.set_title(f"{title2}\n(Энтропия: {calc_entropy(freq2):.3f})")
    ax2.set_ylabel('Частота (%)')
    ax2.tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.show()

def calc_entropy(freq_dict):
    """Энтропия Шеннона"""
    import math
    entropy = 0
    for freq in freq_dict.values():
        if freq > 0:
            entropy -= (freq/100) * math.log2(freq/100)
    return entropy

# ==================== ШИФР 1: МАРШРУТНАЯ ПЕРЕСТАНОВКА ====================

def route_encrypt(text, cols):
    """
    Маршрутная перестановка:
    Запись по столбцам, считывание по строкам
    """
    # Дополняем текст до кратного cols
    rows = (len(text) + cols - 1) // cols
    padded_len = rows * cols
    text = text.ljust(padded_len, 'X')  # дополняем 'X'
    
    # Создаем таблицу: запись по столбцам
    table = [['' for _ in range(cols)] for _ in range(rows)]
    
    idx = 0
    for col in range(cols):
        for row in range(rows):
            table[row][col] = text[idx]
            idx += 1
    
    # Считывание по строкам
    result = ''
    for row in range(rows):
        for col in range(cols):
            result += table[row][col]
    
    return result, rows, cols

def route_decrypt(text, rows, cols):
    """
    Дешифрование маршрутной перестановки:
    Запись по строкам, считывание по столбцам
    """
    # Создаем таблицу: запись по строкам
    table = [['' for _ in range(cols)] for _ in range(rows)]
    
    idx = 0
    for row in range(rows):
        for col in range(cols):
            table[row][col] = text[idx]
            idx += 1
    
    # Считывание по столбцам
    result = ''
    for col in range(cols):
        for row in range(rows):
            result += table[row][col]
    
    return result.rstrip('X')  # убираем дополнение

# ==================== ШИФР 2: МНОЖЕСТВЕННАЯ ПЕРЕСТАНОВКА ====================

def get_key_order(keyword):
    """Получаем порядок столбцов из ключевого слова"""
    # Присваиваем номера буквам по алфавиту
    indexed = [(char, i) for i, char in enumerate(keyword)]
    # Сортируем по алфавиту
    sorted_chars = sorted(indexed, key=lambda x: x[0])
    # Возвращаем новые позиции
    order = [0] * len(keyword)
    for new_pos, (char, old_pos) in enumerate(sorted_chars):
        order[old_pos] = new_pos
    return order

def double_permutation_encrypt(text, key1, key2):
    """
    Множественная перестановка:
    Сначала перестановка столбцов по key1,
    потом перестановка строк по key2
    """
    key1 = normalize(key1)
    key2 = normalize(key2)
    
    if not key1 or not key2:
        raise ValueError("Ключи не могут быть пустыми")
    
    cols = len(key1)
    rows = len(key2)
    
    # Дополняем текст
    needed = rows * cols
    text = text.ljust(needed, 'X')
    
    # Заполняем таблицу по строкам
    table = []
    idx = 0
    for r in range(rows):
        row = []
        for c in range(cols):
            row.append(text[idx])
            idx += 1
        table.append(row)
    
    # Перестановка столбцов (по key1)
    col_order = get_key_order(key1)
    inv_col_order = [0] * cols
    for i, pos in enumerate(col_order):
        inv_col_order[pos] = i
    
    new_table = []
    for r in range(rows):
        new_row = [''] * cols
        for c in range(cols):
            new_row[col_order[c]] = table[r][c]
        new_table.append(new_row)
    table = new_table
    
    # Перестановка строк (по key2)
    row_order = get_key_order(key2)
    inv_row_order = [0] * rows
    for i, pos in enumerate(row_order):
        inv_row_order[pos] = i
    
    new_table = [''] * rows
    for r in range(rows):
        new_table[row_order[r]] = table[r]
    table = new_table
    
    # Считываем результат
    result = ''
    for r in range(rows):
        for c in range(cols):
            result += table[r][c]
    
    return result, rows, cols, inv_row_order, inv_col_order

def double_permutation_decrypt(text, rows, cols, inv_row_order, inv_col_order):
    """Дешифрование множественной перестановки"""
    # Заполняем таблицу
    table = []
    idx = 0
    for r in range(rows):
        row = []
        for c in range(cols):
            row.append(text[idx])
            idx += 1
        table.append(row)
    
    # Обратная перестановка строк
    new_table = [''] * rows
    for r in range(rows):
        new_table[inv_row_order[r]] = table[r]
    table = new_table
    
    # Обратная перестановка столбцов
    new_table = []
    for r in range(rows):
        new_row = [''] * cols
        for c in range(cols):
            new_row[inv_col_order[c]] = table[r][c]
        new_table.append(new_row)
    table = new_table
    
    # Считываем по строкам
    result = ''
    for r in range(rows):
        for c in range(cols):
            result += table[r][c]
    
    return result.rstrip('X')

def print_table(table, title="Таблица"):
    """Красивый вывод таблицы"""
    print(f"\n{title}:")
    cols = len(table[0])
    print("+" + "---+" * cols)
    for row in table:
        print("| " + " | ".join(row) + " |")
        print("+" + "---+" * cols)

def main():
    print("=" * 60)
    print("ЛАБОРАТОРНАЯ РАБОТА №3")
    print("Шифры ПЕРЕСТАНОВКИ (польский язык)")
    print(f"Алфавит: {ALPHABET} ({M} символов)")
    print("=" * 60)
    
    # Загрузка файла
    filename = input("\nВведите имя файла (Enter для тестового текста): ").strip()
    
    if filename:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                text = f.read()
        except FileNotFoundError:
            print("Файл не найден!")
            return
    else:
        # Тестовый текст (>500 символов)
        text = """WARSZAWA STOŁECZNE MIASTO POLSKI LEŻY NAD WISŁĄ W ŚRODKOWEJ CZĘŚCI KRAJU 
        JEST NAJWIĘKSZYM MIASTEM W POLSCE I CENTRUM POLITYCZNYM GOSPODARCZYM KULTUROWYM 
        I NAUKOWYM KRAJU MIASTO Z PRAWEM POWIATU POŁOŻONE W DZIELNICY STOŁECZNEJ 
        W WOJEWÓDZTWIE MAZOWIECKIM WYDZIELONE JAKO SAMODZIELNA JEDNOSTKA 
        PODZIAŁU TERYTORIALNEGO ADMINISTRACJI RZĄDOWEJ I SAMORZĄDOWEJ ORAZ JAKO 
        SIEDZIBA WŁADZ WOJEWÓDZTWA MAZOWIECKIEGO I POWIATU WARSZAWSKIEGO ZAMIESZKANE 
        PRZEZ PONAD MILION SIEDEMSET TYSIĘCY MIESZKAŃCÓW W GRANICACH ADMINISTRACYJNYCH 
        A TRZY MILIONY W OBSZARZE ZESPOLU MIEJSKIEGO WARSZAWA JEST SIEDZIBĄ SEJMU I SENATU 
        PREZYDENTA RZECZPOSPOLITEJ POLSKIEJ RADY MINISTRÓW I INNYCH WŁADZ CENTRALNYCH""" * 2
    
    # Нормализация
    normalized = normalize(text)
    print(f"\nЗагружено символов: {len(text)}")
    print(f"После нормализации: {len(normalized)}")
    
    if len(normalized) < 500:
        print("ПРЕДУПРЕЖДЕНИЕ: Текст меньше 500 символов!")
    
    # Глобальные переменные для гистограмм
    global last_source, last_route, last_double
    
    last_source = normalized
    last_route = ""
    last_double = ""
    
    while True:
        print("\n" + "=" * 40)
        print("МЕНЮ:")
        print("1. Маршрутная перестановка - зашифровать")
        print("2. Маршрутная перестановка - расшифровать")
        print("3. Множественная перестановка - зашифровать")
        print("4. Множественная перестановка - расшифровать")
        print("5. Гистограммы частот")
        print("0. Выход")
        
        choice = input("\nВыбор: ").strip()
        
        if choice == "0":
            break
        
        # ==================== МАРШРУТНАЯ ПЕРЕСТАНОВКА ====================
        elif choice == "1":
            try:
                cols = int(input("Введите количество столбцов таблицы: "))
                if cols <= 0:
                    print("Количество столбцов должно быть > 0!")
                    continue
            except ValueError:
                print("Введите число!")
                continue
            
            start = time.perf_counter()
            encrypted, rows, cols_used = route_encrypt(normalized, cols)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\n{'='*40}")
            print(f"МАРШРУТНАЯ ПЕРЕСТАНОВКА")
            print(f"Параметры: {rows} строк × {cols_used} столбцов")
            print(f"Зашифровано за {elapsed:.3f} мс")
            print(f"Результат ({len(encrypted)} симв.):")
            print(encrypted[:100] + "..." if len(encrypted) > 100 else encrypted)
            
            # Сохраняем параметры для дешифрования
            global route_params
            route_params = (rows, cols_used)
            
            # Сохраняем в файл
            with open("route_encrypted.txt", "w", encoding="utf-8") as f:
                f.write(encrypted)
            with open("route_params.txt", "w", encoding="utf-8") as f:
                f.write(f"{rows}\n{cols_used}")
            print("Сохранено: route_encrypted.txt, route_params.txt")
            
            last_route = encrypted
            
        elif choice == "2":
            try:
                rows = int(input("Введите количество строк: "))
                cols = int(input("Введите количество столбцов: "))
            except ValueError:
                print("Введите числа!")
                continue
            
            # Проверка длины
            if len(normalized) != rows * cols:
                print(f"Ошибка: длина текста ({len(normalized)}) != {rows}×{cols}={rows*cols}")
                continue
            
            start = time.perf_counter()
            decrypted = route_decrypt(normalized, rows, cols)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\nРасшифровано за {elapsed:.3f} мс")
            print(f"Результат ({len(decrypted)} симв.):")
            print(decrypted[:100] + "..." if len(decrypted) > 100 else decrypted)
            
            with open("route_decrypted.txt", "w", encoding="utf-8") as f:
                f.write(decrypted)
            print("Сохранено: route_decrypted.txt")
        
        # ==================== МНОЖЕСТВЕННАЯ ПЕРЕСТАНОВКА ====================
        elif choice == "3":
            print("\nВведите ключевые слова (только польские буквы):")
            key1 = input("Ключ для столбцов (например, IMIE): ").strip().upper()
            key2 = input("Ключ для строк (например, NAZWISKO): ").strip().upper()
            
            try:
                key1 = normalize(key1)
                key2 = normalize(key2)
                if not key1 or not key2:
                    raise ValueError("Пустые ключи")
            except Exception as e:
                print(f"Ошибка ключей: {e}")
                continue
            
            start = time.perf_counter()
            encrypted, rows, cols, inv_row, inv_col = double_permutation_encrypt(normalized, key1, key2)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\n{'='*40}")
            print(f"МНОЖЕСТВЕННАЯ ПЕРЕСТАНОВКА")
            print(f"Ключ столбцов: '{key1}' ({cols} столбцов)")
            print(f"Порядок столбцов: {get_key_order(key1)}")
            print(f"Ключ строк: '{key2}' ({rows} строк)")
            print(f"Порядок строк: {get_key_order(key2)}")
            print(f"Таблица: {rows}×{cols}")
            print(f"Зашифровано за {elapsed:.3f} мс")
            print(f"Результат ({len(encrypted)} симв.):")
            print(encrypted[:100] + "..." if len(encrypted) > 100 else encrypted)
            
            # Сохраняем параметры
            global double_params
            double_params = (rows, cols, inv_row, inv_col)
            
            with open("double_encrypted.txt", "w", encoding="utf-8") as f:
                f.write(encrypted)
            with open("double_params.txt", "w", encoding="utf-8") as f:
                f.write(f"{rows}\n{cols}\n{inv_row}\n{inv_col}")
            print("Сохранено: double_encrypted.txt, double_params.txt")
            
            last_double = encrypted
            
        elif choice == "4":
            try:
                rows = int(input("Введите количество строк: "))
                cols = int(input("Введите количество столбцов: "))
                inv_row = eval(input("Введите обратный порядок строк (список): "))
                inv_col = eval(input("Введите обратный порядок столбцов (список): "))
            except Exception as e:
                print(f"Ошибка ввода: {e}")
                continue
            
            if len(normalized) != rows * cols:
                print(f"Ошибка: длина текста ({len(normalized)}) != {rows}×{cols}")
                continue
            
            start = time.perf_counter()
            decrypted = double_permutation_decrypt(normalized, rows, cols, inv_row, inv_col)
            elapsed = (time.perf_counter() - start) * 1000
            
            print(f"\nРасшифровано за {elapsed:.3f} мс")
            print(f"Результат ({len(decrypted)} симв.):")
            print(decrypted[:100] + "..." if len(decrypted) > 100 else decrypted)
            
            with open("double_decrypted.txt", "w", encoding="utf-8") as f:
                f.write(decrypted)
            print("Сохранено: double_decrypted.txt")
        
        # ==================== ГИСТОГРАММЫ ====================
        elif choice == "5":
            print("\nГистограммы частот:")
            print("1. Исходный vs Маршрутная перестановка")
            print("2. Исходный vs Множественная перестановка")
            print("3. Сравнение всех трёх")
            
            h_choice = input("Выбор: ").strip()
            
            try:
                f_source = get_freq(last_source)
                
                if h_choice == "1":
                    if not last_route:
                        print("Сначала выполните маршрутное шифрование!")
                        continue
                    f_route = get_freq(last_route)
                    show_histograms(f_source, f_route, "Исходный", "Маршрутная перестановка")
                    print("\n[ВАЖНО] Гистограммы должны совпадать!")
                    print("Это признак перестановки (символы те же, порядок другой)")
                    
                elif h_choice == "2":
                    if not last_double:
                        print("Сначала выполните двойное шифрование!")
                        continue
                    f_double = get_freq(last_double)
                    show_histograms(f_source, f_double, "Исходный", "Множественная перестановка")
                    print("\n[ВАЖНО] Гистограммы должны совпадать!")
                    
                elif h_choice == "3":
                    if not last_route or not last_double:
                        print("Сначала выполните оба шифрования!")
                        continue
                    
                    # Три гистограммы
                    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
                    chars = list(ALPHABET)
                    
                    for ax, freq, title in zip(axes, 
                        [f_source, get_freq(last_route), get_freq(last_double)],
                        ["Исходный", "Маршрутная", "Множественная"]):
                        vals = [freq.get(c, 0) for c in chars]
                        ax.bar(chars, vals, alpha=0.7)
                        ax.set_title(f"{title}\n(Энтропия: {calc_entropy(freq):.3f})")
                        ax.tick_params(axis='x', rotation=45)
                    
                    plt.tight_layout()
                    plt.show()
                    print("\n[ВЫВОД] Все три гистограммы идентичны!")
                    print("Перестановка НЕ меняет частоты символов.")
                    
            except Exception as e:
                print(f"Ошибка: {e}")
        
        else:
            print("Неверный выбор!")

if __name__ == "__main__":
    main()