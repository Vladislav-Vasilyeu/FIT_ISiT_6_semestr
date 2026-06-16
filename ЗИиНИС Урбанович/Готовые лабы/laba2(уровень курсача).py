import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import time
import re
from collections import Counter
import string

class PolishCipherApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Криптографические шифры подстановки - Вариант 5")
        self.root.geometry("1200x800")
        
        # Польский алфавит (32 буквы)
        self.alphabet = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ"
        self.m = len(self.alphabet)
        
        # Параметры аффинного шифра
        self.a = 5
        self.b = 7
        
        # Проверка взаимной простоты
        if self.gcd(self.a, self.m) != 1:
            raise ValueError(f"Параметр a={self.a} должен быть взаимно прост с m={self.m}")
        
        # Вычисляем обратное к a
        self.a_inv = self.mod_inverse(self.a, self.m)
        
        # Таблица Порты (упрощённая версия для польского алфавита)
        self.porta_table = self.generate_porta_table()
        
        self.setup_ui()
    
    def gcd(self, a, b):
        """НОД двух чисел"""
        while b:
            a, b = b, a % b
        return a
    
    def mod_inverse(self, a, m):
        """Мультипликативное обратное по модулю"""
        for x in range(1, m):
            if (a * x) % m == 1:
                return x
        return None
    
    def generate_porta_table(self):
        """
        Генерация таблицы Порты
        Используем половину алфавита как ключи
        """
        n = self.m // 2  # 16
        table = {}
        
        for i, key_char in enumerate(self.alphabet[:n]):
            row = {}
            for j, plain_char in enumerate(self.alphabet):
                # Сдвиг зависит от позиции ключа
                shift = (i + 1) * 2
                new_pos = (j + shift) % self.m
                row[plain_char] = self.alphabet[new_pos]
            table[key_char] = row
        
        return table
    
    def normalize_text(self, text):
        """Нормализация текста: только буквы польского алфавита в верхнем регистре"""
        text = text.upper()
        # Замена латинских аналогов на польские
        replacements = {
            'Q': 'K', 'V': 'W', 'X': 'KS',
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        # Оставляем только символы алфавита
        result = ''.join(c for c in text if c in self.alphabet)
        return result
    
    def affine_encrypt(self, text):
        """Аффинное шифрование: E(x) = (a*x + b) mod m"""
        result = []
        for char in text:
            if char in self.alphabet:
                x = self.alphabet.index(char)
                y = (self.a * x + self.b) % self.m
                result.append(self.alphabet[y])
            else:
                result.append(char)
        return ''.join(result)
    
    def affine_decrypt(self, text):
        """Аффинное дешифрование: D(y) = a^(-1) * (y - b) mod m"""
        result = []
        for char in text:
            if char in self.alphabet:
                y = self.alphabet.index(char)
                x = (self.a_inv * (y - self.b)) % self.m
                result.append(self.alphabet[x])
            else:
                result.append(char)
        return ''.join(result)
    
    def porta_encrypt(self, text, key):
        """Шифрование методом Порты"""
        if not key:
            raise ValueError("Ключ не может быть пустым")
        
        key = self.normalize_text(key.upper())
        result = []
        key_len = len(key)
        
        for i, char in enumerate(text):
            if char in self.alphabet:
                key_char = key[i % key_len]
                # Используем только первую половину алфавита для ключа
                if key_char not in self.porta_table:
                    key_char = self.alphabet[0]  # Заглушка
                result.append(self.porta_table[key_char].get(char, char))
            else:
                result.append(char)
        return ''.join(result)
    
    def porta_decrypt(self, text, key):
        """
        Дешифрование Порты (симметричное шифрование)
        Для Порты: encrypt = decrypt (involution)
        """
        return self.porta_encrypt(text, key)
    
    def calculate_frequency(self, text):
        """Подсчёт частот символов"""
        freq = Counter(c for c in text if c in self.alphabet)
        total = sum(freq.values())
        if total == 0:
            return {}
        return {char: count/total for char, count in sorted(freq.items())}
    
    def setup_ui(self):
        """Настройка интерфейса"""
        # Верхняя панель с информацией
        info_frame = ttk.LabelFrame(self.root, text="Информация о варианте", padding=10)
        info_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(info_frame, text="Вариант 5: Польский язык", font=('Arial', 10, 'bold')).pack(anchor="w")
        ttk.Label(info_frame, text=f"Алфавит: {self.alphabet} ({self.m} символов)").pack(anchor="w")
        ttk.Label(info_frame, text=f"Аффинный шифр: a={self.a}, b={self.b}, a⁻¹={self.a_inv} (mod {self.m})").pack(anchor="w")
        ttk.Label(info_frame, text="Шифр Порты: полиалфавитная подстановка").pack(anchor="w")
        
        # Панель выбора файла
        file_frame = ttk.LabelFrame(self.root, text="Загрузка файла", padding=10)
        file_frame.pack(fill="x", padx=10, pady=5)
        
        self.file_path_var = tk.StringVar()
        ttk.Entry(file_frame, textvariable=self.file_path_var, width=80).pack(side="left", padx=5)
        ttk.Button(file_frame, text="Обзор...", command=self.load_file).pack(side="left", padx=5)
        
        # Панель управления
        control_frame = ttk.LabelFrame(self.root, text="Управление шифрованием", padding=10)
        control_frame.pack(fill="x", padx=10, pady=5)
        
        # Выбор метода
        ttk.Label(control_frame, text="Метод:").pack(side="left", padx=5)
        self.method_var = tk.StringVar(value="affine")
        ttk.Radiobutton(control_frame, text="Аффинный Цезарь", variable=self.method_var, 
                       value="affine").pack(side="left", padx=5)
        ttk.Radiobutton(control_frame, text="Шифр Порты", variable=self.method_var, 
                       value="porta").pack(side="left", padx=5)
        
        # Ключ для Порты
        ttk.Label(control_frame, text="Ключ (для Порты):").pack(side="left", padx=(20, 5))
        self.key_var = tk.StringVar(value="TAJNE")
        ttk.Entry(control_frame, textvariable=self.key_var, width=15).pack(side="left", padx=5)
        
        # Кнопки операций
        ttk.Button(control_frame, text="Зашифровать", command=self.encrypt).pack(side="left", padx=20)
        ttk.Button(control_frame, text="Расшифровать", command=self.decrypt).pack(side="left", padx=5)
        
        # Панель с текстами
        text_frame = ttk.Frame(self.root)
        text_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Исходный текст
        left_frame = ttk.LabelFrame(text_frame, text="Исходный текст")
        left_frame.pack(side="left", fill="both", expand=True, padx=5)
        self.source_text = scrolledtext.ScrolledText(left_frame, wrap=tk.WORD, height=15)
        self.source_text.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Результат
        right_frame = ttk.LabelFrame(text_frame, text="Результат")
        right_frame.pack(side="right", fill="both", expand=True, padx=5)
        self.result_text = scrolledtext.ScrolledText(right_frame, wrap=tk.WORD, height=15)
        self.result_text.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Статистика времени
        self.time_label = ttk.Label(self.root, text="Время выполнения: -", font=('Arial', 9, 'italic'))
        self.time_label.pack(pady=5)
        
        # Кнопка гистограмм
        ttk.Button(self.root, text="Показать гистограммы частот", 
                  command=self.show_histograms).pack(pady=5)
        
        # Статус
        self.status_var = tk.StringVar(value="Готово")
        ttk.Label(self.root, textvariable=self.status_var, relief="sunken").pack(fill="x", padx=10, pady=5)
    
    def load_file(self):
        """Загрузка файла"""
        path = filedialog.askopenfilename(filetypes=[("Text files", "*.txt"), ("All files", "*.*")])
        if path:
            self.file_path_var.set(path)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.source_text.delete(1.0, tk.END)
                self.source_text.insert(1.0, content)
                self.status_var.set(f"Загружен файл: {path}")
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось загрузить файл: {str(e)}")
    
    def encrypt(self):
        """Шифрование"""
        try:
            text = self.source_text.get(1.0, tk.END).strip()
            if not text:
                messagebox.showwarning("Предупреждение", "Введите текст для шифрования")
                return
            
            # Нормализация
            normalized = self.normalize_text(text)
            if len(normalized) < 5000:
                if not messagebox.askyesno("Предупреждение", 
                    f"Текст содержит только {len(normalized)} значимых символов (требуется >5000). Продолжить?"):
                    return
            
            start_time = time.perf_counter()
            
            if self.method_var.get() == "affine":
                result = self.affine_encrypt(normalized)
                method_name = "Аффинный Цезарь"
            else:
                key = self.key_var.get()
                if not key:
                    messagebox.showwarning("Предупреждение", "Введите ключ для шифра Порты")
                    return
                result = self.porta_encrypt(normalized, key)
                method_name = "Шифр Порты"
            
            elapsed = (time.perf_counter() - start_time) * 1000  # мс
            
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(1.0, result)
            self.time_label.config(text=f"Время {method_name}: {elapsed:.3f} мс | Символов: {len(normalized)}")
            self.status_var.set(f"Зашифровано методом: {method_name}")
            
            # Сохраняем для гистограмм
            self.last_source = normalized
            self.last_result = result
            
        except Exception as e:
            messagebox.showerror("Ошибка", str(e))
    
    def decrypt(self):
        """Дешифрование"""
        try:
            text = self.source_text.get(1.0, tk.END).strip()
            if not text:
                messagebox.showwarning("Предупреждение", "Введите текст для дешифрования")
                return
            
            normalized = self.normalize_text(text)
            
            start_time = time.perf_counter()
            
            if self.method_var.get() == "affine":
                result = self.affine_decrypt(normalized)
                method_name = "Аффинный Цезарь"
            else:
                key = self.key_var.get()
                if not key:
                    messagebox.showwarning("Предупреждение", "Введите ключ для шифра Порты")
                    return
                result = self.porta_decrypt(normalized, key)
                method_name = "Шифр Порты"
            
            elapsed = (time.perf_counter() - start_time) * 1000
            
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(1.0, result)
            self.time_label.config(text=f"Время дешифрования {method_name}: {elapsed:.3f} мс")
            self.status_var.set(f"Расшифровано методом: {method_name}")
            
        except Exception as e:
            messagebox.showerror("Ошибка", str(e))
    
    def show_histograms(self):
        """Отображение гистограмм частот"""
        try:
            source = getattr(self, 'last_source', None)
            result = getattr(self, 'last_result', None)
            
            if not source or not result:
                # Используем текущие тексты из полей
                source = self.normalize_text(self.source_text.get(1.0, tk.END))
                result = self.normalize_text(self.result_text.get(1.0, tk.END))
            
            if not source or not result:
                messagebox.showwarning("Предупреждение", "Нет данных для построения гистограмм")
                return
            
            # Создаём окно с графиками
            hist_window = tk.Toplevel(self.root)
            hist_window.title("Гистограммы частот символов")
            hist_window.geometry("1200x600")
            
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
            
            # Частоты исходного текста
            freq_source = self.calculate_frequency(source)
            if freq_source:
                chars = list(freq_source.keys())
                vals = [freq_source[c] * 100 for c in chars]  # в процентах
                ax1.bar(chars, vals, color='skyblue', edgecolor='navy')
                ax1.set_title(f'Исходный текст\n(Энтропия: {self.calculate_entropy(freq_source):.3f})', fontsize=11)
                ax1.set_xlabel('Символы')
                ax1.set_ylabel('Частота (%)')
                ax1.tick_params(axis='x', rotation=45)
            
            # Частоты зашифрованного текста
            freq_result = self.calculate_frequency(result)
            if freq_result:
                chars = list(freq_result.keys())
                vals = [freq_result[c] * 100 for c in chars]
                ax2.bar(chars, vals, color='lightcoral', edgecolor='darkred')
                ax2.set_title(f'Зашифрованный текст\n(Энтропия: {self.calculate_entropy(freq_result):.3f})', fontsize=11)
                ax2.set_xlabel('Символы')
                ax2.set_ylabel('Частота (%)')
                ax2.tick_params(axis='x', rotation=45)
            
            plt.tight_layout()
            
            canvas = FigureCanvasTkAgg(fig, master=hist_window)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)
            
            # Добавляем статистику
            stats_text = f"Исходный: {len(source)} симв., уникальных: {len(freq_source)}\n"
            stats_text += f"Зашифрованный: {len(result)} симв., уникальных: {len(freq_result)}"
            ttk.Label(hist_window, text=stats_text, font=('Courier', 10)).pack(pady=5)
            
        except Exception as e:
            messagebox.showerror("Ошибка", f"Ошибка построения гистограмм: {str(e)}")
    
    def calculate_entropy(self, freq_dict):
        """Вычисление энтропии Шеннона"""
        import math
        entropy = 0
        for freq in freq_dict.values():
            if freq > 0:
                entropy -= freq * math.log2(freq)
        return entropy

