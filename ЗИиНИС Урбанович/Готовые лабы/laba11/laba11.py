# Лабораторная работа №11: Эллиптическая криптография
# Вариант 5

P = 751
A = -1
B = 1

def inv_mod(a, m):
    """Вычисление мультипликативно обратного элемента a^-1 mod m"""
    return pow(a, -1, m)

def add_points(P1, P2):
    """Сложение двух точек на эллиптической кривой"""
    if P1 is None: return P2
    if P2 is None: return P1
    
    x1, y1 = P1
    x2, y2 = P2
    
    if x1 == x2 and y1 == (-y2) % P:
        return None # Точки симметричны, результат - бесконечно удаленная точка O
        
    if P1 == P2:
        if y1 == 0: return None
        # Удвоение точки
        lam = (3 * x1**2 + A) * inv_mod(2 * y1, P) % P
    else:
        # Сложение разных точек
        lam = (y2 - y1) * inv_mod((x2 - x1) % P, P) % P
        
    x3 = (lam**2 - x1 - x2) % P
    y3 = (lam * (x1 - x3) - y1) % P
    return (x3, y3)

def mul_point(k, P_point):
    """Скалярное умножение точки k * P (алгоритм удвоения-сложения)"""
    R = None
    addend = P_point
    while k > 0:
        if k & 1:
            R = add_points(R, addend)
        addend = add_points(addend, addend)
        k >>= 1
    return R

def neg_point(P_point):
    """Инверсия точки -P"""
    if P_point is None: return None
    return (P_point[0], (-P_point[1]) % P)

def sub_points(P1, P2):
    """Вычитание точек P1 - P2"""
    return add_points(P1, neg_point(P2))

# ==========================================
# Задание 1. Базовые операции над точками ЭК
# ==========================================
print("--- ЗАДАНИЕ 1 ---")
# 1.1 Поиск точек ЭК для x в диапазоне [141, 175]
print("1.1 Точки ЭК для x в диапазоне [141, 175]:")
for x in range(141, 176):
    rhs = (x**3 + A * x + B) % P
    # Ищем квадратный корень по модулю P (т.к. P = 3 mod 4, можно использовать формулу)
    y = pow(rhs, (P + 1) // 4, P)
    if (y**2) % P == rhs:
        print(f"  x={x}: y1={y}, y2={P-y}")

# 1.2 Операции над точками
p_point = (59, 386)
q_point = (70, 195)
r_point = (72, 254)
k = 11
l = 5

print(f"\n1.2 Операции над точками P{p_point}, Q{q_point}, R{r_point} при k={k}, l={l}:")
# а) kP
res_a = mul_point(k, p_point)
print(f"  а) {k}P = {res_a}")

# б) P + Q
res_b = add_points(p_point, q_point)
print(f"  б) P + Q = {res_b}")

# в) kP + lQ - R
kP = mul_point(k, p_point)
lQ = mul_point(l, q_point)
res_c = sub_points(add_points(kP, lQ), r_point)
print(f"  в) {k}P + {l}Q - R = {res_c}")

# г) P - Q + R
res_d = add_points(sub_points(p_point, q_point), r_point)
print(f"  г) P - Q + R = {res_d}")


# ==========================================
# Задание 2. Шифрование Эль-Гамаля
# ==========================================
print("\n--- ЗАДАНИЕ 2 (Эль-Гамаль) ---")
G2 = (0, 1)        # Генерирующая точка
d2 = 29            # Тайный ключ (Вариант 5)
M = (192, 32)      # Шифруемый блок (Буква «В»)
k_rand = 2         # Случайное число для сеанса связи

Q_pub = mul_point(d2, G2)
print(f"Открытый ключ получателя Q = d*G = {Q_pub}")

# Зашифрование
C1 = mul_point(k_rand, G2)
C2 = add_points(M, mul_point(k_rand, Q_pub))
print(f"Шифртекст: C1={C1}, C2={C2}")

# Расшифрование: M = C2 - d*C1
dC1 = mul_point(d2, C1)
decrypted_M = sub_points(C2, dC1)
print(f"Расшифрованное сообщение: M={decrypted_M}")


# ==========================================
# Задание 3. ЭЦП на основе ECDSA
# ==========================================
print("\n--- ЗАДАНИЕ 3 (ECDSA) ---")
G3 = (416, 55)     # Генерирующая точка
q_order = 13       # Порядок точки
d3 = 10            # Тайный ключ отправителя (Вариант 5)
hash_M = 10        # H(M) = x mod q = 192 mod 13 = 10
k_sign = 3         # Случайное сессионное число (1 < k < q)

Q_pub3 = mul_point(d3, G3)
print(f"Открытый ключ отправителя Q = d*G = {Q_pub3}")

# Генерация подписи
x1, y1 = mul_point(k_sign, G3)
r = x1 % q_order
s = (inv_mod(k_sign, q_order) * (hash_M + d3 * r)) % q_order
print(f"Сгенерированная ЭЦП: (r={r}, s={s})")

# Верификация подписи
w = inv_mod(s, q_order)
u1 = (hash_M * w) % q_order
u2 = (r * w) % q_order

u1G = mul_point(u1, G3)
u2Q = mul_point(u2, Q_pub3)
V = add_points(u1G, u2Q)
v = V[0] % q_order

print(f"Верификация: w={w}, u1={u1}, u2={u2}")
print(f"Точка V = {V}, v = {v}")
print("Подпись ДЕЙСТВИТЕЛЬНА!" if v == r else "Подпись НЕВЕРНА!")