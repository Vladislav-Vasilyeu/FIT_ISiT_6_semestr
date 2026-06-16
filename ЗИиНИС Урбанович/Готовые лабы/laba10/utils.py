import hashlib
import time
import os

def hash_message(message: str) -> int:
    """Возвращает хеш сообщения как целое число (SHA-256)"""
    return int(hashlib.sha256(message.encode()).hexdigest(), 16)

def time_it(func, *args, **kwargs):
    """Замер времени выполнения функции"""
    start = time.perf_counter()
    result = func(*args, **kwargs)
    elapsed = time.perf_counter() - start
    return result, elapsed

def ensure_dir(directory: str):
    """Создаёт директорию, если её нет"""
    if not os.path.exists(directory):
        os.makedirs(directory)

def save_key(filename: str, data: str):
    """Сохраняет ключ в файл"""
    with open(filename, 'w') as f:
        f.write(data)

def load_key(filename: str) -> str:
    """Загружает ключ из файла"""
    with open(filename, 'r') as f:
        return f.read().strip()