def generate_sample_text():
    """Генерация примера польского текста >5000 символов"""
    # Фрагменты из польской Википедии и классической литературы
    sample = """
    POLSKA RZECZPOSPOLITA LUDOWA BYŁA PAŃSTWEM W ŚRODKOWEJ EUROPIE ISTNIEJĄCYM W LATACH 
    TYSIĄC DZIEWIĘĆSET CZTERDZIEŚCI CZTERY DO TYSIĄC DZIEWIĘĆSET OSIEMDZIESIĄT DZIEWIĘĆ. 
    GRANICZYŁA Z ZSRR NA WSCHODZIE CZECHOSŁOWACJĄ I NRD NA ZACHODZIE MORZEM BAŁTYCKIM 
    NA PÓŁNOCY ORAZ CSR I NRD NA POŁUDNIU. POWIERZCHNIA WYNOSIŁA TRZYSIĄT JEDEN TYSIĘCY 
    OSIEMSET KILOMETRÓW KWADRATOWYCH CO CZYNIŁO JĄ SIÓDMYM PAŃSTWEM W EUROPIE POD WZGLĘDEM 
    POWIERZCHNI. STOLICĄ BYŁA WARSZAWA.
    
    HISTORIA POLSKI JEST HISTORIĄ PAŃSTWA POLSKIEGO I ZWIĄZANYCH Z NIM ZIEM OD PRADZIEJÓW 
    DO CZASÓW WSPÓŁCZESNYCH. HISTORIA TERYTORIUM ZAMIESZKIWANEGO PRZEZ POLAKÓW SIĘGA 
    PLEMIENNEGO OKRESU ŻELAZA W KTÓRYM KSZTAŁTOWAŁY SIĘ PLEMIENA ZACHODNIOSŁOWIAŃSKIE 
    W TYM POLAN Z któRYCH WYROSŁO PAŃSTWO POLSKIE. W X WIEKU ZA PANOWANIA PIASTÓW 
    PAŃSTWO POLSKIE PRZYJĘŁO CHRZEST I WESZŁO W ÓWCZESNY KRĄG CYWILIZACJI ŁACIŃSKIEJ.
    
    WSPANIAŁA POLSKA KULTURA LITERACKA ROZWINĘŁA SIĘ W PEŁNI W XIX WIEKU ZE WZGLĘDU NA 
    BRAK PAŃSTWOWOŚCI POLACY SKUPILI SIĘ NA ROZWOJU KULTURY I NAUCE. ADAM MICKIEWICZ 
    JULIUSZ SŁOWACKI I CYPRIAN KAMIL NORWID TO NAJWIĘKSZE POSTACIE POLSKIEGO ROMANTYZMU.
    HENRYK SIENKIEWICZ OTRZYMAŁ NAGRODĘ NOBLA W DZIEDZINIE LITERATURY. W MUZYCE 
    WYBITNYM KOMPOZYTOREM BYŁ FRYDERYK CHOPIN.
    
    WARSZAWA STOŁECZNE MIASTO I NAJWIĘKSZE MIASTO POLSKI POŁOŻONE W ŚRODKOWO WSCHODNIEJ 
    CZĘŚCI KRAJU W DOLINIE WISŁY NA OBSZARZE ŚRODKOWOWSKOŁOWIAŃSKIEJ RÓWNINY NA ODLEGŁOŚCI 
    OKOŁO TRZYSIĄT KILOMETRÓW OD KARPAT I STO KILOMETRÓW OD MORZA BAŁTYCKIEGO. 
    JEST MIASTEM STOŁECZNYM OD TYSIĄC SZEŚĆSET JEDENASTEGO ROKU.
    
    KRAKÓW TO MIASTO NA PRAWACH POWIATU POŁOŻONE W POŁUDNIOWEJ POLSCE NAD WISŁĄ DRUGIE 
    CO DO WIELKOŚCI MIASTO KRAJU. BYŁO STOŁECZNYM MIASTEM POLSKI OD TYSIĄC CZTERYSTA 
    DO TYSIĄC SZEŚĆSET JEDENASTEGO ROKU. W KRAKOWIE ZNAJDUJE SIĘ JEDNO Z NAJSTARSZYCH 
    UNIWERSYTETÓW W EUROPIE UNIWERSYTET JAGIELLOŃSKI ZAŁOŻONY W TYSIĄC CZTERYSTA 
    PIĘĆDZIESIĄT CZWARTYM ROKU PRZEZ KRÓLA KAZIMIERZA WIELKIEGO.
    
    GDAŃSK TO MIASTO NA PRAWACH POWIATU W PÓŁNOCNEJ POLSCE W POBRZEŻU GDAŃSKIM NAD 
    MORZEM BAŁTYCKIM PRZY UJŚCIU MOTŁAWY DO WISŁY NA ZATOCE GDAŃSKIEJ. CENTRUM 
    GOSPODARCZYM MIASTA JEST PORT MORSKI NAJWIĘKSZY W POLSCE I JEDEN Z NAJWIĘKSZYCH 
    NA MORZU BAŁTYCKIM.
    
    ŁÓDŹ TO MIASTO NA PRAWACH POWIATU W ŚRODKOWEJ POLSCE W DZISIEJSZYM WOJEWÓDZTWIE 
    ŁÓDZKIM. W PRZESZŁOŚCI WIELKIE CENTRUM PRZEMYSŁU WŁÓKIENNICZEGO ZNANE JAKO 
    MIASTO ZAKŁADOWE I CZERWONE. OBECNIE WAŻNY OSRODEK KULTURY I HANDLU.
    
    POZNAŃ TO MIASTO NA PRAWACH POWIATU W ZACHODNIEJ POLSCE W DZISIEJSZYM WOJEWÓDZTWIE 
    WIELKOPOLSKIM. JEDNO Z NAJSTARSZYCH MIAST POLSKI LEŻY NAD WARTĄ NA POZNANSKIM 
    PŁASKOWYZU. W PRZESZŁOŚCI STOŁECZNE MIASTO PAŃSTWA POLSKIEGO W CZASACH PIASTÓW.
    
    WROCŁAW TO MIASTO NA PRAWACH POWIATU W POŁUDNIOWO ZACHODNIEJ POLSCE NA DOLNYM 
    ŚLĄSKU NAD ODRĄ. CZWARTE CO DO WIELKOŚCI MIASTO W POLSCE. HISTORYCZNIE LEŻY NA 
    ZIEMIACH CZESKICH NIEMIECKICH I POLSKICH OBECNIE STOŁECZNE MIASTO WOJEWÓDZTWA 
    DOLNOŚLĄSKIEGO.
    
    SZCZECIN TO MIASTO NA PRAWACH POWIATU W PÓŁNOCNO ZACHODNIEJ POLSCE NAD ODRĄ I 
    ZALEWEM SZCZECIŃSKIM SIEDZIBA WOJEWÓDZTWA ZACHODNIOPOMORSKIEGO. WAŻNY PORT MORSKI 
    I OSRODEK PRZEMYSŁOWY. NAJBLIŻEJ GRANICY Z NIEMCAMI POŁOŻONE MIASTO WOJEWÓDZKIE W POLSCE.
    """
    return sample * 3  # Умножаем для достижения >5000 символов

if __name__ == "__main__":
    # Создаём окно
    root = tk.Tk()
    app = PolishCipherApp(root)
    
    # Загружаем пример текста при запуске
    sample = generate_sample_text()
    app.source_text.insert(1.0, sample)
    
    root.mainloop()