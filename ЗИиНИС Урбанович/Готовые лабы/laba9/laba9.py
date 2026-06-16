import hashlib
import sys
import time
import os

def print_banner():
    print("=" * 70)
    print("   ИССЛЕДОВАНИЕ КРИПТОГРАФИЧЕСКИХ ХЕШ-ФУНКЦИЙ")
    print("   MD5  и  SHA-256")
    print("=" * 70)

def get_hasher(algo: str):
    """Возвращает объект хеш-функции"""
    if algo == "MD5":
        return hashlib.md5()
    elif algo == "SHA256":
        return hashlib.sha256()
    else:
        raise ValueError("Неподдерживаемый алгоритм")

def hash_text(text: str, algo: str):
    hasher = get_hasher(algo)
    hasher.update(text.encode('utf-8'))
    return hasher.hexdigest()

def hash_file(filename: str, algo: str):
    if not os.path.exists(filename):
        print(f"Ошибка: файл '{filename}' не найден!")
        return None
    
    hasher = get_hasher(algo)
    try:
        with open(filename, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception as e:
        print(f"Ошибка чтения файла: {e}")
        return None

def test_performance(algo: str):
    """Тест быстродействия выбранного алгоритма"""
    print(f"\n--- ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ {algo} ---")
    
    sizes_kb = [1, 10, 100, 500, 1000, 5000]
    iterations = 100 if algo == "MD5" else 50  # MD5 быстрее, делаем больше итераций
    
    print(f"{'Размер (КБ)':<10} {'Время (сек)':<12} {'Скорость (МБ/с)':<15} {'Хеш (первые 16)'}")
    print("-" * 65)
    
    for kb in sizes_kb:
        data = os.urandom(kb * 1024)
        start = time.time()
        
        for _ in range(iterations):
            get_hasher(algo).update(data)
            get_hasher(algo).hexdigest()  # полное вычисление
            
        total_time = time.time() - start
        speed_mb_s = (kb * iterations) / (total_time * 1024) if total_time > 0 else 0
        
        # Финальный хеш для отображения
        final_hash = get_hasher(algo).update(data) or get_hasher(algo).hexdigest()[:16]
        print(f"{kb:<10} {total_time:.4f}s{'':<5} {speed_mb_s:8.2f} MB/s    {final_hash[:16]}")

def main():
    print_banner()
    
    algorithms = ["MD5", "SHA256"]
    
    while True:
        print("\nВыберите алгоритм:")
        for i, alg in enumerate(algorithms, 1):
            print(f"{i}. {alg}")
        print("3. Сравнительный тест производительности")
        print("4. Выход")
        
        choice = input("\nВаш выбор (1-4): ").strip()
        
        if choice in ["1", "2"]:
            algo = algorithms[int(choice)-1]
            print(f"\nВыбран алгоритм: {algo}")
            
            mode = input("1 - Хешировать текст | 2 - Хешировать файл: ").strip()
            
            if mode == "1":
                text = input("Введите текст: ")
                result = hash_text(text, algo)
                print(f"\n{algo}: {result}")
                print(f"Длина: {len(result)} символов ({len(result)*4} бит)")
                
            elif mode == "2":
                filename = input("Введите путь к файлу: ")
                result = hash_file(filename, algo)
                if result:
                    print(f"\n{algo} файла: {result}")
                    
        elif choice == "3":
            print("\nСравнение MD5 и SHA-256:")
            for alg in algorithms:
                test_performance(alg)
                
        elif choice == "4":
            print("До свидания!")
            break
        else:
            print("Неверный ввод!")

if __name__ == "__main__":
    main()