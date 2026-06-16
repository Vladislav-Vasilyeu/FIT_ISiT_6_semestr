import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk

class StegoFullApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Стеганография: Лабораторная 12 (Встраивание и Извлечение)")
        self.geometry("850x500")
        
        self.img_path = None
        
        # Панель управления
        control_frame = tk.Frame(self)
        control_frame.pack(pady=10)
        
        tk.Button(control_frame, text="1. Выбрать оригинал", command=self.load_image).pack(side=tk.LEFT, padx=5)
        self.entry_msg = tk.Entry(control_frame, width=25)
        self.entry_msg.insert(0, "Секрет")
        self.entry_msg.pack(side=tk.LEFT, padx=5)
        tk.Button(control_frame, text="2. Встроить и сохранить", command=self.embed_data, bg="green", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(control_frame, text="3. Извлечь данные", command=self.extract_data, bg="blue", fg="white").pack(side=tk.LEFT, padx=5)

        # Панель просмотра
        view_frame = tk.Frame(self)
        view_frame.pack(pady=10)
        
        self.label_orig = tk.Label(view_frame, text="Оригинал")
        self.label_orig.pack(side=tk.LEFT, padx=10)
        
        self.label_stego = tk.Label(view_frame, text="Стего-контейнер")
        self.label_stego.pack(side=tk.LEFT, padx=10)

    def load_image(self):
        self.img_path = filedialog.askopenfilename(filetypes=[("PNG files", "*.png")])
        if self.img_path:
            img = Image.open(self.img_path).resize((300, 300))
            self.orig_display = ImageTk.PhotoImage(img)
            self.label_orig.config(image=self.orig_display, text="")

    def embed_data(self):
        if not self.img_path: return
        save_path = filedialog.asksaveasfilename(defaultextension=".png")
        if not save_path: return
        
        msg = self.entry_msg.get() + "@@@"
        img = Image.open(self.img_path).convert('RGB')
        pixels = list(img.getdata())
        bits = ''.join([format(ord(c), '08b') for c in msg])
        
        new_pixels = [( (p[0] & ~1) | int(bits[i]), p[1], p[2] ) if i < len(bits) else p 
                      for i, p in enumerate(pixels)]
        
        img.putdata(new_pixels)
        img.save(save_path)
        
        stego_img = Image.open(save_path).resize((300, 300))
        self.stego_display = ImageTk.PhotoImage(stego_img)
        self.label_stego.config(image=self.stego_display, text="")
        messagebox.showinfo("Готово", "Данные встроены!")

    def extract_data(self):
        # 1. Выбор файла для чтения
        path = filedialog.askopenfilename(filetypes=[("PNG files", "*.png")])
        if not path: return
        
        # 2. Чтение младших битов
        img = Image.open(path).convert('RGB')
        pixels = list(img.getdata())
        bits = "".join([str(p[0] & 1) for p in pixels])
        
        # 3. Декодирование
        res = ""
        for i in range(0, len(bits), 8):
            byte = bits[i:i+8]
            char = chr(int(byte, 2))
            res += char
            if res.endswith("@@@"):
                messagebox.showinfo("Извлечение", f"Найденное сообщение: {res[:-3]}")
                return
        messagebox.showwarning("Ошибка", "Сообщение не найдено!")

if __name__ == "__main__":
    StegoFullApp().mainloop()