import random
from utils import hash_message, time_it, ensure_dir, save_key, load_key

def mod_pow(a, b, p):
    return pow(a, b, p)

def mod_inverse(a, p):
    """Обратное число по модулю p"""
    return pow(a, p-2, p) if p > 1 else 0

def is_prime(n, k=5):
    """Тест Миллера-Рабина"""
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0:
        return False
    
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    
    for _ in range(k):
        a = random.randint(2, n - 2)
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True

def generate_prime(bits=512):
    """Генерация простого числа"""
    while True:
        num = random.getrandbits(bits)
        num |= (1 << bits - 1) | 1
        if is_prime(num):
            return num

class ElGamal_Signer:
    def __init__(self):
        self.p = None
        self.g = None
        self.x = None  # Закрытый ключ
        self.y = None  # Открытый ключ
    
    def generate_keys(self, bits=512):
        """Генерация ключей Эль-Гамаля"""
        self.p = generate_prime(bits)
        
        # Находим примитивный корень g
        self.g = 2
        while pow(self.g, (self.p-1)//2, self.p) == 1:
            self.g += 1
        
        self.x = random.randint(2, self.p-2)  # Закрытый ключ
        self.y = pow(self.g, self.x, self.p)   # Открытый ключ
        
        ensure_dir('keys/elgamal')
        save_key('keys/elgamal/public.key', f"{self.p},{self.g},{self.y}")
        save_key('keys/elgamal/private.key', f"{self.p},{self.g},{self.x}")
        
        return self.p, self.g, self.y, self.x
    
    def load_public_key(self):
        """Загрузка открытого ключа"""
        try:
            data = load_key('keys/elgamal/public.key')
            self.p, self.g, self.y = map(int, data.split(','))
            return True
        except:
            return False
    
    def load_private_key(self):
        """Загрузка закрытого ключа"""
        try:
            data = load_key('keys/elgamal/private.key')
            self.p, self.g, self.x = map(int, data.split(','))
            return True
        except:
            return False
    
    def sign(self, message: str):
        """Подпись сообщения"""
        if not self.load_private_key():
            raise Exception("Закрытый ключ не найден")
        
        h = hash_message(message) % self.p
        k = random.randint(2, self.p-2)
        while pow(k, self.p-1, self.p) != 1:
            k = random.randint(2, self.p-2)
        
        r = pow(self.g, k, self.p)
        k_inv = mod_inverse(k, self.p-1)
        s = (h - self.x * r) * k_inv % (self.p-1)
        
        return (r, s)
    
    def verify(self, message: str, signature: tuple):
        """Верификация подписи"""
        if not self.load_public_key():
            raise Exception("Открытый ключ не найден")
        
        r, s = signature
        if not (0 < r < self.p):
            return False
        
        h = hash_message(message) % self.p
        left = pow(self.y, r, self.p) * pow(r, s, self.p) % self.p
        right = pow(self.g, h, self.p)
        
        return left == right