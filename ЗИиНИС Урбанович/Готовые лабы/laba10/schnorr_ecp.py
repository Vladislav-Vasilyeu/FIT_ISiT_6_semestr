import random
import hashlib
from utils import hash_message, ensure_dir, save_key, load_key

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

def generate_prime(bits=256):
    """Генерация простого числа"""
    while True:
        num = random.getrandbits(bits)
        num |= (1 << bits - 1) | 1
        if is_prime(num):
            return num

class Schnorr_Signer:
    def __init__(self):
        self.p = None
        self.q = None
        self.g = None
        self.x = None  # Закрытый ключ
        self.y = None  # Открытый ключ
    
    def generate_keys(self, bits=512):
        """Генерация ключей Шнорра"""
        # q - простое число ~160-256 бит
        self.q = generate_prime(160)
        
        # p = k*q + 1
        k = random.getrandbits(bits - 160)
        self.p = k * self.q + 1
        while not is_prime(self.p):
            k = random.getrandbits(bits - 160)
            self.p = k * self.q + 1
        
        # Находим g порядка q
        h = random.randint(2, self.p-1)
        self.g = pow(h, k, self.p)
        while self.g == 1:
            h = random.randint(2, self.p-1)
            self.g = pow(h, k, self.p)
        
        self.x = random.randint(1, self.q-1)
        self.y = pow(self.g, self.x, self.p)
        
        ensure_dir('keys/schnorr')
        save_key('keys/schnorr/public.key', f"{self.p},{self.q},{self.g},{self.y}")
        save_key('keys/schnorr/private.key', f"{self.p},{self.q},{self.g},{self.x}")
        
        return self.p, self.q, self.g, self.y, self.x
    
    def load_public_key(self):
        """Загрузка открытого ключа"""
        try:
            data = load_key('keys/schnorr/public.key')
            self.p, self.q, self.g, self.y = map(int, data.split(','))
            return True
        except:
            return False
    
    def load_private_key(self):
        """Загрузка закрытого ключа"""
        try:
            data = load_key('keys/schnorr/private.key')
            self.p, self.q, self.g, self.x = map(int, data.split(','))
            return True
        except:
            return False
    
    def sign(self, message: str):
        """Подпись сообщения"""
        if not self.load_private_key():
            raise Exception("Закрытый ключ не найден")
        
        r = random.randint(1, self.q-1)
        R = pow(self.g, r, self.p)
        
        # Хешируем сообщение вместе с R
        hash_input = f"{R}{message}".encode()
        e = int(hashlib.sha256(hash_input).hexdigest(), 16) % self.q
        
        s = (r + self.x * e) % self.q
        
        return (e, s)
    
    def verify(self, message: str, signature: tuple):
        """Верификация подписи"""
        if not self.load_public_key():
            raise Exception("Открытый ключ не найден")
        
        e, s = signature
        if not (0 <= s < self.q):
            return False
        
        Rv = (pow(self.g, s, self.p) * pow(self.y, -e, self.p)) % self.p
        
        hash_input = f"{Rv}{message}".encode()
        ev = int(hashlib.sha256(hash_input).hexdigest(), 16) % self.q
        
        return ev == e