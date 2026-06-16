import random
from utils import hash_message, time_it, ensure_dir, save_key, load_key

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def mod_inverse(a, m):
    """Обратное число по модулю m (расширенный алгоритм Евклида)"""
    g, x, _ = egcd(a, m)
    if g != 1:
        raise Exception('Обратного элемента не существует')
    return x % m

def egcd(a, b):
    if a == 0:
        return (b, 0, 1)
    else:
        g, y, x = egcd(b % a, a)
        return (g, x - (b // a) * y, y)

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
    """Генерация простого числа заданной битности"""
    while True:
        num = random.getrandbits(bits)
        num |= (1 << bits - 1) | 1  # Старший и младший биты = 1
        if is_prime(num):
            return num

class RSA_Signer:
    def __init__(self):
        self.n = None
        self.e = None
        self.d = None
    
    def generate_keys(self, bits=512):
        """Генерация ключей RSA"""
        p = generate_prime(bits // 2)
        q = generate_prime(bits // 2)
        self.n = p * q
        phi = (p - 1) * (q - 1)
        
        self.e = 65537  # Стандартная публичная экспонента
        self.d = mod_inverse(self.e, phi)
        
        # Сохраняем ключи
        ensure_dir('keys/rsa')
        save_key('keys/rsa/public.key', f"{self.n},{self.e}")
        save_key('keys/rsa/private.key', f"{self.n},{self.d}")
        
        return self.n, self.e, self.d
    
    def load_public_key(self):
        """Загрузка открытого ключа"""
        try:
            data = load_key('keys/rsa/public.key')
            self.n, self.e = map(int, data.split(','))
            return True
        except:
            return False
    
    def load_private_key(self):
        """Загрузка закрытого ключа"""
        try:
            data = load_key('keys/rsa/private.key')
            self.n, self.d = map(int, data.split(','))
            return True
        except:
            return False
    
    def sign(self, message: str):
        """Подпись сообщения"""
        if not self.load_private_key():
            raise Exception("Закрытый ключ не найден")
        
        h = hash_message(message)
        signature = pow(h, self.d, self.n)
        return signature
    
    def verify(self, message: str, signature: int):
        """Верификация подписи"""
        if not self.load_public_key():
            raise Exception("Открытый ключ не найден")
        
        h = hash_message(message)
        h_decrypted = pow(signature, self.e, self.n)
        return h == h_decrypted